import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Badge from "@/components/ui/badge";
import Boton from "@/components/ui/boton";
import { obtenerPedidoPorId } from "@/lib/pedidos/consultas";
import {
  ETIQUETAS_ESTADO,
  ETIQUETAS_METODO_PAGO,
  TONOS_ESTADO,
} from "@/lib/pedidos/presentacion";
import { formatPriceCOP } from "@/utils/formato";
import CambiarEstadoPedido from "./cambiar-estado";

export const metadata: Metadata = {
  title: "Detalle del pedido",
};

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function campo(texto: string | null | undefined): string {
  return texto?.trim() ? texto : "—";
}

export default async function PaginaDetallePedido({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resultado = await obtenerPedidoPorId(id);

  if (!resultado) {
    notFound();
  }

  const { pedido, cliente, detalles } = resultado;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <header>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-black text-dark">
              {pedido.numero_pedido}
            </h1>
            <Badge tono={TONOS_ESTADO[pedido.estado]}>
              {ETIQUETAS_ESTADO[pedido.estado]}
            </Badge>
          </div>
          <p className="mt-1 text-muted">
            {formatearFecha(pedido.created_at)} ·{" "}
            {ETIQUETAS_METODO_PAGO[pedido.metodo_pago]}
          </p>
        </header>
        <Link href="/admin/pedidos">
          <Boton variante="contorno" tamano="sm" radio="xl">
            ← Volver a pedidos
          </Boton>
        </Link>
      </div>

      <article className="rounded-2xl border border-gray-100 bg-white p-6">
        <h2 className="text-sm font-black uppercase tracking-widest text-green-600">
          Cambiar estado
        </h2>
        <div className="mt-3">
          <CambiarEstadoPedido pedidoId={pedido.id} estadoActual={pedido.estado} />
        </div>
      </article>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-green-600">
            Cliente
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Nombre</dt>
              <dd className="font-semibold text-dark">{cliente.nombre}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Teléfono</dt>
              <dd className="font-semibold text-dark">{cliente.telefono}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Email</dt>
              <dd className="font-semibold text-dark">{campo(cliente.email)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Dirección</dt>
              <dd className="text-right font-semibold text-dark">
                {campo(pedido.direccion)}
                {pedido.barrio ? `, ${pedido.barrio}` : ""}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Ciudad</dt>
              <dd className="font-semibold text-dark">
                {campo(pedido.ciudad)}
                {pedido.departamento ? `, ${pedido.departamento}` : ""}
              </dd>
            </div>
            {pedido.notas?.trim() && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Notas del pedido</dt>
                <dd className="text-right font-semibold text-dark">
                  {pedido.notas}
                </dd>
              </div>
            )}
          </dl>
        </article>

        <article className="rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-green-600">
            Productos
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-muted">
                  <th className="px-2 py-2">Producto</th>
                  <th className="px-2 py-2">Cant.</th>
                  <th className="px-2 py-2 text-right">P. unit.</th>
                  <th className="px-2 py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {detalles.map((detalle) => (
                  <tr key={detalle.id}>
                    <td className="px-2 py-2">
                      <div className="flex flex-col">
                        <span className="font-bold text-dark">
                          {detalle.nombre_producto}
                        </span>
                        {detalle.nombre_variante && (
                          <span className="text-xs text-muted">
                            {detalle.nombre_variante}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-dark">{detalle.cantidad}</td>
                    <td className="px-2 py-2 text-right text-muted">
                      {formatPriceCOP(detalle.precio_unitario)}
                    </td>
                    <td className="px-2 py-2 text-right font-semibold text-dark">
                      {formatPriceCOP(detalle.subtotal_linea)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <dl className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-semibold text-dark">
                {formatPriceCOP(pedido.subtotal)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Envío</dt>
              <dd className="font-semibold text-dark">
                {pedido.costo_envio === 0
                  ? "Gratis"
                  : formatPriceCOP(pedido.costo_envio)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Descuento</dt>
              <dd className="font-semibold text-dark">
                -{formatPriceCOP(pedido.descuento_total)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-gray-100 pt-3">
              <dt className="font-bold text-dark">Total</dt>
              <dd className="font-black text-dark">
                {formatPriceCOP(pedido.total)}
              </dd>
            </div>
          </dl>
        </article>
      </div>
    </section>
  );
}
