import Link from "next/link";
import CardProducto from "@/components/productos/card-producto";
import type { Producto } from "@/types/producto";

export default function CarruselFavoritos({ productos }: { productos: Producto[] }) {
  return (
    <section className="bg-green-50 py-12" aria-labelledby="titulo-favoritos">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-green-600 text-xs font-bold uppercase tracking-widest mb-1">
              Favoritos
            </p>
            <h2 id="titulo-favoritos" className="text-2xl md:text-3xl font-black text-dark font-display">
              Los favoritos de nuestros peludos
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-green-600 hover:text-green-700"
          >
            Ver todos
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "thin" }}
        >
          {productos.map(p => (
            <div key={p.id} className="snap-start shrink-0 w-52 sm:w-60">
              <CardProducto producto={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
