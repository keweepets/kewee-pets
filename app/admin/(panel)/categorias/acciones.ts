"use server";

import { requerirAdmin } from "@/lib/auth/sesion";
import { obtenerClienteServicioSupabase } from "@/lib/supabase/servidor";
import type { CategoriaRow } from "@/lib/supabase/tipos-db";

// ---------------------------------------------------------------------------
// Tipos de entrada
// ---------------------------------------------------------------------------

export interface CrearCategoriaEntrada {
  nombre: string;
  parentId?: string | null;
  orden?: number;
}

export interface EditarCategoriaEntrada {
  id: string;
  nombre: string;
  parentId?: string | null;
  orden?: number;
  activo?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Mismo generador de slug que marcas.productos (patrón del panel). */
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

async function slugDisponible(
  slug: string,
  ignorarId?: string
): Promise<boolean> {
  const supabase = obtenerClienteServicioSupabase();
  let consulta = supabase.from("categorias").select("id").eq("slug", slug);
  if (ignorarId) consulta = consulta.neq("id", ignorarId);
  const { data } = await consulta.maybeSingle();
  return !data;
}

async function nombreDisponible(
  nombre: string,
  ignorarId?: string
): Promise<boolean> {
  const supabase = obtenerClienteServicioSupabase();
  let consulta = supabase.from("categorias").select("id").eq("nombre", nombre);
  if (ignorarId) consulta = consulta.neq("id", ignorarId);
  const { data } = await consulta.maybeSingle();
  return !data;
}

/**
 * Recolecta recursivamente los ids de los descendientes de una categoría,
 * para detectar ciclos al cambiar parent_id (una categoría no puede ser
 * hija de sí misma ni de sus propias subcategorías).
 */
async function obtenerIdsDescendientes(id: string): Promise<Set<string>> {
  const supabase = obtenerClienteServicioSupabase();
  const { data, error } = await supabase
    .from("categorias")
    .select("id, parent_id");
  if (error) {
    throw new Error(
      `[admin-categorias] Error al consultar jerarquía: ${error.message}`
    );
  }

  const hijosPorPadre = new Map<string | null, string[]>();
  for (const c of (data ?? []) as CategoriaRow[]) {
    const lista = hijosPorPadre.get(c.parent_id) ?? [];
    lista.push(c.id);
    hijosPorPadre.set(c.parent_id, lista);
  }

  const resultado = new Set<string>();
  const pila = hijosPorPadre.get(id) ?? [];
  while (pila.length > 0) {
    const actual = pila.pop() as string;
    if (resultado.has(actual)) continue;
    resultado.add(actual);
    pila.push(...(hijosPorPadre.get(actual) ?? []));
  }
  return resultado;
}

// ---------------------------------------------------------------------------
// Crear
// ---------------------------------------------------------------------------

export async function crearCategoria(
  entrada: CrearCategoriaEntrada
): Promise<{ ok: boolean; error?: string; id?: string }> {
  await requerirAdmin();

  const nombre = entrada.nombre.trim();
  const parentId = entrada.parentId?.trim() ? entrada.parentId.trim() : null;
  const orden = entrada.orden ?? 0;

  if (!nombre) {
    return { ok: false, error: "El nombre es obligatorio." };
  }

  const slug = generarSlug(nombre);
  if (!slug) {
    return { ok: false, error: "No se pudo generar un slug válido." };
  }

  const supabase = obtenerClienteServicioSupabase();

  if (!(await nombreDisponible(nombre))) {
    return { ok: false, error: `Ya existe una categoría con el nombre "${nombre}".` };
  }
  if (!(await slugDisponible(slug))) {
    return { ok: false, error: `Ya existe una categoría con el slug "${slug}".` };
  }

  // Validar parent_id: debe existir y la nueva categoría no puede ser su propia madre.
  if (parentId) {
    const { data: padre } = await supabase
      .from("categorias")
      .select("id")
      .eq("id", parentId)
      .maybeSingle();
    if (!padre) {
      return { ok: false, error: "La categoría padre seleccionada no existe." };
    }
  }

  const { data, error } = await supabase
    .from("categorias")
    .insert({ nombre, slug, parent_id: parentId, orden, activo: true })
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

export async function editarCategoria(
  entrada: EditarCategoriaEntrada
): Promise<{ ok: boolean; error?: string }> {
  await requerirAdmin();

  const nombre = entrada.nombre.trim();
  const parentId = entrada.parentId?.trim() ? entrada.parentId.trim() : null;
  const orden = entrada.orden ?? 0;
  const activo = entrada.activo ?? true;

  if (!nombre) {
    return { ok: false, error: "El nombre es obligatorio." };
  }

  const slug = generarSlug(nombre);
  if (!slug) {
    return { ok: false, error: "No se pudo generar un slug válido." };
  }

  const supabase = obtenerClienteServicioSupabase();

  // La categoría debe existir.
  const { data: existente } = await supabase
    .from("categorias")
    .select("id")
    .eq("id", entrada.id)
    .maybeSingle();
  if (!existente) {
    return { ok: false, error: "La categoría ya no existe." };
  }

  if (parentId === entrada.id) {
    return { ok: false, error: "Una categoría no puede ser hija de sí misma." };
  }

  // Sin ciclos: el nuevo padre no puede ser la categoría ni un descendiente suyo.
  if (parentId) {
    const descendientes = await obtenerIdsDescendientes(entrada.id);
    if (descendientes.has(parentId)) {
      return {
        ok: false,
        error: "No se puede mover la categoría bajo una de sus propias subcategorías.",
      };
    }
    const { data: padre } = await supabase
      .from("categorias")
      .select("id")
      .eq("id", parentId)
      .maybeSingle();
    if (!padre) {
      return { ok: false, error: "La categoría padre seleccionada no existe." };
    }
  }

  if (!(await nombreDisponible(nombre, entrada.id))) {
    return { ok: false, error: `Ya existe otra categoría con el nombre "${nombre}".` };
  }
  if (!(await slugDisponible(slug, entrada.id))) {
    return { ok: false, error: `Ya existe otra categoría con el slug "${slug}".` };
  }

  const { error } = await supabase
    .from("categorias")
    .update({ nombre, slug, parent_id: parentId, orden, activo })
    .eq("id", entrada.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

// ---------------------------------------------------------------------------
// Activar / desactivar
// ---------------------------------------------------------------------------

export async function toggleActivoCategoria(
  entrada: { id: string; activo: boolean }
): Promise<{ ok: boolean; error?: string }> {
  await requerirAdmin();

  const supabase = obtenerClienteServicioSupabase();
  const { data: existente } = await supabase
    .from("categorias")
    .select("id")
    .eq("id", entrada.id)
    .maybeSingle();
  if (!existente) {
    return { ok: false, error: "La categoría ya no existe." };
  }

  const { error } = await supabase
    .from("categorias")
    .update({ activo: entrada.activo })
    .eq("id", entrada.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
