"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCarrito } from "@/components/carrito/proveedor-carrito";
import { crearPedido } from "@/lib/pedidos/acciones";
import { iniciarPagoMercadoPago } from "@/lib/mercadopago/acciones";
import { construirEnlaceWhatsApp } from "@/lib/whatsapp/construir-mensaje-pedido";
import { RUTAS } from "@/lib/config/tienda";
import {
  MINIMO_ENVIO_GRATIS,
  ZONAS_DOMICILIO,
  tarifaDomicilioPara,
} from "@/lib/config/domicilio";
import { formatPriceCOP } from "@/utils/formato";
import type { MetodoPago } from "@/lib/supabase/tipos-db";
import type { PedidoConRelaciones } from "@/lib/pedidos/consultas";

const DEPARTAMENTOS = [
  "Antioquia",
  "Bogotá D.C.",
  "Valle del Cauca",
  "Atlántico",
  "Cundinamarca",
  "Santander",
  "Bolívar",
  "Nariño",
  "Córdoba",
  "Tolima",
];

function ImagenPlaceholder() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-green-50">
      <Image
        src="/images/mascota-kewee.png"
        alt="KEWEE MASCOTAS"
        width={48}
        height={48}
        className="opacity-80"
      />
    </div>
  );
}

interface FormularioCliente {
  nombre: string;
  telefono: string;
  email: string;
}

interface FormularioDireccion {
  direccion: string;
  barrio: string;
  ciudad: string;
  departamento: string;
  notas: string;
}

const inicialCliente: FormularioCliente = { nombre: "", telefono: "", email: "" };
const inicialDireccion: FormularioDireccion = {
  direccion: "",
  barrio: "",
  ciudad: ZONAS_DOMICILIO[0].nombre,
  departamento: DEPARTAMENTOS[0],
  notas: "",
};

