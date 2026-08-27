/**
 * Generación de mensajes de WhatsApp para pedidos confirmados.
 *
 * Usa los datos reales de PedidoConRelaciones para construir un mensaje
 * legible y la URL wa.me correspondiente (sin API de WhatsApp Business).
 */

import { TIENDA } from "@/lib/config/tienda";
import type { PedidoConRelaciones } from "@/lib/pedidos/consultas";
import { formatPriceCOP } from "@/utils/formato";

const ETIQUETA_METODO_PAGO: Record<string, string> = {
  contraentrega: "Contraentrega",
  mercadopago: "Mercado Pago",
};

function etiquetaMetodoPago(metodo: string): string {
  return ETIQUETA_METODO_PAGO[metodo] ?? metodo;
}

function construccionDireccion(pedido: PedidoConRelaciones): string {
  const { direccion, barrio, ciudad, departamento } = pedido.pedido;
  const partes = [direccion];
  if (barrio) partes.push(barrio);
  partes.push(ciudad);
  if (departamento) partes.push(departamento);
  return partes.join(", ");
}

/** Construye el texto del mensaje de pedido confirmado. */
export function construirMensajePedido(pedido: PedidoConRelaciones): string {
  const { pedido: p, cliente, detalles } = pedido;

  const lineas = detalles.map(
    d => `• ${d.nombre_producto}${d.nombre_variante ? ` (${d.nombre_variante})` : ""} x${d.cantidad} — ${formatPriceCOP(d.subtotal_linea)}`
  );

  const lineasMensaje = [
    `¡Hola ${TIENDA.nombreLegal}! Soy ${cliente.nombre}. Quiero confirmar mi pedido:`,
    ``,
    `*N° Pedido:* ${p.numero_pedido}`,
    ``,
    `*Productos:*`,
    ...lineas,
    ``,
    `*Subtotal:* ${formatPriceCOP(p.subtotal)}`,
    p.descuento_total > 0 ? `*Descuento:* -${formatPriceCOP(p.descuento_total)}` : "",
    `*Envío:* ${p.costo_envio > 0 ? formatPriceCOP(p.costo_envio) : "Gratis"}`,
    `*Total:* ${formatPriceCOP(p.total)}`,
    ``,
    `*Método de pago:* ${etiquetaMetodoPago(p.metodo_pago)}`,
    `*Dirección de entrega:* ${construccionDireccion(pedido)}`,
  ].filter(linea => linea !== "");

  return lineasMensaje.join("\n");
}

/** Construye la URL wa.me que abre el mensaje de pedido en WhatsApp. */
export function construirEnlaceWhatsApp(pedido: PedidoConRelaciones): string {
  return `${TIENDA.urlWhatsApp}?text=${encodeURIComponent(construirMensajePedido(pedido))}`;
}
