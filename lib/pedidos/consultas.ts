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
  EstadoPedido,
  PedidoRow,
} from "@/lib/supabase/tipos-db";

const SELECT_PEDIDO = `
  *,
  clientes(*),
  detalles_pedido(*)
` as const;

export interface FiltrosPedidosAdmin {
  estado?: EstadoPedido;
  /** Búsqueda por numero_pedido, nombre de cliente o teléfono. */
  q?: string;
  /** Fecha desde (inclusive), formato YYYY-MM-DD. */
  desde?: string;
  /** Fecha hasta (inclusive), formato YYYY-MM-DD. */
  hasta?: string;
}

export interface ConteoPorEstado {
  estado: EstadoPedido;
  cantidad: number;
}

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
  let mensaje: string;
  if (error instanceof Error) {
    mensaje = error.message;
  } else if (error && typeof error === "object" && "message" in error) {
    mensaje = String((error as { message: unknown }).message);
  } else {
    mensaje = String(error);
  }
  throw new Error(`[pedidos] ${operacion}: ${mensaje}`);
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
    .order("id", { foreignTable: "detalles_pedido", ascending: true })
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
    .order("id", { foreignTable: "detalles_pedido", ascending: true })
    .maybeSingle();
  if (error) await lanzarSiError("obtenerPedidoPorNumero", error);
  if (!data) return null;
  return mapearPedido(data);
}

/** Lista pedidos para el panel admin, con filtros opcionales, más recientes primero. */
export async function obtenerPedidosAdmin(
  filtros: FiltrosPedidosAdmin = {}
): Promise<PedidoConRelaciones[]> {
  const supabase = obtenerClienteServicioSupabase();

  const termino = filtros.q?.trim();

  // Los filtros `or` de PostgREST no cruzan tablas embebidas, así que para
  // buscar por cliente (nombre/teléfono) resolvemos primero los cliente_id
  // y luego filtramos pedidos por esos ids + por numero_pedido.
  let idsClientes: string[] | null = null;
  if (termino) {
    const patron = `%${termino}%`;

    const [resClientes, resNumero] = await Promise.all([
      supabase.from("clientes").select("id").or(`nombre.ilike.${patron},telefono.ilike.${patron}`),
      supabase.from("pedidos").select("id").ilike("numero_pedido", patron),
    ]);
    if (resClientes.error) await lanzarSiError("obtenerPedidosAdmin", resClientes.error);
    if (resNumero.error) await lanzarSiError("obtenerPedidosAdmin", resNumero.error);

    const idsPorCliente = (resClientes.data ?? []).map((c) => c.id as string);
    const idsPorNumero = (resNumero.data ?? []).map((p) => p.id as string);
    idsClientes = Array.from(new Set([...idsPorCliente, ...idsPorNumero]));
  }

  let query = supabase
    .from("pedidos")
    .select(SELECT_PEDIDO)
    .order("created_at", { ascending: false });

  if (filtros.estado) {
    query = query.eq("estado", filtros.estado);
  }

  if (filtros.desde) {
    query = query.gte("created_at", `${filtros.desde}T00:00:00`);
  }
  if (filtros.hasta) {
    query = query.lte("created_at", `${filtros.hasta}T23:59:59.999`);
  }

  if (idsClientes !== null) {
    query =
      idsClientes.length === 0
        ? query.in("id", []) // sin coincidencias → lista vacía
        : query.in("id", idsClientes);
  }

  const { data, error } = await query;
  if (error) await lanzarSiError("obtenerPedidosAdmin", error);

  return (data ?? []).map(mapearPedido);
}

/** Conteo de pedidos agrupado por estado, para la cabecera de contadores. */
export async function obtenerConteosPorEstado(): Promise<ConteoPorEstado[]> {
  const supabase = obtenerClienteServicioSupabase();
  const { data, error } = await supabase.from("pedidos").select("estado");

  if (error) await lanzarSiError("obtenerConteosPorEstado", error);

  const conteo: Record<string, number> = {};
  for (const fila of data ?? []) {
    const estado = fila.estado as string;
    conteo[estado] = (conteo[estado] ?? 0) + 1;
  }

  return (Object.keys(conteo) as EstadoPedido[]).map((estado) => ({
    estado,
    cantidad: conteo[estado],
  }));
}
