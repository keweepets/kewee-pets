/**
 * Server Actions de MERCADO PAGO — FASE 7B (Checkout Pro).
 *
 * · Solo uso SERVIDOR (use server). Importa la capa de preferencias
 *   (preferencias.ts) que a su vez usa el cliente server-only (cliente.ts).
 * · El token de acceso JAMÁS llega al navegador: esta acción solo devuelve el
 *   init_point (una URL pública de Mercado Pago a la que el cliente redirige).
 *
 * FASE 7B — alcance limitado:
 *   · Crear la preferencia para un pedido YA creado por crearPedido().
 *   · Persistir preference_id en el pedido (server-side, validando que exista).
 *   · Devolver { ok, initPoint } para que el cliente redirija.
 *   NO toca payment_id ni estado_pago. NO implementa verificación de pago,
 *   webhook, ni /checkout/pago (eso es 7C/7D).
 */

"use server";

import { obtenerPedidoPorId } from "@/lib/pedidos/consultas";
import {
  crearPreferenciaPago,
  obtenerPreferenciaPago,
} from "@/lib/mercadopago/preferencias";
import { obtenerClienteServicioSupabase } from "@/lib/supabase/servidor";

/** Resultado de iniciarPagoMercadoPago(). Sigue la convención { ok, error }
 *  del resto de Server Actions del proyecto: los fallos esperables se devuelven
 *  como dato y NO se lanzan (evita exponer el "React error #441" al cliente). */
export type ResultadoIniciarPago =
  | { ok: true; initPoint: string }
  | { ok: false; error: string };

/**
 * Crea la preferencia de Mercado Pago para un pedido ya existente y guarda su
 * preference_id. Pensada para llamarse DESPUÉS de un crearPedido() exitoso.
 *
 * Orden seguro:
 *   1) Valida que el pedido exista (obtenerPedidoPorId devuelve null si no).
 *   2) Crea la preferencia en Mercado Pago (usuario ya persistido) →
 *      → obtiene { id, initPoint }.
 *   3) Persiste SOLO preference_id en el pedido (tras éxito de Mercado Pago,
 *      para no guardar un id inexistente).
 *   4) Devuelve el init_point para que el cliente redirija.
 *
 * NO acepta payment_id ni estado_pago desde el cliente: este flujo solo
 * registra la preferencia; el pago sigue pendiente.
 */
export async function iniciarPagoMercadoPago(
  pedidoId: string
): Promise<ResultadoIniciarPago> {
  try {
    // 1) Validación server-side: el pedido debe existir.
    const pedido = await obtenerPedidoPorId(pedidoId);
    if (!pedido) {
      return {
        ok: false,
        error:
          "El pedido ya no existe. No se pudo iniciar el pago con Mercado Pago.",
      };
    }

    // 2) Comprobaciones de coherencia del pedido para poder cobrar con MP.
    if (pedido.pedido.metodo_pago !== "mercadopago") {
      return {
        ok: false,
        error:
          "Este pedido no se paga con Mercado Pago. Verifica el método de pago.",
      };
    }

    if (pedido.pedido.estado_pago === "pagado") {
      return {
        ok: false,
        error: "Este pedido ya está pagado. No es necesario iniciar otro pago.",
      };
    }

    if (
      pedido.pedido.estado !== "recibido" &&
      pedido.pedido.estado !== "en_proceso"
    ) {
      return {
        ok: false,
        error:
          "Este pedido no puede pagarse en su estado actual con Mercado Pago.",
      };
    }

    const supabase = obtenerClienteServicioSupabase();

    // 3) Idempotencia: si ya existe una preferencia, reutilizarla sin recrearla
    //    ni sobrescribir preference_id (evita pagos/preferencias repetidos).
    if (pedido.pedido.preference_id) {
      const existente = await obtenerPreferenciaPago(
        pedido.pedido.preference_id
      );
      return { ok: true, initPoint: existente.initPoint };
    }

    // 4) Crea la preferencia a partir de los snapshots del pedido persistido
    //    (mismos montos de siempre; nunca se aceptan precios del cliente).
    const { id: preferenceId, initPoint } = await crearPreferenciaPago(pedido);

    // 5) Persiste preference_id SOLO (ni payment_id ni estado_pago).
    const { error } = await supabase
      .from("pedidos")
      .update({ preference_id: preferenceId })
      .eq("id", pedidoId);

    if (error) {
      return {
        ok: false,
        error:
          "El pedido se creó y la preferencia se generó, pero no se pudo " +
          "registrar. Inténtalo de nuevo o paga por contraentrega.",
      };
    }

    // 6) Devuelve la URL de Mercado Pago para redirigir al comprador.
    return { ok: true, initPoint };
  } catch (e) {
    const mensaje =
      e instanceof Error
        ? e.message
        : "No se pudo iniciar el pago en Mercado Pago. Inténtalo de nuevo.";
    return { ok: false, error: mensaje };
  }
}
