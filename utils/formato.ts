/**
 * Utilidades de formato para la tienda.
 * Todos los montos se manejan en pesos colombianos (COP), sin decimales,
 * igual que en el diseño de referencia de Figma.
 */

export function formatPriceCOP(valor: number): string {
  return "$" + valor.toLocaleString("es-CO");
}
