import Image from "next/image";
import Link from "next/link";
import { RUTAS } from "@/lib/config/tienda";

const secciones = [
  {
    href: RUTAS.catalogoCategoria("perros"),
    imagen:
      "https://images.unsplash.com/photo-1648316465628-f21950bedc4f?w=700&h=500&fit=crop&auto=format",
    alt: "Sección perros",
    titulo: "Para perros",
    descripcion: "Alimentos, juguetes y accesorios para tu mejor amigo.",
    cta: "Comprar para perros",
  },
  {
    href: RUTAS.catalogoCategoria("gatos"),
    imagen:
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=700&h=500&fit=crop&auto=format",
    alt: "Sección gatos",
    titulo: "Para gatos",
    descripcion: "El juego y la nutrición importan. Cuídalos bien.",
    cta: "Comprar para gatos",
  },
];

export default function SeccionPerrosGatos() {
  return (
    <div className="max-w-7xl mx-auto px-4 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {secciones.map(s => (
          <Link
            key={s.titulo}
            href={s.href}
            className="relative overflow-hidden rounded-3xl h-64 md:h-80 group block"
          >
            {/* Fondo con img optimizada */}
            <Image
              src={s.imagen}
              alt={s.alt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-dark/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <p className="text-green-300 text-xs font-bold uppercase tracking-wider mb-1">
                Sección
              </p>
              <h3 className="text-white text-2xl font-black mb-2 font-display">{s.titulo}</h3>
              <p className="text-white/80 text-sm mb-4">{s.descripcion}</p>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-dark text-sm font-bold rounded-full group-hover:bg-green-50 transition-colors">
                {s.cta}
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
