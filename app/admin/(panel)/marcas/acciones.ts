"use server";

import { requerirAdmin } from "@/lib/auth/sesion";
import { obtenerClienteServicioSupabase } from "@/lib/supabase/servidor";

export interface CrearMarcaEntrada {
  nombre: string;
}

function generarSlug(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function crearMarca(
  entrada: CrearMarcaEntrada
): Promise<{ ok: boolean; error?: string; id?: string }> {
  await requerirAdmin();

  const nombre = entrada.nombre.trim();
  if (!nombre) {
    return { ok: false, error: "El nombre es obligatorio." };
  }
  if (nombre.length > 100) {
    return { ok: false, error: "El nombre no puede exceder 100 caracteres." };
  }

  const supabase = obtenerClienteServicioSupabase();
  const slug = generarSlug(nombre);

  if (!slug) {
    return { ok: false, error: "No se pudo generar un slug válido." };
  }

  // Evitar slugs duplicados
  const { data: existente } = await supabase
    .from("marcas")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existente) {
    return {
      ok: false,
      error: `Ya existe una marca con el slug "${slug}".`,
    };
  }

  const { data, error } = await supabase
    .from("marcas")
    .insert({ nombre, slug, activo: true })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, id: data.id };
}

// ---------------------------------------------------------------------------
// Editar
// ---------------------------------------------------------------------------

export interface EditarMarcaEntrada {
  id: string;
  nombre: string;
  activo?: boolean;
}

export async function editarMarca(
  entrada: EditarMarcaEntrada
): Promise<{ ok: boolean; error?: string }> {
  await requerirAdmin();

  const nombre = entrada.nombre.trim();
  if (!nombre) {
    return { ok: false, error: "El nombre es obligatorio." };
  }
  if (nombre.length > 100) {
    return { ok: false, error: "El nombre no puede exceder 100 caracteres." };
  }

  const supabase = obtenerClienteServicioSupabase();

  const { data: existente } = await supabase
    .from("marcas")
    .select("id")
    .eq("id", entrada.id)
    .maybeSingle();
  if (!existente) {
    return { ok: false, error: "La marca ya no existe." };
  }

  const slug = generarSlug(nombre);
  if (!slug) {
    return { ok: false, error: "No se pudo generar un slug válido." };
  }

  const { data: duplicado } = await supabase
    .from("marcas")
    .select("id")
    .eq("slug", slug)
    .neq("id", entrada.id)
    .maybeSingle();
  if (duplicado) {
    return { ok: false, error: `Ya existe otra marca con el slug "${slug}".` };
  }

  const activo = entrada.activo ?? true;
  const { error } = await supabase
    .from("marcas")
    .update({ nombre, slug, activo })
    .eq("id", entrada.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

// ---------------------------------------------------------------------------
// Activar / desactivar
// ---------------------------------------------------------------------------

export async function toggleActivoMarca(
  entrada: { id: string; activo: boolean }
): Promise<{ ok: boolean; error?: string }> {
  await requerirAdmin();

  const supabase = obtenerClienteServicioSupabase();

  const { data: existente } = await supabase
    .from("marcas")
    .select("id")
    .eq("id", entrada.id)
    .maybeSingle();
  if (!existente) {
    return { ok: false, error: "La marca ya no existe." };
  }

  const { error } = await supabase
    .from("marcas")
    .update({ activo: entrada.activo })
    .eq("id", entrada.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
