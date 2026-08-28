/**
 * Cliente Mercado Pago — SOLO USO EN SERVIDOR (FASE 7 · Checkout Pro).
 *
 * · Lee MERCADOPAGO_ACCESS_TOKEN desde process.env y crea un singleton
 *   MercadoPagoConfig para el SDK oficial.
 * · EL ACCESS TOKEN NUNCA SE EXPONE AL CLIENTE: no usar variables NEXT_PUBLIC_,
 *   no exportar la instancia, importar este archivo únicamente desde Server
 *   Components, Server Actions, Route Handlers o libs server-side.
 * · Falla de forma clara si falta el token (misma convención que
 *   lib/supabase/servidor.ts).
 */

import MercadoPagoConfig from "mercadopago";

let clienteMercadoPago: MercadoPagoConfig | null = null;

export function obtenerClienteMercadoPago(): MercadoPagoConfig {
  if (clienteMercadoPago) return clienteMercadoPago;

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error(
      "[mercadopago] Falta la variable de entorno MERCADOPAGO_ACCESS_TOKEN. " +
        "Revisa .env.local (ver .env.example)."
    );
  }

  clienteMercadoPago = new MercadoPagoConfig({
    accessToken,
    options: { timeout: 8000 },
  });
  return clienteMercadoPago;
}