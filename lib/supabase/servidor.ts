import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase con SERVICE ROLE KEY — SOLO USO EN SERVIDOR.
 *
 * Esta clave IGNORA las políticas RLS: otorga acceso total a los datos.
 * Importar este archivo ÚNICAMENTE desde Server Components, Route Handlers,
 * Server Actions o APIs internas. Nunca desde código que llegue al navegador.
 */

let clienteServicio: SupabaseClient | null = null;

export function obtenerClienteServicioSupabase(): SupabaseClient {
  if (clienteServicio) return clienteServicio;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const claveServicio = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !claveServicio) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. " +
        "Revisa .env.local (ver .env.example)."
    );
  }

  clienteServicio = createClient(url, claveServicio, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return clienteServicio;
}
