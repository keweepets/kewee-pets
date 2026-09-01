"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";

import Boton from "@/components/ui/boton";
import type { CategoriaRow } from "@/lib/supabase/tipos-db";
import { editarCategoria } from "../acciones";

interface OpcionCategoria {
  id: string;
  nombre: string;
}

export default function FormularioEditarCategoria({
  categoria,
  opcionesPadre,
}: {
  categoria: CategoriaRow;
  opcionesPadre: OpcionCategoria[];
}) {
  const router = useRouter();
  const [enviando, startTransition] = useTransition();
  const [parentIdActual, setParentIdActual] = useState<string>(categoria.parent_id ?? "");

  function manejarEnvio(fd: FormData) {
    const nombre = String(fd.get("nombre") ?? "").trim();
    const ordenRaw = String(fd.get("orden") ?? "");
    const activo = fd.get("activo") === "on";
    if (!nombre) return;

    startTransition(async () => {
      const resultado = await editarCategoria({
        id: categoria.id,
        nombre,
        parentId: parentIdActual === "" ? null : parentIdActual,
        orden: ordenRaw === "" ? 0 : Number(ordenRaw),
        activo,
      });
      if (resultado.ok) {
        router.push("/admin/categorias");
        router.refresh();
      } else {
        alert(resultado.error ?? "Error al guardar la categoría");
      }
    });
  }

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black text-dark">
            Editar categoría
          </h1>
          <p className="mt-1 text-muted">/{categoria.slug}</p>
        </div>
        <Link href="/admin/categorias">
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
            defaultValue={categoria.nombre}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-green-400 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-dark">
            Categoría padre{" "}
            <span className="font-normal text-muted">(opcional)</span>
          </span>
          <select
            name="parentId"
            value={parentIdActual}
            onChange={(e) => setParentIdActual(e.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-green-400 focus:outline-none"
          >
            <option value="">Sin padre (raíz)</option>
            {opcionesPadre.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-dark">Orden</span>
          <input
            name="orden"
            type="number"
            defaultValue={categoria.orden}
            min={0}
            className="w-full max-w-[120px] rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-green-400 focus:outline-none"
          />
        </label>

        <label className="flex items-center gap-2">
          <input
            name="activo"
            type="checkbox"
            defaultChecked={categoria.activo}
            className="h-4 w-4 rounded border-gray-300 text-green-500 focus:ring-green-400"
          />
          <span className="text-sm font-semibold text-dark">
            Categoría activa
          </span>
        </label>

        <div className="flex gap-3">
          <Boton type="submit" radio="xl" disabled={enviando}>
            {enviando ? "Guardando..." : "Guardar cambios"}
          </Boton>
        </div>
      </form>
    </article>
  );
}
