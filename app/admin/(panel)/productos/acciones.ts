"use server";

import { requerirAdmin } from "@/lib/auth/sesion";
import { obtenerClienteServicioSupabase } from "@/lib/supabase/servidor";
import type { TipoVariante } from "@/lib/supabase/tipos-db";

// ---------------------------------------------------------------------------
// Tipos de entrada
// ---------------------------------------------------------------------------

export interface VarianteProductoCrear {
  nombre: string;
  precio: number;
  precioAnterior?: number;
  stock?: number;
  orden?: number;
  tipoVariante?: TipoVariante;
  valor?: string;
  unidad?: string;
  descuentoPorcentaje?: number;
}

export interface CrearProductoEntrada {
  nombre: string;
  slug?: string;
  categoriaId: string;
  marcaId: string;
  descripcion?: string;
  descripcionCorta?: string;
  esDestacado?: boolean;
  esMasVendido?: boolean;
  esPrueba?: boolean;
  activo?: boolean;
  variantes: VarianteProductoCrear[];
}

export interface VarianteProductoEditar {
  id?: string;
  nombre: string;
  precio: number;
  precioAnterior?: number | null;
  stock?: number;
  orden?: number;
  activo?: boolean;
  tipoVariante?: TipoVariante;
  valor?: string | null;
  unidad?: string | null;
  descuentoPorcentaje?: number | null;
}

export interface EditarProductoEntrada {
  id: string;
  nombre: string;
  slug?: string;
  categoriaId: string;
  marcaId: string;
  descripcion?: string;
  descripcionCorta?: string;
  esDestacado?: boolean;
  esMasVendido?: boolean;
  esPrueba?: boolean;
  activo?: boolean;
  variantes: VarianteProductoEditar[];
}

export interface ToggleActivoEntrada {
  id: string;
  activo: boolean;
}

// ---------------------------------------------------------------------------
// Resultado (discriminated union)
// ---------------------------------------------------------------------------

export type ResultadoAccion =
  | { ok: true; id: string }
  | { ok: false; error: string };

// ---------------------------------------------------------------------------
// Helpers privados
// ---------------------------------------------------------------------------

function generarSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function slugUnico(
  supabase: ReturnType<typeof obtenerClienteServicioSupabase>,
  slugBase: string,
  excluyendoId?: string
): Promise<string> {
  let candidato = slugBase;
  let intento = 2;

  while (true) {
    let consulta = supabase
      .from("productos")
      .select("id")
      .eq("slug", candidato)
      .limit(1);

    if (excluyendoId) {
      consulta = consulta.neq("id", excluyendoId);
    }

    const { data } = await consulta;
    if (!data || data.length === 0) return candidato;

    candidato = `${slugBase}-${intento}`;
    intento++;
  }
}

function abreviar(texto: string, longitud: number): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, longitud);
}

async function generarSKUUnico(
  supabase: ReturnType<typeof obtenerClienteServicioSupabase>,
  categoriaId: string,
  marcaId: string,
  nombreVariante: string
): Promise<string> {
  const [cat, marca] = await Promise.all([
    supabase.from("categorias").select("nombre").eq("id", categoriaId).single(),
    supabase.from("marcas").select("nombre").eq("id", marcaId).single(),
  ]);

  const prefijoCat = abreviar(cat.data?.nombre ?? "XX", 3);
  const prefijoMarca = abreviar(marca.data?.nombre ?? "XX", 3);
  const slugVar = generarSlug(nombreVariante) || "uni";
  const base = `${prefijoCat}-${prefijoMarca}-${slugVar}`;

  let secuencial = 1;
  while (secuencial <= 9999) {
    const sku = `${base}-${String(secuencial).padStart(3, "0")}`;
    const { data } = await supabase
      .from("variantes_producto")
      .select("id")
      .eq("sku", sku)
      .limit(1);
    if (!data || data.length === 0) return sku;
    secuencial++;
  }

  return `${base}-${Date.now()}`;
}

function validarVariante(
  v: {
    nombre: string;
    precio: number;
    stock?: number;
    precioAnterior?: number | null;
    descuentoPorcentaje?: number | null;
    tipo?: TipoVariante;
    valor?: string | null;
  },
  indice: number
): string | null {
  if (!v.nombre.trim()) return `Variante #${indice + 1}: el nombre es obligatorio.`;
  if (typeof v.precio !== "number" || v.precio < 0)
    return `Variante "${v.nombre}": el precio debe ser un número ≥ 0.`;
  if (
    v.stock != null &&
    (typeof v.stock !== "number" || v.stock < 0 || !Number.isInteger(v.stock))
  )
    return `Variante "${v.nombre}": el stock debe ser un entero ≥ 0.`;
  if (
    v.precioAnterior != null &&
    (typeof v.precioAnterior !== "number" || v.precioAnterior <= v.precio)
  )
    return `Variante "${v.nombre}": precioAnterior debe ser mayor que el precio.`;
  if (
    v.descuentoPorcentaje != null &&
    (typeof v.descuentoPorcentaje !== "number" ||
      v.descuentoPorcentaje < 0 ||
      v.descuentoPorcentaje > 100)
  )
    return `Variante "${v.nombre}": descuentoPorcentaje debe estar entre 0 y 100.`;
  const tipo = v.tipo ?? "unico";
  const valor = (v.valor ?? "").trim();
  if (tipo !== "unico" && !valor)
    return `Variante "${v.nombre}": debes indicar un valor distinto de vacío (${tipo}).`;
  return null;
}

