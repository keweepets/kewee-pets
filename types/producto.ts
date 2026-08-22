/**
 * Tipos del dominio de la tienda.
 * Los nombres de campos están en español y alineados 1:1 con el futuro
 * esquema de base de datos de Supabase (tablas productos / variantes_producto),
 * para que reemplazar el mock data por datos reales sea un cambio mínimo.
 */

export type CategoriaSlug = "perros" | "gatos" | "accesorios" | "ofertas";

export type EtiquetaProducto = "mas-vendido" | "oferta" | "nuevo";

export interface VarianteProducto {
  id: string;
  nombre: string;
  /** Precio de venta en COP sin decimales. */
  precio: number;
  /** Precio antes del descuento (opcional). */
  precioOriginal?: number;
  sku?: string;
  stock: number;
}

export interface Producto {
  id: string;
  slug: string;
  nombre: string;
  marca: string;
  categoria: CategoriaSlug;
  subcategoria: string;
  descripcion: string;
  descripcionCorta: string;
  imagenes: string[];
  variantes: VarianteProducto[];
  etiquetas: EtiquetaProducto[];
  activo: boolean;
  destacado: boolean;
  masVendido: boolean;
}

/** Ítem de carrito en el cliente. En Fase 5/6 se persistirá junto al pedido. */
export interface ItemCarrito {
  productoId: string;
  varianteId: string;
  nombreProducto: string;
  marca: string;
  nombreVariante: string;
  precio: number;
  cantidad: number;
  imagen: string;
  slug: string;
}

export interface Marca {
  id: string;
  nombre: string;
}
