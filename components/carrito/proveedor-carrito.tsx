"use client";

/**
 * ⚠️ CARRITO DE PRESENTACIÓN — TEMPORAL
 *
 * Contexto mínimo en memoria que alimenta el contador/total del Header y el
 * feedback "¡Agregado!" de las tarjetas de producto, replicando el
 * comportamiento visible del diseño de referencia.
 *
 * NO es la lógica de carrito definitiva: no persiste (localStorage), no tiene
 * página de gestión completa ni reglas de negocio. La FASE 4 (Carrito) la
 * reemplazará por la implementación real con persistencia.
 */

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { ItemCarrito } from "@/types/producto";

interface CarritoContextoValor {
  items: ItemCarrito[];
  agregar: (item: ItemCarrito) => void;
  cantidadTotal: number;
  total: number;
}

const CarritoContexto = createContext<CarritoContextoValor | null>(null);

export function ProveedorCarrito({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);

  const agregar = useCallback((item: ItemCarrito) => {
    setItems(prev => {
      const existente = prev.find(
        i => i.productoId === item.productoId && i.varianteId === item.varianteId
      );
      if (existente) {
        return prev.map(i =>
          i === existente ? { ...i, cantidad: i.cantidad + item.cantidad } : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const valor = useMemo<CarritoContextoValor>(() => {
    const cantidadTotal = items.reduce((acc, i) => acc + i.cantidad, 0);
    const total = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
    return { items, agregar, cantidadTotal, total };
  }, [items, agregar]);

  return <CarritoContexto.Provider value={valor}>{children}</CarritoContexto.Provider>;
}

export function useCarrito(): CarritoContextoValor {
  const ctx = useContext(CarritoContexto);
  if (!ctx) {
    throw new Error("useCarrito debe usarse dentro de <ProveedorCarrito>.");
  }
  return ctx;
}
