"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import {
  ETIQUETAS_PERIODO,
  PERIODOS,
} from "@/lib/pedidos/periodo";
import type { Periodo } from "@/lib/pedidos/periodo";

function aCadenaFecha(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

export default function SelectorPeriodo({
  activo,
}: {
  activo: Periodo;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [desde, setDesde] = useState(searchParams.get("desde") ?? "");
  const [hasta, setHasta] = useState(searchParams.get("hasta") ?? "");

  function construirUrl(
    periodo: Periodo,
    extra: { desde?: string; hasta?: string } = {}
  ) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("desde");
    params.delete("hasta");
    if (periodo === "todo") params.delete("periodo");
    else params.set("periodo", periodo);
    if (periodo === "personalizado") {
      if (extra.desde) params.set("desde", extra.desde);
      if (extra.hasta) params.set("hasta", extra.hasta);
    }
    return `${pathname}?${params.toString()}`;
  }

  function irPeriodo(periodo: Periodo) {
    if (periodo === "personalizado") return irPersonalizado();
    router.push(construirUrl(periodo));
  }

  function irPersonalizado() {
    const hace15 = new Date();
    hace15.setDate(hace15.getDate() - 14);
    const desdeListo = desde || aCadenaFecha(hace15);
    const hastaListo = hasta || aCadenaFecha(new Date());
    setDesde(desdeListo);
    setHasta(hastaListo);
    router.push(
      construirUrl("personalizado", { desde: desdeListo, hasta: hastaListo })
    );
  }

  function aplicarPersonalizado() {
    if (!desde || !hasta) return;
    const [inicio, fin] =
      desde > hasta ? [hasta, desde] : [desde, hasta];
    setDesde(inicio);
    setHasta(fin);
    router.push(construirUrl("personalizado", { desde: inicio, hasta: fin }));
  }

  return (
    <div>
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

      {activo === "personalizado" && (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-muted">
            Desde
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-dark"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wider text-muted">
            Hasta
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-dark"
            />
          </label>
          <button
            type="button"
            onClick={aplicarPersonalizado}
            className="rounded-full bg-green-500 px-4 py-1.5 text-sm font-bold text-white transition-colors hover:bg-green-600"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}