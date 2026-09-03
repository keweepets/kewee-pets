"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import Boton from "@/components/ui/boton";
import { editarPromocion } from "../acciones";
import type {
  AlcancePromocion,
  PromocionRow,
  TipoPromocion,
} from "@/lib/supabase/tipos-db";

const ALCANCES: { valor: AlcancePromocion; etiqueta: string }[] = [
  { valor: "global", etiqueta: "Todo el catálogo" },
  { valor: "categoria", etiqueta: "Por categoría" },
  { valor: "marca", etiqueta: "Por marca" },
  { valor: "producto", etiqueta: "Por producto" },
  { valor: "variante", etiqueta: "Por variante" },
];

interface Opcion {
  id: string;
  nombre: string;
}

function aFechaInput(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

export default function FormularioEditarPromocion({
  promo,
  objetivoIdActual,
  categorias,
  marcas,
  productos,
  variantes,
}: {
  promo: PromocionRow;
  objetivoIdActual: string | null;
  categorias: Opcion[];
  marcas: Opcion[];
  productos: Opcion[];
  variantes: Opcion[];
}) {
  const router = useRouter();
  const [enviando, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [alcance, setAlcance] = useState<AlcancePromocion>(promo.alcance);
  const [tipo, setTipo] = useState<TipoPromocion>(promo.tipo);

  const opcionesObjetivo: Record<AlcancePromocion, Opcion[]> = {
    global: [],
    categoria: categorias,
    marca: marcas,
    producto: productos,
    variante: variantes,
  };

  function manejarEnvio(fd: FormData) {
    const valor = Number(fd.get("valor"));
    const objetivoIdRaw = String(fd.get("objetivoId") ?? "").trim();
    const fechaInicio = String(fd.get("fechaInicio") ?? "");
    const fechaFin = String(fd.get("fechaFin") ?? "");

    if (Number.isNaN(valor)) {
      setError("El valor debe ser un número.");
      return;
    }

    if (fechaInicio && fechaFin && new Date(fechaFin) < new Date(fechaInicio)) {
      setError("La fecha de fin debe ser igual o posterior a la fecha de inicio.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const resultado = await editarPromocion({
        id: promo.id,
        nombre: String(fd.get("nombre") ?? ""),
        tipo,
        valor,
        alcance,
        objetivoId: objetivoIdRaw || undefined,
        fechaInicio,
        fechaFin,
        activo: fd.get("activo") === "on",
      });
      if (resultado.ok) {
        router.push("/admin/promociones");
        router.refresh();
      } else {
        setError(resultado.error ?? "Error al guardar la promoción");
      }
    });
  }

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black text-dark">
            Editar promoción
          </h1>
          <p className="mt-1 text-muted">{promo.nombre}</p>
        </div>
        <Link href="/admin/promociones">
          <Boton variante="contorno" tamano="sm" radio="xl">
            ← Volver
          </Boton>
        </Link>
      </header>

      <form action={manejarEnvio} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-dark">Nombre</span>
          <input
            name="nombre"
            type="text"
            required
            defaultValue={promo.nombre}
            maxLength={100}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-green-400 focus:outline-none"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-dark">Tipo</span>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoPromocion)}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-green-400 focus:outline-none"
            >
              <option value="porcentaje">Porcentaje (%)</option>
              <option value="monto">Monto (COP)</option>
            </select>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-dark">Valor</span>
            <input
              name="valor"
              type="number"
              min={tipo === "porcentaje" ? 1 : 0}
              max={tipo === "porcentaje" ? 100 : undefined}
              step="any"
              required
              defaultValue={promo.valor}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-green-400 focus:outline-none"
            />
            <span className="text-xs text-muted">
              {tipo === "porcentaje"
                ? "Porcentaje a descontar (1–100)"
                : "Monto en pesos a descontar"}
            </span>
          </label>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-dark">Alcance</span>
          <select
            value={alcance}
            onChange={(e) => setAlcance(e.target.value as AlcancePromocion)}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-green-400 focus:outline-none"
          >
            {ALCANCES.map((a) => (
              <option key={a.valor} value={a.valor}>
                {a.etiqueta}
              </option>
            ))}
          </select>
        </div>

        {alcance !== "global" && (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-dark">
              Objetivo ({alcance})
            </span>
            <select
              name="objetivoId"
              required
              defaultValue={alcance === promo.alcance ? objetivoIdActual ?? "" : ""}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-green-400 focus:outline-none"
            >
              <option value="">Selecciona...</option>
              {opcionesObjetivo[alcance].map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nombre}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-dark">Fecha de inicio</span>
            <input
              name="fechaInicio"
              type="date"
              required
              defaultValue={aFechaInput(promo.fecha_inicio)}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-green-400 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-dark">Fecha de fin</span>
            <input
              name="fechaFin"
              type="date"
              required
              defaultValue={aFechaInput(promo.fecha_fin)}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-green-400 focus:outline-none"
            />
          </label>
        </div>

        <label className="flex items-center gap-2">
          <input
            name="activo"
            type="checkbox"
            defaultChecked={promo.activo}
            className="h-4 w-4 rounded border-gray-300 text-green-500 focus:ring-green-400"
          />
          <span className="text-sm font-semibold text-dark">Promoción activa</span>
        </label>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Boton type="submit" radio="xl" disabled={enviando}>
            {enviando ? "Guardando..." : "Guardar cambios"}
          </Boton>
        </div>
      </form>
    </article>
  );
}
