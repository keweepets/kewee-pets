/**
 * Cálculo de impacto de cada promoción (productos y variantes afectadas).
 *
 * Reutiliza las mismas reglas de resolución del catálogo
 * (`construirResolutorCategorias` de lib/catalogo/adaptadores) sin modificar
 * la lógica de descuentos: aquí solo se cuentan variantes activas afectadas
 * y productos activos distintos afectados, tal como impactaría en la tienda.
 */

import type { PromocionRow } from "@/lib/supabase/tipos-db";
import { construirResolutorCategorias } from "@/lib/catalogo/adaptadores";

export interface CatalogoParaImpacto {
  productos: {
    id: string;
    marcaId: string;
    categoriaSlug: string;
  }[];
  variantes: {
    id: string;
    productoId: string;
    activo: boolean;
  }[];
  categorias: { id: string; slug: string; parent_id: string | null }[];
}

export interface ImpactoPromocion {
  productos: number;
  variantes: number;
}

function productosAfectados(
  promo: PromocionRow,
  catalogo: CatalogoParaImpacto,
  resolverCategoria: (promoCategoriaId: string, categoriaSlug: string) => boolean
): Set<string> {
  const ids = new Set<string>();

  if (promo.alcance === "global") {
    for (const p of catalogo.productos) ids.add(p.id);
  } else if (promo.alcance === "categoria" && promo.categoria_id) {
    for (const p of catalogo.productos) {
      if (resolverCategoria(promo.categoria_id, p.categoriaSlug)) {
        ids.add(p.id);
      }
    }
  } else if (promo.alcance === "marca" && promo.marca_id) {
    for (const p of catalogo.productos) {
      if (p.marcaId === promo.marca_id) ids.add(p.id);
    }
  } else if (promo.alcance === "producto" && promo.producto_id) {
    ids.add(promo.producto_id);
  } else if (promo.alcance === "variante" && promo.variante_id) {
    const variante = catalogo.variantes.find((v) => v.id === promo.variante_id);
    if (variante) ids.add(variante.productoId);
  }

  return ids;
}

export function calcularImpacto(
  promo: PromocionRow,
  catalogo: CatalogoParaImpacto
): ImpactoPromocion {
  const resolverCategoria = construirResolutorCategorias(catalogo.categorias);

  const productosAfectadosSet = productosAfectados(
    promo,
    catalogo,
    resolverCategoria
  );

  // Variantes activas afectadas.
  let variantes = 0;
  if (promo.alcance === "variante" && promo.variante_id) {
    const v = catalogo.variantes.find((x) => x.id === promo.variante_id);
    if (v?.activo) variantes = 1;
  } else {
    for (const v of catalogo.variantes) {
      if (v.activo && productosAfectadosSet.has(v.productoId)) {
        variantes += 1;
      }
    }
  }

  return { productos: productosAfectadosSet.size, variantes };
}
