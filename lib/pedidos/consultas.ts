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
import {
  DESVIACION_UTC_TIENDA_HORAS,
  formatearFechaTienda,
} from "@/lib/pedidos/periodo";
import type { RangoFechas } from "@/lib/pedidos/periodo";
import type {
  ClienteRow,
  DetallePedidoRow,
  EstadoPago,
  EstadoPedido,
  MetodoPago,
  PedidoRow,
} from "@/lib/supabase/tipos-db";

const SELECT_PEDIDO = `
  *,
  clientes(*),
  detalles_pedido(*)
` as const;

export interface FiltrosPedidosAdmin {
  estado?: EstadoPedido;
  /** Búsqueda por numero_pedido, nombre de cliente, teléfono o email. */
  q?: string;
  /** Fecha desde (inclusive), formato YYYY-MM-DD. */
  desde?: string;
  /** Fecha hasta (inclusive), formato YYYY-MM-DD. */
  hasta?: string;
  /** Filtro por método de pago. */
  metodoPago?: MetodoPago;
  /** Filtro por estado del pago. */
  estadoPago?: EstadoPago;
  /** Página (1-based) a mostrar. */
  pagina?: number;
  /** Pedidos por página (límite). */
  porPagina?: number;
}

export interface ResultadoPedidosAdmin {
  pedidos: PedidoConRelaciones[];
  /** Total de pedidos con los filtros aplicados (independiente de la página). */
  total: number;
  /** Página actual (1-based). */
  pagina: number;
  /** Pedidos por página. */
  porPagina: number;
  /** Total de páginas. */
  totalPaginas: number;
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

/**
 * Lista pedidos para el panel admin, con filtros opcionales y paginación
 * server-side, más recientes primero.
 */
export async function obtenerPedidosAdmin(
  filtros: FiltrosPedidosAdmin = {}
): Promise<ResultadoPedidosAdmin> {
  const supabase = obtenerClienteServicioSupabase();

  const porPagina = Math.min(Math.max(filtros.porPagina ?? 15, 1), 100);
  const pagina = Math.max(filtros.pagina ?? 1, 1);
  const desde = (pagina - 1) * porPagina;

  const termino = filtros.q?.trim();

  // Los filtros `or` de PostgREST no cruzan tablas embebidas, así que para
  // buscar por cliente (nombre/teléfono) resolvemos primero los cliente_id
  // y luego filtramos pedidos por esos ids + por numero_pedido.
  let idsClientes: string[] | null = null;
  if (termino) {
    const patron = `%${termino}%`;

    const [resClientes, resNumero] = await Promise.all([
      supabase
        .from("clientes")
        .select("id")
        .or(`nombre.ilike.${patron},telefono.ilike.${patron},email.ilike.${patron}`),
      supabase.from("pedidos").select("id").ilike("numero_pedido", patron),
    ]);
    if (resClientes.error) await lanzarSiError("obtenerPedidosAdmin", resClientes.error);
    if (resNumero.error) await lanzarSiError("obtenerPedidosAdmin", resNumero.error);

    const idsPorCliente = (resClientes.data ?? []).map((c) => c.id as string);
    const idsPorNumero = (resNumero.data ?? []).map((p) => p.id as string);
    idsClientes = Array.from(new Set([...idsPorCliente, ...idsPorNumero]));
  }

  function aplicarFiltros(
    base: ReturnType<ReturnType<typeof supabase.from>["select"]>
  ) {
    let q = base;
    if (filtros.estado) q = q.eq("estado", filtros.estado);
    if (filtros.metodoPago) q = q.eq("metodo_pago", filtros.metodoPago);
    if (filtros.estadoPago) q = q.eq("estado_pago", filtros.estadoPago);
    if (filtros.desde) q = q.gte("created_at", `${filtros.desde}T00:00:00`);
    if (filtros.hasta) q = q.lte("created_at", `${filtros.hasta}T23:59:59.999`);
    if (idsClientes !== null)
      q = idsClientes.length === 0 ? q.in("id", []) : q.in("id", idsClientes);
    return q;
  }

  const tabla = supabase.from("pedidos");

  const [resTotal, resLista] = await Promise.all([
    aplicarFiltros(tabla.select("id", { count: "exact", head: true })),
    aplicarFiltros(
      tabla
        .select(SELECT_PEDIDO)
        .order("created_at", { ascending: false })
    ).range(desde, desde + porPagina - 1),
  ]);

  if (resTotal.error) await lanzarSiError("obtenerPedidosAdmin", resTotal.error);
  if (resLista.error) await lanzarSiError("obtenerPedidosAdmin", resLista.error);

  const total = resTotal.count ?? 0;
  const totalPaginas = Math.ceil(total / porPagina);

  return {
    pedidos: (resLista.data ?? []).map((fila) =>
      mapearPedido(fila as Parameters<typeof mapearPedido>[0])
    ),
    total,
    pagina,
    porPagina,
    totalPaginas,
  };
}

/** Conteo de pedidos agrupado por estado, para la cabecera de contadores. */
export async function obtenerConteosPorEstado(
  rango: RangoFechas = {}
): Promise<ConteoPorEstado[]> {
  const supabase = obtenerClienteServicioSupabase();

  let query = supabase.from("pedidos").select("estado");
  if (rango.desde) query = query.gte("created_at", `${rango.desde}T00:00:00`);
  if (rango.hasta) query = query.lte("created_at", `${rango.hasta}T23:59:59.999`);

  const { data, error } = await query;

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

export interface SerieDia {
  fecha: string;
  pedidos: number;
  ingresos: number;
}

/**
 * Serie de los últimos 30 días: pedidos e ingresos agrupados por día en la
 * zona horaria local de la tienda (America/Bogota). Los días sin pedidos se
 * completan con 0. Devuelve un array de 30 entradas, la más antigua primero.
 */
export async function obtenerSerie30Dias(
  dias: number = 30
): Promise<SerieDia[]> {
  const supabase = obtenerClienteServicioSupabase();
  const cantidad = Math.min(Math.max(Math.floor(dias), 1), 365);

  const ahora = new Date();

  // Día local de hoy (00:00) convertido a UTC: Bogotá es UTC-5, así que
  // restamos la desviación a la hora local para obtener el instante UTC.
  const hoyInicioLocal = new Date(ahora);
  hoyInicioLocal.setHours(0, 0, 0, 0);
  const inicioSerie = new Date(hoyInicioLocal);
  inicioSerie.setDate(inicioSerie.getDate() - (cantidad - 1));
  const desdeUTC = new Date(
    inicioSerie.getTime() - DESVIACION_UTC_TIENDA_HORAS * 60 * 60 * 1000
  );

  const { data, error } = await supabase
    .from("pedidos")
    .select("created_at, total")
    .gte("created_at", desdeUTC.toISOString());

  if (error) await lanzarSiError("obtenerSerie30Dias", error);

  const agregado: Record<string, { pedidos: number; ingresos: number }> = {};
  for (const fila of data ?? []) {
    const fecha = formatearFechaTienda(
      new Date((fila as { created_at: string }).created_at)
    );
    const total = Number((fila as { total: number | bigint }).total) || 0;
    const previo = agregado[fecha] ?? { pedidos: 0, ingresos: 0 };
    agregado[fecha] = {
      pedidos: previo.pedidos + 1,
      ingresos: previo.ingresos + total,
    };
  }

  // Genera la lista completa de días llenando huecos con 0.
  const serie: SerieDia[] = [];
  for (let i = cantidad - 1; i >= 0; i--) {
    const dia = new Date();
    dia.setHours(0, 0, 0, 0);
    dia.setDate(dia.getDate() - i);
    const fecha = formatearFechaTienda(dia);
    serie.push({
      fecha,
      ...(agregado[fecha] ?? { pedidos: 0, ingresos: 0 }),
    });
  }

  return serie;
}

export interface MetricasComerciales {
  /** Valor promedio del pedido (suma total / nº pedidos). */
  valorPromedioPedido: number;
  /** % de pedidos entregados (0-100). */
  tasaEntregados: number;
  /** % de pedidos cancelados o rechazados (0-100). */
  tasaCanceladosRechazados: number;
  /** Clientes con 2 o más pedidos. */
  clientesRepetidos: number;
  /** Clientes con al menos 1 pedido. */
  clientesConPedidos: number;
  /** % de clientes repetidos sobre los que tienen pedidos (0-100). */
  tasaRepetidos: number;
  /** Total de pedidos considerados. */
  totalPedidos: number;
}

/**
 * Métricas comerciales del catálogo de pedidos.
 *
 * PERÍODO: acepta un rango de fechas opcional (RangoFechas). Si no se pasa,
 * se calculan sobre el total histórico de pedidos en la BD.
 *
 * No inventa canal, conversión ni métricas de Mercado Pago.
 */
export async function obtenerMetricasComerciales(
  rango: RangoFechas = {}
): Promise<MetricasComerciales> {
  const supabase = obtenerClienteServicioSupabase();

  let queryPedidos = supabase.from("pedidos").select("estado, total");
  let queryClientes = supabase.from("pedidos").select("cliente_id");
  if (rango.desde) {
    queryPedidos = queryPedidos.gte("created_at", `${rango.desde}T00:00:00`);
    queryClientes = queryClientes.gte("created_at", `${rango.desde}T00:00:00`);
  }
  if (rango.hasta) {
    queryPedidos = queryPedidos.lte("created_at", `${rango.hasta}T23:59:59.999`);
    queryClientes = queryClientes.lte("created_at", `${rango.hasta}T23:59:59.999`);
  }

  const [resPedidos, resClientes] = await Promise.all([
    queryPedidos,
    queryClientes,
  ]);

  if (resPedidos.error)
    await lanzarSiError("obtenerMetricasComerciales", resPedidos.error);
  if (resClientes.error)
    await lanzarSiError("obtenerMetricasComerciales", resClientes.error);

  const pedidos = resPedidos.data ?? [];
  const totalPedidos = pedidos.length;

  let sumaTotal = 0;
  let entregados = 0;
  let canceladosRechazados = 0;
  for (const fila of pedidos) {
    const f = fila as { estado: string; total: number | bigint };
    sumaTotal += Number(f.total) || 0;
    if (f.estado === "entregado") entregados += 1;
    if (f.estado === "cancelado" || f.estado === "rechazado")
      canceladosRechazados += 1;
  }

  const conteoPorCliente = new Map<string, number>();
  for (const fila of resClientes.data ?? []) {
    const clienteId = (fila as { cliente_id: string }).cliente_id;
    conteoPorCliente.set(clienteId, (conteoPorCliente.get(clienteId) ?? 0) + 1);
  }
  const clientesConPedidos = conteoPorCliente.size;
  let clientesRepetidos = 0;
  for (const cantidad of conteoPorCliente.values()) {
    if (cantidad >= 2) clientesRepetidos += 1;
  }

  const pct = (n: number) => (totalPedidos === 0 ? 0 : (n / totalPedidos) * 100);

  return {
    valorPromedioPedido: totalPedidos === 0 ? 0 : sumaTotal / totalPedidos,
    tasaEntregados: pct(entregados),
    tasaCanceladosRechazados: pct(canceladosRechazados),
    clientesRepetidos,
    clientesConPedidos,
    tasaRepetidos:
      clientesConPedidos === 0 ? 0 : (clientesRepetidos / clientesConPedidos) * 100,
    totalPedidos,
  };
}

// ---------------------------------------------------------------------------
// Exportación y métricas (FASE 8D-5)
// ---------------------------------------------------------------------------

/**
 * Lista TODOS los pedidos que coinciden con los filtros (sin paginación),
 * más recientes primero. Se usa para exportar a CSV con los mismos filtros
 * aplicados en la pantalla.
 */
export async function obtenerPedidosParaExportar(
  filtros: FiltrosPedidosAdmin = {}
): Promise<PedidoConRelaciones[]> {
  const supabase = obtenerClienteServicioSupabase();
  const idsClientes = await resolverIdsClientes(supabase, filtros);

  const tablas = supabase.from("pedidos");
  let query = tablas
    .select(SELECT_PEDIDO)
    .order("created_at", { ascending: false });
  query = aplicarFiltros(query, filtros, idsClientes);

  const { data, error } = await query;
  if (error) await lanzarSiError("obtenerPedidosParaExportar", error);

  return (data ?? []).map((fila) =>
    mapearPedido(fila as Parameters<typeof mapearPedido>[0])
  );
}

export interface ResumenMetodoPago {
  metodoPago: MetodoPago;
  cantidad: number;
  /** Suma del total de los pedidos de ese método. */
  sumaTotal: number;
}

/**
 * Resumen de pedidos por método/canal. En la BD la única dimensión de
 * método/canal disponible es `metodo_pago` (contraentrega | mercadopago);
 * NO existe un campo "canal" ni WhatsApp, así que no se inventa uno.
 */
export async function obtenerResumenMetodoPago(
  filtros: FiltrosPedidosAdmin = {}
): Promise<ResumenMetodoPago[]> {
  const supabase = obtenerClienteServicioSupabase();
  const idsClientes = await resolverIdsClientes(supabase, filtros);

  // Grupos permitidos del método/canal actual en la BD.
  const metodos: MetodoPago[] = ["contraentrega", "mercadopago"];

  const resultados = await Promise.all(
    metodos.map(async (metodoPago) => {
      const query = aplicarFiltros(
        supabase
          .from("pedidos")
          .select("total", { count: "exact", head: true }),
        { ...filtros, metodoPago },
        idsClientes
      );
      const { count, error } = await query;
      if (error)
        await lanzarSiError("obtenerResumenMetodoPago", error);

      const sumaQuery = aplicarFiltros(
        supabase
          .from("pedidos")
          .select("total"),
        { ...filtros, metodoPago },
        idsClientes
      );
      const { data: totales, error: errorSuma } = await sumaQuery;
      if (errorSuma)
        await lanzarSiError("obtenerResumenMetodoPago", errorSuma);

      const sumaTotal = (totales ?? []).reduce<number>(
        (acc, fila) => acc + (Number((fila as { total: number | bigint }).total) || 0),
        0
      );

      return {
        metodoPago,
        cantidad: count ?? 0,
        sumaTotal,
      };
    })
  );

  return resultados;
}

/**
 * Resuelve los ids de clientes que coinciden con el término de búsqueda
 * (nombre/teléfono/email) y los ids de pedidos por número. Si no hay término
 * de búsqueda, devuelve null (sin filtro por ids).
 */
async function resolverIdsClientes(
  supabase: ReturnType<typeof obtenerClienteServicioSupabase>,
  filtros: FiltrosPedidosAdmin
): Promise<string[] | null> {
  const termino = filtros.q?.trim();
  if (!termino) return null;

  const patron = `%${termino}%`;
  const [resClientes, resNumero] = await Promise.all([
    supabase
      .from("clientes")
      .select("id")
      .or(`nombre.ilike.${patron},telefono.ilike.${patron},email.ilike.${patron}`),
    supabase.from("pedidos").select("id").ilike("numero_pedido", patron),
  ]);
  if (resClientes.error) await lanzarSiError("resolverIdsClientes", resClientes.error);
  if (resNumero.error) await lanzarSiError("resolverIdsClientes", resNumero.error);

  const idsPorCliente = (resClientes.data ?? []).map((c) => c.id as string);
  const idsPorNumero = (resNumero.data ?? []).map((p) => p.id as string);
  return Array.from(new Set([...idsPorCliente, ...idsPorNumero]));
}

/** Aplica los filtros comunes a una consulta sobre la tabla pedidos. */
function aplicarFiltros(
  query: BuilderSeleccion,
  filtros: FiltrosPedidosAdmin,
  idsClientes: string[] | null
): BuilderSeleccion {
  let q: BuilderSeleccion = query;
  if (filtros.estado) q = q.eq("estado", filtros.estado);
  if (filtros.metodoPago) q = q.eq("metodo_pago", filtros.metodoPago);
  if (filtros.estadoPago) q = q.eq("estado_pago", filtros.estadoPago);
  if (filtros.desde) q = q.gte("created_at", `${filtros.desde}T00:00:00`);
  if (filtros.hasta) q = q.lte("created_at", `${filtros.hasta}T23:59:59.999`);
  if (idsClientes !== null)
    q = idsClientes.length === 0 ? q.in("id", []) : q.in("id", idsClientes);
  return q;
}

/** Tipo de una consulta .select() sobre la tabla pedidos del cliente servicio. */
type BuilderSeleccion = ReturnType<
  ReturnType<ReturnType<typeof obtenerClienteServicioSupabase>["from"]>["select"]
>;
