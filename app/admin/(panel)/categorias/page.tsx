import Link from "next/link";

import Badge from "@/components/ui/badge";
import { obtenerClienteServicioSupabase } from "@/lib/supabase/servidor";
import type { CategoriaRow } from "@/lib/supabase/tipos-db";
import FormularioCategoria from "./formulario";
import BotonToggleCategoria from "./boton-toggle";

interface NodoCategoria extends CategoriaRow {
  hijos: NodoCategoria[];
}

function construirArbol(categorias: CategoriaRow[]): NodoCategoria[] {
  const filas = [...categorias].sort(
    (a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre)
  );
  const nodos = new Map<string, NodoCategoria>();
  for (const c of filas) {
    nodos.set(c.id, { ...c, hijos: [] });
  }
  const raices: NodoCategoria[] = [];
  for (const nodo of nodos.values()) {
    if (nodo.parent_id && nodos.has(nodo.parent_id)) {
      nodos.get(nodo.parent_id)!.hijos.push(nodo);
    } else {
      raices.push(nodo);
    }
  }
  return raices;
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
        <tr key={nodo.id} className="transition-colors hover:bg-gray-50/50">
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
            </div>
          </td>
        </tr>
      ))}
      {nodos.length > 0 &&
        nodos.map((nodo) => (
          <FilasCategoria
            key={`hijos-${nodo.id}`}
            nodos={nodo.hijos}
            nivel={nivel + 1}
          />
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
