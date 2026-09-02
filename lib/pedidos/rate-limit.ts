/**
 * Rate limiting in-memory para la creación de pedidos.
 *
 * Usa un Map global del módulo con ventana fija. Cada instancia de serverless
 * en Vercel mantiene su propio Map, por lo que esta protección NO es
 * distribuida entre réplicas: mitiga ráfagas rápidas desde un mismo origen,
 * pero no ataques escalados horizontalmente. Para el volumen actual de
 * Kewee (pedidos bajo, tráfico local) es una barrera suficiente.
 *
 * La clave es el teléfono normalizado (trim + sin espacios), ya que es el
 * campo obligatorio y validado que mejor identifica al solicitante sin
 * requerir autenticación.
 */

interface RegistroVentana {
  count: number;
  resetAt: number;
}

const ventana = new Map<string, RegistroVentana>();

const LIMITE_POR_VENTANA = 3;
const DURACION_VENTANA_MS = 60_000; // 1 minuto

/** Limpia entradas expiradas periódicamente para evitar memory leaks. */
function limpiarExpiradas(): void {
  const ahora = Date.now();
  for (const [clave, registro] of ventana) {
    if (ahora > registro.resetAt) ventana.delete(clave);
  }
}

export interface ResultadoRateLimit {
  permitido: boolean;
  restante: number;
}

/**
 * Verifica si una clave (teléfono) ha excedido el límite de intentos
 * dentro de la ventana actual. Si la ventana expiró o no existe, la resetea.
 */
export function verificarRateLimit(clave: string): ResultadoRateLimit {
  limpiarExpiradas();

  const ahora = Date.now();
  const registro = ventana.get(clave);

  if (!registro || ahora > registro.resetAt) {
    ventana.set(clave, { count: 1, resetAt: ahora + DURACION_VENTANA_MS });
    return { permitido: true, restante: LIMITE_POR_VENTANA - 1 };
  }

  registro.count++;
  return {
    permitido: registro.count <= LIMITE_POR_VENTANA,
    restante: Math.max(0, LIMITE_POR_VENTANA - registro.count),
  };
}
