import Link from "next/link";

import Badge from "@/components/ui/badge";
import {
  obtenerConteosPorEstado,
  obtenerMetricasComerciales,
  obtenerResumenMetodoPago,
  obtenerSerie30Dias,
} from "@/lib/pedidos/consultas";
import {
  ETIQUETAS_PERIODO,
  diasDelMesActual,
  parsearPeriodo,
  resolverRangoFechas,
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

export default async function PaginaResumenAdmin({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const params = await searchParams;
  const periodo = parsearPeriodo(params.periodo);

  const rango = resolverRangoFechas(periodo);
  // Días a mostrar en la serie según el período ("Todo" conserva 30, el
  // comportamiento actual).
  const diasSerie =
    periodo === "hoy"
      ? 1
      : periodo === "7d"
        ? 7
        : periodo === "30d" || periodo === "todo"
          ? 30
          : diasDelMesActual();

  const [conteosDb, resumenMetodo, serie, kpisCatalogo, metricas] =
    await Promise.all([
      obtenerConteosPorEstado(rango),
      obtenerResumenMetodoPago(rango),
      obtenerSerie30Dias(diasSerie),
      obtenerKpisCatalogo(),
      obtenerMetricasComerciales(rango),
    ]);

  const maxPedidosDia = Math.max(1, ...serie.map((d) => d.pedidos));

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

  return (
    <section className="flex flex-col gap-6">
      <header>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-black text-dark">Resumen</h1>
            <p className="mt-1 text-muted">
              Estado general del panel y de la tienda.
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
          <p className="mt-1 text-sm text-muted">
            {ETIQUETAS_PERIODO[periodo]}
          </p>
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
            {ETIQUETAS_PERIODO[periodo]}
          </p>
        </article>
      </div>

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

      <article className="rounded-2xl border border-gray-100 bg-white p-5">
        <h2 className="text-sm font-black uppercase tracking-widest text-green-600">
          Cobrado por método de pago
        </h2>
        <p className="mt-1 text-xs text-muted">
          Solo pedidos con pago confirmado (estado_pago = pagado).
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
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
      </article>

      <article className="rounded-2xl border border-gray-100 bg-white p-5">
        <h2 className="text-sm font-black uppercase tracking-widest text-green-600">
          Métricas comerciales
        </h2>
        <p className="mt-1 text-xs text-muted">
          Período: {ETIQUETAS_PERIODO[periodo]} · {metricas.totalPedidos}{" "}
          {metricas.totalPedidos !== 1 ? "pedidos" : "pedido"}.
        </p>

        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-100 px-3 py-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">
              Valor promedio (cobrado)
            </p>
            <p className="font-display text-xl font-black text-dark">
              {formatPriceCOP(Math.round(metricas.valorPromedioPedido))}
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 px-3 py-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">
              Tasa de entregados
            </p>
            <p className="font-display text-xl font-black text-dark">
              {metricas.tasaEntregados.toFixed(1)}%
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 px-3 py-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">
              Cancelados / rechazados
            </p>
            <p className="font-display text-xl font-black text-dark">
              {metricas.tasaCanceladosRechazados.toFixed(1)}%
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 px-3 py-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">
              Clientes repetidos
            </p>
            <p className="font-display text-xl font-black text-dark">
              {metricas.clientesRepetidos}
              <span className="text-sm font-bold text-muted">
                {" "}
                / {metricas.clientesConPedidos} ({metricas.tasaRepetidos.toFixed(1)}%)
              </span>
            </p>
          </div>
        </div>
      </article>

      <article className="rounded-2xl border border-gray-100 bg-white p-5">
        <h2 className="text-sm font-black uppercase tracking-widest text-green-600">
          Catálogo y ventas
        </h2>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-100 px-3 py-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">
              Productos activos
            </p>
            <p className="font-display text-xl font-black text-dark">
              {kpisCatalogo.productosActivos}
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 px-3 py-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">
              Marcas activas
            </p>
            <p className="font-display text-xl font-black text-dark">
              {kpisCatalogo.marcasActivas}
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 px-3 py-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">
              Categorías activas
            </p>
            <p className="font-display text-xl font-black text-dark">
              {kpisCatalogo.categoriasActivas}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-bold text-dark">Top productos más vendidos</p>
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
                      {v.producto} <span className="text-muted">· {v.variante}</span>
                    </span>
                    <Badge tono="ambar">{v.stock} ud</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </article>

      <article className="rounded-2xl border border-gray-100 bg-white p-5">
        <h2 className="text-sm font-black uppercase tracking-widest text-green-600">
          Serie últimos 30 días
        </h2>

        <div className="mt-4 flex h-28 items-end gap-1">
          {serie.map(({ fecha, pedidos }) => (
            <div
              key={fecha}
              title={`${fecha}: ${pedidos} pedido${pedidos !== 1 ? "s" : ""}`}
              className="flex-1 rounded-t bg-green-500/70 transition-colors hover:bg-green-600"
              style={{
                height: `${(pedidos / maxPedidosDia) * 100}%`,
                minHeight: pedidos > 0 ? "4px" : "1px",
              }}
            />
          ))}
        </div>

        <div className="mt-4 max-h-72 overflow-auto rounded-xl border border-gray-100">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-gray-50">
              <tr className="text-xs font-bold uppercase tracking-wider text-muted">
                <th className="px-3 py-2">Fecha</th>
                <th className="px-3 py-2 text-right">Pedidos</th>
                <th className="px-3 py-2 text-right">Cobrado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...serie].reverse().map(({ fecha, pedidos, ingresos }) => (
                <tr key={fecha} className="transition-colors hover:bg-gray-50/50">
                  <td className="px-3 py-2">
                    {new Date(`${fecha}T12:00:00`).toLocaleDateString("es-CO", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-dark">
                    {pedidos}
                  </td>
                  <td className="px-3 py-2 text-right text-dark">
                    {formatPriceCOP(ingresos)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
