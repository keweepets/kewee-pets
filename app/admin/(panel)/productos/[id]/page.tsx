import { notFound } from "next/navigation";

import { obtenerClienteServicioSupabase } from "@/lib/supabase/servidor";
import type {
  MarcaRow,
  CategoriaRow,
  VarianteRow,
  ImagenProductoRow,
} from "@/lib/supabase/tipos-db";
import FormularioEditarProducto from "./formulario";
import GestionStock from "../gestion-stock";

interface Params {
  id: string;
}

export default async function PaginaEditarProducto({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const supabase = obtenerClienteServicioSupabase();

  const [productoResult, categoriasResult, marcasResult, imagenesResult] = await Promise.all([
    supabase
      .from("productos")
      .select(
        `
        *,
        variantes_producto(*)
      `
      )
      .eq("id", id)
      .maybeSingle(),
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
    supabase
      .from("imagenes_producto")
      .select("id, url, alt, orden, activo")
      .eq("producto_id", id)
      .eq("activo", true)
      .order("orden", { ascending: true }),
  ]);

  if (productoResult.error) {
    throw new Error(
      `[admin-productos-editar] Error al consultar producto: ${productoResult.error.message}`
    );
  }

  if (!productoResult.data) {
    notFound();
  }

  const producto = productoResult.data;
  const variantes = (
    (producto.variantes_producto as VarianteRow[]) ?? []
  ).sort((a, b) => a.orden - b.orden);

  const variantesStock = variantes.map((v) => ({
    id: v.id,
    nombre: v.nombre,
    stock: v.stock,
  }));

  const categorias = (categoriasResult.data ?? []) as Pick<
    CategoriaRow,
    "id" | "nombre" | "slug"
  >[];

  const marcas = (marcasResult.data ?? []) as Pick<MarcaRow, "id" | "nombre">[];

  const imagenes = ((imagenesResult.data ?? []) as Pick<ImagenProductoRow, "id" | "url" | "alt" | "orden" | "activo">[])
    .sort((a, b) => a.orden - b.orden);

  return (
    <section className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-black text-dark">
          Editar producto
        </h1>
        <p className="mt-1 text-muted">
          Editando: <strong>{producto.nombre}</strong>
        </p>
      </header>

      <FormularioEditarProducto
        productoId={producto.id}
        nombre={producto.nombre}
        slug={producto.slug}
        categoriaId={producto.categoria_id}
        marcaId={producto.marca_id}
        descripcion={producto.descripcion}
        descripcionCorta={producto.descripcion_corta}
        esDestacado={producto.es_destacado}
        esMasVendido={producto.es_mas_vendido}
        esPrueba={producto.es_prueba}
        activo={producto.activo}
        variantes={variantes}
        imagenes={imagenes}
        categorias={categorias}
        marcas={marcas}
      />

      <GestionStock variantes={variantesStock} />
    </section>
  );
}
