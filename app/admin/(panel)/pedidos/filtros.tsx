"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import Boton from "@/components/ui/boton";
import {
  ESTADOS_ORDEN,
  ESTADOS_PAGO,
  ETIQUETAS_ESTADO,
  ETIQUETAS_ESTADO_PAGO,
  METODOS_PAGO,
  ETIQUETAS_METODO_PAGO,
} from "@/lib/pedidos/presentacion";

interface Conteos {
  [estado: string]: number;
}

export default function FiltrosPedidos({ conteos }: { conteos: Conteos }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [desde, setDesde] = useState(searchParams.get("desde") ?? "");
  const [hasta, setHasta] = useState(searchParams.get("hasta") ?? "");
  const [metodoPago, setMetodoPago] = useState(
    searchParams.get("metodoPago") ?? ""
  );

  function irConParametros(cambios: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(cambios).forEach(([clave, valor]) => {
      if (valor) params.set(clave, valor);
      else params.delete(clave);
    });
    router.push(`${pathname}?${params.toString()}`);
  }

  function manejarBusqueda(e: React.FormEvent) {
    e.preventDefault();
    irConParametros({ q, desde, hasta, metodoPago });
  }

  const estadoActivo = searchParams.get("estado");
  const estadoPagoActivo = searchParams.get("estadoPago");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <a
          href={`${pathname}?estado=`}
          onClick={(e) => {
            e.preventDefault();
            irConParametros({ estado: "" });
          }}
          className={
            "rounded-full px-4 py-1.5 text-sm font-bold " +
            (!estadoActivo
              ? "bg-green-500 text-white"
              : "border border-gray-200 bg-white text-dark hover:bg-gray-50")
          }
        >
          Todos ({conteos.total})
        </a>
        {ESTADOS_ORDEN.map((estado) => (
          <a
            key={estado}
            href={`${pathname}?estado=${estado}`}
            onClick={(e) => {
              e.preventDefault();
              irConParametros({ estado });
            }}
            className={
              "rounded-full px-4 py-1.5 text-sm font-bold " +
              (estadoActivo === estado
                ? "bg-green-500 text-white"
                : "border border-gray-200 bg-white text-dark hover:bg-gray-50")
            }
          >
            {ETIQUETAS_ESTADO[estado]} ({conteos[estado] ?? 0})
          </a>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={`${pathname}?estadoPago=`}
          onClick={(e) => {
            e.preventDefault();
            irConParametros({ estadoPago: "" });
          }}
          className={
            "rounded-full px-4 py-1.5 text-sm font-bold " +
            (!estadoPagoActivo
              ? "bg-green-500 text-white"
              : "border border-gray-200 bg-white text-dark hover:bg-gray-50")
          }
        >
          Todos los pagos
        </a>
        {ESTADOS_PAGO.map((pago) => (
          <a
            key={pago}
            href={`${pathname}?estadoPago=${pago}`}
            onClick={(e) => {
              e.preventDefault();
              irConParametros({ estadoPago: pago });
            }}
            className={
              "rounded-full px-4 py-1.5 text-sm font-bold " +
              (estadoPagoActivo === pago
                ? "bg-green-500 text-white"
                : "border border-gray-200 bg-white text-dark hover:bg-gray-50")
            }
          >
            {ETIQUETAS_ESTADO_PAGO[pago]}
          </a>
        ))}
      </div>

      <form
        onSubmit={manejarBusqueda}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-gray-100 bg-white p-4"
      >
        <label className="flex flex-1 basis-64 flex-col gap-1.5">
          <span className="text-sm font-semibold text-dark">
            N° pedido, cliente, teléfono o email
          </span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ej: KP-000011, María, 300, correo@ejemplo.com"
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-green-400 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-dark">Desde</span>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-green-400 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-dark">Hasta</span>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-green-400 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-dark">Método de pago</span>
          <select
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
            className="rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-green-400 focus:outline-none"
          >
            <option value="">Todos</option>
            {METODOS_PAGO.map((m) => (
              <option key={m} value={m}>
                {ETIQUETAS_METODO_PAGO[m]}
              </option>
            ))}
          </select>
        </label>
        <Boton type="submit" variante="contorno" tamano="sm" radio="xl">
          Filtrar
        </Boton>
        {(q || desde || hasta || estadoActivo || estadoPagoActivo || metodoPago) && (
          <a
            href={pathname}
            onClick={(e) => {
              e.preventDefault();
              router.push(pathname);
            }}
            className="text-sm font-semibold text-muted underline"
          >
            Limpiar
          </a>
        )}
      </form>
    </div>
  );
}
