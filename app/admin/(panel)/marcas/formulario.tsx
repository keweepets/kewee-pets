"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import Boton from "@/components/ui/boton";
import { crearMarca } from "./acciones";

export default function FormularioMarca() {
  const router = useRouter();
  const [enviando, startTransition] = useTransition();

  function manejarEnvio(fd: FormData) {
    const nombre = String(fd.get("nombre") ?? "").trim();
    if (!nombre) return;

    startTransition(async () => {
      const resultado = await crearMarca({ nombre });
      if (resultado.ok) {
        router.refresh();
      } else {
        alert(resultado.error ?? "Error al crear marca");
      }
    });
  }

  return (
    <form action={manejarEnvio} className="flex items-end gap-3">
      <div className="flex-1">
        <label
          htmlFor="nombre-marca"
          className="mb-1.5 block text-sm font-semibold text-dark"
        >
          Nombre de la marca
        </label>
        <input
          id="nombre-marca"
          name="nombre"
          type="text"
          required
          placeholder="Ej: Royal Canin"
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-green-400 focus:outline-none"
        />
      </div>
      <Boton type="submit" radio="xl" disabled={enviando}>
        {enviando ? "Creando..." : "Crear marca"}
      </Boton>
    </form>
  );
}
