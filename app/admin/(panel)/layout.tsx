import type { Metadata } from "next";

import Boton from "@/components/ui/boton";
import NavAdmin from "./nav-admin";
import { requerirAdmin } from "@/lib/auth/sesion";
import { cerrarSesion } from "../acciones-sesion";

export const metadata: Metadata = {
  title: {
    default: "Panel de administración",
    template: "%s | Admin KEWEE",
  },
  robots: { index: false, follow: false },
};

/**
 * Shell del panel. requerirAdmin() protege las rutas del grupo (panel):
 * es la frontera real de seguridad (el proxy.ts solo filtra cookies
 * ausentes a nivel de borde). /admin/login vive FUERA de este grupo
 * para no heredar el guard y evitar bucles de redirección.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requerirAdmin();

  return (
    <div className="flex min-h-full flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <p className="font-display text-lg font-black text-dark">
            KEWEE · Panel
          </p>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-muted">
              {admin.email}
            </span>
            <form action={cerrarSesion}>
              <Boton type="submit" variante="contorno" tamano="sm" radio="completo">
                Cerrar sesión
              </Boton>
            </form>
          </div>
        </div>

        <NavAdmin />
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
}
