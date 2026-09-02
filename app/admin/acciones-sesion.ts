"use server";

import { redirect } from "next/navigation";

import {
  crearClienteAuthSupabase,
  leerEmailsAdminPermitidos,
  requerirAdmin,
  type EstadoLogin,
} from "@/lib/auth/sesion";

/**
 * Server Actions de sesión del panel (FASE 6A).
 * Únicas superficies server-side de esta fase; no exponen datos ni
 * ejecutan escrituras de catálogo. Toda acción administrativa FUTURA
 * deberá comenzar con requerirAdmin().
 */

export async function iniciarSesion(
  _estadoPrevio: EstadoLogin,
  formData: FormData
): Promise<EstadoLogin> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Ingresa tu correo y tu contraseña." };
  }

  const supabase = await crearClienteAuthSupabase();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // Mensaje genérico a propósito: no revela si el correo existe ni si
  // es un admin autorizado.
  if (error) {
    return { error: "Credenciales incorrectas." };
  }

  if (!leerEmailsAdminPermitidos().includes(email)) {
    // Autenticado pero fuera de la allowlist: cerrar la sesión recién
    // creada y devolver al login con aviso genérico.
    await supabase.auth.signOut();
    redirect("/admin/login?denegado=1");
  }

  redirect("/admin");
}

export async function cerrarSesion(): Promise<void> {
  const supabase = await crearClienteAuthSupabase();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/** Política de contraseña mínima (fracas en Supabase si es demasiado corta). */
const LONGITUD_MINIMA_CONTRASENA = 8;

export interface EstadoActualizarPassword {
  error?: string;
  exito?: string;
}

/**
 * Actualiza la contraseña del admin (flujo de recuperación).
 * Solo procede con una sesión válida (requerirAdmin) para que únicamente una
 * recuperación autenticada pueda cambiar la contraseña. Tras el éxito se
 * redirige al panel.
 */
export async function actualizarPassword(
  _estadoPrevio: EstadoActualizarPassword,
  formData: FormData
): Promise<EstadoActualizarPassword> {
  await requerirAdmin();

  const password = String(formData.get("password") ?? "");
  const confirmacion = String(formData.get("confirmacion") ?? "");

  if (!password || !confirmacion) {
    return { error: "Ingresa y confirma tu nueva contraseña." };
  }
  if (password !== confirmacion) {
    return { error: "Las contraseñas no coinciden." };
  }
  if (password.length < LONGITUD_MINIMA_CONTRASENA) {
    return {
      error: `La contraseña debe tener al menos ${LONGITUD_MINIMA_CONTRASENA} caracteres.`,
    };
  }

  const supabase = await crearClienteAuthSupabase();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    // Mensaje genérico: no revela detalle interno del error de Supabase.
    return { error: "No se pudo actualizar la contraseña. Inténtalo de nuevo." };
  }

  redirect("/admin");
}

/** Marca si el correo ingresado tiene formato válido (básico). */
function emailFormatoValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export interface EstadoSolicitarRecuperacion {
  exito?: boolean;
  error?: string;
}

/**
 * Emisor del flujo "¿Olvidaste tu contraseña?".
 * Envía el correo de recuperación de Supabase con redirectTo apuntando a
 * nuestro callback. La respuesta es deliberadamente genérica y NO revela si
 * el correo existe (previene enumeración de cuentas).
 */
export async function solicitarRecuperacion(
  _estadoPrevio: EstadoSolicitarRecuperacion,
  formData: FormData
): Promise<EstadoSolicitarRecuperacion> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email || !emailFormatoValido(email)) {
    return { error: "Ingresa un correo electrónico válido." };
  }

  const sitio = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const redirectTo = `${sitio}/auth/callback`;

  const supabase = await crearClienteAuthSupabase();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    // Genérico: no expone el motivo interno.
    return { error: "No se pudo enviar el correo. Inténtalo de nuevo." };
  }

  return { exito: true };
}

