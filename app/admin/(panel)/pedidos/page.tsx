import type { Metadata } from "next";
import Link from "next/link";

import Badge from "@/components/ui/badge";
import {
  obtenerConteosPorEstado,
  obtenerPedidosAdmin,
  obtenerResumenMetodoPago,
} from "@/lib/pedidos/consultas";
import type { FiltrosPedidosAdmin } from "@/lib/pedidos/consultas";
import {
  ETIQUETAS_ESTADO,
  ETIQUETAS_ESTADO_PAGO,
  ETIQUETAS_METODO_PAGO,
  ESTADOS_ORDEN,
  TONOS_ESTADO,
  TONOS_ESTADO_PAGO,
} from "@/lib/pedidos/presentacion";
import type {
  EstadoPago,
  EstadoPedido,
  MetodoPago,
} from "@/lib/supabase/tipos-db";
import { formatPriceCOP } from "@/utils/formato";
import BotonExportar from "./boton-exportar";
import FiltrosPedidos from "./filtros";

export const metadata: Metadata = {
  title: "Pedidos",
};

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

interface EntradaParams {
  searchParams: Promise<{
    estado?: string;
    q?: string;
    desde?: string;
    hasta?: string;
    metodoPago?: string;
    estadoPago?: string;
    pagina?: string;
  }>;
}

const ESTADOS_VALIDOS: EstadoPedido[] = ESTADOS_ORDEN;

export default async function PaginaPedidosAdmin({
  searchParams,
}: EntradaParams) {
  const params = await searchParams;

  const estado = (ESTADOS_VALIDOS as string[]).includes(params.estado ?? "")
    ? (params.estado as EstadoPedido)
    : undefined;

  const metodoPago = (
    ["contraentrega", "mercadopago"] as string[]
  ).includes(params.metodoPago ?? "")
    ? (params.metodoPago as MetodoPago)
    : undefined;

  const estadoPago = (["pendiente", "pagado", "rechazado"] as string[]).includes(
    params.estadoPago ?? ""
  )
    ? (params.estadoPago as EstadoPago)
    : undefined;

  const pagina = Math.max(parseInt(params.pagina ?? "1", 10) || 1, 1);

  const filtros: FiltrosPedidosAdmin = {
    estado,
    q: params.q,
    desde: params.desde,
    hasta: params.hasta,
    metodoPago,
    estadoPago,
  };

  const resultado = await obtenerPedidosAdmin({
    ...filtros,
    pagina,
  });
  const { pedidos, total: totalPedidos, totalPaginas } = resultado;

  const [conteosDb, resumenMetodo] = await Promise.all([
    obtenerConteosPorEstado(),
    obtenerResumenMetodoPago(filtros),
  ]);
  const conteos: Record<string, number> = { total: totalPedidos };
  for (const c of conteosDb) conteos[c.estado] = c.cantidad;

  const hayFiltros = Boolean(
    estado || params.q || params.desde || params.hasta || metodoPago || estadoPago
  );

  function construirUrPagina(nuevaPagina: number): string {
    const url = new URLSearchParams(params);
    url.set("pagina", String(nuevaPagina));
    return `/admin/pedidos?${url.toString()}`;
  }

  return (
    <section className="flex flex-col gap-6">
      <header>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-black text-dark">Pedidos</h1>
            <p className="mt-1 text-muted">
              Gestiona los pedidos recibidos en la tienda.
            </p>
          </div>
          <BotonExportar filtros={filtros} deshabilitado={totalPedidos === 0} />
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {resumenMetodo.map(({ metodoPago, cantidad, sumaTotal }) => (
          <article
            key={metodoPago}
            className="rounded-2xl border border-gray-100 bg-white p-4"
          >
            <p className="text-sm font-bold text-muted">
              {ETIQUETAS_METODO_PAGO[metodoPago]}
            </p>
            <p className="mt-1 font-display text-2xl font-black text-dark">
              {cantidad}
            </p>
            <p className="text-xs text-muted">
              {formatPriceCOP(sumaTotal)}
            </p>
          </article>
        ))}
      </div>

      <FiltrosPedidos conteos={conteos} />

      {pedidos.length === 0 ? (
        <article className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="font-display text-xl font-black text-dark">
            {hayFiltros ? "No se encontraron pedidos" : "No hay pedidos todavía"}
          </p>
          <p className="mt-2 text-sm text-muted">
            {hayFiltros
              ? "Ajusta los filtros o el término de búsqueda e intenta de nuevo."
              : "Los pedidos que se creen en la tienda aparecerán aquí."}
          </p>
        </article>
      ) : (
        <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-bold uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">N° pedido</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Método</th>
                  <th className="px-4 py-3 text-center">Pago</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pedidos.map(({ pedido, cliente }) => (
                  <tr
                    key={pedido.id}
                    className="transition-colors hover:bg-gray-50/50"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-bold text-dark">
                      {pedido.numero_pedido}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {formatearFecha(pedido.created_at)}
                    </td>
                    <td className="px-4 py-3 font-bold text-dark">
                      {cliente.nombre}
                    </td>
                    <td className="px-4 py-3 text-muted">{cliente.telefono}</td>
                    <td className="px-4 py-3 text-right font-bold text-dark">
                      {formatPriceCOP(pedido.total)}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {ETIQUETAS_METODO_PAGO[pedido.metodo_pago]}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge tono={TONOS_ESTADO_PAGO[pedido.estado_pago]}>
                        {ETIQUETAS_ESTADO_PAGO[pedido.estado_pago]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge tono={TONOS_ESTADO[pedido.estado]}>
                        {ETIQUETAS_ESTADO[pedido.estado]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/admin/pedidos/${pedido.id}`}
                        className="text-sm font-semibold text-green-600 transition-colors hover:text-green-800"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-xs text-muted">
              {totalPedidos} pedido{totalPedidos !== 1 && "s"}
              {hayFiltros && " (con filtros aplicados)"}
            </p>

            {totalPaginas > 1 && (
              <nav className="flex items-center gap-2" aria-label="Paginación">
                <Link
                  href={construirUrPagina(pagina - 1)}
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
                  href={construirUrPagina(pagina + 1)}
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
          </div>
        </article>
      )}
    </section>
  );
}
