-- ============================================================================
-- KEWEE MASCOTAS · MIGRACIÓN 0003 — Seeds iniciales
-- FASE 3 · Aprobado:
--   · ÚNICAMENTE las categorías raíz comerciales.
--   · NO se inventan marcas (se crearán con los productos reales).
-- ============================================================================

insert into public.categorias (nombre, slug, orden) values
  ('Perros',     'perros',     1),
  ('Gatos',      'gatos',      2),
  ('Accesorios', 'accesorios', 3)
on conflict (slug) do nothing;

-- Sin seeds de marcas ni productos por decisión del cliente:
-- el catálogo real se cargará vía backend/admin en fases posteriores.
