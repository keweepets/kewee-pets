/**
 * Capa de acceso a datos del catálogo (solo lectura pública).
 *
 * · Usa el cliente anon + RLS: la base ya filtra activos y promociones
 *   vigentes (ver supabase/migrations/0002). Sin service role en el cliente.
 * · Pensada para Server Components / Route Handlers.
 * · El mock de data/presentacion.ts sigue siendo la fuente de la UI hasta
 *   verificar la conexión real (decisión FASE 3): estas funciones quedan
 *   listas para reemplazarlo sin tocar componentes.
 */

import type { Marca, Producto } from "@/types/producto";
import { obtenerClienteSupabase } from "@/lib/supabase/cliente";
import { obtenerClienteServicioSupabase } from "@/lib/supabase/servidor";
import type {
  CategoriaRow,
  ProductoRowCompleto,
} from "@/lib/supabase/tipos-db";
import {
  construirResolutorCategorias,
  mapearProducto,
  productoTieneOferta,
  type ResolutorCategorias,
} from "@/lib/catalogo/adaptadores";
import {
  mapearPromocion,
  type PromocionVigente,
} from "@/lib/catalogo/promociones";

const SELECT_PRODUCTO = `
  *,
  categorias(id, nombre, slug, parent_id),
  marcas(id, nombre),
  variantes_producto(*),
  imagenes_producto(*)
` as const;

/** Límite interno cuando se filtran ofertas en memoria (escala inicial). */
const TOPE_OFERTAS_EN_MEMORIA = 200;
export const LIMITE_DEFECTO = 24;

export interface FiltrosCatalogo {
  /** Slug de categoría raíz; incluye sus subcategorías. */
  categoriaSlug?: string;
  marcaId?: string;
  busqueda?: string;
  soloOfertas?: boolean;
  limite?: number;
  pagina?: number;
}

export interface ResultadoCatalogo {
  productos: Producto[];
  total: number;
  pagina: number;
  limite: number;
}

export interface ResumenCategoria {
  id: string;
  nombre: string;
  slug: string;
  parentId: string | null;
}

async function lanzarSiError(operacion: string, error: unknown): Promise<never> {
  throw new Error(`[catalogo] ${operacion}: ${error instanceof Error ? error.message : String(error)}`);
}

/** Promociones legibles ahora mismo (RLS ya filtra activas y vigentes). */
export async function obtenerPromocionesVigentes(): Promise<PromocionVigente[]> {
  const supabase = obtenerClienteSupabase();
  const { data, error } = await supabase.from("promociones").select("*");
  if (error) await lanzarSiError("obtenerPromocionesVigentes", error);
  return (data ?? []).map(mapearPromocion);
}

export async function listarCategorias(): Promise<ResumenCategoria[]> {
  const supabase = obtenerClienteSupabase();
  const { data, error } = await supabase
    .from("categorias")
    .select("id, nombre, slug, parent_id, orden")
    .order("orden", { ascending: true });
  if (error) await lanzarSiError("listarCategorias", error);

  return (data as Pick<CategoriaRow, "id" | "nombre" | "slug" | "parent_id" | "orden">[]).map((c) => ({
    id: c.id,
    nombre: c.nombre,
    slug: c.slug,
    parentId: c.parent_id,
  }));
}

export async function listarMarcas(): Promise<Marca[]> {
  const supabase = obtenerClienteSupabase();
  const { data, error } = await supabase
    .from("marcas")
    .select("id, nombre")
    .order("nombre", { ascending: true });
  if (error) await lanzarSiError("listarMarcas", error);
  return data as Marca[];
}

/** Ids de una categoría por slug + todas sus subcategorías. */
async function idsCategoriaConHijas(slug: string): Promise<string[] | null> {
  const supabase = obtenerClienteSupabase();
  const { data: raiz, error } = await supabase
    .from("categorias")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (error) await lanzarSiError("idsCategoriaConHijas", error);
  if (!raiz) return null;

  const { data: hijas, error: errorHijas } = await supabase
    .from("categorias")
    .select("id")
    .eq("parent_id", raiz.id);
  if (errorHijas) await lanzarSiError("idsCategoriaConHijas(hijas)", errorHijas);

  return [raiz.id, ...(hijas ?? []).map((h) => h.id)];
}

interface ContextoConsulta {
  promos: PromocionVigente[];
  resolutor: ResolutorCategorias;
}

async function contextoCompleto(): Promise<ContextoConsulta> {
  const [promos, categorias] = await Promise.all([
    obtenerPromocionesVigentes(),
    supabaseCategoriasParaResolutor(),
  ]);
  return { promos, resolutor: construirResolutorCategorias(categorias) };
}

