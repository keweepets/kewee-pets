import Link from "next/link";
import { RUTAS } from "@/lib/config/tienda";

const categorias = [
  { label: "Perros", emoji: "🐕", color: "bg-amber-50 border-amber-200", href: RUTAS.catalogoCategoria("perros") },
  { label: "Gatos", emoji: "🐈", color: "bg-purple-50 border-purple-200", href: RUTAS.catalogoCategoria("gatos") },
  { label: "Accesorios", emoji: "🦮", color: "bg-blue-50 border-blue-200", href: RUTAS.catalogoCategoria("accesorios") },
  { label: "Promociones", emoji: "🏷️", color: "bg-red-50 border-red-200", href: RUTAS.catalogoCategoria("ofertas") },
];

export default function Categorias() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categorias.map(cat => (
          <Link
            key={cat.label}
            href={cat.href}
            className={`flex flex-col items-center gap-2 py-5 rounded-2xl border-2 ${cat.color} hover:scale-105 transition-transform font-bold text-dark`}
          >
            <span className="text-3xl" aria-hidden="true">{cat.emoji}</span>
            <span className="text-sm">{cat.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
