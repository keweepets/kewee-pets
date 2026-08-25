import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DetalleProducto from "@/components/productos/detalle-producto";
import { obtenerProductoPorSlug } from "@/lib/catalogo/consultas";

export const dynamic = "force-dynamic";

interface PropsPagina {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PropsPagina): Promise<Metadata> {
  const { slug } = await params;
  try {
    const producto = await obtenerProductoPorSlug(slug);
    if (!producto) {
      return { title: "Producto no encontrado" };
    }
    return {
      title: producto.nombre,
      description: producto.descripcionCorta || undefined,
    };
  } catch (error) {
    console.error("[producto] Error generando metadata:", error);
    return { title: "Producto" };
  }
}

export default async function ProductoPage({ params }: PropsPagina) {
  const { slug } = await params;

  let producto = null;
  try {
    producto = await obtenerProductoPorSlug(slug);
  } catch (error) {
    console.error("[producto] Error consultando Supabase:", error);
    return (
      <div className="px-6 py-24 text-center bg-green-50">
        <span className="text-5xl" aria-hidden="true">
          ⚠️
        </span>
        <h1 className="mt-4 text-2xl font-black text-dark font-display">
          No pudimos cargar este producto
        </h1>
        <p className="mt-2 max-w-md mx-auto text-muted">
          Ocurrió un problema al consultar la información. Por favor intenta de
          nuevo en unos minutos.
        </p>
      </div>
    );
  }

  if (!producto) {
    notFound();
  }

  return <DetalleProducto producto={producto} />;
}