function normalizarUnidadSegunTipo(
  tipo: TipoVariante,
  unidad: string | null | undefined
): string | null {
  const unidadTexto = (unidad ?? "").trim();
  if (tipo === "talla") return null;
  if (tipo === "tamano") return null;
  return unidadTexto || null;
}

function encontrarNombreVarianteDuplicado(
  variantes: { nombre?: string }[]
): string | null {
  const vistos = new Map<string, number>();
  for (const v of variantes) {
    if (!v.nombre) continue;
    const clave = v.nombre.trim().toLowerCase();
    const veces = (vistos.get(clave) ?? 0) + 1;
    vistos.set(clave, veces);
    if (veces > 1) return v.nombre.trim();
  }
  return null;
}

// ---------------------------------------------------------------------------
// crearProducto
// ---------------------------------------------------------------------------

export async function crearProducto(
  datos: CrearProductoEntrada
): Promise<ResultadoAccion> {
  await requerirAdmin();

  const supabase = obtenerClienteServicioSupabase();

  // ── Validaciones ──────────────────────────────────────────────────────
  const nombreLimpio = datos.nombre?.trim();
  if (!nombreLimpio) return { ok: false, error: "El nombre del producto es obligatorio." };
  if (nombreLimpio.length > 200) return { ok: false, error: "El nombre no puede exceder 200 caracteres." };

  if (!datos.categoriaId) return { ok: false, error: "La categoría es obligatoria." };
  if (!datos.marcaId) return { ok: false, error: "La marca es obligatoria." };

  if (!datos.variantes || datos.variantes.length === 0)
    return { ok: false, error: "El producto debe tener al menos una variante." };

  for (const [i, v] of datos.variantes.entries()) {
    const error = validarVariante(
      { ...v, tipo: v.tipoVariante, valor: v.valor },
      i
    );
    if (error) return { ok: false, error };
  }

  const duplicadoNombre = encontrarNombreVarianteDuplicado(datos.variantes);
  if (duplicadoNombre)
    return { ok: false, error: `Hay dos variantes con el mismo nombre: "${duplicadoNombre}". Usa valores distintos.` };

  // ── Verificar que categoría y marca existen ───────────────────────────
  const { data: cat } = await supabase
    .from("categorias")
    .select("id")
    .eq("id", datos.categoriaId)
    .limit(1);
  if (!cat || cat.length === 0) return { ok: false, error: "La categoría seleccionada no existe." };

  const { data: marca } = await supabase
    .from("marcas")
    .select("id")
    .eq("id", datos.marcaId)
    .limit(1);
  if (!marca || marca.length === 0) return { ok: false, error: "La marca seleccionada no existe." };

  // ── Slug ──────────────────────────────────────────────────────────────
  const slugBase = datos.slug?.trim() ? generarSlug(datos.slug) : generarSlug(nombreLimpio);
  if (!slugBase) return { ok: false, error: "El slug generado está vacío. Revisa el nombre." };
  const slug = await slugUnico(supabase, slugBase);

  // ── Insertar producto ─────────────────────────────────────────────────
  const { data: producto, error: errorProducto } = await supabase
    .from("productos")
    .insert({
      nombre: nombreLimpio,
      slug,
      categoria_id: datos.categoriaId,
      marca_id: datos.marcaId,
      descripcion: datos.descripcion?.trim() ?? "",
      descripcion_corta: datos.descripcionCorta?.trim() ?? "",
      es_destacado: datos.esDestacado ?? false,
      es_mas_vendido: datos.esMasVendido ?? false,
      es_prueba: datos.esPrueba ?? false,
      activo: datos.activo ?? true,
    })
    .select("id")
    .single();

  if (errorProducto || !producto)
    return { ok: false, error: `Error al crear producto: ${errorProducto?.message ?? "Error desconocido"}` };

  // ── Insertar variantes (con SKU auto-generado) ────────────────────────
  const variantesDb = await Promise.all(
    datos.variantes.map(async (v, i) => {
      const sku = await generarSKUUnico(
        supabase,
        datos.categoriaId,
        datos.marcaId,
        v.nombre
      );

      return {
        producto_id: producto.id,
        nombre: v.nombre.trim(),
        sku,
        precio: v.precio,
        precio_anterior: v.precioAnterior ?? null,
        stock: v.stock ?? 0,
        orden: v.orden ?? i,
        activo: true,
        tipo_variante: v.tipoVariante ?? ("unico" as TipoVariante),
        valor: v.valor?.trim() || null,
        unidad: normalizarUnidadSegunTipo(
          v.tipoVariante ?? ("unico" as TipoVariante),
          v.unidad
        ),
        descuento_porcentaje: v.descuentoPorcentaje ?? null,
      };
    })
  );

  const { error: errorVariantes } = await supabase
    .from("variantes_producto")
    .insert(variantesDb);

  if (errorVariantes) {
    // Rollback manual: eliminar producto creado
    await supabase.from("productos").delete().eq("id", producto.id);
    return { ok: false, error: `Error al crear variantes: ${errorVariantes.message}` };
  }

  return { ok: true, id: producto.id };
}

