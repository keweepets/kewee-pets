import Link from "next/link";

import Badge from "@/components/ui/badge";
import {
  obtenerConteosPorEstado,
  obtenerMetricasComerciales,
  obtenerResumenMetodoPago,
} from "@/lib/pedidos/consultas";
import {
  ETIQUETAS_PERIODO,
  parsearPeriodo,
  resolverRangoFechas,
  resolverRangoPersonalizado,
} from "@/lib/pedidos/periodo";
import { obtenerKpisCatalogo } from "@/lib/catalogo/consultas";
import {
  ESTADOS_ORDEN,
  ETIQUETAS_ESTADO,
  ETIQUETAS_METODO_PAGO,
  TONOS_ESTADO,
} from "@/lib/pedidos/presentacion";
import { formatPriceCOP } from "@/utils/formato";
import SelectorPeriodo from "./selector-periodo";

export const metadata = {
  title: "Resumen",
};

function formatearFechaLarga(fecha: string): string {
  return new Date(`${fecha}T12:00:00`).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function PaginaResumenAdmin({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; desde?: string; hasta?: string }>;
}) {
  const params = await searchParams;
  const periodo = parsearPeriodo(params.periodo);

  const rangoPersonalizado =
    periodo === "personalizado"
      ? resolverRangoPersonalizado(params.desde, params.hasta)
      : null;
  const rango = resolverRangoFechas(periodo, rangoPersonalizado);

  const [conteosDb, resumenMetodo, kpisCatalogo, metricas] =
    await Promise.all([
      obtenerConteosPorEstado(rango),
      obtenerResumenMetodoPago(rango),
      obtenerKpisCatalogo(),
      obtenerMetricasComerciales(rango),
    ]);

  const conteos: Record<string, number> = {};
  for (const c of conteosDb) conteos[c.estado] = c.cantidad;

  const totalPedidosPeriodo = Object.values(conteos).reduce(
    (acc, n) => acc + n,
    0
  );
  const ingresosPeriodo = resumenMetodo.reduce(
    (acc, m) => acc + m.sumaTotal,
    0
  );
  const ticketPromedioCobrado = Math.round(metricas.valorPromedioPedido);

  const etiquetaPeriodo =
    periodo === "personalizado" && rango.desde && rango.hasta
      ? `${formatearFechaLarga(rango.desde)} → ${formatearFechaLarga(rango.hasta)}`
      : ETIQUETAS_PERIODO[periodo];

  return (
    <section className="flex flex-col gap-6">
      <header>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-black text-dark">Resumen</h1>
            <p className="mt-1 text-muted">
              ¿Cómo está la tienda y qué tienes que atender?
            </p>
          </div>
          <SelectorPeriodo activo={periodo} />
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="text-sm font-black uppercase tracking-widest text-green-600">
            Pedidos del período
          </h2>
          <p className="mt-2 font-display text-2xl font-black text-dark">
            {totalPedidosPeriodo}
          </p>
          <p className="mt-1 text-sm text-muted">{etiquetaPeriodo}</p>
        </article>

        <article className="rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="text-sm font-black uppercase tracking-widest text-green-600">
            Cobrado del período
          </h2>
          <p className="mt-2 font-display text-2xl font-black text-dark">
            {formatPriceCOP(ingresosPeriodo)}
          </p>
          <p className="mt-1 text-sm text-muted">
            Únicamente pedidos con pago confirmado (estado_pago = pagado) ·{" "}
            {etiquetaPeriodo}
          </p>

          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {resumenMetodo.map(({ metodoPago, cantidad, sumaTotal }) => (
              <li
                key={metodoPago}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-3 py-2"
              >
                <span className="text-sm font-semibold text-dark">
                  {ETIQUETAS_METODO_PAGO[metodoPago]}
                </span>
                <span className="text-right text-sm">
                  <span className="font-black text-dark">{cantidad}</span>{" "}
                  <span className="text-muted">· {formatPriceCOP(sumaTotal)}</span>
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-3 text-sm text-muted">
            Ticket promedio cobrado:{" "}
            <span className="font-bold text-dark">
              {formatPriceCOP(ticketPromedioCobrado)}
            </span>
          </p>
        </article>
      </div>

      <div className="border-t border-gray-200" aria-hidden="true" />

      <article className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-black uppercase tracking-widest text-green-600">
            Pedidos por estado
          </h2>
          <Link
            href="/admin/pedidos"
            className="text-sm font-semibold text-green-600 transition-colors hover:text-green-800"
          >
            Ver pedidos →
          </Link>
        </div>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {ESTADOS_ORDEN.map((estado) => (
            <li
              key={estado}
              className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-3 py-2"
            >
              <span className="text-sm font-semibold text-dark">
                {ETIQUETAS_ESTADO[estado]}
              </span>
              <Badge tono={TONOS_ESTADO[estado]}>{conteos[estado] ?? 0}</Badge>
            </li>
          ))}
        </ul>
      </article>

      <div className="border-t border-gray-200" aria-hidden="true" />

      <article className="rounded-2xl border border-gray-100 bg-white p-5">
        <h2 className="text-sm font-black uppercase tracking-widest text-green-600">
          Inventario y ventas
        </h2>
        <p className="mt-1 text-xs text-muted">
          Corte actual del catálogo (no depende del período).
        </p>

        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-bold text-dark">Stock bajo</p>
            {kpisCatalogo.stockBajo.length === 0 ? (
              <p className="mt-2 text-sm text-muted">
                Sin variantes con stock bajo.
              </p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {kpisCatalogo.stockBajo.map((v) => (
                  <li
                    key={`${v.producto}-${v.variante}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2"
                  >
                    <span className="text-sm font-semibold text-dark">
                      {v.producto}{" "}
                      <span className="text-muted">· {v.variante}</span>
                    </span>
                    <Badge tono="ambar">{v.stock} ud</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <p className="text-sm font-bold text-dark">
              Más vendidos (histórico)
            </p>
            {kpisCatalogo.topProductos.length === 0 ? (
              <p className="mt-2 text-sm text-muted">
                Sin ventas registradas todavía.
              </p>
            ) : (
              <ol className="mt-2 space-y-1.5">
                {kpisCatalogo.topProductos.map((p, i) => (
                  <li
                    key={`${p.nombre}-${i}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-dark">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-black text-white">
                        {i + 1}
                      </span>
                      {p.nombre}
                    </span>
                    <span className="text-sm text-muted">
                      {p.unidadesVendidas} ud
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </article>
    </section>
  );
}