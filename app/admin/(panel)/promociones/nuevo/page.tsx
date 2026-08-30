import { obtenerClienteServicioSupabase } from "@/lib/supabase/servidor";
import FormularioPromocion from "./formulario";

export default async function PaginaNuevaPromocion() {
  const supabase = obtenerClienteServicioSupabase();

  const [categoriasResult, marcasResult, productosResult, variantesResult] =
    await Promise.all([
      supabase
        .from("categorias")
        .select("id, nombre")
        .eq("activo", true)
        .order("nombre", { ascending: true }),
      supabase
        .from("marcas")
        .select("id, nombre")
        .eq("activo", true)
        .order("nombre", { ascending: true }),
      supabase
        .from("productos")
        .select("id, nombre")
        .eq("activo", true)
        .order("nombre", { ascending: true }),
      supabase
        .from("variantes_producto")
        .select("id, nombre, producto_id")
        .eq("activo", true)
        .order("orden", { ascending: true }),
    ]);

  const categorias = (categoriasResult.data ?? []) as { id: string; nombre: string }[];
  const marcas = (marcasResult.data ?? []) as { id: string; nombre: string }[];
  const productos = (productosResult.data ?? []) as { id: string; nombre: string }[];
  const variantes = (
    (variantesResult.data ?? []) as {
      id: string;
      nombre: string;
      producto_id: string;
    }[]
  ).map((v) => ({ id: v.id, nombre: v.nombre }));

  return (
    <section className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-black text-dark">
          Nueva promoción
        </h1>
        <p className="mt-1 text-muted">
          Define un descuento u oferta aplicable al catálogo.
        </p>
      </header>

      <FormularioPromocion
        categorias={categorias}
        marcas={marcas}
        productos={productos}
        variantes={variantes}
      />
    </section>
  );
}
