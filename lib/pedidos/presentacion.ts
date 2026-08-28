/**
 * Presentación de pedidos para el panel de administración.
 * Centraliza etiquetas y tonos visuales de estados y métodos de pago.
 */

import type { EstadoPedido, MetodoPago } from "@/lib/supabase/tipos-db";

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