export default function CheckoutPage() {
  const { items, cantidadTotal, total, vaciar } = useCarrito();

  const [cliente, setCliente] = useState<FormularioCliente>(inicialCliente);
  const [direccion, setDireccion] = useState<FormularioDireccion>(inicialDireccion);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("contraentrega");

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pedidoConfirmado, setPedidoConfirmado] = useState<PedidoConRelaciones | null>(null);
  const [redirigiendoMercadoPago, setRedirigiendoMercadoPago] = useState(false);

  // Al volver desde Mercado Pago (navegación a origen externo), el navegador
  // restaura /checkout desde el bfcache conservando el estado React previo, por
  // lo que redirigiendoMercadoPago quedaba atascado en la pantalla intermedia.
  // Al restaurarse (event.persisted), se resetean esos estados para volver al
  // formulario de checkout en lugar de la pantalla "Redirigiendo a Mercado Pago".
  useEffect(() => {
    const manejarPageshow = (evento: PageTransitionEvent) => {
      if (evento.persisted) {
        setRedirigiendoMercadoPago(false);
        setEnviando(false);
      }
    };
    window.addEventListener("pageshow", manejarPageshow);
    return () => window.removeEventListener("pageshow", manejarPageshow);
  }, []);

  const costoEnvio = useMemo(
    () => tarifaDomicilioPara(total, direccion.ciudad),
    [total, direccion.ciudad],
  );
  const totalFinal = total + costoEnvio;

  const setClienteCampo = (campo: keyof FormularioCliente, valor: string) =>
    setCliente(prev => ({ ...prev, [campo]: valor }));
  const setDireccionCampo = (campo: keyof FormularioDireccion, valor: string) =>
    setDireccion(prev => ({ ...prev, [campo]: valor }));

  const validar = (): string | null => {
    if (!cliente.nombre.trim()) return "El nombre es obligatorio.";
    if (!cliente.telefono.trim() || !/^[0-9+\-\s()]{7,20}$/.test(cliente.telefono.trim()))
      return "El teléfono no es válido.";
    if (!direccion.direccion.trim()) return "La dirección es obligatoria.";
    if (!direccion.ciudad.trim()) return "La ciudad es obligatoria.";
    return null;
  };

  const manejarConfirmar = async () => {
    setError(null);
    const errorValidacion = validar();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    setEnviando(true);
    try {
      // Se envía solo varianteId + cantidad; precio/stock/totales los
      // recalcula crearPedido() en el servidor (fuente de verdad).
      const resultado = await crearPedido({
        cliente: {
          nombre: cliente.nombre.trim(),
          telefono: cliente.telefono.trim(),
          email: cliente.email.trim() || undefined,
        },
        direccionEntrega: {
          direccion: direccion.direccion.trim(),
          barrio: direccion.barrio.trim() || undefined,
          ciudad: direccion.ciudad.trim(),
          departamento: direccion.departamento.trim() || undefined,
          notas: direccion.notas.trim() || undefined,
        },
        items: items.map(i => ({ varianteId: i.varianteId, cantidad: i.cantidad })),
        metodoPago,
      });
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }

      // Contraentrega: flujo actual sin cambios (pantalla de confirmación + WhatsApp).
      if (metodoPago === "contraentrega") {
        setPedidoConfirmado(resultado.pedido);
        vaciar();
        return;
      }

      // Mercado Pago: pedido creado (estado 'recibido', estado_pago 'pendiente').
      // Ahora se crea la preferencia, se guarda preference_id y se redirige a init_point.
      setRedirigiendoMercadoPago(true);
      const pago = await iniciarPagoMercadoPago(resultado.pedido.pedido.id);
      if (!pago.ok) {
        setError(pago.error);
        setRedirigiendoMercadoPago(false);
        return;
      }
      // Antes de salir a Mercado Pago se apaga el flag de "redirigiendo" para
      // que, si el navegador restaura /checkout desde el bfcache al volver,
      // el guard (redirigiendoMercadoPago && enviando) sea false y se muestre
      // el formulario en lugar de la pantalla intermedia.
      setRedirigiendoMercadoPago(false);
      window.location.href = pago.initPoint;
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear el pedido. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  if (pedidoConfirmado) {
    const numeroPedido = pedidoConfirmado.pedido.numero_pedido;
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-3xl mx-auto w-full">
        <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-sm text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-black font-display text-dark">¡Pedido confirmado!</h1>
          <p className="mt-2 text-muted">
            Hemos recibido tu pedido. El número de seguimiento es:
          </p>
          <p className="mt-4 inline-block px-6 py-2 bg-green-50 border border-green-200 text-green-700 text-xl font-black rounded-2xl">
            {numeroPedido}
          </p>
          <p className="mt-4 text-sm text-muted">
            Te contactaremos para coordinar la entrega.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <a
              href={construirEnlaceWhatsApp(pedidoConfirmado)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold rounded-full transition-colors active:scale-[0.98]"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Confirmar por WhatsApp
            </a>
            <Link
              href={RUTAS.catalogo}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full transition-colors active:scale-[0.98]"
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (redirigiendoMercadoPago && enviando) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-3xl mx-auto w-full">
        <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-sm text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 animate-pulse">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-black font-display text-dark">
            Redirigiendo a Mercado Pago
          </h1>
          <p className="mt-2 text-muted">
            Tu pedido está creado. Serás enviado a Mercado Pago para completar
            el pago de forma segura.
          </p>
          <p className="mt-4 text-sm text-gray-400">
            No cierres esta ventana durante la redirección.
          </p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-3xl mx-auto w-full">
        <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-sm text-center">
          <h1 className="text-2xl font-black font-display text-dark">Tu carrito está vacío</h1>
          <p className="mt-2 text-muted">
            Agrega productos antes de iniciar el checkout.
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
        <Link href={RUTAS.carrito} className="hover:text-green-600">Carrito</Link>
        <span>/</span>
        <span className="text-dark font-medium">Checkout</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-black font-display text-dark mb-6">
        Finalizar compra
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Formulario */}
        <div className="flex-1 space-y-6">
          {/* Datos del cliente */}
          <section className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-black text-dark mb-4">Información de contacto</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">Nombre</label>
                <input
                  type="text"
                  value={cliente.nombre}
                  onChange={e => setClienteCampo("nombre", e.target.value)}
                  placeholder="Juan García"
                  maxLength={100}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="tel"
                  value={cliente.telefono}
                  onChange={e => setClienteCampo("telefono", e.target.value)}
                  placeholder="+57 300 000 0000"
                  maxLength={20}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 transition-colors"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-dark mb-1.5">
                  Correo electrónico <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="email"
                  value={cliente.email}
                  onChange={e => setClienteCampo("email", e.target.value)}
                  placeholder="juan@email.com"
                  maxLength={254}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 transition-colors"
                />
              </div>
            </div>
          </section>

          {/* Dirección de entrega */}
          <section className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-black text-dark mb-4">Dirección de entrega</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-dark mb-1.5">Dirección</label>
                <input
                  type="text"
                  value={direccion.direccion}
                  onChange={e => setDireccionCampo("direccion", e.target.value)}
                  placeholder="Calle 45 #23-12"
                  maxLength={200}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">Ciudad / Zona</label>
                <select
                  value={direccion.ciudad}
                  onChange={e => setDireccionCampo("ciudad", e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 bg-white transition-colors"
                >
                  {ZONAS_DOMICILIO.map(zona => (
                    <option key={zona.id} value={zona.nombre}>{zona.nombre}</option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-gray-500">
                  Domicilio en {direccion.ciudad}:{" "}
                  {costoEnvio === 0
                    ? "Gratis"
                    : formatPriceCOP(costoEnvio)}
                  {" "}· Envío gratis desde {formatPriceCOP(MINIMO_ENVIO_GRATIS)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-dark mb-1.5">Barrio</label>
                <input
                  type="text"
                  value={direccion.barrio}
                  onChange={e => setDireccionCampo("barrio", e.target.value)}
                  placeholder="El Poblado"
                  maxLength={100}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 transition-colors"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-dark mb-1.5">Departamento</label>
                <select
                  value={direccion.departamento}
                  onChange={e => setDireccionCampo("departamento", e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 bg-white transition-colors"
                >
                  {DEPARTAMENTOS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-dark mb-1.5">
                  Notas <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  value={direccion.notas}
                  onChange={e => setDireccionCampo("notas", e.target.value)}
                  rows={2}
                  placeholder="Referencias, instrucciones de entrega, etc."
                  maxLength={500}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-400 transition-colors resize-none"
                />
              </div>
            </div>
          </section>

          {/* Método de pago */}
          <section className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-black text-dark mb-4">Método de pago</h2>
            <div className="space-y-3">
              <label
                className={`flex items-start gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-colors ${
                  metodoPago === "contraentrega"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="metodoPago"
                  value="contraentrega"
                  checked={metodoPago === "contraentrega"}
                  onChange={() => setMetodoPago("contraentrega")}
                  className="mt-0.5 accent-green-500"
                />
                <div>
                  <p className="font-bold text-dark text-sm flex items-center gap-2">
                    Contraentrega en Medellín
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-bold">
                      Solo Medellín
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Paga en efectivo al recibir tu pedido.</p>
                </div>
              </label>

              <label
                className={`flex items-start gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-colors ${
                  metodoPago === "mercadopago"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="metodoPago"
                  value="mercadopago"
                  checked={metodoPago === "mercadopago"}
                  onChange={() => setMetodoPago("mercadopago")}
                  className="mt-0.5 accent-green-500"
                />
                <div>
                  <p className="font-bold text-dark text-sm">Pago online con Mercado Pago</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Tarjeta de crédito, débito, PSE, efectivo y más.
                  </p>
                  <div className="flex gap-2 mt-2">
                    {["Visa", "Mastercard", "PSE"].map(b => (
                      <span
                        key={b}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-medium"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Resumen del pedido */}
        <div className="lg:w-96 shrink-0">
          <div className="bg-gray-50 rounded-3xl p-5 sticky top-24">
            <h2 className="font-black text-dark mb-4">
              Tu pedido ({cantidadTotal} {cantidadTotal === 1 ? "producto" : "productos"})
            </h2>

            <div className="space-y-3 mb-4 max-h-72 overflow-y-auto pr-1">
              {items.map(item => (
                <div key={item.varianteId} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                    {item.imagen ? (
                      <Image
                        src={item.imagen}
                        alt={item.nombreProducto}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <ImagenPlaceholder />
                    )}
                    <span className="absolute -top-1.5 -right-1.5 h-4.5 w-4.5 flex items-center justify-center bg-green-500 text-white text-[10px] font-bold rounded-full">
                      {item.cantidad}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-dark line-clamp-1">{item.nombreProducto}</p>
                    <p className="text-xs text-gray-400">{item.nombreVariante}</p>
                  </div>
                  <span className="text-sm font-bold text-dark shrink-0">
                    {formatPriceCOP(item.precio * item.cantidad)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold">{formatPriceCOP(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Envío</span>
                <span className={`font-semibold ${costoEnvio === 0 ? "text-green-600" : ""}`}>
                  {costoEnvio === 0 ? "Gratis" : formatPriceCOP(costoEnvio)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between items-baseline">
                <span className="font-bold text-dark">Total</span>
                <span className="text-xl font-black text-dark">{formatPriceCOP(totalFinal)}</span>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                {error}
              </div>
            )}

            <button
              onClick={manejarConfirmar}
              disabled={enviando}
              className={`w-full mt-5 py-3.5 text-white font-bold rounded-2xl transition-all ${
                enviando
                  ? "bg-green-300 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 hover:shadow-md active:scale-[0.98]"
              }`}
            >
              {enviando ? "Confirmando..." : "Confirmar pedido"}
            </button>
            <p className="mt-3 text-center text-xs text-gray-400">
              Pagos seguros · Despachos en Medellín
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
