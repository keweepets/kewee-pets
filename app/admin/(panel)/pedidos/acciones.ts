"use server";

import { requerirAdmin } from "@/lib/auth/sesion";
import { obtenerClienteServicioSupabase } from "@/lib/supabase/servidor";
import { obtenerPedidosParaExportar } from "@/lib/pedidos/consultas";
import type { FiltrosPedidosAdmin } from "@/lib/pedidos/consultas";
import {
  ESTADOS_ORDEN,
  ETIQUETAS_ESTADO,
  ETIQUETAS_ESTADO_PAGO,
  ETIQUETAS_METODO_PAGO,
} from "@/lib/pedidos/presentacion";
import type { EstadoPedido } from "@/lib/supabase/tipos-db";

export interface ResultadoActualizarEstado {
  ok: boolean;
  error?: string;
}

export async function actualizarEstadoPedido(
  id: string,
  estado: EstadoPedido
): Promise<ResultadoActualizarEstado> {
  await requerirAdmin();

  if (!ESTADOS_ORDEN.includes(estado)) {
    return { ok: false, error: "Estado de pedido no válido." };
  }

  const supabase = obtenerClienteServicioSupabase();
  const { error } = await supabase
    .from("pedidos")
    .update({ estado })
    .eq("id", id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

// ---------------------------------------------------------------------------
// Nota interna (privada, solo panel admin)
// ---------------------------------------------------------------------------

export interface ResultadoGuardarNotaInterna {
  ok: boolean;
  error?: string;
}

export async function guardarNotaInterna(
  id: string,
  nota: string
): Promise<ResultadoGuardarNotaInterna> {
  await requerirAdmin();

  if (!id) {
    return { ok: false, error: "ID del pedido es obligatorio." };
  }

  const notaNormalizada = nota.trim();
  if (notaNormalizada.length > 1000) {
    return { ok: false, error: "La nota interna no puede superar 1000 caracteres." };
  }

  const supabase = obtenerClienteServicioSupabase();

  const { data: existente } = await supabase
    .from("pedidos")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (!existente) {
    return { ok: false, error: "El pedido ya no existe." };
  }

  // Solo actualiza nota_interna; nunca toca `notas` (del cliente).
  const { error } = await supabase
    .from("pedidos")
    .update({ nota_interna: notaNormalizada || null })
    .eq("id", id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

// ---------------------------------------------------------------------------
// Exportación a CSV (FASE 8D-5)
// ---------------------------------------------------------------------------

export interface ResultadoExportarCSV {
  ok: boolean;
  error?: string;
  /** Nombre de archivo sugerido para la descarga. */
  fileName?: string;
  /** Contenido CSV (UTF-8 con BOM para Excel). */
  csv?: string;
}

function escaparCsv(valor: string | number | null | undefined): string {
  let texto = valor === null || valor === undefined ? "" : String(valor);
  if (/^[=+\-@\t\r\n]/.test(texto)) {
    texto = "'" + texto;
  }
  if (/[",\n\r]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

/**
 * Exporta a CSV los pedidos que coinciden con los filtros actuales del panel.
 * Se ejecuta server-side con validación de admin y reutiliza la misma consulta
 * (filtrando por estado/método/estado de pago/fechas/búsqueda).
 */
export async function exportarPedidosCSV(
  filtros: FiltrosPedidosAdmin
): Promise<ResultadoExportarCSV> {
  await requerirAdmin();

  const pedidos = await obtenerPedidosParaExportar(filtros);

  const encabezados = [
    "Numero",
    "Fecha",
    "Cliente",
    "Telefono",
    "Email",
    "Metodo pago",
    "Estado pago",
    "Estado",
    "Subtotal",
    "Costo envio",
    "Descuento",
    "Total",
    "Ciudad",
  ];

  const filas = pedidos.map(({ pedido, cliente }) => [
    pedido.numero_pedido,
    new Date(pedido.created_at).toISOString(),
    cliente.nombre,
    cliente.telefono,
    cliente.email ?? "",
    ETIQUETAS_METODO_PAGO[pedido.metodo_pago],
    ETIQUETAS_ESTADO_PAGO[pedido.estado_pago],
    ETIQUETAS_ESTADO[pedido.estado],
    String(pedido.subtotal),
    String(pedido.costo_envio),
    String(pedido.descuento_total),
    String(pedido.total),
    pedido.ciudad,
  ]);

  const lineas = [
    encabezados.map(escaparCsv).join(","),
    ...filas.map((f) => f.map(escaparCsv).join(",")),
  ];
  // BOM para que Excel interprete correctamente los acentos.
  const csv = "\uFEFF" + lineas.join("\r\n");

  const fecha = new Date().toISOString().slice(0, 10);
  return {
    ok: true,
    fileName: `pedidos_${fecha}.csv`,
    csv,
  };
}
