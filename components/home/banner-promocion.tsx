import Image from "next/image";
import Link from "next/link";
import { RUTAS } from "@/lib/config/tienda";

export default function BannerPromocion() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="relative overflow-hidden rounded-3xl bg-green-500 min-h-[200px] flex items-center">
        <Image
          src="https://images.unsplash.com/photo-1582725461742-8ecd962c260d?w=1200&h=300&fit=crop&auto=format"
          alt=""
          fill
          sizes="(max-width: 1280px) 100vw, 1200px"
          className="object-cover opacity-30 mix-blend-multiply"
          aria-hidden="true"
        />
        <div className="relative z-10 px-8 md:px-16 py-10 max-w-lg">
          <span className="inline-block bg-white/20 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            Promoción especial
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-3 font-display">
            Hasta 20% OFF en alimentos seleccionados
          </h2>
          <p className="text-white/85 mb-6">
            Oferta válida hasta el 31 de agosto. No acumulable con otras promociones.
          </p>
          <Link
            href={RUTAS.catalogoCategoria("ofertas")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-600 font-bold rounded-full hover:bg-green-50 transition-colors"
          >
            Ver promociones
          </Link>
        </div>
      </div>
    </div>
  );
}
