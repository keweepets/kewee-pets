/**
 * Resolución de promociones (lógica pura, sin I/O).
 *
 * Reglas aprobadas:
 *  · SIN acumulación: sobre cada variante aplica UNA sola promo — la de mayor
 *    descuento entre las vigentes que le apliquen.
 *  · El precio base de la variante NUNCA se muta; el descuento solo se calcula.
 *  · tipo 'porcentaje' → valor = % a descontar (1–100).
 *    tipo 'monto'       → valor = COP enteros a descontar, con piso en 0.
 *
 * La correspondencia promo(categoria_id) → categoría del producto se resuelve
 * con el comparador inyectado `esCategoriaAplicable`, para mantener este
 * módulo puro y testeable.
 */

import type {
  AlcancePromocion,
  PromocionRow,
  TipoPromocion,
} from "@/lib/supabase/tipos-db";

export interface PromocionVigente {
  id: string;
  nombre: string;
  tipo: TipoPromocion;
  valor: number;
  alcance: AlcancePromocion;
  categoriaId: string | null;
  marcaId: string | null;
  productoId: string | null;
  varianteId: string | null;
}

/** Contexto jerárquico necesario para resolver alcances. */
export interface ContextoProducto {
  productoId: string;
  marcaId: string;
  /** Slug de la categoría del producto. */
  categoriaSlug: string;
}

export interface VarianteContexto {
  varianteId: string;
  precioLista: number;
}

export interface PrecioResuelto {
  precioEfectivo: number;
  precioLista: number;
  montoDescuento: number;
  /** Promo aplicada (la de mayor descuento) o null si no hay ninguna. */
  promocionAplicada: PromocionVigente | null;
}

export function mapearPromocion(row: PromocionRow): PromocionVigente {
  return {
    id: row.id,
    nombre: row.nombre,
    tipo: row.tipo,
    valor: row.valor,
    alcance: row.alcance,
    categoriaId: row.categoria_id,
    marcaId: row.marca_id,
    productoId: row.producto_id,
    varianteId: row.variante_id,
  };
}

/**
 * Calcula el precio efectivo de una variante:
 * mejor promo vigente aplicable, sin acumulación, piso 0.
 *
 * `esCategoriaAplicable` decide si una promo de alcance 'categoria' cubre al
 * producto (permite incluir subcategorías según el árbol real).
 */
export function calcularPrecioEfectivo(
  variante: VarianteContexto,
  contexto: ContextoProducto,
  promocionesVigentes: PromocionVigente[],
  esCategoriaAplicable: (promoCategoriaId: string, categoriaSlug: string) => boolean
): PrecioResuelto {
  let mejor: { promo: PromocionVigente; descuento: number } | null = null;

  for (const promo of promocionesVigentes) {
    const aplica =
      promo.alcance === "global" ||
      (promo.alcance === "variante" && promo.varianteId === variante.varianteId) ||
      (promo.alcance === "producto" && promo.productoId === contexto.productoId) ||
      (promo.alcance === "marca" && promo.marcaId === contexto.marcaId) ||
      (promo.alcance === "categoria" &&
        promo.categoriaId !== null &&
        esCategoriaAplicable(promo.categoriaId, contexto.categoriaSlug));

    if (!aplica) continue;

    const descuento =
      promo.tipo === "porcentaje"
        ? Math.round((variante.precioLista * promo.valor) / 100)
        : Math.min(promo.valor, variante.precioLista);

    if (!mejor || descuento > mejor.descuento) {
      mejor = { promo, descuento };
    }
  }

  const precioEfectivo = Math.max(0, variante.precioLista - (mejor?.descuento ?? 0));

  return {
    precioEfectivo,
    precioLista: variante.precioLista,
    montoDescuento: mejor?.descuento ?? 0,
    promocionAplicada: mejor?.promo ?? null,
  };
}
