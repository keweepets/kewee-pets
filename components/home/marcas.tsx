import Link from "next/link";
import type { Marca } from "@/types/producto";

export default function Marcas({ marcas }: { marcas: Marca[] }) {
  return (
    <section className="bg-gray-50 py-12" aria-labelledby="titulo-marcas">
      <div className="max-w-7xl mx-auto px-4">
        <h2
          id="titulo-marcas"
          className="text-center text-sm font-bold uppercase tracking-widest text-gray-400 mb-8"
        >
          Nuestras marcas
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {marcas.map(m => (
            <Link
              key={m.id}
              href="/catalogo"
              className="px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-700 hover:border-green-400 hover:text-green-600 hover:shadow-sm transition-all"
            >
              {m.nombre}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
