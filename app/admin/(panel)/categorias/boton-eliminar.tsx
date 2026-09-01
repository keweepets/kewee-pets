"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { eliminarCategoria } from "./acciones";

export default function BotonEliminarCategoria({
  categoriaId,
  nombre,
}: {
  categoriaId: string;
  nombre: string;
}) {
  const router = useRouter();
  const [procesando, startTransition] = useTransition();

  function manejarClick() {
    const confirmado = confirm(
      `¿Eliminar la categoría "${nombre}"? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    startTransition(async () => {
      const resultado = await eliminarCategoria({ id: categoriaId });
      if (resultado.ok) {
        router.refresh();
      } else {
        alert(resultado.error ?? "Error al eliminar la categoría");
      }
    });
  }

  return (
    <button
      type="button"
      disabled={procesando}
      onClick={manejarClick}
      className="text-sm font-semibold text-red-600 transition-colors hover:text-red-800 disabled:opacity-50"
    >
      {procesando ? "..." : "Eliminar"}
    </button>
  );
}
