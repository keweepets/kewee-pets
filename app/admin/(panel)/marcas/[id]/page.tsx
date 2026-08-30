import { notFound } from "next/navigation";

import { obtenerClienteServicioSupabase } from "@/lib/supabase/servidor";
import type { MarcaRow } from "@/lib/supabase/tipos-db";
import FormularioEditarMarca from "./formulario-editar";

export default async function PaginaEditarMarca({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = obtenerClienteServicioSupabase();

  const { data, error } = await supabase
    .from("marcas")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`[admin-marcas-editar] Error al consultar marca: ${error.message}`);
  }

  if (!data) {
    notFound();
  }

  const marca = data as MarcaRow;

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-6">
      <FormularioEditarMarca marca={marca} />
    </section>
  );
}
