import type { Metadata } from "next";

import Boton from "@/components/ui/boton";
import { requerirAdmin } from "@/lib/auth/sesion";
import { cerrarSesion } from "../acciones-sesion";

export const metadata: Metadata = {
  title: {
    default: "Panel de administración",
    template: "%s | Admin KEWEE",
  },
  robots: { index: false, follow: false },
};

const SECCIONES_FUTURAS = ["Productos", "Marcas", "Promociones"];

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

        <nav
          aria-label="Secciones del panel"
          className="mx-auto flex w-full max-w-7xl gap-2 px-6 pb-3"
        >
          <span className="rounded-full bg-green-500 px-4 py-1.5 text-sm font-bold text-white">
            Resumen
          </span>
          {SECCIONES_FUTURAS.map((seccion) => (
            <span
              key={seccion}
              aria-disabled="true"
              className="cursor-not-allowed rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-bold text-gray-300"
            >
              {seccion}
            </span>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
}
