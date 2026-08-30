"use client";

import { useState, useTransition } from "react";

import Boton from "@/components/ui/boton";
import type { FiltrosPedidosAdmin } from "@/lib/pedidos/consultas";
import { exportarPedidosCSV } from "./acciones";

export default function BotonExportar({
  filtros,
  deshabilitado = false,
}: {
  filtros: FiltrosPedidosAdmin;
  deshabilitado?: boolean;
}) {
  const [enviando, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function descargarCSV() {
    setError(null);
    startTransition(async () => {
      const resultado = await exportarPedidosCSV(filtros);
      if (!resultado.ok || !resultado.csv) {
        setError(resultado.error ?? "Error al exportar los pedidos.");
        return;
      }

      const blob = new Blob([resultado.csv], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = resultado.fileName ?? "pedidos.csv";
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
      URL.revokeObjectURL(url);
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Boton
        type="button"
        variante="contorno"
        tamano="sm"
        radio="xl"
        onClick={descargarCSV}
        disabled={enviando || deshabilitado}
      >
        {enviando ? "Exportando..." : "Exportar CSV"}
      </Boton>
      {error && <span className="text-xs font-semibold text-red-600">{error}</span>}
    </div>
  );
}
