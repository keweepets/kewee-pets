import type { MetadataRoute } from "next";
import { obtenerClienteSupabase } from "@/lib/supabase/cliente";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ahora = new Date();

  const estaticas: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: ahora, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/catalogo`, lastModified: ahora, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/nosotros`, lastModified: ahora, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contacto`, lastModified: ahora, changeFrequency: "monthly", priority: 0.5 },
  ];

  let productos: MetadataRoute.Sitemap = [];
  try {
    const supabase = obtenerClienteSupabase();
    const { data } = await supabase
      .from("productos")
      .select("slug, updated_at")
      .eq("activo", true)
      .eq("es_prueba", false);

    if (data) {
      productos = data.map((p) => ({
        url: `${baseUrl}/producto/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : ahora,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    }
  } catch {
    // Si Supabase no está disponible, devolver solo las rutas estáticas.
  }

  return [...estaticas, ...productos];
}