// ---------------------------------------------------------------------------
// editarProducto
// ---------------------------------------------------------------------------

export async function editarProducto(
  datos: EditarProductoEntrada
): Promise<ResultadoAccion> {
  await requerirAdmin();

  const supabase = obtenerClienteServicioSupabase();

  // ── Validaciones ──────────────────────────────────────────────────────
  if (!datos.id) return { ok: false, error: "ID del producto es obligatorio." };

  const nombreLimpio = datos.nombre?.trim();
  if (!nombreLimpio) return { ok: false, error: "El nombre del producto es obligatorio." };
  if (nombreLimpio.length > 200) return { ok: false, error: "El nombre no puede exceder 200 caracteres." };

  if (!datos.categoriaId) return { ok: false, error: "La categoría es obligatoria." };
  if (!datos.marcaId) return { ok: false, error: "La marca es obligatoria." };

  if (!datos.variantes || datos.variantes.length === 0)
    return { ok: false, error: "El producto debe tener al menos una variante." };

  for (const [i, v] of datos.variantes.entries()) {
    const error = validarVariante(
      { ...v, tipo: v.tipoVariante, valor: v.valor },
      i
    );
    if (error) return { ok: false, error };
  }

  const duplicadoNombre = encontrarNombreVarianteDuplicado(datos.variantes);
  if (duplicadoNombre)
    return { ok: false, error: `Hay dos variantes con el mismo nombre: "${duplicadoNombre}". Usa valores distintos.` };

  // ── Verificar que el producto existe ──────────────────────────────────
  const { data: existente } = await supabase
    .from("productos")
    .select("id")
    .eq("id", datos.id)
    .limit(1);
  if (!existente || existente.length === 0)
    return { ok: false, error: "El producto no existe." };

  // ── Verificar que categoría y marca existen ───────────────────────────
  const { data: cat } = await supabase
    .from("categorias")
    .select("id")
    .eq("id", datos.categoriaId)
    .limit(1);
  if (!cat || cat.length === 0) return { ok: false, error: "La categoría seleccionada no existe." };

  const { data: marca } = await supabase
    .from("marcas")
    .select("id")
    .eq("id", datos.marcaId)
    .limit(1);
  if (!marca || marca.length === 0) return { ok: false, error: "La marca seleccionada no existe." };

  // ── Slug ──────────────────────────────────────────────────────────────
  const slugBase = datos.slug?.trim() ? generarSlug(datos.slug) : generarSlug(nombreLimpio);
  if (!slugBase) return { ok: false, error: "El slug generado está vacío. Revisa el nombre." };
  const slug = await slugUnico(supabase, slugBase, datos.id);

  // ── Actualizar producto ───────────────────────────────────────────────
  const { error: errorUpdate } = await supabase
    .from("productos")
    .update({
      nombre: nombreLimpio,
      slug,
      categoria_id: datos.categoriaId,
      marca_id: datos.marcaId,
      descripcion: datos.descripcion?.trim() ?? "",
      descripcion_corta: datos.descripcionCorta?.trim() ?? "",
      es_destacado: datos.esDestacado ?? false,
      es_mas_vendido: datos.esMasVendido ?? false,
      es_prueba: datos.esPrueba ?? false,
      activo: datos.activo ?? true,
    })
    .eq("id", datos.id);

  if (errorUpdate)
    return { ok: false, error: `Error al actualizar producto: ${errorUpdate.message}` };

  // ── Upsert de variantes ──────────────────────────────────────────────
  const variantesConId = datos.variantes.filter((v) => v.id);
  const variantesSinId = datos.variantes.filter((v) => !v.id);

  // Actualizar existentes
  if (variantesConId.length > 0) {
    const updates = variantesConId.map((v) =>
      supabase
        .from("variantes_producto")
        .update({
          nombre: v.nombre.trim(),
          precio: v.precio,
          precio_anterior: v.precioAnterior ?? null,
          orden: v.orden ?? 0,
          activo: v.activo ?? true,
          tipo_variante: v.tipoVariante ?? ("unico" as TipoVariante),
          valor: v.valor?.trim() || null,
          unidad: normalizarUnidadSegunTipo(
            v.tipoVariante ?? ("unico" as TipoVariante),
            v.unidad
          ),
          descuento_porcentaje: v.descuentoPorcentaje ?? null,
        })
        .eq("id", v.id!)
        .eq("producto_id", datos.id)
    );

    const resultados = await Promise.all(updates);
    const fallo = resultados.find((r) => r.error);
    if (fallo?.error)
      return { ok: false, error: `Error al actualizar variante: ${fallo.error.message}` };
  }

  // Insertar nuevas (con SKU auto-generado)
  if (variantesSinId.length > 0) {
    const maxOrden = Math.max(0, ...datos.variantes.map((v) => v.orden ?? 0));

    const nuevasDb = await Promise.all(
      variantesSinId.map(async (v, i) => {
        const sku = await generarSKUUnico(
          supabase,
          datos.categoriaId,
          datos.marcaId,
          v.nombre
        );

        return {
          producto_id: datos.id,
          nombre: v.nombre.trim(),
          sku,
          precio: v.precio,
          precio_anterior: v.precioAnterior ?? null,
          stock: v.stock ?? 0,
          orden: (v.orden ?? 0) + maxOrden + i + 1,
          activo: true,
          tipo_variante: v.tipoVariante ?? ("unico" as TipoVariante),
          valor: v.valor?.trim() || null,
          unidad: normalizarUnidadSegunTipo(
            v.tipoVariante ?? ("unico" as TipoVariante),
            v.unidad
          ),
          descuento_porcentaje: v.descuentoPorcentaje ?? null,
        };
      })
    );

    const { error: errorInsert } = await supabase
      .from("variantes_producto")
      .insert(nuevasDb);

    if (errorInsert)
      return { ok: false, error: `Error al crear nuevas variantes: ${errorInsert.message}` };
  }

  // ── Soft-delete de variantes ausentes ─────────────────────────────────
  const idsEnviados = new Set(
    datos.variantes.filter((v) => v.id).map((v) => v.id as string)
  );

  const { data: variantesActuales } = await supabase
    .from("variantes_producto")
    .select("id")
    .eq("producto_id", datos.id)
    .eq("activo", true);

  if (variantesActuales) {
    const idsDesactivar = variantesActuales
      .map((v) => v.id)
      .filter((id) => !idsEnviados.has(id));

    if (idsDesactivar.length > 0) {
      await supabase
        .from("variantes_producto")
        .update({ activo: false })
        .in("id", idsDesactivar);
    }
  }

  return { ok: true, id: datos.id };
}

