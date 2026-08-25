import type { Metadata } from "next";
import PaginaEnConstruccion from "@/components/layout/pagina-en-construccion";

export const metadata: Metadata = {
  title: "Contacto",
};

export default function ContactoPage() {
  return (
    <PaginaEnConstruccion
      titulo="Contacto"
      descripcion="La página de contacto se portará del diseño en una próxima fase. Mientras tanto, escríbenos por WhatsApp."
    />
  );
}
