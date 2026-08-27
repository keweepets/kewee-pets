"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCarrito } from "@/components/carrito/proveedor-carrito";
import { RUTAS } from "@/lib/config/tienda";
import { formatPriceCOP } from "@/utils/formato";
import type { EtiquetaProducto, Producto } from "@/types/producto";

const etiquetasConfig: Record<EtiquetaProducto, { label: string; color: string }> = {
  "mas-vendido": { label: "Más vendido", color: "bg-green-500 text-white" },
  oferta: { label: "Oferta", color: "bg-orange-500 text-white" },
  nuevo: { label: "Nuevo", color: "bg-blue-500 text-white" },
};

export default function CardProducto({ producto }: { producto: Producto }) {
  const router = useRouter();
  const { agregar } = useCarrito();

  const [varianteSeleccionadaId, setVarianteSeleccionadaId] = useState(
    producto.variantes[0]?.id ?? ""
  );
  const [agregado, setAgregado] = useState(false);

  const variante =
    producto.variantes.find(v => v.id === varianteSeleccionadaId) ?? producto.variantes[0];

  const descuento = variante?.precioOriginal
    ? Math.round((1 - variante.precio / variante.precioOriginal) * 100)
    : 0;

  const manejarAgregar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!variante) return;
    agregar({
      productoId: producto.id,
      varianteId: variante.id,
      nombreProducto: producto.nombre,
      marca: producto.marca,
      nombreVariante: variante.nombre,
      precio: variante.precio,
      cantidad: 1,
      stock: variante.stock,
      imagen: producto.imagenes[0],
      slug: producto.slug,
    });
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1800);
  };

  const irADetalle = () => router.push(RUTAS.producto(producto.slug));

  const etiquetaPrincipal = producto.etiquetas[0];

  return (
    <div
      className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden group cursor-pointer transition-all duration-200 flex flex-col"
      onClick={irADetalle}
    >
      {/* Imagen */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <Image
          src={producto.imagenes[0]}
          alt={producto.nombre}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {etiquetaPrincipal && etiquetasConfig[etiquetaPrincipal] && (
          <span
            className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-xs font-bold ${etiquetasConfig[etiquetaPrincipal].color}`}
          >
            {etiquetasConfig[etiquetaPrincipal].label}
          </span>
        )}
        {descuento > 0 && (
          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white">
            -{descuento}%
          </span>
        )}
        {variante && variante.stock <= 3 && variante.stock > 0 && (
          <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            Últimas {variante.stock}
          </span>
        )}
      </div>

      {/* Contenido */}
      <div className="p-3.5 flex flex-col gap-2 flex-1">
        {/* Marca + nombre */}
        <div>
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">
            {producto.marca}
          </p>
          <h3 className="text-sm font-bold text-dark leading-snug mt-0.5 line-clamp-2">
            {producto.nombre}
          </h3>
        </div>

        {/* Variantes */}
        {producto.variantes.length > 1 && (
          <div className="flex flex-wrap gap-1" onClick={e => e.stopPropagation()}>
            {producto.variantes.map(v => (
              <button
                key={v.id}
                onClick={e => {
                  e.stopPropagation();
                  setVarianteSeleccionadaId(v.id);
                }}
                className={`px-2 py-0.5 rounded-md text-xs font-medium border transition-colors ${
                  v.id === varianteSeleccionadaId
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-gray-200 text-gray-600 hover:border-green-400"
                } ${v.stock === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                disabled={v.stock === 0}
              >
                {v.nombre}
              </button>
            ))}
          </div>
        )}

        {/* Precio */}
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-base font-black text-dark">
            {formatPriceCOP(variante?.precio ?? 0)}
          </span>
          {variante?.precioOriginal && (
            <span className="text-xs text-gray-400 line-through">
              {formatPriceCOP(variante.precioOriginal)}
            </span>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={manejarAgregar}
          disabled={!variante || variante.stock === 0}
          className={`w-full py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
            agregado
              ? "bg-green-100 text-green-700"
              : variante?.stock === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 text-white active:scale-95"
          }`}
        >
          {agregado ? "¡Agregado! ✓" : variante?.stock === 0 ? "Agotado" : "¡Lo quiero!"}
        </button>
      </div>
    </div>
  );
}
