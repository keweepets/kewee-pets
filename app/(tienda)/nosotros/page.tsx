import type { Metadata } from "next";
import PaginaEnConstruccion from "@/components/layout/pagina-en-construccion";

export const metadata: Metadata = {
  title: "Nosotros",
};

export default function NosotrosPage() {
  return (
    <PaginaEnConstruccion
      titulo="Sobre Kewee Mascotas"
      descripcion="La página completa de Nosotros se portará del diseño en una próxima fase."
    />
  );
}
