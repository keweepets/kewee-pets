/**
 * Selector de período del Dashboard (FASE 8E-6).
 *
 * Define los períodos disponibles y resuelve, server-side, el rango de fechas
 * en la zona local de la tienda (America/Bogota).
 */

export type Periodo = "hoy" | "7d" | "30d" | "mes" | "todo";

/** Zona horaria única de la tienda (todas las métricas la usan). */
export const ZONA_HORARIA_TIENDA = "America/Bogota";

/** Desviación fija de la zona de la tienda respecto a UTC, en horas. */
export const DESVIACION_UTC_TIENDA_HORAS = -5;

/** Formatea una fecha a YYYY-MM-DD en la zona de la tienda. */
export function formatearFechaTienda(fecha: Date): string {
  const formateador = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA_TIENDA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formateador.format(fecha);
}

export const PERIODOS: Periodo[] = ["hoy", "7d", "30d", "mes", "todo"];

export const ETIQUETAS_PERIODO: Record<Periodo, string> = {
  hoy: "Hoy",
  "7d": "Últimos 7 días",
  "30d": "Últimos 30 días",
  mes: "Este mes",
  todo: "Todo",
};

/** Normaliza una cadena de searchParams a un Periodo válido (default "todo"). */
export function parsearPeriodo(valor: string | null | undefined): Periodo {
  return PERIODOS.includes(valor as Periodo) ? (valor as Periodo) : "todo";
}

export interface RangoFechas {
  desde?: string;
  hasta?: string;
}

/**
 * Convierte un rango de fechas expresado en la zona local de la tienda
 * (America/Bogota, UTC-5) a instantes UTC absolutos (ISO) para consultar
 * `created_at` correctamente.
 *
 * · `desde`  → inicio del día local   (00:00:00.000)
 * · `hasta`  → fin del día local      (23:59:59.999)
 *
 * Así, "desde 2026-08-29" incluye desde el 29/08 00:00 hora Bogotá y
 * "hasta 2026-08-29" incluye hasta el 29/08 23:59:59.999 hora Bogotá,
 * independientemente de la zona horaria del servidor o de Postgres.
 */
export function limitesRangoEnUtc(
  rango: RangoFechas
): { desdeIso?: string; hastaIso?: string } {
  const resultado: { desdeIso?: string; hastaIso?: string } = {};

  function aInstanteUtc(fecha: string, esFin: boolean): string {
    const [y, m, d] = fecha.split("-").map(Number);
    // Inicio: 00:00 del día `fecha`. Fin: 1 ms antes del 00:00 del día siguiente.
    // Bogotá = UTC-5 → local 00:00 = UTC 05:00 del mismo día (restamos el offset).
    const milis = Date.UTC(y, m - 1, esFin ? d + 1 : d) - DESVIACION_UTC_TIENDA_HORAS * 60 * 60 * 1000 - (esFin ? 1 : 0);
    return new Date(milis).toISOString();
  }

  if (rango.desde) resultado.desdeIso = aInstanteUtc(rango.desde, false);
  if (rango.hasta) resultado.hastaIso = aInstanteUtc(rango.hasta, true);

  return resultado;
}

/** Instante UTC correspondiente al inicio (00:00) de HOY en la zona de la tienda. */
function inicioDeHoyEnTienda(): Date {
  // Bogotá = UTC-5 (constante). Desplazamos el instante actual y leemos sus
  // componentes UTC para obtener el calendario de Bogotá sin depender de la
  // zona horaria del servidor.
  const bogotaWall = new Date(
    Date.now() - DESVIACION_UTC_TIENDA_HORAS * 60 * 60 * 1000
  );
  return new Date(
    Date.UTC(
      bogotaWall.getUTCFullYear(),
      bogotaWall.getUTCMonth(),
      bogotaWall.getUTCDate()
    )
  );
}

/**
 * Resuelve el rango (YYYY-MM-DD, zona de la tienda) para un período.
 * "todo" → sin rango (filtro desactivado, comportamiento actual).
 */
export function resolverRangoFechas(periodo: Periodo): RangoFechas {
  if (periodo === "todo") return {};

  const inicioHoy = inicioDeHoyEnTienda();

  let desde = new Date(inicioHoy);
  const hasta = new Date(inicioHoy);

  if (periodo === "mes") {
    desde = new Date(
      Date.UTC(
        inicioHoy.getUTCFullYear(),
        inicioHoy.getUTCMonth(),
        1
      )
    );
  } else if (periodo === "30d") {
    desde = new Date(inicioHoy.getTime() - 29 * 24 * 60 * 60 * 1000);
  } else if (periodo === "7d") {
    desde = new Date(inicioHoy.getTime() - 6 * 24 * 60 * 60 * 1000);
  } // "hoy" → desde == hasta

  return {
    desde: formatearFechaTienda(desde),
    hasta: formatearFechaTienda(hasta),
  };
}

/** Nº de días del mes actual en la zona de la tienda (para la serie "Este mes"). */
export function diasDelMesActual(): number {
  const inicioHoy = inicioDeHoyEnTienda();
  const dias = new Date(
    Date.UTC(inicioHoy.getUTCFullYear(), inicioHoy.getUTCMonth() + 1, 0)
  ).getUTCDate();
  return dias;
}
