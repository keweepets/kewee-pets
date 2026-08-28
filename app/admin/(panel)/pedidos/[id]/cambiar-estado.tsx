"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import Boton from "@/components/ui/boton";
import {
  ESTADOS_ORDEN,
  ETIQUETAS_ESTADO,
} from "@/lib/pedidos/presentacion";
import type { EstadoPedido } from "@/lib/supabase/tipos-db";
import { actualizarEstadoPedido } from "../acciones";

export default function CambiarEstadoPedido({
  pedidoId,
  estadoActual,
}: {
  pedidoId: string;
  estadoActual: EstadoPedido;
}) {
  const router = useRouter();
  const [enviando, startTransition] = useTransition();

  function manejarCambio(fd: FormData) {
    const estado = String(fd.get("estado") ?? "");
    if (!(ESTADOS_ORDEN as string[]).includes(estado)) return;

    startTransition(async () => {
      const resultado = await actualizarEstadoPedido(pedidoId, estado as EstadoPedido);
      if (resultado.ok) {
        router.refresh();
      } else {
        alert(resultado.error ?? "Error al cambiar el estado");
      }
    });
  }

  return (
    <form action={manejarCambio} className="flex items-end gap-3">
      <label className="flex flex-1 flex-col gap-1.5">
        <span className="text-sm font-semibold text-dark">Estado</span>
        <select
          name="estado"
          defaultValue={estadoActual}
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-green-400 focus:outline-none"
        >
          {ESTADOS_ORDEN.map((estado) => (
            <option key={estado} value={estado}>
              {ETIQUETAS_ESTADO[estado]}
            </option>
          ))}
        </select>
      </label>
      <Boton type="submit" radio="xl" disabled={enviando}>
        {enviando ? "Guardando..." : "Guardar estado"}
      </Boton>
    </form>
  );
}
