import CarruselFavoritos from "@/components/home/carrusel-favoritos";
import Categorias from "@/components/home/categorias";
import CtaFinal from "@/components/home/cta-final";
import GridDestacados from "@/components/home/grid-destacados";
import HeroSlider from "@/components/home/hero-slider";
import Marcas from "@/components/home/marcas";
import SeccionNosotros from "@/components/home/seccion-nosotros";
import SeccionPerrosGatos from "@/components/home/seccion-perros-gatos";
import { marcas } from "@/data/presentacion";
import { listarProductos } from "@/lib/catalogo/consultas";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Productos reales de Supabase (UUID) para que las variantes agregadas al
  // carrito sean compatibles con crearPedido(). Se conservan los flags de
  // mapeo para replicar las secciones favoritos/destacados del diseño.
  const { productos } = await listarProductos({ limite: 100 });
  const masVendidos = productos.filter(p => p.masVendido);
  const destacados = productos.filter(p => p.destacado);

  return (
    <div>
      <HeroSlider />
      <Categorias />
      <SeccionPerrosGatos />
      <CarruselFavoritos productos={masVendidos} />
      {/* Banner "20% OFF" neutralizado: es copia estática sin promoción real en
          Supabase. Se reintegrará dinámicamente cuando existan promociones reales. */}
      <SeccionNosotros />
      <GridDestacados productos={destacados} />
      <Marcas marcas={marcas} />
      <CtaFinal />
    </div>
  );
}
