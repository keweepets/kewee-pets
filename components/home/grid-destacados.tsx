import CardProducto from "@/components/productos/card-producto";
import type { Producto } from "@/types/producto";

export default function GridDestacados({ productos }: { productos: Producto[] }) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12" aria-labelledby="titulo-destacados">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-green-600 text-xs font-bold uppercase tracking-widest mb-1">
            Destacados
          </p>
          <h2 id="titulo-destacados" className="text-2xl md:text-3xl font-black text-dark font-display">
            Consentir a tu mascota
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {productos.map(p => (
          <CardProducto key={p.id} producto={p} />
        ))}
      </div>
    </section>
  );
}
