import Link from "next/link";

import { obtenerClienteServicioSupabase } from "@/lib/supabase/servidor";
import Badge from "@/components/ui/badge";
import type { MarcaRow } from "@/lib/supabase/tipos-db";
import FormularioMarca from "./formulario";
import BotonToggleMarca from "./boton-toggle";

async function obtenerMarcasAdmin(): Promise<MarcaRow[]> {
  const supabase = obtenerClienteServicioSupabase();
  const { data, error } = await supabase
    .from("marcas")
    .select("*")
    .order("nombre", { ascending: true });

  if (error) {
    throw new Error(`[admin-marcas] Error al consultar marcas: ${error.message}`);
  }

  return (data ?? []) as MarcaRow[];
}

export default async function PaginaMarcasAdmin() {
  const marcas = await obtenerMarcasAdmin();

  return (
    <section className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-black text-dark">Marcas</h1>
        <p className="mt-1 text-muted">
          Crea y gestiona las marcas del catálogo.
        </p>
      </header>

      <article className="rounded-2xl border border-gray-100 bg-white p-6">
        <FormularioMarca />
      </article>

      {marcas.length === 0 ? (
        <article className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="font-display text-xl font-black text-dark">
            No hay marcas todavía
          </p>
          <p className="mt-2 text-sm text-muted">
            Crea la primera marca usando el formulario de arriba.
          </p>
        </article>
      ) : (
        <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-bold uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {marcas.map((marca) => (
                  <tr
                    key={marca.id}
                    className="transition-colors hover:bg-gray-50/50"
                  >
                    <td className="px-4 py-3 font-bold text-dark">
                      {marca.nombre}
                    </td>
                    <td className="px-4 py-3 text-muted">/{marca.slug}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge tono={marca.activo ? "verdeSuave" : "gris"}>
                        {marca.activo ? "Activa" : "Inactiva"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Link
                          href={`/admin/marcas/${marca.id}`}
                          className="text-sm font-semibold text-green-600 transition-colors hover:text-green-800"
                        >
                          Editar
                        </Link>
                        <BotonToggleMarca
                          marcaId={marca.id}
                          activo={marca.activo}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <footer className="border-t border-gray-100 bg-gray-50 px-4 py-3 text-xs text-muted">
            {marcas.length} marca{marcas.length !== 1 && "s"} en total
          </footer>
        </article>
      )}
    </section>
  );
}
