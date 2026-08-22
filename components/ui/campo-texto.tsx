import { useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CampoTextoProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /** Mensaje de ayuda opcional bajo el campo. */
  ayuda?: string;
}

export default function CampoTexto({
  label,
  error,
  ayuda,
  className,
  id,
  ...props
}: CampoTextoProps) {
  const idGenerado = useId();
  const idCampo = id ?? idGenerado;

  return (
    <div>
      {label && (
        <label htmlFor={idCampo} className="mb-1.5 block text-sm font-semibold text-dark">
          {label}
        </label>
      )}
      <input
        id={idCampo}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${idCampo}-error` : ayuda ? `${idCampo}-ayuda` : undefined}
        className={cn(
          "w-full rounded-xl border-2 px-4 py-2.5 text-sm transition-colors focus:outline-none",
          error
            ? "border-red-300 focus:border-red-400"
            : "border-gray-200 focus:border-green-400",
          className
        )}
        {...props}
      />
      {error && (
        <p id={`${idCampo}-error`} role="alert" className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
      {!error && ayuda && (
        <p id={`${idCampo}-ayuda`} className="mt-1 text-xs text-gray-400">
          {ayuda}
        </p>
      )}
    </div>
  );
}
