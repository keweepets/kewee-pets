/**
 * Adaptadores: filas Supabase (snake_case) → tipos del dominio de la UI
 * (types/producto.ts). Mantiene la interfaz de los componentes intacta para
 * que el cambio mock → datos reales sea mínimo.
 *
 * Notas de mapeo:
 *  · El esquema final NO tiene columna subcategoría (reemplazada por la
 *    jerarquía de `categorias`): se mapea como cadena vacía por ahora.
 *  · `etiquetas` se DERIVA: 'mas-vendido' desde es_mas_vendido y 'oferta'
 *    cuando hay rebaja fija o promo vigente con descuento. ('nuevo' no se
 *    deriva todavía.)
 *  · El precio mostrado por variante es el EFECTIVO tras la mejor promo
 *    vigente (sin acumulación); el precio base nunca se muta en BD.
 */

import type {
  EtiquetaProducto,
  Producto,
  VarianteProducto,
  CategoriaSlug,
} from "@/types/producto";
import type {
  CategoriaRow,
  ProductoRowCompleto,
} from "@/lib/supabase/tipos-db";
import {
  calcularPrecioEfectivo,
  type ContextoProducto,
  type PromocionVigente,
} from "@/lib/catalogo/promociones";

function porOrden(a: { orden: number }, b: { orden: number }): number {
  return a.orden - b.orden;
}

/** Resuelve si una promo de alcance 'categoria' cubre un slug dado,
 *  incluyendo subcategorías del árbol real. */
export type ResolutorCategorias = (
  promoCategoriaId: string,
  categoriaSlug: string
) => boolean;

export function construirResolutorCategorias(
  categorias: Pick<CategoriaRow, "id" | "slug" | "parent_id">[]
): ResolutorCategorias {
  const porId = new Map(categorias.map((c) => [c.id, c]));
  const idsPorSlug = new Map(
    categorias.map((c) => [c.slug, c.id] as const)
  );

  /** Cadena de ids desde la categoría hasta la raíz. */
  function cadenaDeIds(desdeId: string | null): Set<string> {
    const ids = new Set<string>();
    let actual = desdeId ? porId.get(desdeId) ?? null : null;
    while (actual) {
      ids.add(actual.id);
      actual = actual.parent_id ? porId.get(actual.parent_id) ?? null : null;
    }
    return ids;
  }

  return (promoCategoriaId, categoriaSlug) => {
    const idProducto = idsPorSlug.get(categoriaSlug);
    if (!idProducto) return false;
    return cadenaDeIds(idProducto).has(promoCategoriaId);
  };
}

const RESOLUTOR_NULO: ResolutorCategorias = () => false;

export function mapearProducto(
  row: ProductoRowCompleto,
  promocionesVigentes: PromocionVigente[] = [],
  resolutorCategorias: ResolutorCategorias = RESOLUTOR_NULO
): Producto {
  const contexto: ContextoProducto = {
    productoId: row.id,
    marcaId: row.marca_id,
    categoriaSlug: row.categorias?.slug ?? "",
  };

  const variantesActivas = [...row.variantes_producto]
    .filter((v) => v.activo)
    .sort(porOrden);

  const variantesMapeadas: VarianteProducto[] = variantesActivas.map((v) => {
    const resuelto = calcularPrecioEfectivo(
      { varianteId: v.id, precioLista: v.precio },
      contexto,
      promocionesVigentes,
      resolutorCategorias
    );

    const hayPromo = resuelto.promocionAplicada !== null;
    const precioOriginal =
      v.precio_anterior ?? (hayPromo ? v.precio : undefined);

    return {
      id: v.id,
      nombre: v.nombre,
      precio: resuelto.precioEfectivo,
      ...(precioOriginal !== undefined ? { precioOriginal } : {}),
      ...(v.sku ? { sku: v.sku } : {}),
      stock: v.stock,
    };
  });

  const imagenesUrls = [...row.imagenes_producto]
    .filter((img) => img.activo && !img.variante_id)
    .sort(porOrden)
    .map((img) => img.url);

  const etiquetas: EtiquetaProducto[] = [];
  if (row.es_mas_vendido) etiquetas.push("mas-vendido");
  const hayOferta =
    variantesMapeadas.some((v) => v.precioOriginal !== undefined) ||
    variantesMapeadas.some((v) => {
      const lista = variantesActivas.find((va) => va.id === v.id);
      return lista ? v.precio < lista.precio : false;
    });
  if (hayOferta) etiquetas.push("oferta");

  return {
    id: row.id,
    slug: row.slug,
    nombre: row.nombre,
    marca: row.marcas?.nombre ?? "",
    categoria: row.categorias?.slug as CategoriaSlug,
    subcategoria: "",
    descripcion: row.descripcion,
    descripcionCorta: row.descripcion_corta,
    imagenes: imagenesUrls,
    variantes: variantesMapeadas,
    etiquetas,
    activo: row.activo,
    destacado: row.es_destacado,
    masVendido: row.es_mas_vendido,
  };
}

export function productoTieneOferta(producto: Producto): boolean {
  return producto.etiquetas.includes("oferta");
}
