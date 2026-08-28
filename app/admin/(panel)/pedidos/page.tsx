import type { Metadata } from "next";
import Link from "next/link";

import Badge from "@/components/ui/badge";
import {
  obtenerConteosPorEstado,
  obtenerPedidosAdmin,
} from "@/lib/pedidos/consultas";
import {
  ETIQUETAS_ESTADO,
  ETIQUETAS_METODO_PAGO,
  ESTADOS_ORDEN,
  TONOS_ESTADO,
} from "@/lib/pedidos/presentacion";
import type { EstadoPedido } from "@/lib/supabase/tipos-db";
import { formatPriceCOP } from "@/utils/formato";
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

  const pedidos = await obtenerPedidosAdmin({
    estado,
    q: params.q,
    desde: params.desde,
    hasta: params.hasta,
  });

  const conteosDb = await obtenerConteosPorEstado();
  const conteos: Record<string, number> = { total: pedidos.length };
  for (const c of conteosDb) conteos[c.estado] = c.cantidad;

  const hayFiltros = Boolean(estado || params.q || params.desde || params.hasta);

  return (
    <section className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-black text-dark">Pedidos</h1>
        <p className="mt-1 text-muted">
          Gestiona los pedidos recibidos en la tienda.
        </p>
      </header>

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
          <footer className="border-t border-gray-100 bg-gray-50 px-4 py-3 text-xs text-muted">
            {pedidos.length} pedido{pedidos.length !== 1 && "s"}
            {hayFiltros && " (con filtros aplicados)"}
          </footer>
        </article>
      )}
    </section>
  );
}