async function supabaseCategoriasParaResolutor() {
  const supabase = obtenerClienteSupabase();
  const { data, error } = await supabase
    .from("categorias")
    .select("id, slug, parent_id");
  if (error) await lanzarSiError("contextoResolutor", error);
  return data as Pick<CategoriaRow, "id" | "slug" | "parent_id">[];
}

/** Escapa caracteres con significado en filtros `or` de PostgREST. */
function sanitizarBusqueda(q: string): string {
  return q.replace(/[(),%]/g, " ").trim();
}

function mapearFilas(
  filas: unknown,
  contexto: ContextoConsulta
): Producto[] {
  return (filas as ProductoRowCompleto[]).map((fila) =>
    mapearProducto(fila, contexto.promos, contexto.resolutor)
  );
}

/**
 * Listado del catálogo con filtros combinables:
 * categoría (con subcategorías), marca, búsqueda, ofertas y paginación.
 *
 * Nota: el filtro 'ofertas' se resuelve en memoria (promo vigente o rebaja
 * fija). A escala actual es suficiente; si crece el catálogo, optimizar con
 * una vista/RPC en una migración futura.
 */
export async function listarProductos(
  filtros: FiltrosCatalogo = {}
): Promise<ResultadoCatalogo> {
  const limite = Math.min(Math.max(filtros.limite ?? LIMITE_DEFECTO, 1), 48);
  const pagina = Math.max(filtros.pagina ?? 1, 1);

  const supabase = obtenerClienteSupabase();
  const contexto = await contextoCompleto();

  let consulta = supabase
    .from("productos")
    .select(SELECT_PRODUCTO, { count: "exact" })
    .eq("activo", true)
    .eq("es_prueba", false);

  if (filtros.categoriaSlug) {
    const ids = await idsCategoriaConHijas(filtros.categoriaSlug);
    if (!ids) {
      return { productos: [], total: 0, pagina, limite };
    }
    consulta = consulta.in("categoria_id", ids);
  }

  if (filtros.marcaId) {
    consulta = consulta.eq("marca_id", filtros.marcaId);
  }

  const texto = sanitizarBusqueda(filtros.busqueda ?? "");
  if (texto) {
    const patron = `%${texto}%`;
    consulta = consulta.or(
      `nombre.ilike.${patron},descripcion_corta.ilike.${patron}`
    );
  }

  consulta = consulta.order("created_at", { ascending: false });

  // Con filtro de ofertas se traen hasta TOPE_OFERTAS_EN_MEMORIA y se pagina
  // tras filtrar; sin él, paginación directa en BD.
  if (filtros.soloOfertas) {
    consulta = consulta.limit(TOPE_OFERTAS_EN_MEMORIA);
  } else {
    const desde = (pagina - 1) * limite;
    consulta = consulta.range(desde, desde + limite - 1);
  }

  const { data, count, error } = await consulta;
  if (error) await lanzarSiError("listarProductos", error);

  let productos = mapearFilas(data, contexto);

  if (filtros.soloOfertas) {
    productos = productos.filter(productoTieneOferta);
    const total = productos.length;
    const desde = (pagina - 1) * limite;
    return {
      productos: productos.slice(desde, desde + limite),
      total,
      pagina,
      limite,
    };
  }

  return { productos, total: count ?? 0, pagina, limite };
}

/** Detalle por slug (producto activo) o null si no existe. */
export async function obtenerProductoPorSlug(
  slug: string
): Promise<Producto | null> {
  const supabase = obtenerClienteSupabase();
  const contexto = await contextoCompleto();

  const { data, error } = await supabase
    .from("productos")
    .select(SELECT_PRODUCTO)
    .eq("activo", true)
    .eq("es_prueba", false)
    .eq("slug", slug)
    .maybeSingle();
  if (error) await lanzarSiError("obtenerProductoPorSlug", error);
  if (!data) return null;

  return mapearProducto(
    data as ProductoRowCompleto,
    contexto.promos,
    contexto.resolutor
  );
}

/** Re-export para tipar resultados embebidos fuera de este módulo. */
export type {
  CategoriaRow,
  ImagenProductoRow,
  ProductoRowCompleto,
  VarianteRow,
} from "@/lib/supabase/tipos-db";

// ---------------------------------------------------------------------------
// KPIs del catálogo para el Dashboard (FASE 8E-4)
// ---------------------------------------------------------------------------

