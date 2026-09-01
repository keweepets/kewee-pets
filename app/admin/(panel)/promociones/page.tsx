import type { Metadata } from "next";
import Link from "next/link";

import Badge from "@/components/ui/badge";
import Boton from "@/components/ui/boton";
import { obtenerClienteServicioSupabase } from "@/lib/supabase/servidor";
import type { PromocionRow } from "@/lib/supabase/tipos-db";
import {
  ETIQUETAS_ALCANCE,
  ETIQUETAS_TIPO,
} from "./presentacion";
import BotonTogglePromocion from "./boton-toggle";
import {
  calcularImpacto,
  type CatalogoParaImpacto,
  type ImpactoPromocion,
} from "./impacto";

export const metadata: Metadata = {
  title: "Promociones",
};

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatearValor(promo: PromocionRow): string {
  if (promo.tipo === "porcentaje") return `${promo.valor}%`;
  return "$" + promo.valor.toLocaleString("es-CO");
}

function esVigente(promo: PromocionRow, ahora: number): boolean {
  const inicio = new Date(promo.fecha_inicio).getTime();
  const fin = new Date(promo.fecha_fin).getTime();
  return inicio <= ahora && ahora <= fin;
}

function ahoraEnMilisegundos(): number {
  return new Date().getTime();
}

function nombreObjetivo(
  promo: PromocionRow,
  nombres: { [id: string]: string }
): string {
  if (promo.alcance === "global") return "Todos";
  const id =
    promo.alcance === "categoria"
      ? promo.categoria_id
      : promo.alcance === "marca"
        ? promo.marca_id
        : promo.alcance === "producto"
          ? promo.producto_id
          : promo.variante_id;
  return id && nombres[id] ? nombres[id] : "—";
}

