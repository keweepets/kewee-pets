import Link from "next/link";
import type { ReactNode } from "react";
import { RUTAS } from "@/lib/config/tienda";
import type { ResultadoPagoRetorno } from "@/lib/mercadopago/verificar-pago";
import { verificarPagoYActualizar } from "@/lib/mercadopago/verificar-pago";

function primerValor(valor: string | string[] | undefined): string | undefined {
  const v = Array.isArray(valor) ? valor[0] : valor;
  return v?.trim() ? v.trim() : undefined;
}

// ---------------------------------------------------------------------------
// Bloques de UI por resultado.
// ---------------------------------------------------------------------------

function MarcoResultado({
  icono,
  colorIconoRef,
  titulo,
  descripcion,
  children,
}: {
  icono: ReactNode;
  colorIconoRef: string;
  titulo: string;
  descripcion: string;
  children?: ReactNode;
}) {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-3xl mx-auto w-full">
      <div className="bg-white border border-gray-100 rounded-3xl p-10 shadow-sm text-center">
        <div
          className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4 ${colorIconoRef}`}
        >
          {icono}
        </div>
        <h1 className="text-2xl font-black font-display text-dark">{titulo}</h1>
        <p className="mt-2 text-muted">{descripcion}</p>
        {children}
      </div>
    </div>
  );
}

function IconoCheck() {
  return (
    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function IconoReloj() {
  return (
    <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconoError() {
  return (
    <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.7 3.86a2 2 0 00-3.4 0z" />
    </svg>
  );
}

function BotonSeguirComprando() {
  return (
    <Link
      href={RUTAS.catalogo}
      className="inline-block mt-6 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full transition-colors active:scale-[0.98]"
    >
      Seguir comprando
    </Link>
  );
}

function PantallaAprobado(numeroPedido: string, paymentId: string) {
  return (
    <MarcoResultado
      icono={<IconoCheck />}
      colorIconoRef="bg-green-100"
      titulo="¡Pago aprobado!"
      descripcion={`Tu pago fue verificado y procesado correctamente. El número de seguimiento de tu pedido es:`}
    >
      <p className="mt-4 inline-block px-6 py-2 bg-green-50 border border-green-200 text-green-700 text-xl font-black rounded-2xl">
        {numeroPedido}
      </p>
      <p className="mt-4 text-xs text-gray-400">ID de transacción: {paymentId}</p>
      <div className="mt-6">
        <BotonSeguirComprando />
      </div>
    </MarcoResultado>
  );
}

function PantallaPendiente(numeroPedido?: string) {
  return (
    <MarcoResultado
      icono={<IconoReloj />}
      colorIconoRef="bg-amber-100"
      titulo="Pago pendiente"
      descripcion={
        numeroPedido
          ? `Tu pedido ${numeroPedido} está creado, pero el pago aún no se confirma. Te avisaremos cuando se apruebe.`
          : "Tu pedido está creado, pero el pago aún no se confirma. Te avisaremos cuando se apruebe."
      }
    >
      <div className="mt-6">
        <BotonSeguirComprando />
      </div>
    </MarcoResultado>
  );
}

function PantallaNoAprobado(numeroPedido?: string) {
  return (
    <MarcoResultado
      icono={<IconoError />}
      colorIconoRef="bg-red-100"
      titulo="Pago no aprobado"
      descripcion={
        numeroPedido
          ? `El pago del pedido ${numeroPedido} no fue aprobado. Puedes intentarlo nuevamente o elegir otro método de pago.`
          : "El pago no fue aprobado o no pudo verificarse. Puedes intentarlo nuevamente o elegir otro método de pago."
      }
    >
      <div className="mt-6">
        <BotonSeguirComprando />
      </div>
    </MarcoResultado>
  );
}

function PantallaError(mensaje: string) {
  return (
    <MarcoResultado
      icono={<IconoError />}
      colorIconoRef="bg-red-100"
      titulo="No pudimos verificar el pago"
      descripcion="Ocurrió un problema al consultar el estado del pago. Por favor inténtalo de nuevo."
    >
      <p className="mt-4 text-xs text-gray-400">{mensaje}</p>
      <div className="mt-6">
        <BotonSeguirComprando />
      </div>
    </MarcoResultado>
  );
}

// ---------------------------------------------------------------------------
// Página de retorno — SERVER COMPONENT.
// ---------------------------------------------------------------------------

interface ParamsResultadoPago {
  payment_id?: string | string[];
  status?: string | string[];
  external_reference?: string | string[];
  preference_id?: string | string[];
}

export default async function PaginaResultadoPago({
  searchParams,
}: {
  searchParams: Promise<ParamsResultadoPago>;
}) {
  const sp = await searchParams;
  const paymentId = primerValor(sp.payment_id);
  const pedidoId = primerValor(sp.external_reference);

  // Verificación server-side contra la API de Mercado Pago (nunca solo la URL).
  let resultado: ResultadoPagoRetorno;
  try {
    resultado = await verificarPagoYActualizar({ paymentId, pedidoId });
  } catch (e) {
    resultado = {
      ok: false,
      error: e instanceof Error ? e.message : "Error al verificar el pago.",
    };
  }

  if (!resultado.ok) {
    return PantallaError(resultado.error);
  }

  switch (resultado.resultado) {
    case "aprobado":
      return PantallaAprobado(resultado.numeroPedido, resultado.paymentId);
    case "pendiente":
      return PantallaPendiente(resultado.numeroPedido);
    case "rechazado":
    case "invalido":
      return PantallaNoAprobado(resultado.numeroPedido);
  }
}
