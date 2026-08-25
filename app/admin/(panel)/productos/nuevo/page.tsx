import { obtenerClienteServicioSupabase } from "@/lib/supabase/servidor";
import FormularioProducto from "./formulario";

export default async function PaginaNuevoProducto() {
  const supabase = obtenerClienteServicioSupabase();

  const [categoriasResult, marcasResult] = await Promise.all([
    supabase
      .from("categorias")
      .select("id, nombre, slug")
      .eq("activo", true)
      .order("orden", { ascending: true }),
    supabase
      .from("marcas")
      .select("id, nombre")
      .eq("activo", true)
      .order("nombre", { ascending: true }),
  ]);

  const categorias = (categoriasResult.data ?? []) as {
    id: string;
    nombre: string;
    slug: string;
  }[];

  const marcas = (marcasResult.data ?? []) as { id: string; nombre: string }[];

  return (
    <section className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-black text-dark">
          Nuevo producto
        </h1>
        <p className="mt-1 text-muted">
          Completa los campos para agregar un producto al catálogo.
        </p>
      </header>

      <FormularioProducto categorias={categorias} marcas={marcas} />
    </section>
  );
}
