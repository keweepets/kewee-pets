"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { RUTAS } from "@/lib/config/tienda";

interface Diapositiva {
  fondo: string;
  imagen: string;
  eyebrow: string;
  titulo: string;
  subtitulo: string;
  cta: string;
  href: string;
  claro: boolean;
}

const diapositivas: Diapositiva[] = [
  {
    fondo: "bg-green-500",
    imagen:
      "https://images.unsplash.com/photo-1544568100-847a948585b9?w=800&h=500&fit=crop&auto=format",
    eyebrow: "Bienvenidos a Kewee",
    titulo: "Todo lo que tu mascota necesita",
    subtitulo: "Alimentos premium, juguetes y accesorios seleccionados con amor.",
    cta: "Explorar productos",
    href: RUTAS.catalogo,
    claro: false,
  },
  {
    fondo: "bg-[#2D2D2D]",
    imagen:
      "https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=800&h=500&fit=crop&auto=format",
    eyebrow: "Para tus gatos",
    titulo: "Nutrición de primera para ellos",
    subtitulo: "Descubre nuestras marcas favoritas: Royal Canin, Pro Plan, Hill's y más.",
    cta: "Ver para gatos",
    href: RUTAS.catalogoCategoria("gatos"),
    claro: false,
  },
  {
    fondo: "bg-cream",
    imagen:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=500&fit=crop&auto=format",
    eyebrow: "Contraentrega en Medellín",
    titulo: "Paga al recibir en tu puerta",
    subtitulo: "Pedidos contraentrega gestionados exclusivamente por WhatsApp.",
    cta: "Pedir por WhatsApp",
    href: RUTAS.contacto,
    claro: true,
  },
];

export default function HeroSlider() {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndice(i => (i + 1) % diapositivas.length), 4500);
    return () => clearInterval(timer);
  }, []);

  const actual = diapositivas[indice];

  return (
    <div className={`relative overflow-hidden ${actual.fondo} transition-colors duration-700`}>
      <div className="max-w-7xl mx-auto px-4 py-10 md:py-16">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Texto */}
          <div className="flex-1 text-center md:text-left">
            <p
              className={`text-xs font-bold uppercase tracking-widest mb-3 ${
                actual.claro ? "text-green-600" : "text-green-300"
              }`}
            >
              {actual.eyebrow}
            </p>
            <h1
              className={`text-3xl md:text-5xl font-black leading-tight mb-4 font-display ${
                actual.claro ? "text-dark" : "text-white"
              }`}
            >
              {actual.titulo}
            </h1>
            <p
              className={`text-base md:text-lg mb-6 max-w-md ${
                actual.claro ? "text-gray-600" : "text-white/80"
              }`}
            >
              {actual.subtitulo}
            </p>
            <Link
              href={actual.href}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full text-base shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              {actual.cta}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Imagen */}
          <div className="flex-1 max-w-xs md:max-w-sm w-full">
            <Image
              src={actual.imagen}
              alt={actual.titulo}
              width={500}
              height={500}
              priority={indice === 0}
              className="w-full rounded-3xl shadow-2xl object-cover aspect-square"
            />
          </div>
        </div>
      </div>

      {/* Puntos */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {diapositivas.map((d, i) => (
          <button
            key={d.eyebrow}
            onClick={() => setIndice(i)}
            aria-label={`Ir a diapositiva ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === indice ? "w-6 bg-green-500" : "w-2 bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
