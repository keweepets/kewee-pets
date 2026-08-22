import Link from "next/link";
import IconoWhatsApp from "@/components/icons/icono-whatsapp";
import { RUTAS, TIENDA } from "@/lib/config/tienda";

export default function CtaFinal() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <h2 className="text-3xl md:text-4xl font-black text-dark mb-4 font-display">
        Todo lo que tu mascota necesita,
        <br className="hidden md:block" /> en un solo lugar.
      </h2>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        Desde alimentos premium hasta accesorios especiales. Con entrega a domicilio y
        contraentrega en Medellín.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={RUTAS.catalogo}
          className="px-8 py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full text-base transition-all hover:shadow-md active:scale-95"
        >
          Explorar productos
        </Link>
        <a
          href={TIENDA.urlWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border-2 border-green-500 text-green-600 font-bold rounded-full text-base hover:bg-green-50 transition-colors"
        >
          <IconoWhatsApp className="w-4 h-4" />
          Contactar por WhatsApp
        </a>
      </div>
    </div>
  );
}
