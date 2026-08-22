import Image from "next/image";
import Link from "next/link";
import { RUTAS } from "@/lib/config/tienda";

const valores = [
  { icono: "💚", label: "Amor por los animales" },
  { icono: "✓", label: "Marcas de confianza" },
  { icono: "🚀", label: "Envío rápido" },
  { icono: "📱", label: "Atención por WhatsApp" },
];

export default function SeccionNosotros() {
  return (
    <section className="bg-cream py-14" aria-labelledby="titulo-nosotros">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          {/* Mascota */}
          <div className="flex-1 flex justify-center">
            <Image
              src="/images/mascota-kewee.png"
              alt="Mascota de Kewee Mascotas"
              width={288}
              height={288}
              className="h-56 md:h-72 w-auto object-contain drop-shadow-2xl"
            />
          </div>

          {/* Texto */}
          <div className="flex-1 text-center md:text-left">
            <p className="text-green-600 text-xs font-bold uppercase tracking-widest mb-2">
              Quiénes somos
            </p>
            <h2
              id="titulo-nosotros"
              className="text-2xl md:text-4xl font-black text-dark mb-4 leading-tight font-display"
            >
              Creemos que cada mascota merece lo mejor
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Somos una tienda virtual colombiana especializada en productos para mascotas.
              Seleccionamos cada producto con amor y criterio, porque sabemos que tu compañero
              peludo es parte de la familia.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {valores.map(v => (
                <div key={v.label} className="flex items-center gap-2 text-sm font-medium text-dark">
                  <span className="text-base" aria-hidden="true">{v.icono}</span>
                  {v.label}
                </div>
              ))}
            </div>
            <Link
              href={RUTAS.nosotros}
              className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-green-500 text-green-600 font-bold rounded-full hover:bg-green-500 hover:text-white transition-colors"
            >
              Conocer más sobre Kewee
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
