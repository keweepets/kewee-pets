import { NextResponse, type NextRequest } from "next/server";

import { crearClienteAuthSupabase } from "@/lib/auth/sesion";

/**
 * Callback de recuperación de contraseña (FASE 6A · Supabase Auth).
 *
 * Supabase redirige aquí con un `code` en el query string tras solicitar el
 * reset de contraseña (Send password reset / resetPasswordForEmail). Este
 * handler canjea ese code por una sesión válida mediante
 * exchangeCodeForSession() y redirige a la pantalla para establecer la nueva
 * contraseña.
 *
 * El client SSR de cookies escribe la sesión en las cookies httpOnly, por lo
 * que la página de update-password podrá verificar la identidad con
 * requerirAdmin()/auth.getUser().
 *
 * No debe haber una page.tsx y un route.ts en la misma ruta /auth (este
 * segmento solo expone el handler; /admin es la zona protegida).
 */

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const baseUrl = request.nextUrl.origin;

  // Sin code (por ejemplo, acceso directo o enlace inválido): volver al login.
  if (!code) {
    return NextResponse.redirect(
      new URL("/admin/login?error=recovery", baseUrl)
    );
  }

  try {
    const supabase = await crearClienteAuthSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      // No se expone el detalle interno; solo se redirige al login con aviso.
      return NextResponse.redirect(
        new URL("/admin/login?error=recovery", baseUrl)
      );
    }

    return NextResponse.redirect(
      new URL("/admin/update-password", baseUrl)
    );
  } catch {
    return NextResponse.redirect(
      new URL("/admin/login?error=recovery", baseUrl)
    );
  }
}
