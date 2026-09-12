"use client";

// ---------------------------------------------------------------------------
// Optimización client-side de imágenes de productos.
//
// Antes de subir vía subirImagenProducto(), la imagen seleccionada se:
//   1. Redimensiona a un máximo de 1600 px en su lado mayor (proporción fija;
//      nunca se amplía).
//   2. Re-codifica a WebP con calidad 0.82.
//   3. Devuelve un nuevo File (image/webp) que reemplaza al original en el
//      flujo existente.
// Si el WebP supera 500 KB se reintenta a calidad 0.70; si aún así supera
// 1 MB, se devuelve un error amigable y el archivo NO se envía.
//
// La Server Action (imagenes-acciones.ts) y su firma quedan intactas, igual
// que Supabase Storage y el bodySizeLimit de Next.js.
// ---------------------------------------------------------------------------

const MAX_LADO_PX = 1600;
const LIMITE_BLANCO = 500 * 1024; // 500 KB → si se supera, reintento a calidad 0.70
const LIMITE_DURO = 1024 * 1024; // 1 MB → tope: no se envía nada mayor
const CALIDAD_PRIMARIA = 0.82;
const CALIDAD_SECUNDARIA = 0.7;
const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];

export type ResultadoOptimizacionImagen =
  | { ok: true; archivo: File }
  | { ok: false; error: string };

async function comprimirAWebP(
  origen: File,
  ladoMaximo: number,
  calidad: number
): Promise<Blob> {
  const urlImagen = URL.createObjectURL(origen);
  try {
    const imagen = new Image();
    await new Promise<void>((resolve, reject) => {
      imagen.onload = () => resolve();
      imagen.onerror = () => reject(new Error("No se pudo leer la imagen."));
      imagen.src = urlImagen;
    });

    const anchoOriginal = imagen.naturalWidth;
    const altoOriginal = imagen.naturalHeight;
    if (!anchoOriginal || !altoOriginal) {
      throw new Error("La imagen está vacía o no es un formato soportado.");
    }

    const factor = Math.min(1, ladoMaximo / Math.max(anchoOriginal, altoOriginal));
    const ancho = Math.max(1, Math.round(anchoOriginal * factor));
    const alto = Math.max(1, Math.round(altoOriginal * factor));

    const lienzo = document.createElement("canvas");
    lienzo.width = ancho;
    lienzo.height = alto;
    const contexto = lienzo.getContext("2d");
    if (!contexto) {
      throw new Error("No se pudo crear el lienzo para procesar la imagen.");
    }
    contexto.imageSmoothingEnabled = true;
    contexto.imageSmoothingQuality = "high";
    contexto.drawImage(imagen, 0, 0, ancho, alto);

    const blob = await new Promise<Blob | null>((resolver) =>
      lienzo.toBlob(resolver, "image/webp", calidad)
    );
    if (!blob) {
      throw new Error(
        "No se pudo codificar la imagen como WebP en este navegador."
      );
    }
    return blob;
  } finally {
    URL.revokeObjectURL(urlImagen);
  }
}

export async function optimizarImagenProducto(
  original: File
): Promise<ResultadoOptimizacionImagen> {
  if (!TIPOS_PERMITIDOS.includes(original.type)) {
    return {
      ok: false,
      error: `Tipo no permitido: ${original.type}. Usa JPEG, PNG o WebP.`,
    };
  }

  try {
    let blob = await comprimirAWebP(original, MAX_LADO_PX, CALIDAD_PRIMARIA);

    if (blob.size > LIMITE_BLANCO) {
      blob = await comprimirAWebP(original, MAX_LADO_PX, CALIDAD_SECUNDARIA);
    }

    if (blob.size > LIMITE_DURO) {
      return {
        ok: false,
        error:
          "La imagen comprimida sigue superando 1 MB. Prueba con una imagen de menor resolución.",
      };
    }

    const base = original.name.replace(/\.[^/.]+$/, "") || "imagen";
    const archivo = new File([blob], `${base}.webp`, {
      type: "image/webp",
    });

    return { ok: true, archivo };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "No se pudo optimizar la imagen.",
    };
  }
}