"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import type { DireccionOrden } from "./acciones";
import { moverCategoriaOrden } from "./acciones";

export default function BotonReordenarCategoria({
  categoriaId,
  direccion,
  activo,
  etiqueta,
}: {
  categoriaId: string;
  direccion: DireccionOrden;
  activo: boolean;
  etiqueta: string;
}) {
  const router = useRouter();
  const [procesando, startTransition] = useTransition();

  function manejarClick() {
    startTransition(async () => {
      const resultado = await moverCategoriaOrden({
        id: categoriaId,
        direccion,
      });
      if (!resultado.ok) {
        alert(resultado.error ?? "Error al reordenar la categoría");
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      disabled={procesando || !activo}
      onClick={manejarClick}
      title={etiqueta}
      aria-label={etiqueta}
      className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-dark disabled:cursor-not-allowed disabled:opacity-30"
    >
      {procesando ? "…" : direccion === "arriba" ? "↑" : "↓"}
    </button>
  );
}
