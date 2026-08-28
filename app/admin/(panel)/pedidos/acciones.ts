"use server";

import { requerirAdmin } from "@/lib/auth/sesion";
import { obtenerClienteServicioSupabase } from "@/lib/supabase/servidor";
import { ESTADOS_ORDEN } from "@/lib/pedidos/presentacion";
import type { EstadoPedido } from "@/lib/supabase/tipos-db";

export interface ResultadoActualizarEstado {
  ok: boolean;
  error?: string;
}

export async function actualizarEstadoPedido(
  id: string,
  estado: EstadoPedido
): Promise<ResultadoActualizarEstado> {
  await requerirAdmin();

  if (!ESTADOS_ORDEN.includes(estado)) {
    return { ok: false, error: "Estado de pedido no válido." };
  }

  const supabase = obtenerClienteServicioSupabase();
  const { error } = await supabase
    .from("pedidos")
    .update({ estado })
    .eq("id", id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
