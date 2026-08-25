/**
 * Sesión y autorización del panel de administración (FASE 6A).
 *
 * - Cliente Supabase Auth para Server Components / Server Actions con
 *   sesión en cookies httpOnly (@supabase/ssr). Usa SOLO la clave anon:
 *   la identidad la valida el servidor de Supabase (auth.getUser()).
 * - requerirAdmin() es la ÚNICA función de autorización. Debe invocarse
 *   en cada página de /admin Y en toda Server Action administrativa futura
 *   (las actions son endpoints POST alcanzables sin pasar por la UI).
 * - La allowlist ADMIN_EMAILS vive solo en el servidor: nunca con prefijo
 *   NEXT_PUBLIC_. Si no está definida o está vacía, se niega todo acceso
 *   (fail-closed).
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";

export interface EstadoLogin {
  error?: string;
}

export interface UsuarioAdmin {
  id: string;
  email: string;
}

/** Cliente Supabase Auth server-side con sesión en cookies. */
export async function crearClienteAuthSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const claveAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !claveAnon) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Revisa .env.local (ver .env.example)."
    );
  }

  const almacenCookies = await cookies();

  return createServerClient(url, claveAnon, {
    cookies: {
      getAll() {
        return almacenCookies.getAll();
      },
      setAll(cookiesPorEscribir) {
        try {
          cookiesPorEscribir.forEach(({ name, value, options }) => {
            almacenCookies.set(name, value, options);
          });
        } catch {
          // Llamado desde un Server Component (cookies de solo lectura).
          // El refresco del token lo aplicará la siguiente Server Action
          // o Route Handler, donde las cookies sí son escribibles.
        }
      },
    },
  });
}

/** Allowlist de admins (server-only): emails separados por coma. */
export function leerEmailsAdminPermitidos(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Verifica sesión activa + pertenencia a la allowlist.
 * - Sin sesión            → redirect a /admin/login.
 * - Autenticado sin permiso → redirect a /admin/login?denegado=1.
 */
export async function requerirAdmin(): Promise<UsuarioAdmin> {
  const supabase = await crearClienteAuthSupabase();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/admin/login");
  }

  const usuario = data.user;
  const email = (usuario.email ?? "").trim().toLowerCase();

  if (!email || !leerEmailsAdminPermitidos().includes(email)) {
    redirect("/admin/login?denegado=1");
  }

  return { id: usuario.id, email };
}
