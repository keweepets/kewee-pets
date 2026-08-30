/**
 * Presentación de promociones para el panel de administración.
 * Centraliza etiquetas de tipos, alcances y valores.
 */

import type { AlcancePromocion, TipoPromocion } from "@/lib/supabase/tipos-db";

export const ETIQUETAS_TIPO: Record<TipoPromocion, string> = {
  porcentaje: "Porcentaje",
  monto: "Monto (COP)",
};

export const ETIQUETAS_ALCANCE: Record<AlcancePromocion, string> = {
  global: "Todo el catálogo",
  categoria: "Por categoría",
  marca: "Por marca",
  producto: "Por producto",
  variante: "Por variante",
};
