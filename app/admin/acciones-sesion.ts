"use server";

import { redirect } from "next/navigation";

import {
  crearClienteAuthSupabase,
  leerEmailsAdminPermitidos,
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
