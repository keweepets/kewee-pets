import type { Metadata } from "next";

import FormularioLogin from "./formulario";

export const metadata: Metadata = {
  title: "Acceso administrativo",
  robots: { index: false, follow: false },
};

interface PropsPagina {
  searchParams: Promise<{ denegado?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: PropsPagina) {
  const { denegado, error } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center bg-green-50 px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <p className="text-xs font-black uppercase tracking-widest text-green-600">
          KEWEE MASCOTAS
        </p>
        <h1 className="mt-1 font-display text-2xl font-black text-dark">
          Panel de administración
        </h1>
        <p className="mt-1 text-sm text-muted">
          Ingresa con tu cuenta de administrador.
        </p>

        {denegado ? (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
          >
            Tu cuenta no tiene acceso al panel.
          </p>
        ) : null}

        {error === "recovery" ? (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
          >
            El enlace de recuperación no es válido o ya expiró. Solicita uno nuevo.
          </p>
        ) : null}

        <FormularioLogin />
      </div>
    </div>
  );
}
