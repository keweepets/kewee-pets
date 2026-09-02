import type { Metadata } from "next";

import { requerirAdmin } from "@/lib/auth/sesion";
import FormularioNuevaContrasena from "./formulario";

export const metadata: Metadata = {
  title: "Nueva contraseña",
  robots: { index: false, follow: false },
};

/**
 * Pantalla para establecer la nueva contraseña tras una recuperación.
 * Protegida: requiere una sesión válida de admin (requerirAdmin). Si el
 * callback de recuperación falló y no hay sesión, redirige al login.
 */
export default async function ActualizarPasswordPage() {
  const admin = await requerirAdmin();

  return (
    <div className="flex flex-1 items-center justify-center bg-green-50 px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <p className="text-xs font-black uppercase tracking-widest text-green-600">
          KEWEE MASCOTAS
        </p>
        <h1 className="mt-1 font-display text-2xl font-black text-dark">
          Nueva contraseña
        </h1>
        <p className="mt-1 text-sm text-muted">
          Hola, {admin.email}. Establece una nueva contraseña para tu cuenta.
        </p>

        <FormularioNuevaContrasena />
      </div>
    </div>
  );
}
