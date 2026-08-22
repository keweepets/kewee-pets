import type { Metadata } from "next";
import PaginaEnConstruccion from "@/components/layout/pagina-en-construccion";

export const metadata: Metadata = {
  title: "Producto",
};

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <PaginaEnConstruccion
      titulo="Detalle de producto"
      descripcion={`La página del producto "${slug}" se construirá en la FASE 3 con datos reales de Supabase.`}
    />
  );
}
