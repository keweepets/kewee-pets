import { notFound } from "next/navigation";

import { obtenerClienteServicioSupabase } from "@/lib/supabase/servidor";
import type { PromocionRow } from "@/lib/supabase/tipos-db";
import FormularioEditarPromocion from "./formulario-editar";

export default async function PaginaEditarPromocion({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = obtenerClienteServicioSupabase();

  const [promoResult, categoriasResult, marcasResult, productosResult, variantesResult] =
    await Promise.all([
      supabase.from("promociones").select("*").eq("id", id).maybeSingle(),
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
        .select("id, nombre")
        .eq("activo", true)
        .order("orden", { ascending: true }),
    ]);

  if (promoResult.error) {
    throw new Error(
      `[admin-promociones-editar] Error al consultar promoción: ${promoResult.error.message}`,
    );
  }

  if (!promoResult.data) {
    notFound();
  }

  const promo = promoResult.data as PromocionRow;

  const objetivoIdActual =
    promo.alcance === "categoria"
      ? promo.categoria_id
      : promo.alcance === "marca"
        ? promo.marca_id
        : promo.alcance === "producto"
          ? promo.producto_id
          : promo.variante_id;

  return (
    <FormularioEditarPromocion
      promo={promo}
      objetivoIdActual={objetivoIdActual}
      categorias={(categoriasResult.data ?? []) as { id: string; nombre: string }[]}
      marcas={(marcasResult.data ?? []) as { id: string; nombre: string }[]}
      productos={(productosResult.data ?? []) as { id: string; nombre: string }[]}
      variantes={(variantesResult.data ?? []) as { id: string; nombre: string }[]}
    />
  );
}
