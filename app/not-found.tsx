import Image from "next/image";
import Link from "next/link";
import { RUTAS } from "@/lib/config/tienda";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center bg-green-50">
      <Image
        src="/images/mascota-kewee.png"
        alt="KEWEE MASCOTAS"
        width={120}
        height={120}
        className="opacity-90"
      />
      <p className="text-sm font-black text-green-600 uppercase tracking-widest">
        Error 404
      </p>
      <h1 className="text-3xl font-black text-dark font-display">
        ¡Guau! Esta página no existe
      </h1>
      <p className="max-w-md text-muted">
        La página que buscas fue movida o nunca existió. Te llevamos de vuelta a
        donde están las cosas buenas.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={RUTAS.catalogo}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full transition-colors"
        >
          Ver catálogo
        </Link>
        <Link
          href={RUTAS.inicio}
          className="px-6 py-2.5 border border-gray-200 bg-white hover:border-green-400 hover:text-green-600 text-gray-600 font-bold rounded-full transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
