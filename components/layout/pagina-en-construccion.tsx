import Link from "next/link";
import { RUTAS } from "@/lib/config/tienda";

/**
 * Página temporal para rutas que se construirán en fases posteriores.
 * Garantiza navegación sin errores 404 durante las demos.
 */
export default function PaginaEnConstruccion({
  titulo,
  descripcion,
}: {
  titulo: string;
  descripcion: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center bg-green-50">
      <span className="text-5xl" aria-hidden="true">🐾</span>
      <h1 className="text-3xl font-black text-dark font-display">{titulo}</h1>
      <p className="max-w-md text-muted">{descripcion}</p>
      <Link
        href={RUTAS.inicio}
        className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
