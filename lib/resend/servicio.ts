/**
 * Servicio de correo transaccional con Resend (FASE 6).
 *
 * · Solo uso SERVIDOR (use server): la API key se lee de una variable de
 *   entorno y nunca se expone al cliente.
 * · Esta fase solo expone un envío mínimo de correo de prueba (to, subject y
 *   html). La plantilla de confirmación de pedido y su conexión con
 *   crearPedido() se implementan en pasos posteriores.
 */

"use server";

import { Resend } from "resend";

export interface EnviarCorreoEntrada {
  to: string;
  subject: string;
  html: string;
}

/** Resultado claro de éxito/error para el consumidor del servicio. */
export type ResultadoEnvioCorreo =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function enviarCorreo(
  entrada: EnviarCorreoEntrada
): Promise<ResultadoEnvioCorreo> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: "[resend] Falta la variable de entorno RESEND_API_KEY.",
    };
  }

  const resend = new Resend(apiKey);

  // En la fase 4 la confirmación de pedido define el remitente real (from).
  // Aquí, para la prueba, se usa 'onboarding@resend.dev' (remitente por defecto
  // de cuentas sin dominio verificado). Ajustar cuando exista un dominio propio.
  const { data, error } = await resend.emails.send({
    from: "Keweepets <onboarding@resend.dev>",
    to: [entrada.to],
    subject: entrada.subject,
    html: entrada.html,
  });

  if (error) {
    return {
      ok: false,
      error: `[resend] ${error.name ?? "Error"}: ${error.message}`,
    };
  }

  return { ok: true, id: data?.id ?? "" };
}
