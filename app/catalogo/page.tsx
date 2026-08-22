import type { Metadata } from "next";
import PaginaEnConstruccion from "@/components/layout/pagina-en-construccion";

export const metadata: Metadata = {
  title: "Catálogo",
};

export default function CatalogoPage() {
  return (
    <PaginaEnConstruccion
      titulo="Catálogo"
      descripcion="El catálogo completo de productos se construirá en la FASE 3, conectado a Supabase."
    />
  );
}
