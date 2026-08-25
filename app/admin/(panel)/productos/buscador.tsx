"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export default function BuscadorProductos() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [procesando, startTransition] = useTransition();

  const valorActual = searchParams.get("q") ?? "";

  function buscar(fd: FormData) {
    const q = String(fd.get("q") ?? "").trim();
    startTransition(() => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      router.push(`/admin/productos?${params.toString()}`);
    });
  }

  function limpiar() {
    startTransition(() => {
      router.push("/admin/productos");
    });
  }

  return (
    <form action={buscar} className="flex items-center gap-2">
      <input
        name="q"
        type="text"
        defaultValue={valorActual}
        placeholder="Buscar por nombre, slug o SKU..."
        className="w-full max-w-sm rounded-xl border-2 border-gray-200 px-4 py-2 text-sm transition-colors focus:border-green-400 focus:outline-none"
      />
      <button
        type="submit"
        disabled={procesando}
        className="rounded-xl bg-green-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-green-600 disabled:opacity-50"
      >
        Buscar
      </button>
      {valorActual && (
        <button
          type="button"
          disabled={procesando}
          onClick={limpiar}
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-muted transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          Limpiar
        </button>
      )}
    </form>
  );
}
