"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { toggleActivoPromocion } from "./acciones";

export default function BotonTogglePromocion({
  promocionId,
  activo,
}: {
  promocionId: string;
  activo: boolean;
}) {
  const router = useRouter();
  const [procesando, startTransition] = useTransition();

  function manejarClick() {
    startTransition(async () => {
      const resultado = await toggleActivoPromocion({
        id: promocionId,
        activo: !activo,
      });
      if (!resultado.ok) {
        alert(resultado.error ?? "Error al cambiar el estado");
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      disabled={procesando}
      onClick={manejarClick}
      className={`text-xs font-bold transition-colors ${
        activo
          ? "text-amber-600 hover:text-amber-800"
          : "text-green-600 hover:text-green-800"
      } disabled:opacity-50`}
    >
      {procesando ? "..." : activo ? "Desactivar" : "Activar"}
    </button>
  );
}
