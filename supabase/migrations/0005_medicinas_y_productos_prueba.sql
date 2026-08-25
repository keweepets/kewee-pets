-- ============================================================================
-- KEWEE MASCOTAS · MIGRACIÓN 0005 — Categoría Medicinas y exclusión de prueba
-- FASE 6B · Diseño técnico aprobado.
--
-- Cambios:
--   1. Nueva categoría raíz "Medicinas" (orden 4).
--   2. Política RLS de productos: agregar filtro es_prueba = false.
--
-- Notas:
--   · Seeds usa ON CONFLICT para ser idempotente.
--   · La política se reemplaza (DROP + CREATE) para mantener el mismo nombre.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Categoría "Medicinas"
-- ----------------------------------------------------------------------------
insert into public.categorias (nombre, slug, orden)
values ('Medicinas', 'medicinas', 4)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- 2. RLS productos: excluir productos de prueba de la tienda pública
-- ----------------------------------------------------------------------------
drop policy if exists "lectura_publica_productos_activos" on public.productos;

create policy "lectura_publica_productos_activos"
  on public.productos for select
  to anon, authenticated
  using (activo and not es_prueba);
