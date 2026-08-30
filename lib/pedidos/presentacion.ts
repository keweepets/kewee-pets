/**
 * Presentación de pedidos para el panel de administración.
 * Centraliza etiquetas y tonos visuales de estados y métodos de pago.
 */

import type { EstadoPago, EstadoPedido, MetodoPago } from "@/lib/supabase/tipos-db";

export const ETIQUETAS_ESTADO: Record<EstadoPedido, string> = {
  recibido: "Recibido",
  en_proceso: "En proceso",
  entregado: "Entregado",
  cancelado: "Cancelado",
  rechazado: "Rechazado",
};

export const ESTADOS_ORDEN: EstadoPedido[] = [
  "recibido",
  "en_proceso",
  "entregado",
  "cancelado",
  "rechazado",
];

export const TONOS_ESTADO: Record<
  EstadoPedido,
  "ambar" | "azul" | "verdeSuave" | "gris" | "rojo"
> = {
  recibido: "ambar",
  en_proceso: "azul",
  entregado: "verdeSuave",
  cancelado: "gris",
  rechazado: "rojo",
};

export const ETIQUETAS_METODO_PAGO: Record<MetodoPago, string> = {
  contraentrega: "Contra entrega",
  mercadopago: "Mercado Pago",
};

export const METODOS_PAGO: MetodoPago[] = ["contraentrega", "mercadopago"];

export const ETIQUETAS_ESTADO_PAGO: Record<EstadoPago, string> = {
  pendiente: "Pago pendiente",
  pagado: "Pagado",
  rechazado: "Pago rechazado",
};

export const ESTADOS_PAGO: EstadoPago[] = ["pendiente", "pagado", "rechazado"];

export const TONOS_ESTADO_PAGO: Record<
  EstadoPago,
  "ambar" | "verdeSuave" | "rojo"
> = {
  pendiente: "ambar",
  pagado: "verdeSuave",
  rechazado: "rojo",
};
