import type { Metadata } from "next";
import PaginaEnConstruccion from "@/components/layout/pagina-en-construccion";

export const metadata: Metadata = {
  title: "Carrito",
};

export default function CarritoPage() {
  return (
    <PaginaEnConstruccion
      titulo="Carrito de compras"
      descripcion="La gestión completa del carrito llegará en la FASE 4."
    />
  );
}
