import { notFound } from "next/navigation";

import { obtenerClienteServicioSupabase } from "@/lib/supabase/servidor";
import type { CategoriaRow } from "@/lib/supabase/tipos-db";
import FormularioEditarCategoria from "./formulario-editar";

async function obtenerIdsDescendientes(
  categoriaId: string
): Promise<Set<string>> {
  const supabase = obtenerClienteServicioSupabase();
  const { data } = await supabase
    .from("categorias")
    .select("id, parent_id");

  const hijosPorPadre = new Map<string | null, string[]>();
  for (const c of (data ?? []) as CategoriaRow[]) {
    const lista = hijosPorPadre.get(c.parent_id) ?? [];
    lista.push(c.id);
    hijosPorPadre.set(c.parent_id, lista);
  }

  const resultado = new Set<string>();
  const pila = hijosPorPadre.get(categoriaId) ?? [];
  while (pila.length > 0) {
    const actual = pila.pop() as string;
    if (resultado.has(actual)) continue;
    resultado.add(actual);
    pila.push(...(hijosPorPadre.get(actual) ?? []));
  }
  return resultado;
}

export default async function PaginaEditarCategoria({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = obtenerClienteServicioSupabase();

  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(
      `[admin-categorias-editar] Error al consultar categoría: ${error.message}`
    );
  }

  if (!data) {
    notFound();
  }

  const categoria = data as CategoriaRow;
  const idsExcluidos = await obtenerIdsDescendientes(categoria.id);

  const { data: todas } = await supabase
    .from("categorias")
    .select("id, nombre, orden")
    .order("nombre", { ascending: true });

  const opcionesPadre = (todas ?? [])
    .filter((c: { id: string }) => c.id !== categoria.id && !idsExcluidos.has(c.id))
    .map((c: { id: string; nombre: string }) => ({ id: c.id, nombre: c.nombre }));

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-6">
      <FormularioEditarCategoria
        categoria={categoria}
        opcionesPadre={opcionesPadre}
      />
    </section>
  );
}
