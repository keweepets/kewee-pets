/**
 * Capa de acceso a datos de PEDIDOS (FASE 6 · migración 0007).
 *
 * · Usa el cliente SERVICE ROLE (obtenerClienteServicioSupabase), ya que las
 *   tablas de pedidos todavía no cuentan con políticas RLS (paso separado) y
 *   solo debe accederse desde el servidor (Server Actions, admin, etc.).
 * · Pensada para Server Components / Server Actions / Route Handlers.
 * · Por ahora SOLO lectura de pedidos existentes. La creación, edición y
 *   cambios de estado llegarán en pasos posteriores.
 */

import { obtenerClienteServicioSupabase } from "@/lib/supabase/servidor";
import type {
  ClienteRow,
  DetallePedidoRow,
  PedidoRow,
} from "@/lib/supabase/tipos-db";

const SELECT_PEDIDO = `
  *,
  clientes(*),
  detalles_pedido(*)
` as const;

/** Pedido con cliente y detalle embebidos (formato select de supabase-js). */
export interface PedidoConRelaciones {
  pedido: PedidoRow;
  cliente: ClienteRow;
  detalles: DetallePedidoRow[];
}

async function lanzarSiError(
  operacion: string,
  error: unknown
): Promise<never> {
  throw new Error(
    `[pedidos] ${operacion}: ${error instanceof Error ? error.message : String(error)}`
  );
}

function mapearPedido(fila: {
  clientes: ClienteRow;
  detalles_pedido: DetallePedidoRow[];
}): PedidoConRelaciones {
  const { clientes, detalles_pedido, ...pedido } = fila;
  return {
    pedido: pedido as unknown as PedidoRow,
    cliente: clientes,
    detalles: detalles_pedido,
  };
}

/** Consulta un pedido por su id (uuid). */
export async function obtenerPedidoPorId(
  id: string
): Promise<PedidoConRelaciones | null> {
  const supabase = obtenerClienteServicioSupabase();
  const { data, error } = await supabase
    .from("pedidos")
    .select(SELECT_PEDIDO)
    .eq("id", id)
    .order("created_at", { foreignTable: "detalles_pedido", ascending: true })
    .maybeSingle();
  if (error) await lanzarSiError("obtenerPedidoPorId", error);
  if (!data) return null;
  return mapearPedido(data);
}

/** Consulta un pedido por su número legible (ej. KP-000001). */
export async function obtenerPedidoPorNumero(
  numeroPedido: string
): Promise<PedidoConRelaciones | null> {
  const supabase = obtenerClienteServicioSupabase();
  const { data, error } = await supabase
    .from("pedidos")
    .select(SELECT_PEDIDO)
    .eq("numero_pedido", numeroPedido)
    .order("created_at", { foreignTable: "detalles_pedido", ascending: true })
    .maybeSingle();
  if (error) await lanzarSiError("obtenerPedidoPorNumero", error);
  if (!data) return null;
  return mapearPedido(data);
}
