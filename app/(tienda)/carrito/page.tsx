"use client";

import Image from "next/image";
import Link from "next/link";
import { useCarrito } from "@/components/carrito/proveedor-carrito";
import { RUTAS } from "@/lib/config/tienda";
import { formatPriceCOP } from "@/utils/formato";

function ImagenPlaceholder() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-green-50">
      <Image
        src="/images/mascota-kewee.png"
        alt="KEWEE MASCOTAS"
        width={64}
        height={64}
        className="opacity-80"
      />
    </div>
  );
}

export default function CarritoPage() {
  const { items, setCantidad, eliminar, vaciar, cantidadTotal, total } = useCarrito();

  if (items.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-3xl mx-auto w-full">
        <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-sm text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
            <svg
              className="h-8 w-8 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 5.4a1 1 0 00.9 1.4H18m-5-9v4m-2-2h4m-6 9a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-black font-display text-dark">Tu carrito está vacío</h1>
          <p className="mt-2 text-muted">
            Explora el catálogo y encuentra lo que tu mascota necesita.
          </p>
          <Link
            href={RUTAS.catalogo}
            className="inline-block mt-6 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full transition-colors active:scale-[0.98]"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto w-full">
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link href={RUTAS.inicio} className="hover:text-green-600">Inicio</Link>
        <span>/</span>
        <span className="text-dark font-medium">Carrito</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-black font-display text-dark mb-6">
        Carrito de compras{" "}
        <span className="text-muted font-bold">({cantidadTotal} {cantidadTotal === 1 ? "producto" : "productos"})</span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Líneas del carrito */}
        <div className="flex-1 space-y-4">
          {items.map((item) => {
            const subtotalLinea = item.precio * item.cantidad;
            return (
              <div
                key={item.varianteId}
                className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex gap-4"
              >
                {/* Imagen */}
                <Link
                  href={RUTAS.producto(item.slug)}
                  className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-gray-50"
                >
                  {item.imagen ? (
                    <Image
                      src={item.imagen}
                      alt={item.nombreProducto}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <ImagenPlaceholder />
                  )}
                </Link>

                {/* Detalle */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={RUTAS.producto(item.slug)}
                      className="text-sm font-bold text-dark hover:text-green-600 transition-colors line-clamp-2"
                    >
                      {item.nombreProducto}
                    </Link>
                    <button
                      onClick={() => eliminar(item.varianteId)}
                      aria-label={`Eliminar ${item.nombreProducto}`}
                      className="shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400">{item.nombreVariante}</p>

                  <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                    {/* Control de cantidad */}
                    <div className="flex items-center border border-gray-200 rounded-full">
                      <button
                        onClick={() => setCantidad(item.varianteId, item.cantidad - 1)}
                        disabled={item.cantidad <= 1}
                        aria-label="Disminuir cantidad"
                        className="h-8 w-8 flex items-center justify-center text-gray-600 hover:text-green-600 disabled:text-gray-300 transition-colors"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-dark tabular-nums">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => setCantidad(item.varianteId, item.cantidad + 1)}
                        disabled={item.stock != null && item.cantidad >= item.stock}
                        aria-label="Aumentar cantidad"
                        className="h-8 w-8 flex items-center justify-center text-gray-600 hover:text-green-600 disabled:text-gray-300 transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-400">
                        {formatPriceCOP(item.precio)} × {item.cantidad}
                      </p>
                      <p className="text-base font-black text-dark">{formatPriceCOP(subtotalLinea)}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex justify-between items-center">
            <button
              onClick={vaciar}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors font-semibold"
            >
              Vaciar carrito
            </button>
            <Link
              href={RUTAS.catalogo}
              className="text-sm font-bold text-green-600 hover:text-green-700 transition-colors"
            >
              ← Seguir comprando
            </Link>
          </div>
        </div>

        {/* Resumen */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-gray-50 rounded-3xl p-5 sticky top-24">
            <h2 className="font-black text-dark mb-4">Resumen</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cantidadTotal} {cantidadTotal === 1 ? "producto" : "productos"})</span>
                <span className="font-semibold">{formatPriceCOP(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                <span className="text-gray-400">Se calcula en el pago</span>
              </div>
            </div>
            <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-baseline">
              <span className="font-bold text-dark">Total</span>
              <span className="text-xl font-black text-dark">{formatPriceCOP(total)}</span>
            </div>
            <Link
              href={RUTAS.checkout}
              className="block w-full mt-5 py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-all hover:shadow-md active:scale-[0.98] text-center"
            >
              Finalizar compra
            </Link>
            <p className="mt-3 text-center text-xs text-gray-400">
              Pagos seguros · Despachos en Medellín
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
