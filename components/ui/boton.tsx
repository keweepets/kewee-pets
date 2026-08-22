import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variante = "primario" | "contorno" | "fantasma";
type Tamano = "sm" | "md" | "lg";
type Radio = "completo" | "xl" | "2xl";

export interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamano?: Tamano;
  /** Radio de borde según el patrón de Figma: pills (hero) usan "completo", formularios/cards "2xl", admin "xl". */
  radio?: Radio;
}

const variantes: Record<Variante, string> = {
  primario:
    "bg-green-500 text-white hover:bg-green-600 shadow-sm hover:shadow-md",
  contorno: "border-2 border-green-500 text-green-600 hover:bg-green-50",
  fantasma: "text-dark hover:bg-gray-100",
};

const tamanos: Record<Tamano, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-2.5 text-base",
  lg: "px-8 py-3.5 text-base",
};

const radios: Record<Radio, string> = {
  completo: "rounded-full",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
};

export default function Boton({
  variante = "primario",
  tamano = "md",
  radio = "2xl",
  className,
  type = "button",
  ...props
}: BotonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-bold transition-all duration-200 active:scale-95 disabled:pointer-events-none disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none",
        variantes[variante],
        tamanos[tamano],
        radios[radio],
        className
      )}
      {...props}
    />
  );
}

export type { Variante as VarianteBoton, Tamano as TamanoBoton };