function ResumenConteos({
  total,
  activas,
  vigentes,
}: {
  total: number;
  activas: number;
  vigentes: number;
}) {
  const tarjetas = [
    { etiqueta: "Total", valor: total, clase: "text-dark" },
    { etiqueta: "Activas", valor: activas, clase: "text-green-600" },
    { etiqueta: "Vigentes", valor: vigentes, clase: "text-amber-600" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {tarjetas.map((t) => (
        <article
          key={t.etiqueta}
          className="rounded-2xl border border-gray-100 bg-white p-5 text-center"
        >
          <p className={`font-display text-3xl font-black ${t.clase}`}>
            {t.valor}
          </p>
          <p className="mt-1 text-sm font-semibold uppercase tracking-widest text-muted">
            {t.etiqueta}
          </p>
        </article>
      ))}
    </div>
  );
}

function Impacto({ impacto }: { impacto: ImpactoPromocion }) {
  return (
    <div className="flex flex-col">
      <span className="font-semibold text-dark">
        {impacto.productos} producto{impacto.productos !== 1 && "s"}
      </span>
      <span className="text-xs text-muted">
        {impacto.variantes} variante{impacto.variantes !== 1 && "s"}
      </span>
    </div>
  );
}

export default async function PaginaPromocionesAdmin() {
  const supabase = obtenerClienteServicioSupabase();
  const ahora = ahoraEnMilisegundos();

  const [promosResult, productosResult, variantesResult, categoriasResult] =
    await Promise.all([
      supabase
        .from("promociones")
        .select(
          `*,
          categorias(nombre),
          marcas(nombre),
          productos(nombre),
          variantes_producto(nombre)`
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("productos")
        .select("id, marca_id, activo, categorias(slug, parent_id)"),
      supabase
        .from("variantes_producto")
        .select("id, producto_id, activo"),
      supabase
        .from("categorias")
        .select("id, slug, parent_id"),
    ]);

  if (promosResult.error) {
    throw new Error(
      `[admin-promociones] Error al consultar promociones: ${promosResult.error.message}`,
    );
  }

  const filas = (promosResult.data ?? []) as (PromocionRow & {
    categorias: { nombre: string } | null;
    marcas: { nombre: string } | null;
    productos: { nombre: string } | null;
    variantes_producto: { nombre: string } | null;
  })[];

  const nombres: { [id: string]: string } = {};
  for (const f of filas) {
    if (f.categorias) nombres[f.categoria_id as string] = f.categorias.nombre;
    if (f.marcas) nombres[f.marca_id as string] = f.marcas.nombre;
    if (f.productos) nombres[f.producto_id as string] = f.productos.nombre;
    if (f.variantes_producto)
      nombres[f.variante_id as string] = f.variantes_producto.nombre;
  }

  // Catálogo para impacto.
  const productosDb = (productosResult.data ?? []) as {
    id: string;
    marca_id: string;
    activo: boolean;
    categorias: { slug: string; parent_id: string | null }[] | null;
  }[];

  const catalogo: CatalogoParaImpacto = {
    productos: productosDb
      .filter((p) => p.activo)
      .map((p) => ({
        id: p.id,
        marcaId: p.marca_id,
        categoriaSlug: p.categorias?.[0]?.slug ?? "",
      })),
    variantes: ((variantesResult.data ?? []) as {
      id: string;
      producto_id: string;
      activo: boolean;
    }[]).map((v) => ({ id: v.id, productoId: v.producto_id, activo: v.activo })),
    categorias: ((categoriasResult.data ?? []) as {
      id: string;
      slug: string;
      parent_id: string | null;
    }[]).map((c) => ({ id: c.id, slug: c.slug, parent_id: c.parent_id })),
  };

  const impactoPorPromo = new Map<string, ImpactoPromocion>();
  for (const f of filas) {
    impactoPorPromo.set(f.id, calcularImpacto(f as PromocionRow, catalogo));
  }

  let totalActivas = 0;
  let totalVigentes = 0;
  for (const f of filas) {
    const prom = f as PromocionRow;
    if (prom.activo) totalActivas += 1;
    if (prom.activo && esVigente(prom, ahora)) totalVigentes += 1;
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black text-dark">
            Promociones
          </h1>
          <p className="mt-1 text-muted">
            Descuentos y ofertas aplicados a productos del catálogo.
          </p>
        </div>
        <Link href="/admin/promociones/nuevo">
          <Boton radio="xl">Crear promoción</Boton>
        </Link>
      </header>

      <ResumenConteos
        total={filas.length}
        activas={totalActivas}
        vigentes={totalVigentes}
      />

      {filas.length === 0 ? (
        <article className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="font-display text-xl font-black text-dark">
            No hay promociones todavía
          </p>
          <p className="mt-2 text-sm text-muted">
            Las promociones que se creen aparecerán aquí.
          </p>
        </article>
      ) : (
        <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-bold uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Promoción</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Alcance</th>
                  <th className="px-4 py-3">Objetivo</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3 text-center">Impacto</th>
                  <th className="px-4 py-3">Vigencia</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filas.map((row) => {
                  const prom = row as PromocionRow;
                  const vigente = esVigente(prom, ahora);

                  const tonoEstado: "verdeSuave" | "ambar" | "gris" =
                    prom.activo
                      ? vigente
                        ? "verdeSuave"
                        : "ambar"
                      : "gris";

                  const etiquetaEstado = !prom.activo
                    ? "Inactiva"
                    : vigente
                      ? "Vigente"
                      : "No vigente";

                  return (
                    <tr
                      key={prom.id}
                      className="transition-colors hover:bg-gray-50/50"
                    >
                      <td className="px-4 py-3 font-bold text-dark">
                        {prom.nombre}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {ETIQUETAS_TIPO[prom.tipo]}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {ETIQUETAS_ALCANCE[prom.alcance]}
                      </td>
                      <td className="px-4 py-3 text-dark">
                        {nombreObjetivo(prom, nombres)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-dark">
                        {formatearValor(prom)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Impacto
                          impacto={impactoPorPromo.get(prom.id) ?? { productos: 0, variantes: 0 }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-muted">
                            {formatearFecha(prom.fecha_inicio)}
                          </span>
                          <span className="text-xs text-muted">
                            hasta {formatearFecha(prom.fecha_fin)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge tono={tonoEstado}>{etiquetaEstado}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Link
                            href={`/admin/promociones/${prom.id}`}
                            className="text-sm font-semibold text-green-600 transition-colors hover:text-green-800"
                          >
                            Editar
                          </Link>
                          <BotonTogglePromocion
                            promocionId={prom.id}
                            activo={prom.activo}
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
            {filas.length} promoción{filas.length !== 1 && "es"} en total
          </footer>
        </article>
      )}
    </section>
  );
}
