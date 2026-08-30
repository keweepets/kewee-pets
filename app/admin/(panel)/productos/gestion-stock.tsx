"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import Boton from "@/components/ui/boton";
import { actualizarStockVariante } from "./acciones";

interface VarianteStockRow {
  id: string;
  nombre: string;
  stock: number;
}

const UMBRAL_STOCK_BAJO = 5;

function estadoStock(stock: number): {
  etiqueta: string;
  clase: string;
} {
  if (stock === 0)
    return { etiqueta: "Sin stock", clase: "bg-red-100 text-red-700" };
  if (stock <= UMBRAL_STOCK_BAJO)
    return {
      etiqueta: `Stock bajo (${stock})`,
      clase: "bg-amber-100 text-amber-700",
    };
  return { etiqueta: "Disponible", clase: "bg-green-100 text-green-700" };
}

function FilaStock({ variante }: { variante: VarianteStockRow }) {
  const router = useRouter();
  const [valor, setValor] = useState(String(variante.stock));
  const [enviando, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const estado = estadoStock(variante.stock);

  function guardar() {
    const numero = Number(valor);
    if (valor.trim() === "" || Number.isNaN(numero) || numero < 0) {
      setError("Ingresa un número entero mayor o igual a 0.");
      return;
    }
    if (!Number.isInteger(numero)) {
      setError("El stock debe ser un número entero.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const resultado = await actualizarStockVariante({
        varianteId: variante.id,
        stock: numero,
      });
      if (resultado.ok) {
        router.refresh();
      } else {
        setError(resultado.error ?? "Error al actualizar el stock");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3">
      <div className="flex flex-col">
        <span className="font-bold text-dark">{variante.nombre}</span>
        <span
          className={`mt-1 inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-bold ${estado.clase}`}
        >
          {estado.etiqueta}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-muted">Stock actual</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              step={1}
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-24 rounded-xl border-2 border-gray-200 px-3 py-2 text-sm font-bold text-dark transition-colors focus:border-green-400 focus:outline-none"
            />
            <Boton type="button" tamano="sm" radio="xl" onClick={guardar} disabled={enviando}>
              {enviando ? "Guardando..." : "Guardar"}
            </Boton>
          </div>
          {error && <span className="text-xs font-semibold text-red-600">{error}</span>}
        </label>
      </div>
    </div>
  );
}

export default function GestionStock({
  variantes,
}: {
  variantes: VarianteStockRow[];
}) {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-6">
      <h2 className="text-sm font-black uppercase tracking-widest text-green-600">
        Gestión de stock
      </h2>
      <p className="mt-1 text-sm text-muted">
        Edita el stock disponible de cada variante. Se valida en el servidor.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {variantes.length === 0 ? (
          <p className="text-sm text-muted">Este producto no tiene variantes.</p>
        ) : (
          variantes.map((v) => <FilaStock key={v.id} variante={v} />)
        )}
      </div>
    </article>
  );
}
