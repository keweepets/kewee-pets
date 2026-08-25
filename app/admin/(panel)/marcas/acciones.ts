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
