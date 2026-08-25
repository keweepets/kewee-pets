/**
 * Tipos que reflejan EXACTAMENTE las filas del esquema Supabase
 * (FASE 3 + FASE 6B migración 0004):
 * marcas, categorias, productos, variantes_producto, imagenes_producto,
 * promociones. Nombres snake_case idénticos a las columnas reales.
 *
 * Solo lectura pública vía clave anon + RLS (ver supabase/migrations/0002).
 */

export interface MarcaRow {
  id: string;
  nombre: string;
  slug: string;
  logo_url: string | null;
  activo: boolean;
  created_at: string;
}

export interface CategoriaRow {
  id: string;
  nombre: string;
  slug: string;
  parent_id: string | null;
  orden: number;
  activo: boolean;
  created_at: string;
}

export interface ProductoRow {
  id: string;
  categoria_id: string;
  marca_id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  descripcion_corta: string;
  activo: boolean;
  es_destacado: boolean;
  es_mas_vendido: boolean;
  es_prueba: boolean;
  created_at: string;
  updated_at: string;
}

export type TipoVariante =
  | "unico"
  | "peso"
  | "talla"
  | "tamano"
  | "cantidad"
  | "volumen"
  | "presentacion";

export interface VarianteRow {
  id: string;
  producto_id: string;
  nombre: string;
  sku: string | null;
  precio: number;
  precio_anterior: number | null;
  stock: number;
  orden: number;
  activo: boolean;
  tipo_variante: TipoVariante;
  valor: string | null;
  unidad: string | null;
  descuento_porcentaje: number | null;
  created_at: string;
}

export interface ImagenProductoRow {
  id: string;
  producto_id: string;
  variante_id: string | null;
  url: string;
  alt: string;
  orden: number;
  activo: boolean;
  created_at: string;
}

export type TipoPromocion = "porcentaje" | "monto";
export type AlcancePromocion = "global" | "categoria" | "marca" | "producto" | "variante";

export interface PromocionRow {
  id: string;
  nombre: string;
  tipo: TipoPromocion;
  valor: number;
  alcance: AlcancePromocion;
  categoria_id: string | null;
  marca_id: string | null;
  producto_id: string | null;
  variante_id: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  created_at: string;
}

/** Producto con relaciones embebidas (formato select de supabase-js). */
export interface ProductoRowCompleto extends ProductoRow {
  categorias: Pick<CategoriaRow, "id" | "nombre" | "slug" | "parent_id"> | null;
  marcas: Pick<MarcaRow, "id" | "nombre"> | null;
  variantes_producto: VarianteRow[];
  imagenes_producto: ImagenProductoRow[];
}
