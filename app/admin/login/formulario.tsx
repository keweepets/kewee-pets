"use client";

import { useState, useActionState } from "react";

import Boton from "@/components/ui/boton";
import CampoTexto from "@/components/ui/campo-texto";
import {
  iniciarSesion,
  solicitarRecuperacion,
} from "@/app/admin/acciones-sesion";
import type { EstadoLogin } from "@/lib/auth/sesion";
import type { EstadoSolicitarRecuperacion } from "@/app/admin/acciones-sesion";

const estadoInicialLogin: EstadoLogin = {};
const estadoInicialRecuperacion: EstadoSolicitarRecuperacion = {};

export default function FormularioLogin() {
  const [modo, setModo] = useState<"login" | "recuperacion">("login");
  const [login, formActionLogin, pendienteLogin] = useActionState(
    iniciarSesion,
    estadoInicialLogin
  );
  const [recuperacion, formActionRecuperacion, pendienteRecuperacion] =
    useActionState(solicitarRecuperacion, estadoInicialRecuperacion);

  const volverAlLogin = () => setModo("login");

  if (modo === "recuperacion") {
    return (
      <div className="mt-6">
        <h2 className="text-sm font-black text-dark">¿Olvidaste tu contraseña?</h2>
        <p className="mt-1 text-sm text-muted">
          Ingresa tu correo y te enviaremos un enlace para restablecer tu
          contraseña.
        </p>

        {recuperacion.error ? (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
          >
            {recuperacion.error}
          </p>
        ) : null}

        {recuperacion.exito ? (
          <p
            role="status"
            className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700"
          >
            Si el correo existe en nuestra plataforma, recibirás un enlace para
            restablecer tu contraseña. Revisa tu bandeja de entrada.
          </p>
        ) : null}

        {!recuperacion.exito ? (
          <form action={formActionRecuperacion} className="mt-4 flex flex-col gap-4">
            <CampoTexto
              label="Correo electrónico"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="admin@keweepets.com"
              required
              disabled={pendienteRecuperacion}
            />
            <Boton
              type="submit"
              radio="xl"
              disabled={pendienteRecuperacion}
              className="mt-1 w-full"
            >
              {pendienteRecuperacion ? "Enviando..." : "Enviar enlace"}
            </Boton>
          </form>
        ) : null}

        <button
          type="button"
          onClick={volverAlLogin}
          className="mt-4 text-sm font-semibold text-green-600 hover:underline"
        >
          Volver al inicio de sesión
        </button>
      </div>
    );
  }

  return (
    <form action={formActionLogin} className="mt-6 flex flex-col gap-4">
      {login.error ? (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
        >
          {login.error}
        </p>
      ) : null}

      <CampoTexto
        label="Correo electrónico"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="admin@keweepets.com"
        required
        disabled={pendienteLogin}
      />
      <CampoTexto
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        required
        disabled={pendienteLogin}
      />

      <Boton type="submit" radio="xl" disabled={pendienteLogin} className="mt-1 w-full">
        {pendienteLogin ? "Ingresando..." : "Ingresar"}
      </Boton>

      <button
        type="button"
        onClick={() => setModo("recuperacion")}
        className="mt-1 text-center text-sm font-semibold text-green-600 hover:underline"
      >
        ¿Olvidaste tu contraseña?
      </button>
    </form>
  );
}
