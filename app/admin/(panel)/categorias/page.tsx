import Link from "next/link";
import { Fragment } from "react";

import Badge from "@/components/ui/badge";
import { obtenerClienteServicioSupabase } from "@/lib/supabase/servidor";
import type { CategoriaRow } from "@/lib/supabase/tipos-db";
import FormularioCategoria from "./formulario";
import BotonToggleCategoria from "./boton-toggle";
import BotonReordenarCategoria from "./boton-reordenar";
import BotonEliminarCategoria from "./boton-eliminar";

interface NodoCategoria extends CategoriaRow {
  hijos: NodoCategoria[];
  puedeSubir: boolean;
  puedeBajar: boolean;
}

function conMetadatosOrden(nodos: NodoCategoria[]): NodoCategoria[] {
  return nodos.map((nodo, indice) => ({
    ...nodo,
    puedeSubir: indice > 0,
    puedeBajar: indice < nodos.length - 1,
    hijos: conMetadatosOrden(nodo.hijos),
  }));
}

function ordenarHermanos<T extends CategoriaRow>(nodos: T[]): T[] {
  return [...nodos].sort(
    (a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre)
  );
}

/**
 * Construye el árbol jerárquico por DFS: cada grupo de hermanos (mismo
 * parent_id) se ordena por su propio `orden`, sin mezclar niveles mediante
 * un orden plano global.
 */
function construirArbol(categorias: CategoriaRow[]): NodoCategoria[] {
  const ids = new Set(categorias.map((c) => c.id));
  const hijosPorPadre = new Map<string | null, CategoriaRow[]>();
  for (const c of categorias) {
    const clave = c.parent_id && ids.has(c.parent_id) ? c.parent_id : null;
    const lista = hijosPorPadre.get(clave) ?? [];
    lista.push(c);
    hijosPorPadre.set(clave, lista);
  }

  function armarNodo(c: CategoriaRow): NodoCategoria {
    const hijos = ordenarHermanos(hijosPorPadre.get(c.id) ?? []).map(armarNodo);
    return { ...c, hijos, puedeSubir: false, puedeBajar: false };
  }

  return conMetadatosOrden(
    ordenarHermanos(hijosPorPadre.get(null) ?? []).map(armarNodo)
  );
}

function FilasCategoria({
  nodos,
  nivel,
}: {
  nodos: NodoCategoria[];
  nivel: number;
}) {
  return (
    <>
      {nodos.map((nodo) => (
        <Fragment key={nodo.id}>
          <tr className="transition-colors hover:bg-gray-50/50">
            <td className="px-4 py-3">
              <div
                className="flex flex-col"
                style={{ paddingLeft: `${nivel * 1.5}rem` }}
              >
                <span className="font-bold text-dark">{nodo.nombre}</span>
                <span className="text-xs text-muted">/{nodo.slug}</span>
              </div>
            </td>
            <td className="px-4 py-3 text-muted">
              {nivel === 0 ? (
                <span>Raíz</span>
              ) : (
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Subcategoría · nivel {nivel}
                </span>
              )}
            </td>
            <td className="px-4 py-3 text-center">
              <Badge tono={nodo.activo ? "verdeSuave" : "gris"}>
                {nodo.activo ? "Activa" : "Inactiva"}
              </Badge>
            </td>
            <td className="px-4 py-3 text-center">
              <div className="flex items-center justify-center gap-1">
                <BotonReordenarCategoria
                  categoriaId={nodo.id}
                  direccion="arriba"
                  activo={nodo.puedeSubir}
                  etiqueta={`Subir ${nodo.nombre}`}
                />
                <BotonReordenarCategoria
                  categoriaId={nodo.id}
                  direccion="abajo"
                  activo={nodo.puedeBajar}
                  etiqueta={`Bajar ${nodo.nombre}`}
                />
              </div>
            </td>
            <td className="px-4 py-3 text-center">
              <div className="flex flex-col items-center gap-1">
                <Link
                  href={`/admin/categorias/${nodo.id}`}
                  className="text-sm font-semibold text-green-600 transition-colors hover:text-green-800"
                >
                  Editar
                </Link>
                <BotonToggleCategoria
                  categoriaId={nodo.id}
                  activo={nodo.activo}
                />
                <BotonEliminarCategoria
                  categoriaId={nodo.id}
                  nombre={nodo.nombre}
                />
              </div>
            </td>
          </tr>
          {nodo.hijos.length > 0 && (
            <FilasCategoria nodos={nodo.hijos} nivel={nivel + 1} />
          )}
        </Fragment>
      ))}
    </>
  );
}

export default async function PaginaCategoriasAdmin() {
  const supabase = obtenerClienteServicioSupabase();

  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("orden", { ascending: true });

  if (error) {
    throw new Error(
      `[admin-categorias] Error al consultar categorías: ${error.message}`
    );
  }

  const categorias = (data ?? []) as CategoriaRow[];
  const arbol = construirArbol(categorias);
  const opciones = categorias.map((c) => ({
    id: c.id,
    nombre: c.nombre,
  }));

  return (
    <section className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-black text-dark">Categorías</h1>
        <p className="mt-1 text-muted">
          Organiza el catálogo en una jerarquía de categorías y subcategorías.
        </p>
      </header>

      <article className="rounded-2xl border border-gray-100 bg-white p-6">
        <FormularioCategoria categorias={opciones} />
      </article>

      {categorias.length === 0 ? (
        <article className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="font-display text-xl font-black text-dark">
            No hay categorías todavía
          </p>
          <p className="mt-2 text-sm text-muted">
            Crea la primera categoría usando el formulario de arriba.
          </p>
        </article>
      ) : (
        <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-bold uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">Jerarquía</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-center">Orden</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <FilasCategoria nodos={arbol} nivel={0} />
              </tbody>
            </table>
          </div>
          <footer className="border-t border-gray-100 bg-gray-50 px-4 py-3 text-xs text-muted">
            {categorias.length} categoría{categorias.length !== 1 && "s"} en total
          </footer>
        </article>
      )}
    </section>
  );
}
