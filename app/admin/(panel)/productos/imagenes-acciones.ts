"use server";

import { requerirAdmin } from "@/lib/auth/sesion";
import { obtenerClienteServicioSupabase } from "@/lib/supabase/servidor";

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const MAX_TAMANO = 5 * 1024 * 1024; // 5 MB
const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const BUCKET = "productos";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function validarArchivo(archivo: File): string | null {
  if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
    return `Tipo no permitido: ${archivo.type}. Usa JPEG, PNG o WebP.`;
  }
  if (archivo.size > MAX_TAMANO) {
    const mb = (archivo.size / (1024 * 1024)).toFixed(1);
    return `Archivo muy grande (${mb} MB). Máximo 5 MB.`;
  }
  return null;
}

function extensionFromMime(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return map[mime] ?? "jpg";
}

function generarUuid(): string {
  return crypto.randomUUID();
}

// ---------------------------------------------------------------------------
// subirImagenProducto
// ---------------------------------------------------------------------------

export async function subirImagenProducto(
  productoId: string,
  archivo: File,
  alt?: string
): Promise<{ ok: boolean; error?: string; id?: string }> {
  await requerirAdmin();

  if (!productoId) return { ok: false, error: "El ID del producto es obligatorio." };

  const errorValidacion = validarArchivo(archivo);
  if (errorValidacion) return { ok: false, error: errorValidacion };

  const supabase = obtenerClienteServicioSupabase();

  // Verificar que el producto existe
  const { data: producto } = await supabase
    .from("productos")
    .select("id")
    .eq("id", productoId)
    .maybeSingle();

  if (!producto) return { ok: false, error: "El producto no existe." };

  // Generar nombre UUID
  const ext = extensionFromMime(archivo.type);
  const nombreArchivo = `${generarUuid()}.${ext}`;
  const ruta = `${productoId}/${nombreArchivo}`;

  // Subir a Storage
  const buffer = await archivo.arrayBuffer();
  const { error: errorUpload } = await supabase.storage
    .from(BUCKET)
    .upload(ruta, buffer, { contentType: archivo.type });

  if (errorUpload) {
    return { ok: false, error: `Error al subir imagen: ${errorUpload.message}` };
  }

  // Obtener URL pública
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(ruta);
  const url = urlData.publicUrl;

  // Determinar orden: si es la primera imagen, es principal (orden 0)
  const { count } = await supabase
    .from("imagenes_producto")
    .select("id", { count: "exact", head: true })
    .eq("producto_id", productoId);

  const orden = (count ?? 0) === 0 ? 0 : (count ?? 0);

  // Insertar fila
  const { data: imagen, error: errorInsert } = await supabase
    .from("imagenes_producto")
    .insert({
      producto_id: productoId,
      url,
      alt: alt?.trim() ?? "",
      orden,
      activo: true,
    })
    .select("id")
    .single();

  if (errorInsert) {
    // Limpiar archivo subido si falla la inserción
    await supabase.storage.from(BUCKET).remove([ruta]);
    return { ok: false, error: `Error al registrar imagen: ${errorInsert.message}` };
  }

  return { ok: true, id: imagen.id };
}

// ---------------------------------------------------------------------------
// eliminarImagen
// ---------------------------------------------------------------------------

export async function eliminarImagen(
  imagenId: string
): Promise<{ ok: boolean; error?: string }> {
  await requerirAdmin();

  if (!imagenId) return { ok: false, error: "El ID de la imagen es obligatorio." };

  const supabase = obtenerClienteServicioSupabase();

  // Obtener la imagen para saber la ruta en Storage
  const { data: imagen } = await supabase
    .from("imagenes_producto")
    .select("id, url, producto_id")
    .eq("id", imagenId)
    .maybeSingle();

  if (!imagen) return { ok: false, error: "La imagen no existe." };

  // Extraer la ruta relativa del bucket desde la URL pública
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const prefijoPublico = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/`;
  const rutaRelativa = imagen.url.replace(prefijoPublico, "");

  // Eliminar archivo de Storage
  if (rutaRelativa && !rutaRelativa.startsWith("http")) {
    await supabase.storage.from(BUCKET).remove([rutaRelativa]);
  }

  // Eliminar fila
  const { error } = await supabase
    .from("imagenes_producto")
    .delete()
    .eq("id", imagenId);

  if (error) return { ok: false, error: `Error al eliminar imagen: ${error.message}` };

  return { ok: true };
}

// ---------------------------------------------------------------------------
// establecerPrincipal
// ---------------------------------------------------------------------------

export async function establecerPrincipal(
  imagenId: string
): Promise<{ ok: boolean; error?: string }> {
  await requerirAdmin();

  if (!imagenId) return { ok: false, error: "El ID de la imagen es obligatorio." };

  const supabase = obtenerClienteServicioSupabase();

  // Obtener la imagen y su producto
  const { data: imagen } = await supabase
    .from("imagenes_producto")
    .select("id, producto_id, orden")
    .eq("id", imagenId)
    .maybeSingle();

  if (!imagen) return { ok: false, error: "La imagen no existe." };
  if (imagen.orden === 0) return { ok: true }; // Ya es principal

  const productoId = imagen.producto_id;

  // Obtener todas las imágenes del producto, ordenadas
  const { data: todas } = await supabase
    .from("imagenes_producto")
    .select("id, orden")
    .eq("producto_id", productoId)
    .order("orden", { ascending: true });

  if (!todas) return { ok: false, error: "Error al obtener imágenes del producto." };

  // Reasignar órdenes: la seleccionada pasa a 0, las demás suben
  const updates = todas.map((img) => {
    let nuevoOrden: number;
    if (img.id === imagenId) {
      nuevoOrden = 0;
    } else if (img.orden < imagen.orden) {
      // Estaba antes: sube en 1
      nuevoOrden = img.orden + 1;
    } else {
      // Estaba después: mantiene posición relativa
      nuevoOrden = img.orden;
    }
    return supabase
      .from("imagenes_producto")
      .update({ orden: nuevoOrden })
      .eq("id", img.id);
  });

  const resultados = await Promise.all(updates);
  const fallo = resultados.find((r) => r.error);
  if (fallo?.error) {
    return { ok: false, error: `Error al reordenar imágenes: ${fallo.error.message}` };
  }

  return { ok: true };
}
