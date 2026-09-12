import Link from "next/link";
import { redirect } from "next/navigation";

import { obtenerClienteServicioSupabase } from "@/lib/supabase/servidor";
import Badge from "@/components/ui/badge";
import Boton from "@/components/ui/boton";
import BotonToggleActivo from "./boton-toggle";
import BuscadorProductos from "./buscador";

interface MarcaResumen {
  id: string;
  nombre: string;
}

interface CategoriaResumen {
  id: string;
  nombre: string;
  slug: string;
}

interface VarianteResumen {
  id: string;
  nombre: string;
  sku: string | null;
  precio: number;
  stock: number;
  activo: boolean;
}

interface ImagenResumen {
  url: string;
  orden: number;
  activo: boolean;
}

interface ProductoAdmin {
  id: string;
  nombre: string;
  slug: string;
  activo: boolean;
  es_destacado: boolean;
  es_mas_vendido: boolean;
  marcas: MarcaResumen[] | MarcaResumen | null;
  categorias: CategoriaResumen[] | CategoriaResumen | null;
  variantes_producto: VarianteResumen[];
  imagenes_producto: ImagenResumen[];
}

interface ResultadoProductosAdmin {
  productos: ProductoAdmin[];
  total: number;
  pagina: number;
  porPagina: number;
  totalPaginas: number;
}

async function obtenerProductosAdmin(
  busqueda?: string,
  pagina = 1,
  porPagina = 15
): Promise<ResultadoProductosAdmin> {
  const supabase = obtenerClienteServicioSupabase();

  const { data, error } = await supabase.rpc("productos_admin_paginados", {
    p_busqueda: busqueda?.trim() ? busqueda : null,
    p_pagina: pagina,
    p_por_pagina: porPagina,
  });

  if (error) {
    throw new Error(`[admin-productos] Error al consultar productos: ${error.message}`);
  }

  const filas = (data ?? []) as (ProductoAdmin & { total: number })[];
  const total = filas[0]?.total ?? 0;
  const totalPaginas = Math.ceil(total / porPagina);

  return {
    productos: filas,
    total,
    pagina: Math.max(pagina, 1),
    porPagina,
    totalPaginas,
  };
}

function formatearPrecio(precio: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(precio);
}

