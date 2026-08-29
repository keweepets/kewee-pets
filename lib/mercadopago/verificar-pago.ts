/**
 * Verificación de pago Mercado Pago (Checkout Pro) — FASE 7C.
 *
 * · SOLO USO EN SERVIDOR (importa cliente.ts con el access token server-only).
 * · Se invoca desde la página de retorno /checkout/pago.
 *
 * Propósito: dado el retorno de Mercado Pago (payment_id + external_reference),
 * consultar la API de Mercado Pago (GET /v1/payments/:id) y NUNCA confiar solo
 * en la URL de retorno (que puede manipularse). Solo si el pago realmente está
 * aprobado y coincide con el pedido, se actualiza el pedido server-side:
 *
 *   · estado_pago -> 'pagado'
 *   · payment_id   -> id del pago devuelto por Mercado Pago
 *
 * Validaciones de coherencia:
 *   1. status === "approved"
 *   2. external_reference === pedido.id
 *   3. transaction_amount === pedido.total
 *
 * La actualización es idempotente: re-verifica desde la API cada vez.
 * NO toca `estado` del pedido ni preference_id. Webhook NO está implementado.
 */

import { Payment } from "mercadopago";
import { obtenerClienteMercadoPago } from "@/lib/mercadopago/cliente";
import { obtenerPedidoPorId } from "@/lib/pedidos/consultas";
import { obtenerClienteServicioSupabase } from "@/lib/supabase/servidor";

/** Estados del pago que la página de retorno puede mostrar. */
export type ResultadoPagoRetorno =
  /** Pago aprobado y verificado: se actualizó estado_pago='pagado'. */
  | { ok: true; resultado: "aprobado"; numeroPedido: string; paymentId: string }
  /** Pago pendiente (aún no aprobado) — no se actualiza el pedido. */
  | { ok: true; resultado: "pendiente"; numeroPedido?: string }
  /** Pago rechazado/cancelado por Mercado Pago — no se actualiza el pedido. */
  | { ok: true; resultado: "rechazado"; numeroPedido?: string }
  /** Datos de retorno inválidos o pago que no coincide con el pedido. */
  | { ok: true; resultado: "invalido"; numeroPedido?: string }
  /** Error al consultar la API de Mercado Pago (config/red). */
  | { ok: false; error: string };

/** Variantes de ResultadoPagoRetorno que no requieren verificar contra la API
 *  (pendiente / rechazado / inválido). El caso "aprobado" se resuelve después. */
type ResultadoClasificado = Extract<
  ResultadoPagoRetorno,
  { ok: true; resultado: "pendiente" | "rechazado" | "invalido" }
>;

interface EntradaVerificacion {
  /** id del pago recibido en el retorno (?payment_id=...). */
  paymentId?: string;
  /** id del pedido recibido en el retorno (?external_reference=...). */
  pedidoId?: string;
}

/** Clasifica el status del pago en una de las categorías legibles. */
function clasificarStatus(status: string | undefined): ResultadoClasificado | null {
  switch (status) {
    case "approved":
      return null; // requiere verificación adicional de monto/ref
    case "authorized":
    case "pending":
    case "in_process":
    case "in_mediation":
      return { ok: true, resultado: "pendiente" };
    case "rejected":
    case "cancelled":
    case "refunded":
      return { ok: true, resultado: "rechazado" };
    default:
      return { ok: true, resultado: "invalido" };
  }
}

/**
 * Verifica un pago de Mercado Pago consultando la API y, si corresponde,
 * actualiza el pedido (server-side) con estado_pago='pagado' + payment_id.
 */
export async function verificarPagoYActualizar(
  entrada: EntradaVerificacion
): Promise<ResultadoPagoRetorno> {
  const { paymentId, pedidoId } = entrada;

  // Sin payment_id no hay nada que verificar contra la API.
  if (!paymentId) {
    return { ok: true, resultado: "invalido" };
  }

  // 1) Consultar el pago real en Mercado Pago (fuente de verdad).
  let payment;
  try {
    const cliente = obtenerClienteMercadoPago();
    payment = await new Payment(cliente).get({ id: paymentId });
  } catch (e) {
    const mensaje =
      e instanceof Error ? e.message : "Error desconocido al verificar el pago.";
    return { ok: false, error: mensaje };
  }

  // 2) Si no está aprobado, devolver la categoría (pendiente/rechazado/inválido).
  const clasificado = clasificarStatus(payment.status);
  if (clasificado) {
    const numeroPedido = await buscarNumeroPedido(
      payment.external_reference ?? pedidoId
    );
    if (clasificado.resultado === "pendiente") {
      return { ok: true, resultado: "pendiente", numeroPedido };
    }
    if (clasificado.resultado === "rechazado") {
      return { ok: true, resultado: "rechazado", numeroPedido };
    }
    return { ok: true, resultado: "invalido", numeroPedido };
  }

  // 3) Aprobado: validar coherencia con el pedido.
  //    El pedido se resuelve desde external_reference del pago (o del retorno).
  const refPedido = payment.external_reference ?? pedidoId;
  if (!refPedido) {
    return { ok: true, resultado: "invalido" };
  }

  const pedido = await obtenerPedidoPorId(refPedido);
  if (!pedido) {
    return { ok: true, resultado: "invalido" };
  }

  // 3.1) external_reference del pago debe ser el id del pedido.
  if (payment.external_reference !== pedido.pedido.id) {
    return { ok: true, resultado: "invalido" };
  }

  // 3.2) transaction_amount debe coincidir con el total del pedido (COPs).
  const montoPago = Number(payment.transaction_amount);
  if (!Number.isFinite(montoPago) || Math.abs(montoPago - pedido.pedido.total) > 0.01) {
    return { ok: true, resultado: "invalido" };
  }

  // 3.3) status confirmed "approved" (el switch devolvió null solo para approved).
  if (payment.status !== "approved") {
    return { ok: true, resultado: "invalido" };
  }

  // 4) Todo coincide: actualizar pedido server-side (solo estado_pago + payment_id).
  const pagoId = String(payment.id ?? paymentId);
  const supabase = obtenerClienteServicioSupabase();
  const { error } = await supabase
    .from("pedidos")
    .update({ estado_pago: "pagado", payment_id: pagoId })
    .eq("id", pedido.pedido.id);
  if (error) {
    return { ok: false, error: error.message };
  }

  return {
    ok: true,
    resultado: "aprobado",
    numeroPedido: pedido.pedido.numero_pedido,
    paymentId: pagoId,
  };
}

/** Resuelve el número legible del pedido a partir de su id (si existe). */
async function buscarNumeroPedido(pedidoId?: string): Promise<string | undefined> {
  if (!pedidoId) return undefined;
  const pedido = await obtenerPedidoPorId(pedidoId);
  return pedido?.pedido.numero_pedido;
}
