"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import Boton from "@/components/ui/boton";
import { crearPromocion } from "../acciones";
import type { AlcancePromocion, TipoPromocion } from "@/lib/supabase/tipos-db";

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

export default function FormularioPromocion({
  categorias,
  marcas,
  productos,
  variantes,
}: {
  categorias: Opcion[];
  marcas: Opcion[];
  productos: Opcion[];
  variantes: Opcion[];
}) {
  const router = useRouter();
  const [enviando, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [tipo, setTipo] = useState<TipoPromocion>("porcentaje");
  const [alcance, setAlcance] = useState<AlcancePromocion>("global");

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
      const resultado = await crearPromocion({
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
        setError(resultado.error ?? "Error al crear la promoción");
      }
    });
  }

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-6">
      <form action={manejarEnvio} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-dark">Nombre</span>
          <input
            name="nombre"
            type="text"
            required
            placeholder="Ej: 15% en alimentos"
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
              placeholder={tipo === "porcentaje" ? "15" : "20000"}
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
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-green-400 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-dark">Fecha de fin</span>
            <input
              name="fechaFin"
              type="date"
              required
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-green-400 focus:outline-none"
            />
          </label>
        </div>

        <label className="flex items-center gap-2">
          <input
            name="activo"
            type="checkbox"
            defaultChecked
            className="h-4 w-4 rounded border-gray-300 text-green-500 focus:ring-green-400"
          />
          <span className="text-sm font-semibold text-dark">
            Activa desde su creación
          </span>
        </label>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Boton type="submit" radio="xl" disabled={enviando}>
            {enviando ? "Creando..." : "Crear promoción"}
          </Boton>
        </div>
      </form>
    </article>
  );
}