export default async function PaginaProductosAdmin({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; pagina?: string }>;
}) {
  const { q, pagina: paginaParam } = await searchParams;
  const porPagina = 15;
  const paginaSolicitada = Math.max(
    parseInt(paginaParam ?? "1", 10) || 1,
    1
  );

  let resultado: ResultadoProductosAdmin | null = null;
  let errorConsulta: string | null = null;
  try {
    resultado = await obtenerProductosAdmin(q, paginaSolicitada, porPagina);
  } catch (e) {
    errorConsulta =
      e instanceof Error ? e.message : "Error desconocido al consultar.";
  }

  if (errorConsulta) {
    return (
      <section className="flex flex-col gap-6">
        <header>
          <h1 className="font-display text-2xl font-black text-dark">Productos</h1>
          <p className="mt-1 text-muted">
            Gestión del catálogo de productos, variantes e inventario.
          </p>
        </header>
        <article className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="font-display text-lg font-black text-red-700">
            No se pudieron cargar los productos
          </p>
          <p className="mt-2 text-sm text-red-600">
            {errorConsulta}
          </p>
          <p className="mt-4 text-sm text-muted">
            Revisa que Supabase esté disponible y vuelve a intentar.
          </p>
          <Link
            href="/admin/productos"
            className="mt-4 inline-block rounded-xl bg-green-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-green-600"
          >
            Reintentar
          </Link>
        </article>
      </section>
    );
  }

  if (!resultado) {
    throw new Error(
      "[admin-productos] Se perdió el resultado de la consulta: " + errorConsulta
    );
  }

  const { productos, total, totalPaginas } = resultado;
  const pagina = Math.min(paginaSolicitada, Math.max(totalPaginas, 1));

  function construirUrlPagina(nuevaPagina: number): string {
    const url = new URLSearchParams();
    if (q) url.set("q", q);
    url.set("pagina", String(nuevaPagina));
    return `/admin/productos?${url.toString()}`;
  }

  if (pagina !== paginaSolicitada) {
    redirect(construirUrlPagina(pagina));
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-dark">Productos</h1>
          <p className="mt-1 text-muted">
            Gestión del catálogo de productos, variantes e inventario.
          </p>
        </div>
        <Link href="/admin/productos/nuevo">
          <Boton radio="xl">Nuevo producto</Boton>
        </Link>
      </header>

      <BuscadorProductos />

      {productos.length === 0 ? (
        <article className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="font-display text-xl font-black text-dark">
            {q ? "No se encontraron productos" : "No hay productos todavía"}
          </p>
          <p className="mt-2 text-sm text-muted">
            {q
              ? `No hay resultados para "${q}". Intenta con otro término.`
              : "Crea el primer producto para comenzar a gestionar el catálogo."}
          </p>
        </article>
      ) : (
        <article className="rounded-2xl border border-gray-100 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-bold uppercase tracking-wider text-muted">
                  <th className="px-4 py-3"></th>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3 whitespace-nowrap">Marca</th>
                  <th className="px-4 py-3 whitespace-nowrap">Categoría</th>
                  <th className="px-4 py-3">Variantes</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">Estado</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {productos.map((producto) => {
                  const variantesActivas = producto.variantes_producto.filter(
                    (v) => v.activo
                  );

                  return (
                    <tr
                      key={producto.id}
                      className="transition-colors hover:bg-gray-50/50"
                    >
                      <td className="px-4 py-3">
                        {(() => {
                          const imagenPrincipal = producto.imagenes_producto
                            .filter((img) => img.activo)
                            .sort((a, b) => a.orden - b.orden)[0];
                          return imagenPrincipal ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={imagenPrincipal.url}
                              alt={producto.nombre}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                              <svg className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" />
                              </svg>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-dark">
                            {producto.nombre}
                          </span>
                          <span className="text-xs text-muted">
                            /{producto.slug}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-dark whitespace-nowrap">
                        {Array.isArray(producto.marcas)
                          ? producto.marcas[0]?.nombre ?? "—"
                          : producto.marcas?.nombre ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-dark whitespace-nowrap">
                        {Array.isArray(producto.categorias)
                          ? producto.categorias[0]?.nombre ?? "—"
                          : producto.categorias?.nombre ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        {variantesActivas.length === 0 ? (
                          <span className="text-xs text-muted">Sin variantes</span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {variantesActivas.map((v) => (
                              <div
                                key={v.id}
                                className="flex items-center gap-2 text-xs whitespace-nowrap"
                              >
                                <span className="font-semibold text-dark">
                                  {v.nombre}
                                </span>
                                <span className="text-muted">
                                  {formatearPrecio(v.precio)}
                                </span>
                                <span
                                  className={
                                    v.stock === 0
                                      ? "font-bold text-red-500"
                                      : v.stock <= 5
                                        ? "font-bold text-amber-600"
                                        : "text-muted"
                                  }
                                >
                                  ×{v.stock}
                                </span>
                                {v.sku && (
                                  <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-muted">
                                    {v.sku}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <Badge tono={producto.activo ? "verdeSuave" : "gris"}>
                          {producto.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center gap-1">
                          <Link
                            href={`/admin/productos/${producto.id}`}
                            className="text-sm font-semibold text-green-600 transition-colors hover:text-green-800"
                          >
                            Editar
                          </Link>
                          <BotonToggleActivo
                            productoId={producto.id}
                            activo={producto.activo}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-4 py-3 text-xs text-muted">
            <p>
              {q && (
                <span>
                  Resultados para &quot;{q}&quot; ·{" "}
                </span>
              )}
              {total} producto{total !== 1 && "s"} en total
            </p>

            {totalPaginas > 1 && (
              <nav className="flex items-center gap-2" aria-label="Paginación">
                <Link
                  href={construirUrlPagina(pagina - 1)}
                  aria-disabled={pagina <= 1}
                  className={
                    "rounded-lg border px-3 py-1.5 text-sm font-semibold " +
                    (pagina <= 1
                      ? "pointer-events-none border-gray-200 text-muted/50 opacity-50"
                      : "border-gray-200 bg-white text-dark hover:bg-gray-50")
                  }
                >
                  ← Anterior
                </Link>
                <span className="text-sm font-semibold text-dark">
                  Página {pagina} de {totalPaginas}
                </span>
                <Link
                  href={construirUrlPagina(pagina + 1)}
                  aria-disabled={pagina >= totalPaginas}
                  className={
                    "rounded-lg border px-3 py-1.5 text-sm font-semibold " +
                    (pagina >= totalPaginas
                      ? "pointer-events-none border-gray-200 text-muted/50 opacity-50"
                      : "border-gray-200 bg-white text-dark hover:bg-gray-50")
                  }
                >
                  Siguiente →
                </Link>
              </nav>
            )}
          </footer>
        </article>
      )}
    </section>
  );
}
