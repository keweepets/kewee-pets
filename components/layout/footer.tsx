import Image from "next/image";
import Link from "next/link";
import IconoWhatsApp from "@/components/icons/icono-whatsapp";
import { RUTAS, TIENDA } from "@/lib/config/tienda";

const enlacesTienda = [
  { label: "Perros", href: RUTAS.catalogoCategoria("perros") },
  { label: "Gatos", href: RUTAS.catalogoCategoria("gatos") },
  { label: "Accesorios", href: RUTAS.catalogoCategoria("accesorios") },
  { label: "Promociones", href: RUTAS.catalogoCategoria("ofertas") },
];

export default function Footer() {
  return (
    <footer className="bg-dark text-white/80 mt-16">
      {/* Banner contraentrega */}
      <div className="bg-green-500 py-3">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-4 text-white text-sm font-medium text-center">
          <span className="flex items-center gap-2">
            <IconoWhatsApp className="w-4 h-4" />
            Contraentrega disponible en Medellín
          </span>
          <span className="text-white/80">·</span>
          <span>Pedidos contraentrega únicamente por WhatsApp</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Marca */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/images/mascota-kewee-avatar.jpg"
                alt="Mascota de Kewee"
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <div className="font-black text-2xl text-white font-display">kewee</div>
                <div className="text-[10px] text-white/50 tracking-[0.2em] uppercase -mt-1">
                  mascotas
                </div>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-4">
              Tienda virtual especializada en productos para mascotas. Con amor desde
              Medellín, Colombia.
            </p>
            <a
              href={TIENDA.urlWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-full text-white text-sm font-semibold transition-colors"
            >
              <IconoWhatsApp className="w-4 h-4" />
              Escribir al WhatsApp
            </a>
          </div>

          {/* Tienda */}
          <nav aria-label="Tienda">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Tienda
            </h4>
            <ul className="space-y-2.5 text-sm">
              {enlacesTienda.map(enlace => (
                <li key={enlace.label}>
                  <Link href={enlace.href} className="text-white/60 hover:text-green-400 transition-colors">
                    {enlace.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Información */}
          <nav aria-label="Información">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Información
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href={RUTAS.nosotros} className="text-white/60 hover:text-green-400 transition-colors">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href={RUTAS.contacto} className="text-white/60 hover:text-green-400 transition-colors">
                  Contacto
                </Link>
              </li>
              {/* Enlaces legales: se activan en FASE 9 (Seguridad + SEO) */}
              <li><a href="#" className="text-white/60 hover:text-green-400 transition-colors">Políticas de envío</a></li>
              <li><a href="#" className="text-white/60 hover:text-green-400 transition-colors">Términos y condiciones</a></li>
              <li><a href="#" className="text-white/60 hover:text-green-400 transition-colors">Devoluciones</a></li>
            </ul>
          </nav>

          {/* Contacto */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">
              Contacto
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-white/60">
                <IconoWhatsApp className="w-4 h-4 shrink-0 mt-0.5 text-green-400" />
                {TIENDA.telefonoVisible}
              </li>
              <li className="flex items-start gap-2 text-white/60">
                <svg className="w-4 h-4 shrink-0 mt-0.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {TIENDA.email}
              </li>
              <li className="flex items-start gap-2 text-white/60">
                <svg className="w-4 h-4 shrink-0 mt-0.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  {TIENDA.horario[0]}
                  <br />
                  {TIENDA.horario[1]}
                </span>
              </li>
              <li className="text-white/60">{TIENDA.ubicacion}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <span>© {new Date().getFullYear()} {TIENDA.nombreLegal}. Todos los derechos reservados.</span>
          <div className="flex items-center gap-1">
            <span>Pagos seguros con</span>
            <span className="text-white/60 font-semibold">Mercado Pago</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
