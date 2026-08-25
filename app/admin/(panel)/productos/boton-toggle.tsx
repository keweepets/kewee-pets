"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { toggleActivoProducto } from "./acciones";

export default function BotonToggleActivo({
  productoId,
  activo,
}: {
  productoId: string;
  activo: boolean;
}) {
  const router = useRouter();
  const [procesando, startTransition] = useTransition();

  function manejarClick() {
    startTransition(async () => {
      await toggleActivoProducto({ id: productoId, activo: !activo });
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
