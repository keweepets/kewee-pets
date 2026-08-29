/**
 * Preferencias de Mercado Pago (Checkout Pro) — FASE 7.
 *
 * · Solo uso SERVIDOR (importa cliente.ts).
 * · Construye la preferencia a partir del pedido YA persistido por crearPedido():
 *   los precios provienen de los snapshots inmutables de detalles_pedido que el
 *   servidor recalculó (fuente de verdad). Nunca se aceptan precios del cliente.
 * · Los montos están en COP (enteros), consistentes con el catálogo.
 *
 * Convenciones por decisión de producto:
 *   - external_reference = pedido.id  → identifica el pedido ante Mercado Pago.
 *   - items = líneas del pedido (title, quantity, unit_price desde snapshot).
 *   - si el pedido tiene costo de envío, se agrega una línea "Envío" para que el
 *     total cobrado coincida exactamente con pedido.total.
 *   - back_urls (success/pending/failure) y notification_url se construyen con
 *     NEXT_PUBLIC_SITE_URL; si falta, la función falla con mensaje claro.
 *
 * Este módulo NO conecta el checkout ni crea el webhook todavía: solo deja
 * listo lo que el checkout usará para redirigir a init_point.
 */

import { Preference } from "mercadopago";
import { obtenerClienteMercadoPago } from "@/lib/mercadopago/cliente";
import type { PedidoConRelaciones } from "@/lib/pedidos/consultas";

const MONEDA = "COP";

/** Ruta de retorno (aún no implementada) y webhook (aún no implementado). */
const RUTA_RETORNO = "/checkout/pago";
const RUTA_WEBHOOK = "/api/webhooks/mercadopago";

/**
 * Forma mínima de una línea de la preferencia. Coincide estructuralmente con
 * `Items` del SDK de Mercado Pago (que no se exporta públicamente).
 */
interface ItemPreferencia {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
}

/**
 * Cuerpo de la preferencia a enviar a Mercado Pago. Coincide estructuralmente
 * con `PreferenceRequest` del SDK (no exportado públicamente por el SDK).
 */
export interface CuerpoPreferencia {
  items: ItemPreferencia[];
  external_reference: string;
  statement_descriptor: string;
  back_urls: {
    success: string;
    pending: string;
    failure: string;
  };
  auto_return?: string;
  notification_url: string;
  payment_methods: {
    installments: number;
  };
}

/** Base URL absoluta del sitio; falla claro si no está configurada. */
function obtenerUrlBase(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (!base) {
    throw new Error(
      "[mercadopago] Falta la variable de entorno NEXT_PUBLIC_SITE_URL. " +
        "Revisa .env.local (ver .env.example)."
    );
  }
  return base;
}

/**
 * Determina si la URL base del sitio apunta a un host local (localhost,
 * 127.0.0.1, ::1, 0.0.0.0) en lugar de un dominio públicamente alcanzable.
 * Mercado Pago rechaza las back_urls de auto-return para hosts locales
 * (error: "auto_return invalid. back_url.success must be defined"), así que en
 * esos casos NO se envía auto_return para que Checkout Pro acepte la preferencia.
 */
function esHostLocal(baseUrl: string): boolean {
  return /localhost/i.test(baseUrl) || /^https?:\/\/(127\.0\.0\.1|0\.0\.0\.0|::1)(:\d+)?(?:\/|$)/i.test(baseUrl);
}

/**
 * Prepara el cuerpo de la preferencia desde un pedido existente.
 * Función pura (no llama a la API), exportada para poder probarla.
 */
export function construirCuerpoPreferencia(
  pedido: PedidoConRelaciones
): CuerpoPreferencia {
  const { pedido: p, detalles } = pedido;

  const items = detalles.map((d) => ({
    id: d.variante_id ?? `linea-${d.id}`,
    title: d.nombre_variante
      ? `${d.nombre_producto} (${d.nombre_variante})`
      : d.nombre_producto,
    quantity: d.cantidad,
    unit_price: d.precio_unitario,
    currency_id: MONEDA,
  }));

  if (p.costo_envio > 0) {
    items.push({
      id: "envio",
      title: "Envío",
      quantity: 1,
      unit_price: p.costo_envio,
      currency_id: MONEDA,
    });
  }

  const base = obtenerUrlBase();

  // back_urls siempre son URLs absolutas derivadas de NEXT_PUBLIC_SITE_URL.
  const backUrls = {
    success: `${base}${RUTA_RETORNO}?resultado=exito`,
    pending: `${base}${RUTA_RETORNO}?resultado=pendiente`,
    failure: `${base}${RUTA_RETORNO}?resultado=fallo`,
  };

  return {
    items,
    external_reference: p.id,
    statement_descriptor: "KEWEE MASCOTAS",
    back_urls: backUrls,
    // Auto-return sólo si la URL de éxito es públicamente alcanzable; en
    // localhost (pruebas con token TEST) Mercado Pago lo rechaza.
    ...(esHostLocal(base) ? {} : { auto_return: "approved" }),
    notification_url: `${base}${RUTA_WEBHOOK}`,
    // Tarjetas en una sola cuota (decisión de producto): payment_methods.installments = 1.
    payment_methods: { installments: 1 },
  };
}

/** Datos mínimos de la preferencia creada que el checkout necesita para redirigir. */
export interface ResultadoPreferenciaPago {
  /** Identificador de la preferencia asignado por Mercado Pago. */
  id: string;
  /** URL de Mercado Pago (Checkout Pro) a la que se redirige al comprador. */
  initPoint: string;
}

/**
 * Crea la preferencia en Mercado Pago para el pedido dado y devuelve todo lo
 * necesario para redirigir al checkout de Mercado Pago (init_point).
 * Lanza Error con mensaje claro ante cualquier fallo (config, API, etc.).
 */
export async function crearPreferenciaPago(
  pedido: PedidoConRelaciones
): Promise<ResultadoPreferenciaPago> {
  const cliente = obtenerClienteMercadoPago();
  const preferencia = new Preference(cliente);
  const body = construirCuerpoPreferencia(pedido);

  try {
    const { id, init_point } = await preferencia.create({ body });
    if (!id || !init_point) {
      throw new Error(
        "Mercado Pago creó la preferencia pero no devolvió init_point."
      );
    }
    return { id, initPoint: init_point };
  } catch (e) {
    const mensaje =
      e instanceof Error ? e.message : "Error desconocido al crear la preferencia.";
    throw new Error(`[mercadopago] crearPreferenciaPago: ${mensaje}`);
  }
}