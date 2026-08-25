"use client";

import { useActionState } from "react";

import Boton from "@/components/ui/boton";
import CampoTexto from "@/components/ui/campo-texto";
import { iniciarSesion } from "@/app/admin/acciones-sesion";
import type { EstadoLogin } from "@/lib/auth/sesion";

const estadoInicial: EstadoLogin = {};

export default function FormularioLogin() {
  const [estado, formAction, pendiente] = useActionState(
    iniciarSesion,
    estadoInicial
  );

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      {estado.error ? (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
        >
          {estado.error}
        </p>
      ) : null}

      <CampoTexto
        label="Correo electrónico"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="admin@keweepets.com"
        required
        disabled={pendiente}
      />
      <CampoTexto
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        required
        disabled={pendiente}
      />

      <Boton type="submit" radio="xl" disabled={pendiente} className="mt-1 w-full">
        {pendiente ? "Ingresando..." : "Ingresar"}
      </Boton>
    </form>
  );
}
