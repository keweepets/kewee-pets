import CarruselFavoritos from "@/components/home/carrusel-favoritos";
import Categorias from "@/components/home/categorias";
import CtaFinal from "@/components/home/cta-final";
import GridDestacados from "@/components/home/grid-destacados";
import HeroSlider from "@/components/home/hero-slider";
import Marcas from "@/components/home/marcas";
import SeccionNosotros from "@/components/home/seccion-nosotros";
import SeccionPerrosGatos from "@/components/home/seccion-perros-gatos";
import { marcas, productosPresentacion } from "@/data/presentacion";

export default function Home() {
  const masVendidos = productosPresentacion.filter(p => p.masVendido);
  const destacados = productosPresentacion.filter(p => p.destacado);

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
