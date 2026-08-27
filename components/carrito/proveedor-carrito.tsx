"use client";

/**
 * CARITO — Contexto con persistencia en localStorage.
 *
 * Expone items, agregar, setCantidad, eliminar, vaciar, cantidadTotal y total.
 *
 * · Persistencia robusta vía `useSyncExternalStore`: lee/escribe localStorage
 *   de forma sincronizada con React y tolera StrictMode y recargas de página.
 * · La hidratación no rompe el SSR/hydration: `getServerSnapshot` devuelve []
 *   (coincide con el HTML del servidor) y `getSnapshot` los ítems reales del
 *   cliente; React reconcilia sin mismatch.
 * · La cantidad por ítem se mantiene en [1, stock]. Si el stock no está
 *   disponible no se limita artificialmente a 1.
 * · La clave única de cada ítem es su `varianteId`.
 */

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { ItemCarrito } from "@/types/producto";

const CLAVE_STORAGE = "kewee-carrito";

interface CarritoContextoValor {
  items: ItemCarrito[];
  agregar: (item: ItemCarrito) => void;
  setCantidad: (varianteId: string, cantidad: number) => void;
  eliminar: (varianteId: string) => void;
  vaciar: () => void;
  cantidadTotal: number;
  total: number;
}

// ---------------------------------------------------------------------------
// Store externo (módulo) respaldado por localStorage
// ---------------------------------------------------------------------------

let itemsAlmacen: ItemCarrito[] = leerDeStorage();
const listeners = new Set<() => void>();

function notificar(): void {
  for (const l of listeners) l();
}

/**
 * Acota la cantidad a un mínimo de 1 y, cuando hay stock conocido (> 0), a no
 * superarlo. Si el stock no está disponible (0 o negativo) NO aplica techo
 * superior, para no limitar injustamente a 1 los ítems sin dato de stock.
 */
function acotarCantidad(cantidad: number, stock: number): number {
  if (!Number.isInteger(cantidad) || cantidad < 1) return 1;
  if (stock > 0) return Math.min(cantidad, stock);
  return cantidad;
}

/**
 * Agrupa los ítems por variante (clave única del carrito) sumando cantidades.
 * Previene ids duplicados que pudieran quedar de versiones previas guardadas
 * en localStorage.
 */
function deduplicar(items: ItemCarrito[]): ItemCarrito[] {
  const porVariante = new Map<string, ItemCarrito>();
  for (const item of items) {
    const existente = porVariante.get(item.varianteId);
    if (!existente) {
      porVariante.set(item.varianteId, { ...item });
      continue;
    }
    const stock = existente.stock ?? item.stock ?? 0;
    porVariante.set(item.varianteId, {
      ...existente,
      cantidad: acotarCantidad(existente.cantidad + item.cantidad, stock),
      stock,
    });
  }
  return [...porVariante.values()];
}

function leerDeStorage(): ItemCarrito[] {
  if (typeof window === "undefined") return [];
  try {
    const crudo = window.localStorage.getItem(CLAVE_STORAGE);
    if (!crudo) return [];
    const parseado = JSON.parse(crudo);
    if (!Array.isArray(parseado)) return [];
    return deduplicar(parseado as ItemCarrito[]);
  } catch {
    return [];
  }
}

/** Guarda en localStorage y notifica a los suscriptores del store. */
function persistir(nuevosItems: ItemCarrito[]): void {
  itemsAlmacen = nuevosItems;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CLAVE_STORAGE, JSON.stringify(nuevosItems));
    } catch {
      // Persistencia best-effort: no romper la sesión si storage falla.
    }
  }
  notificar();
}

function suscribirse(callback: () => void): () => void {
  listeners.add(callback);
  const escucharStorage = (e: StorageEvent) => {
    if (e.key === CLAVE_STORAGE) {
      itemsAlmacen = leerDeStorage();
      callback();
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", escucharStorage);
  }
  return () => {
    listeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", escucharStorage);
    }
  };
}

/** Lectura en el cliente: los ítems persistidos. */
function obtenerSnapshot(): ItemCarrito[] {
  return itemsAlmacen;
}

/** Lectura en el servidor/SSR: siempre vacío para no romper la hidratación.
 *  Devuelve una referencia estable y cacheada para evitar loops en React. */
const VACIO_ESTABLE: ItemCarrito[] = [];

function obtenerSnapshotServidor(): ItemCarrito[] {
  return VACIO_ESTABLE;
}

// ---------------------------------------------------------------------------
// Contexto / Proveedor / hook
// ---------------------------------------------------------------------------

const CarritoContexto = createContext<CarritoContextoValor | null>(null);

export function ProveedorCarrito({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    suscribirse,
    obtenerSnapshot,
    obtenerSnapshotServidor
  );

  const agregar = useCallback((item: ItemCarrito) => {
    persistir(deduplicar([...itemsAlmacen, item]));
  }, []);

  const setCantidad = useCallback((varianteId: string, cantidad: number) => {
    persistir(
      itemsAlmacen.map(i =>
        i.varianteId === varianteId
          ? { ...i, cantidad: acotarCantidad(cantidad, i.stock ?? 0) }
          : i
      )
    );
  }, []);

  const eliminar = useCallback((varianteId: string) => {
    persistir(itemsAlmacen.filter(i => i.varianteId !== varianteId));
  }, []);

  const vaciar = useCallback(() => {
    persistir([]);
  }, []);

  const cantidadTotal = items.reduce((acc, i) => acc + i.cantidad, 0);
  const total = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  const valor: CarritoContextoValor = {
    items,
    agregar,
    setCantidad,
    eliminar,
    vaciar,
    cantidadTotal,
    total,
  };

  return (
    <CarritoContexto.Provider value={valor}>{children}</CarritoContexto.Provider>
  );
}

export function useCarrito(): CarritoContextoValor {
  const ctx = useContext(CarritoContexto);
  if (!ctx) {
    throw new Error("useCarrito debe usarse dentro de <ProveedorCarrito>.");
  }
  return ctx;
}
