"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import Boton from "@/components/ui/boton";
import type { MarcaRow } from "@/lib/supabase/tipos-db";
import { editarMarca } from "../acciones";

export default function FormularioEditarMarca({ marca }: { marca: MarcaRow }) {
  const router = useRouter();
  const [enviando, startTransition] = useTransition();

  function manejarEnvio(fd: FormData) {
    const nombre = String(fd.get("nombre") ?? "").trim();
    const activo = fd.get("activo") === "on";
    if (!nombre) return;

    startTransition(async () => {
      const resultado = await editarMarca({ id: marca.id, nombre, activo });
      if (resultado.ok) {
        router.push("/admin/marcas");
        router.refresh();
      } else {
        alert(resultado.error ?? "Error al guardar la marca");
      }
    });
  }

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black text-dark">
            Editar marca
          </h1>
          <p className="mt-1 text-muted">/{marca.slug}</p>
        </div>
        <Link href="/admin/marcas">
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
            defaultValue={marca.nombre}
            maxLength={100}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-green-400 focus:outline-none"
          />
        </label>

        <label className="flex items-center gap-2">
          <input
            name="activo"
            type="checkbox"
            defaultChecked={marca.activo}
            className="h-4 w-4 rounded border-gray-300 text-green-500 focus:ring-green-400"
          />
          <span className="text-sm font-semibold text-dark">Marca activa</span>
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
