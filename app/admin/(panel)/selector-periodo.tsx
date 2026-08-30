"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  ETIQUETAS_PERIODO,
  PERIODOS,
} from "@/lib/pedidos/periodo";
import type { Periodo } from "@/lib/pedidos/periodo";

export default function SelectorPeriodo({
  activo,
}: {
  activo: Periodo;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function irPeriodo(periodo: Periodo) {
    const params = new URLSearchParams(searchParams.toString());
    if (periodo === "todo") params.delete("periodo");
    else params.set("periodo", periodo);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2" aria-label="Selector de período">
      {PERIODOS.map((periodo) => (
        <button
          key={periodo}
          type="button"
          onClick={() => irPeriodo(periodo)}
          className={
            "rounded-full px-3 py-1.5 text-sm font-bold transition-colors " +
            (periodo === activo
              ? "bg-green-500 text-white"
              : "border border-gray-200 bg-white text-dark hover:bg-gray-50")
          }
        >
          {ETIQUETAS_PERIODO[periodo]}
        </button>
      ))}
    </div>
  );
}
