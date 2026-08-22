"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCarrito } from "@/components/carrito/proveedor-carrito";
import IconoWhatsApp from "@/components/icons/icono-whatsapp";
import { RUTAS, TIENDA } from "@/lib/config/tienda";

const enlacesNav: { label: string; href: string }[] = [
  { label: "Perros", href: RUTAS.catalogoCategoria("perros") },
  { label: "Gatos", href: RUTAS.catalogoCategoria("gatos") },
  { label: "Accesorios", href: RUTAS.catalogoCategoria("accesorios") },
  { label: "Promociones", href: RUTAS.catalogoCategoria("ofertas") },
  { label: "Nosotros", href: RUTAS.nosotros },
];

export default function Header() {
  const router = useRouter();
  const { cantidadTotal, total } = useCarrito();
  const [busqueda, setBusqueda] = useState("");
  const [menuAbierto, setMenuAbierto] = useState(false);

  const manejarBusqueda = (e: React.FormEvent) => {
    e.preventDefault();
    setMenuAbierto(false);
    router.push(
      busqueda.trim()
        ? `${RUTAS.catalogo}?q=${encodeURIComponent(busqueda.trim())}`
        : RUTAS.catalogo
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      {/* Fila principal */}
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
        {/* Logo */}
        <Link
          href={RUTAS.inicio}
          className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity"
          onClick={() => setMenuAbierto(false)}
        >
          <Image
            src="/images/mascota-kewee-avatar.jpg"
            alt="Mascota de Kewee"
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover"
            priority
          />
          <div className="hidden sm:block leading-tight">
            <div className="font-black text-xl text-green-500 tracking-tight font-display">
              kewee
            </div>
            <div className="text-[10px] text-muted tracking-[0.2em] uppercase -mt-1 font-medium">
              mascotas
            </div>
          </div>
        </Link>

        {/* Búsqueda */}
        <form onSubmit={manejarBusqueda} className="flex-1 max-w-xl mx-auto" role="search">
          <div className="relative">
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar productos, marcas..."
              aria-label="Buscar productos"
              className="w-full h-9 pl-4 pr-10 rounded-full border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-green-500 focus:bg-white transition-colors placeholder:text-gray-400"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-500"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        {/* Iconos */}
        <div className="flex items-center gap-1">
          {/* WhatsApp */}
          <a
            href={TIENDA.urlWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escríbenos por WhatsApp"
            className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-green-50 text-green-500 transition-colors"
          >
            <IconoWhatsApp className="w-5 h-5" />
          </a>

          {/* Carrito */}
          <Link
            href={RUTAS.carrito}
            aria-label={`Carrito de compras: ${cantidadTotal} artículos`}
            className="relative h-9 flex items-center gap-1.5 px-3 rounded-full hover:bg-green-50 transition-colors group"
          >
            <svg
              className="w-5 h-5 text-dark group-hover:text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cantidadTotal > 0 && (
              <>
                <span className="text-sm font-semibold text-dark hidden sm:block">
                  ${(total / 1000).toFixed(0)}k
                </span>
                <span className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 flex items-center justify-center rounded-full bg-green-500 text-white text-[10px] font-bold">
                  {cantidadTotal}
                </span>
              </>
            )}
          </Link>

          {/* Menú móvil */}
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            aria-expanded={menuAbierto}
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors md:hidden"
          >
            <svg className="w-5 h-5 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {menuAbierto ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Barra de navegación (desktop) */}
      <nav className="bg-green-500 hidden md:block" aria-label="Navegación principal">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1">
          {enlacesNav.map(enlace => (
            <Link
              key={enlace.label}
              href={enlace.href}
              className="px-4 py-2 text-white/90 hover:text-white hover:bg-green-600 text-sm font-medium transition-colors"
            >
              {enlace.label}
            </Link>
          ))}
          <Link
            href={RUTAS.contacto}
            className="px-4 py-2 text-white/90 hover:text-white hover:bg-green-600 text-sm font-medium transition-colors"
          >
            Contacto
          </Link>
          <div className="ml-auto flex items-center gap-2 py-1">
            <span className="text-white/70 text-xs">Contraentrega disponible en Medellín</span>
            <span className="h-1 w-1 rounded-full bg-white/50" />
            <Link href={RUTAS.admin} className="text-white/60 hover:text-white text-xs transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </nav>

      {/* Navegación móvil */}
      {menuAbierto && (
        <nav className="md:hidden bg-white border-t border-gray-100 py-2" aria-label="Navegación móvil">
          {[...enlacesNav, { label: "Contacto", href: RUTAS.contacto }].map(enlace => (
            <Link
              key={enlace.label}
              href={enlace.href}
              onClick={() => setMenuAbierto(false)}
              className="block w-full text-left px-4 py-2.5 text-sm font-medium text-dark hover:bg-green-50 hover:text-green-600 transition-colors"
            >
              {enlace.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
