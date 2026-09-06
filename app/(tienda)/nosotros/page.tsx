import type { Metadata } from "next";
import PaginaEnConstruccion from "@/components/layout/pagina-en-construccion";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Conoce a Kewee Mascotas: tienda virtual colombiana de productos para mascotas con amor desde Medellín. Alimentos premium, juguetes y accesorios.",
};

export default function NosotrosPage() {
  return (
    <PaginaEnConstruccion
      titulo="Sobre Kewee Mascotas"
      descripcion="La página completa de Nosotros se portará del diseño en una próxima fase."
    />
  );
}
