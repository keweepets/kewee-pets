import { NextResponse, type NextRequest } from "next/server";

/**
 * Gate rápido de borde para /admin (Next.js 16: proxy.ts; middleware está
 * deprecado). SOLO comprueba la presencia de la cookie de sesión de
 * Supabase Auth para evitar renders inútiles.
 *
 * NO es la frontera de seguridad: la validación real del JWT y de la
 * allowlist ADMIN_EMAILS ocurre en el servidor vía requerirAdmin()
 * (app/admin/layout.tsx y cada Server Action futura).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return NextResponse.next();
  }

  const tieneCookieSesion = request.cookies
    .getAll()
    .some(
      (cookie) =>
        cookie.name.startsWith("sb-") && cookie.name.includes("auth-token")
    );

  if (!tieneCookieSesion) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
