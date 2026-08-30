"use server";

import { requerirAdmin } from "@/lib/auth/sesion";
import { obtenerClienteServicioSupabase } from "@/lib/supabase/servidor";
import type { AlcancePromocion, TipoPromocion } from "@/lib/supabase/tipos-db";

export interface CrearPromocionEntrada {
  nombre: string;
  tipo: TipoPromocion;
  valor: number;
  alcance: AlcancePromocion;
  objetivoId?: string | null;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
}

export interface EditarPromocionEntrada extends CrearPromocionEntrada {
  id: string;
}

export interface ResultadoCrearPromocion {
  ok: boolean;
  id?: string;
  error?: string;
}

const ALCANCES_VALIDOS: AlcancePromocion[] = [
  "global",
  "categoria",
  "marca",
  "producto",
  "variante",
];

/** Mapa de columna de objetivo por alcance. */
const COLUMNA_OBJETIVO: Record<AlcancePromocion, string | null> = {
  global: null,
  categoria: "categoria_id",
  marca: "marca_id",
  producto: "producto_id",
  variante: "variante_id",
};

/**
 * Valida una promoción aplicando las mismas reglas de creación/edición.
 * Devuelve una promoción normalizada { campos, objetivoId } o un error.
 */
async function validarPromocion(
  entrada: Omit<CrearPromocionEntrada, "nombre"> & { nombre: string }
): Promise<
  | { ok: true; campos: Record<string, unknown> }
  | { ok: false; error: string }
> {
  const nombre = entrada.nombre.trim();
  if (!nombre) {
    return { ok: false, error: "El nombre es obligatorio." };
  }

  const tipo = entrada.tipo;
  if (tipo !== "porcentaje" && tipo !== "monto") {
    return { ok: false, error: "El tipo de promoción no es válido." };
  }

  if (typeof entrada.valor !== "number" || !Number.isFinite(entrada.valor)) {
    return { ok: false, error: "El valor debe ser un número." };
  }
  if (tipo === "porcentaje" && (entrada.valor <= 0 || entrada.valor > 100)) {
    return { ok: false, error: "Para porcentaje, el valor debe estar entre 1 y 100." };
  }
  if (tipo === "monto" && entrada.valor <= 0) {
    return { ok: false, error: "Para monto, el valor debe ser mayor a 0." };
  }

  const alcance = entrada.alcance;
  if (!ALCANCES_VALIDOS.includes(alcance)) {
    return { ok: false, error: "El alcance de la promoción no es válido." };
  }

  const objetivoId = entrada.objetivoId?.trim() ? entrada.objetivoId.trim() : null;

  // Exactamente un objetivo según alcance.
  if (alcance !== "global" && !objetivoId) {
    return { ok: false, error: "Debes seleccionar un objetivo para el alcance elegido." };
  }
  if (alcance === "global" && objetivoId) {
    return { ok: false, error: "Una promoción global no debe tener objetivo." };
  }

  const inicio = new Date(entrada.fechaInicio);
  const fin = new Date(entrada.fechaFin);
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
    return { ok: false, error: "Las fechas de vigencia son obligatorias." };
  }
  if (fin.getTime() <= inicio.getTime()) {
    return { ok: false, error: "La fecha de fin debe ser posterior a la de inicio." };
  }

  const supabase = obtenerClienteServicioSupabase();

  // Validar que el objetivo exista según el alcance.
  if (objetivoId) {
    const tabla =
      alcance === "categoria"
        ? "categorias"
        : alcance === "marca"
          ? "marcas"
          : alcance === "producto"
            ? "productos"
            : "variantes_producto";

    const { data: objetivo } = await supabase
      .from(tabla as "categorias")
      .select("id")
      .eq("id", objetivoId)
      .maybeSingle();
    if (!objetivo) {
      return { ok: false, error: "El objetivo seleccionado no existe." };
    }
  }

  const campos: Record<string, unknown> = {
    nombre,
    tipo,
    valor: tipo === "monto" ? Math.round(entrada.valor) : entrada.valor,
    alcance,
    fecha_inicio: inicio.toISOString(),
    fecha_fin: fin.toISOString(),
    activo: entrada.activo,
  };

  const columna = COLUMNA_OBJETIVO[alcance];
  if (columna) {
    campos[columna] = objetivoId;
  } else {
    campos.categoria_id = null;
    campos.marca_id = null;
    campos.producto_id = null;
    campos.variante_id = null;
  }

  return { ok: true, campos };
}

// ---------------------------------------------------------------------------
// Crear
// ---------------------------------------------------------------------------

export async function crearPromocion(
  entrada: CrearPromocionEntrada
): Promise<ResultadoCrearPromocion> {
  await requerirAdmin();

  const resultado = await validarPromocion(entrada);
  if (!resultado.ok) {
    return { ok: false, error: resultado.error };
  }

  const supabase = obtenerClienteServicioSupabase();
  const { data, error } = await supabase
    .from("promociones")
    .insert(resultado.campos)
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, id: data.id };
}

// ---------------------------------------------------------------------------
// Editar
// ---------------------------------------------------------------------------

export async function editarPromocion(
  entrada: EditarPromocionEntrada
): Promise<ResultadoCrearPromocion> {
  await requerirAdmin();

  if (!entrada.id) {
    return { ok: false, error: "ID de la promoción es obligatorio." };
  }

  const supabase = obtenerClienteServicioSupabase();

  const { data: existente } = await supabase
    .from("promociones")
    .select("id")
    .eq("id", entrada.id)
    .maybeSingle();
  if (!existente) {
    return { ok: false, error: "La promoción ya no existe." };
  }

  const resultado = await validarPromocion(entrada);
  if (!resultado.ok) {
    return { ok: false, error: resultado.error };
  }

  const { error } = await supabase
    .from("promociones")
    .update(resultado.campos)
    .eq("id", entrada.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, id: entrada.id };
}

// ---------------------------------------------------------------------------
// Activar / desactivar
// ---------------------------------------------------------------------------

export interface ResultadoTogglePromocion {
  ok: boolean;
  error?: string;
}

export async function toggleActivoPromocion(
  entrada: { id: string; activo: boolean }
): Promise<ResultadoTogglePromocion> {
  await requerirAdmin();

  if (!entrada.id) {
    return { ok: false, error: "ID de la promoción es obligatorio." };
  }

  const supabase = obtenerClienteServicioSupabase();

  const { data: existente } = await supabase
    .from("promociones")
    .select("id")
    .eq("id", entrada.id)
    .maybeSingle();
  if (!existente) {
    return { ok: false, error: "La promoción ya no existe." };
  }

  const { error } = await supabase
    .from("promociones")
    .update({ activo: entrada.activo })
    .eq("id", entrada.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
