"use client";

import { useActionState } from "react";

import Boton from "@/components/ui/boton";
import CampoTexto from "@/components/ui/campo-texto";
import { actualizarPassword, type EstadoActualizarPassword } from "../acciones-sesion";

const estadoInicial: EstadoActualizarPassword = {};

export default function FormularioNuevaContrasena() {
  const [estado, formAction, pendiente] = useActionState(
    actualizarPassword,
    estadoInicial
  );

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      {estado.error ? (
        <p key={estado.error} role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
          {estado.error}
        </p>
      ) : null}

      <CampoTexto
        label="Nueva contraseña"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="Nueva contraseña"
        required
        minLength={8}
        disabled={pendiente}
        ayuda="Mínimo 8 caracteres."
      />
      <CampoTexto
        label="Confirmar contraseña"
        name="confirmacion"
        type="password"
        autoComplete="new-password"
        placeholder="Repite la contraseña"
        required
        minLength={8}
        disabled={pendiente}
      />

      <Boton type="submit" radio="xl" disabled={pendiente} className="mt-1 w-full">
        {pendiente ? "Guardando..." : "Guardar contraseña"}
      </Boton>
    </form>
  );
}