// ---------------------------------------------------------------------------
// toggleActivoProducto
// ---------------------------------------------------------------------------

export async function toggleActivoProducto(
  datos: ToggleActivoEntrada
): Promise<ResultadoAccion> {
  await requerirAdmin();

  if (!datos.id) return { ok: false, error: "ID del producto es obligatorio." };

  const supabase = obtenerClienteServicioSupabase();

  const { error } = await supabase
    .from("productos")
    .update({ activo: datos.activo })
    .eq("id", datos.id);

  if (error) return { ok: false, error: `Error al actualizar producto: ${error.message}` };

  return { ok: true, id: datos.id };
}

// ---------------------------------------------------------------------------
// actualizarStockVariante
// ---------------------------------------------------------------------------

export interface ActualizarStockEntrada {
  varianteId: string;
  stock: number;
}

export async function actualizarStockVariante(
  datos: ActualizarStockEntrada
): Promise<ResultadoAccion> {
  await requerirAdmin();

  if (!datos.varianteId)
    return { ok: false, error: "ID de la variante es obligatorio." };

  if (
    typeof datos.stock !== "number" ||
    !Number.isInteger(datos.stock) ||
    datos.stock < 0
  ) {
    return { ok: false, error: "El stock debe ser un número entero mayor o igual a 0." };
  }

  const supabase = obtenerClienteServicioSupabase();

  const { data: existente } = await supabase
    .from("variantes_producto")
    .select("id")
    .eq("id", datos.varianteId)
    .limit(1);
  if (!existente || existente.length === 0)
    return { ok: false, error: "La variante no existe." };

  const { error } = await supabase
    .from("variantes_producto")
    .update({ stock: datos.stock })
    .eq("id", datos.varianteId);

  if (error) return { ok: false, error: `Error al actualizar stock: ${error.message}` };

  return { ok: true, id: datos.varianteId };
}
