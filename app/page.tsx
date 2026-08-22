import Boton from "@/components/ui/boton";
import Badge from "@/components/ui/badge";
import CampoTexto from "@/components/ui/campo-texto";
import { formatPriceCOP } from "@/utils/formato";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-green-50 px-6 py-16 text-center">
      <div className="flex flex-col items-center gap-3">
        <Badge tono="verdeSuave">FASE 1 · Fundación técnica lista</Badge>
        <h1 className="text-4xl font-black text-dark md:text-5xl">
          Kewee <span className="text-green-500">Mascotas</span>
        </h1>
        <p className="max-w-xl text-lg text-muted">
          Next.js 16 + Tailwind CSS v4 con el design system portado desde el
          diseño de referencia. En la FASE 2 se portarán Header, Home y Footer
          completos.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Boton tamano="lg" radio="completo">
          Comprar ahora
        </Boton>
        <Boton variante="contorno" tamano="lg" radio="completo">
          Ver catálogo
        </Boton>
      </div>

      <div className="w-full max-w-sm space-y-3 rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-sm">
        <CampoTexto label="Correo electrónico" placeholder="tucorreo@ejemplo.com" />
        <CampoTexto
          label="Teléfono"
          placeholder="300 123 4567"
          ayuda="Para coordinar la contraentrega en Medellín."
        />
        <p className="text-sm text-muted">
          Precio formateado con{" "}
          <code className="rounded bg-gray-50 px-1 py-0.5 text-xs">formatPriceCOP</code>:{" "}
          <span className="font-bold text-green-600">{formatPriceCOP(89900)}</span>
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge tono="verde">Más vendido</Badge>
          <Badge tono="naranja">Oferta</Badge>
          <Badge tono="rojo">-20%</Badge>
          <Badge tono="ambar">Últimas unidades</Badge>
        </div>
      </div>
    </main>
  );
}
