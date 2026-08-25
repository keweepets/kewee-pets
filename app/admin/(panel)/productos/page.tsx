import Link from "next/link";

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

function sanitizarBusqueda(q: string): string {
  return q.replace(/[(),%]/g, " ").trim();
}

async function obtenerProductosAdmin(busqueda?: string): Promise<ProductoAdmin[]> {
  const supabase = obtenerClienteServicioSupabase();
  const termino = sanitizarBusqueda(busqueda ?? "");

  let consulta = supabase
    .from("productos")
    .select(`
      id, nombre, slug, activo, es_destacado, es_mas_vendido,
      marcas(id, nombre),
      categorias(id, nombre, slug),
      variantes_producto(id, nombre, sku, precio, stock, activo),
      imagenes_producto(url, orden, activo)
    `);

  if (termino) {
    const patron = `%${termino}%`;

    const { data: variantesMatch } = await supabase
      .from("variantes_producto")
      .select("producto_id")
      .ilike("sku", patron);

    const idsPorSku = new Set(
      (variantesMatch ?? []).map((v) => v.producto_id)
    );

    consulta = consulta.or(
      `nombre.ilike.${patron},slug.ilike.${patron}`
    );

    const { data, error } = await consulta.order("created_at", { ascending: false });

    if (error) {
      throw new Error(`[admin-productos] Error al consultar productos: ${error.message}`);
    }

    const productosDb = (data ?? []) as ProductoAdmin[];

    if (idsPorSku.size === 0) return productosDb;

    const idsNormales = new Set(productosDb.map((p) => p.id));
    const idsFaltantes = [...idsPorSku].filter((id) => !idsNormales.has(id));

    if (idsFaltantes.length === 0) return productosDb;

    const { data: adicionales } = await supabase
      .from("productos")
      .select(`
        id, nombre, slug, activo, es_destacado, es_mas_vendido,
        marcas(id, nombre),
        categorias(id, nombre, slug),
        variantes_producto(id, nombre, sku, precio, stock, activo),
        imagenes_producto(url, orden, activo)
      `)
      .in("id", idsFaltantes)
      .order("created_at", { ascending: false });

    return [...productosDb, ...((adicionales ?? []) as ProductoAdmin[])];
  }

  const { data, error } = await consulta.order("created_at", { ascending: false });

  if (error) {
    throw new Error(`[admin-productos] Error al consultar productos: ${error.message}`);
  }

  return (data ?? []) as ProductoAdmin[];
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
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const productos = await obtenerProductosAdmin(q);

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
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-bold uppercase tracking-wider text-muted">
                  <th className="px-4 py-3"></th>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Marca</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">Variantes</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
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
                      <td className="px-4 py-3 text-dark">
                        {Array.isArray(producto.marcas)
                          ? producto.marcas[0]?.nombre ?? "—"
                          : producto.marcas?.nombre ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-dark">
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
                                className="flex items-center gap-2 text-xs"
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
                      <td className="px-4 py-3 text-center">
                        <Badge tono={producto.activo ? "verdeSuave" : "gris"}>
                          {producto.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
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

          <footer className="border-t border-gray-100 bg-gray-50 px-4 py-3 text-xs text-muted">
            {q && (
              <span>
                Resultados para &quot;{q}&quot; ·{" "}
              </span>
            )}
            {productos.length} producto{productos.length !== 1 && "s"} en total
          </footer>
        </article>
      )}
    </section>
  );
}