/** Unidades en inventario a partir de las cuales se considera stock bajo. */
const UMBRAL_STOCK_BAJO = 5;
const TOP_N_PRODUCTOS = 5;

export interface TopProducto {
  nombre: string;
  unidadesVendidas: number;
}

export interface VarianteStockBajo {
  producto: string;
  variante: string;
  stock: number;
}

export interface KpisCatalogo {
  topProductos: TopProducto[];
  stockBajo: VarianteStockBajo[];
  productosActivos: number;
  marcasActivas: number;
  categoriasActivas: number;
}

/**
 * Métricas de catálogo para el panel admin. Usa service role porque necesita
 * contar activos sobre el total y leer stock de variantes (la RLS pública solo
 * expone activos y oculta algunos campos por rol).
 */
export async function obtenerKpisCatalogo(): Promise<KpisCatalogo> {
  const supabase = obtenerClienteServicioSupabase();

  // 1) Top productos por unidades vendidas (detalles_pedido).
  const { data: detalle, error: errTop } = await supabase
    .from("detalles_pedido")
    .select("producto_id, nombre_producto, cantidad, productos(nombre)");

  let topProductos: TopProducto[] = [];
  if (errTop) {
    // Re-lanzar con contexto
    throw new Error(`[catalogo] topProductos: ${errTop.message}`);
  }

  const ventas = new Map<
    string,
    { nombre: string; unidades: number }
  >();
  for (const fila of detalle ?? []) {
    const f = fila as {
      producto_id: string | null;
      nombre_producto: string;
      cantidad: number;
      productos: unknown;
    };
    const clave = f.producto_id ?? f.nombre_producto;
    const nombreProducto = primerProducto(f.productos)?.nombre ?? f.nombre_producto;
    const previo = ventas.get(clave) ?? { nombre: nombreProducto, unidades: 0 };
    ventas.set(clave, { nombre: nombreProducto, unidades: previo.unidades + f.cantidad });
  }

  // Normaliza la relación embebida (la API devuelve un array en algunos casos).
  function primerProducto(valor: unknown): { nombre: string; activo?: boolean } | null {
    if (Array.isArray(valor)) return (valor[0] as { nombre: string }) ?? null;
    if (valor && typeof valor === "object") return valor as { nombre: string };
    return null;
  }

  topProductos = Array.from(ventas.values())
    .sort((a, b) => b.unidades - a.unidades)
    .slice(0, TOP_N_PRODUCTOS)
    .map(({ nombre, unidades }) => ({ nombre, unidadesVendidas: unidades }));

  // 2) Variantes activas con stock bajo, más su producto activo.
  const { data: variantes, error: errStock } = await supabase
    .from("variantes_producto")
    .select("nombre, stock, activo, productos(nombre, activo)")
    .lte("stock", UMBRAL_STOCK_BAJO);

  let stockBajo: VarianteStockBajo[] = [];
  if (errStock) {
    throw new Error(`[catalogo] stockBajo: ${errStock.message}`);
  }

  stockBajo = (variantes ?? [])
    .filter((v) => {
      const fila = v as { activo: boolean; productos: unknown };
      const producto = primerProducto(fila.productos);
      return fila.activo && producto?.activo === true;
    })
    .filter((v) => (v as { stock: number }).stock > 0)
    .map((v) => {
      const fila = v as { nombre: string; stock: number; productos: unknown };
      const producto = primerProducto(fila.productos);
      return {
        producto: producto?.nombre ?? "Producto",
        variante: fila.nombre,
        stock: fila.stock,
      };
    })
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 10);

  // 3) Conteos de activos.
  const [resProductos, resMarcas, resCategorias] = await Promise.all([
    supabase
      .from("productos")
      .select("id", { count: "exact", head: true })
      .eq("activo", true),
    supabase
      .from("marcas")
      .select("id", { count: "exact", head: true })
      .eq("activo", true),
    supabase
      .from("categorias")
      .select("id", { count: "exact", head: true })
      .eq("activo", true),
  ]);

  if (resProductos.error)
    throw new Error(`[catalogo] productosActivos: ${resProductos.error.message}`);
  if (resMarcas.error)
    throw new Error(`[catalogo] marcasActivas: ${resMarcas.error.message}`);
  if (resCategorias.error)
    throw new Error(`[catalogo] categoriasActivas: ${resCategorias.error.message}`);

  return {
    topProductos,
    stockBajo,
    productosActivos: resProductos.count ?? 0,
    marcasActivas: resMarcas.count ?? 0,
    categoriasActivas: resCategorias.count ?? 0,
  };
}
