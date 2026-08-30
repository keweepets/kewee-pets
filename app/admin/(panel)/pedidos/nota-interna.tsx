"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import Boton from "@/components/ui/boton";
import { guardarNotaInterna } from "./acciones";

export default function NotaInterna({
  pedidoId,
  nota,
}: {
  pedidoId: string;
  nota: string | null;
}) {
  const router = useRouter();
  const [valor, setValor] = useState(nota ?? "");
  const [enviando, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function guardar() {
    setMensaje(null);
    setError(null);

    if (valor.length > 1000) {
      setError("La nota interna no puede superar 1000 caracteres.");
      return;
    }

    startTransition(async () => {
      const resultado = await guardarNotaInterna(pedidoId, valor);
      if (resultado.ok) {
        setMensaje("Nota interna guardada.");
        router.refresh();
      } else {
        setError(resultado.error ?? "Error al guardar la nota interna");
      }
    });
  }

  return (
    <article className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/50 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-black uppercase tracking-widest text-amber-700">
          Nota interna (privada)
        </h2>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-700">
          Solo admin
        </span>
      </div>
      <p className="mt-1 text-sm text-muted">
        Visible únicamente en el panel. Nunca se muestra al cliente. Las notas
        del cliente se guardan aparte, en su bloque de datos.
      </p>

      <textarea
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        rows={4}
        maxLength={1000}
        placeholder="Ej: confirmar con el cliente antes de despachar..."
        className="mt-3 w-full rounded-xl border-2 border-amber-200 bg-white px-4 py-2.5 text-sm transition-colors focus:border-amber-400 focus:outline-none"
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Boton type="button" radio="xl" tamano="sm" onClick={guardar} disabled={enviando}>
          {enviando ? "Guardando..." : "Guardar nota"}
        </Boton>
        {mensaje && <span className="text-sm font-semibold text-green-600">{mensaje}</span>}
        {error && <span className="text-sm font-semibold text-red-600">{error}</span>}
      </div>
    </article>
  );
}
