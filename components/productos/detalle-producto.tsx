"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCarrito } from "@/components/carrito/proveedor-carrito";
import { RUTAS } from "@/lib/config/tienda";
import { formatPriceCOP } from "@/utils/formato";
import type { EtiquetaProducto, Producto, VarianteProducto } from "@/types/producto";

const etiquetasConfig: Record<EtiquetaProducto, { label: string; color: string }> = {
  "mas-vendido": { label: "Más vendido", color: "bg-green-500 text-white" },
  oferta: { label: "Oferta", color: "bg-orange-500 text-white" },
  nuevo: { label: "Nuevo", color: "bg-blue-500 text-white" },
};

function ImagenPlaceholder() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-green-50">
      <Image
        src="/images/mascota-kewee.png"
        alt="KEWEE MASCOTAS"
        width={140}
        height={140}
        className="opacity-80"
      />
      <span className="text-xs font-semibold text-muted">Foto próximamente</span>
    </div>
  );
}

export default function DetalleProducto({ producto }: { producto: Producto }) {
  const { agregar } = useCarrito();

  const [varianteSeleccionadaId, setVarianteSeleccionadaId] = useState(
    producto.variantes[0]?.id ?? ""
  );
  const [imagenActiva, setImagenActiva] = useState(0);
  const [agregado, setAgregado] = useState(false);

  const variante: VarianteProducto | undefined =
    producto.variantes.find((v) => v.id === varianteSeleccionadaId) ??
    producto.variantes[0];

  const descuento = variante?.precioOriginal
    ? Math.round((1 - variante.precio / variante.precioOriginal) * 100)
    : 0;

  const agotado = !variante || variante.stock === 0;

  const manejarAgregar = () => {
    if (!variante || variante.stock === 0) return;
    agregar({
      productoId: producto.id,
      varianteId: variante.id,
      nombreProducto: producto.nombre,
      marca: producto.marca,
      nombreVariante: variante.nombre,
      precio: variante.precio,
      cantidad: 1,
      imagen: producto.imagenes[0] ?? "",
      slug: producto.slug,
    });
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1800);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto w-full">
      {/* Volver */}
      <Link
        href={RUTAS.catalogo}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-muted hover:text-green-600 transition-colors mb-6"
      >
        ← Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Galería */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
            {producto.imagenes.length > 0 ? (
              <Image
                key={producto.imagenes[imagenActiva] ?? producto.slug}
                src={producto.imagenes[imagenActiva]}
                alt={producto.nombre}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <ImagenPlaceholder />
            )}
          </div>

          {producto.imagenes.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {producto.imagenes.map((url, indice) => (
                <button
                  key={url + indice}
                  onClick={() => setImagenActiva(indice)}
                  aria-label={`Ver imagen ${indice + 1}`}
                  className={`relative aspect-square rounded-xl overflow-hidden bg-gray-50 border-2 transition-colors ${
                    indice === imagenActiva
                      ? "border-green-500"
                      : "border-transparent hover:border-gray-200"
                  }`}
                >
                  <Image src={url} alt="" fill sizes="120px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información */}
        <div className="flex flex-col">
          <p className="text-sm font-black text-green-600 uppercase tracking-widest">
            {producto.marca}
          </p>
          <h1 className="mt-1 text-3xl font-black font-display text-dark leading-tight">
            {producto.nombre}
          </h1>

          {producto.etiquetas.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {producto.etiquetas.map((etiqueta) =>
                etiquetasConfig[etiqueta] ? (
                  <span
                    key={etiqueta}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${etiquetasConfig[etiqueta].color}`}
                  >
                    {etiquetasConfig[etiqueta].label}
                  </span>
                ) : null
              )}
            </div>
          )}

          {producto.descripcionCorta && (
            <p className="mt-4 text-muted leading-relaxed">{producto.descripcionCorta}</p>
          )}

          {/* Precio */}
          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-4xl font-black text-dark">
              {formatPriceCOP(variante?.precio ?? 0)}
            </span>
            {variante?.precioOriginal && (
              <span className="text-lg text-gray-400 line-through">
                {formatPriceCOP(variante.precioOriginal)}
              </span>
            )}
            {descuento > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-red-500 text-white">
                -{descuento}%
              </span>
            )}
          </div>

          {/* Stock */}
          {variante && (
            <p
              className={`mt-2 text-sm font-semibold ${
                variante.stock === 0
                  ? "text-red-500"
                  : variante.stock <= 3
                  ? "text-amber-600"
                  : "text-green-600"
              }`}
            >
              {variante.stock === 0
                ? "Agotado temporalmente"
                : variante.stock <= 3
                ? `¡Últimas ${variante.stock} unidades!`
                : "Disponible"}
            </p>
          )}

          {/* Variantes (ocultas si hay una sola) */}
          {producto.variantes.length > 1 && (
            <div className="mt-6">
              <h2 className="text-sm font-black text-dark uppercase tracking-wide mb-2">
                Elige una opción
              </h2>
              <div className="flex flex-wrap gap-2">
                {producto.variantes.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVarianteSeleccionadaId(v.id)}
                    disabled={v.stock === 0}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
                      v.id === varianteSeleccionadaId
                        ? "bg-green-500 border-green-500 text-white"
                        : v.stock === 0
                        ? "border-gray-100 text-gray-300 cursor-not-allowed line-through"
                        : "border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600"
                    }`}
                  >
                    {v.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={manejarAgregar}
              disabled={agotado}
              className={`flex-1 py-3.5 rounded-full text-base font-black transition-all duration-200 ${
                agregado
                  ? "bg-green-100 text-green-700"
                  : agotado
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 text-white active:scale-[0.98]"
              }`}
            >
              {agregado ? "¡Agregado al carrito! ✓" : agotado ? "Agotado" : "¡Lo quiero!"}
            </button>
          </div>

          {/* Descripción larga */}
          {producto.descripcion && (
            <div className="mt-10 pt-8 border-t border-gray-100">
              <h2 className="text-sm font-black text-dark uppercase tracking-wide mb-3">
                Descripción
              </h2>
              <p className="text-muted leading-relaxed whitespace-pre-line">
                {producto.descripcion}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
