-- ============================================================================
-- KEWEE MASCOTAS · MIGRACIÓN 0002 — Políticas RLS iniciales
-- FASE 3 · Diseño aprobado:
--   · Lectura pública SOLO de registros activos.
--   · Promociones legibles solo si activas Y vigentes.
--   · Escritura reservada al backend con SUPABASE_SERVICE_ROLE_KEY
--     (la service role OMITE RLS; no se crean políticas INSERT/UPDATE/DELETE).
--
-- Nota FASE 8 (panel admin): cuando exista Supabase Auth de administradores,
-- se añadirán políticas específicas para roles admin (lectura de inactivos,
-- escrituras desde cliente autenticado) sin tocar estas políticas públicas.
-- ============================================================================

alter table public.marcas             enable row level security;
alter table public.categorias         enable row level security;
alter table public.productos          enable row level security;
alter table public.variantes_producto enable row level security;
alter table public.imagenes_producto  enable row level security;
alter table public.promociones        enable row level security;

-- ----------------------------------------------------------------------------
-- Lectura pública (anon y authenticated) — únicamente activos
-- ----------------------------------------------------------------------------
create policy "lectura_publica_marcas_activas"
  on public.marcas for select
  to anon, authenticated
  using (activo);

create policy "lectura_publica_categorias_activas"
  on public.categorias for select
  to anon, authenticated
  using (activo);

create policy "lectura_publica_productos_activos"
  on public.productos for select
  to anon, authenticated
  using (activo);

create policy "lectura_publica_variantes_activas"
  on public.variantes_producto for select
  to anon, authenticated
  using (activo);

create policy "lectura_publica_imagenes_activas"
  on public.imagenes_producto for select
  to anon, authenticated
  using (activo);

-- ----------------------------------------------------------------------------
-- Promociones: visibles solo si activas y dentro del periodo de vigencia
-- ----------------------------------------------------------------------------
create policy "lectura_publica_promociones_vigentes"
  on public.promociones for select
  to anon, authenticated
  using (
    activo
    and now() >= fecha_inicio
    and now() <= fecha_fin
  );

-- ----------------------------------------------------------------------------
-- Escrituras: SIN políticas para anon/authenticated → denegadas por defecto.
-- El backend (Server Actions / Route Handlers con service_role_key) gestiona
-- toda escritura: alta/edición de productos, variantes, imágenes, promociones.
-- ----------------------------------------------------------------------------
