"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import Boton from "@/components/ui/boton";
import { crearCategoria } from "./acciones";

interface OpcionCategoria {
  id: string;
  nombre: string;
}

export default function FormularioCategoria({
  categorias,
}: {
  categorias: OpcionCategoria[];
}) {
  const router = useRouter();
  const [enviando, startTransition] = useTransition();

  function manejarEnvio(fd: FormData) {
    const nombre = String(fd.get("nombre") ?? "").trim();
    const parentIdRaw = String(fd.get("parentId") ?? "").trim();
    if (!nombre) return;

    startTransition(async () => {
      const resultado = await crearCategoria({
        nombre,
        parentId: parentIdRaw || undefined,
      });
      if (resultado.ok) {
        router.refresh();
      } else {
        alert(resultado.error ?? "Error al crear categoría");
      }
    });
  }

  return (
    <form action={manejarEnvio} className="flex flex-wrap items-end gap-3">
      <div className="min-w-[200px] flex-1">
        <label
          htmlFor="nombre-categoria"
          className="mb-1.5 block text-sm font-semibold text-dark"
        >
          Nombre de la categoría
        </label>
        <input
          id="nombre-categoria"
          name="nombre"
          type="text"
          required
          placeholder="Ej: Alimentos"
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-green-400 focus:outline-none"
        />
      </div>

      <div className="min-w-[200px] flex-1">
        <label
          htmlFor="parentId-categoria"
          className="mb-1.5 block text-sm font-semibold text-dark"
        >
          Categoría padre <span className="font-normal text-muted">(opcional)</span>
        </label>
        <select
          id="parentId-categoria"
          name="parentId"
          defaultValue=""
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-green-400 focus:outline-none"
        >
          <option value="">Sin padre (raíz)</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <Boton type="submit" radio="xl" disabled={enviando}>
        {enviando ? "Creando..." : "Crear categoría"}
      </Boton>
    </form>
  );
}
