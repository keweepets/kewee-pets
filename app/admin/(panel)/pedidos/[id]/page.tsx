import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Badge from "@/components/ui/badge";
import Boton from "@/components/ui/boton";
import { obtenerPedidoPorId } from "@/lib/pedidos/consultas";
import {
  ETIQUETAS_ESTADO,
  ETIQUETAS_ESTADO_PAGO,
  ETIQUETAS_METODO_PAGO,
  TONOS_ESTADO,
  TONOS_ESTADO_PAGO,
} from "@/lib/pedidos/presentacion";
import { formatPriceCOP } from "@/utils/formato";
import CambiarEstadoPedido from "./cambiar-estado";
import NotaInterna from "../nota-interna";
import { construirEnlaceWhatsAppCliente } from "@/lib/whatsapp/enlace-cliente";

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
            <Badge tono={TONOS_ESTADO_PAGO[pedido.estado_pago]}>
              {ETIQUETAS_ESTADO_PAGO[pedido.estado_pago]}
            </Badge>
            <Badge tono="azul">
              {ETIQUETAS_METODO_PAGO[pedido.metodo_pago]}
            </Badge>
          </div>
          <p className="mt-1 text-muted">{formatearFecha(pedido.created_at)}</p>
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

          {(() => {
            const enlace = construirEnlaceWhatsAppCliente(
              cliente.telefono,
              `Hola ${cliente.nombre.trim().split(/\s+/)[0]}, te escribimos desde KEWEE MASCOTAS para confirmar tu pedido ${pedido.numero_pedido} por un total de ${formatPriceCOP(pedido.total)} (${ETIQUETAS_METODO_PAGO[pedido.metodo_pago]}). Antes de prepararlo, confírmanos por favor tu nombre completo, celular, dirección, barrio y ciudad. Si necesitas agregar alguna indicación para la entrega, también puedes enviárnosla.`
            );
            return enlace ? (
              <a
                href={enlace}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#20BD5A]"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp del cliente
              </a>
            ) : null;
          })()}
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

      <NotaInterna pedidoId={pedido.id} nota={pedido.nota_interna} />
    </section>
  );
}
