import type { Metadata } from "next";
import PaginaEnConstruccion from "@/components/layout/pagina-en-construccion";

export const metadata: Metadata = {
  title: "Administración",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <PaginaEnConstruccion
      titulo="Panel de administración"
      descripcion="El panel administrativo con Supabase Auth se construirá en la FASE 8."
    />
  );
}
