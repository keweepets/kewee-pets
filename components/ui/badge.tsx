import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tono =
  | "verde" // Más vendido
  | "verdeSuave"
  | "naranja" // Oferta
  | "azul" // Nuevo
  | "rojo" // Descuento -%
  | "ambar" // Últimas unidades / pendiente
  | "gris"; // Inactivo / neutral

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tono?: Tono;
}

const tonos: Record<Tono, string> = {
  verde: "bg-green-500 text-white",
  verdeSuave: "bg-green-100 text-green-700",
  naranja: "bg-orange-500 text-white",
  azul: "bg-blue-100 text-blue-700",
  rojo: "bg-red-100 text-red-600",
  ambar: "bg-amber-100 text-amber-700",
  gris: "bg-gray-100 text-gray-500",
};

export default function Badge({ tono = "gris", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold",
        tonos[tono],
        className
      )}
      {...props}
    />
  );
}
