/**
 * Webhook de Mercado Pago (Checkout Pro).
 *
 * Recibe las notificaciones que Mercado Pago envía a notification_url
 * (${NEXT_PUBLIC_SITE_URL}/api/webhooks/mercadopago) tras cada pago. Es la
 * fuente confiable para marcar estado_pago = 'pagado' sin depender de que el
 * cliente regrese a /checkout/pago.
 *
 * Flujo (todo server-side):
 *   1. Valida la firma x-signature (+ x-request-id) con WebhookSignatureValidator
 *      del SDK oficial, contra MERCADOPAGO_WEBHOOK_SECRET.
 *   2. Solo procesa eventos type === "payment": toma data.id del query
 *      (es lo que cubre la firma, no el body) y reutiliza
 *      verificarPagoYActualizar(), que es idempotente y verifica contra la API
 *      antes de marcar el pedido.
 *   3. Responde 200 siempre que el evento se procesó correctamente (incluidos
 *      duplicados y reenvíos). Eventos que no nos interesan (p. ej.
 *      merchant_order) se acusan con 200 sin procesarlos.
 *
 * Respuestas de error: 401 firma inválida, 503 sin secret configurado,
 * 400 sin data.id, 500 si no se pudo consultar la API de Mercado Pago.
 * NUNCA se exponen credenciales ni detalles internos en la respuesta HTTP.
 */

import {
  InvalidWebhookSignatureError,
  WebhookSignatureValidator,
} from "mercadopago";
import type { NextRequest } from "next/server";
import { verificarPagoYActualizar } from "@/lib/mercadopago/verificar-pago";

export const runtime = "nodejs";

/** Máxima deriva de reloj permitida entre el ts de la firma y el servidor. */
const TOLERANCIA_FIRMA_SEGUNDOS = 300;

function primerValor(
  valor: string | string[] | null | undefined
): string | undefined {
  const v = Array.isArray(valor) ? valor[0] : valor;
  return v?.trim() ? v.trim() : undefined;
}

/** Resuelve el type del evento: del query primero, del body como respaldo. */
async function obtenerTipoEvento(
  request: NextRequest
): Promise<string | undefined> {
  const tipoQuery = primerValor(request.nextUrl.searchParams.get("type"));
  if (tipoQuery) return tipoQuery;
  try {
    const body = (await request.json()) as { type?: unknown };
    if (typeof body?.type === "string") return body.type.trim();
  } catch {
    // Body no JSON: no hay type que considerar.
  }
  return undefined;
}

export async function POST(request: NextRequest) {
  const secreto = process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim();
  if (!secreto) {
    console.error(
      "[mercadopago:webhook] Falta MERCADOPAGO_WEBHOOK_SECRET; el webhook no está configurado."
    );
    return Response.json({ error: "Webhook no configurado." }, { status: 503 });
  }

  const xSignature = request.headers.get("x-signature") ?? undefined;
  const xRequestId = request.headers.get("x-request-id") ?? undefined;
  const dataId = primerValor(request.nextUrl.searchParams.get("data.id"));

  // 1) Firma: rechazar cualquier notificación que no venga firmada por MP.
  try {
    WebhookSignatureValidator.validate({
      xSignature,
      xRequestId,
      dataId,
      secret: secreto,
      toleranceSeconds: TOLERANCIA_FIRMA_SEGUNDOS,
    });
  } catch (e) {
    const motivo =
      e instanceof InvalidWebhookSignatureError ? e.reason : "desconocido";
    console.error(
      `[mercadopago:webhook] Firma inválida (request-id=${xRequestId ?? "?"}, data.id=${dataId ?? "?"}, motivo=${motivo})`
    );
    return Response.json({ error: "Firma inválida." }, { status: 401 });
  }

  // 2) Solo eventos de pago individual; el resto se acusa sin procesar.
  const tipoEvento = await obtenerTipoEvento(request);
  if (tipoEvento !== "payment") {
    console.log(
      `[mercadopago:webhook] Evento ignorado (type=${tipoEvento ?? "desconocido"}, data.id=${dataId ?? "?"})`
    );
    return Response.json({ ok: true }, { status: 200 });
  }

  if (!dataId) {
    console.error(
      "[mercadopago:webhook] Evento payment sin data.id en el query."
    );
    return Response.json({ error: "Falta data.id." }, { status: 400 });
  }

  // 3) Reutiliza la verificación existente (idempotente): solo marca 'pagado'
  //    si status=approved + external_reference→pedido + monto coinciden.
  const resultado = await verificarPagoYActualizar({ paymentId: dataId });

  if (!resultado.ok) {
    console.error(
      `[mercadopago:webhook] No se pudo verificar el pago ${dataId}: ${resultado.error}`
    );
    return Response.json(
      { error: "No se pudo verificar el pago." },
      { status: 500 }
    );
  }

  console.log(
    `[mercadopago:webhook] Pago ${dataId} procesado: ${resultado.resultado}${resultado.resultado === "aprobado" ? ` (pedido ${resultado.numeroPedido})` : ""}`
  );
  return Response.json({ ok: true }, { status: 200 });
}