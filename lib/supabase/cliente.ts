import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase del NAVEGADOR con la clave anónima (pública).
 *
 * La clave anon solo permite lo que las políticas RLS autoricen.
 * Nunca usar aquí la service role key.
 */

let cliente: SupabaseClient | null = null;

export function obtenerClienteSupabase(): SupabaseClient {
  if (cliente) return cliente;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const claveAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !claveAnon) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Revisa .env.local (ver .env.example)."
    );
  }

  cliente = createClient(url, claveAnon);
  return cliente;
}
