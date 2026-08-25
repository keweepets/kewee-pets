-- ============================================================================
-- KEWEE MASCOTAS · MIGRACIÓN 0006 — Storage bucket para imágenes de producto
-- FASE 6B · Alcance reducido: bucket + políticas Storage
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Bucket "productos" (público, 5 MB, JPEG/PNG/WebP)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'productos',
  'productos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ----------------------------------------------------------------------------
-- 2. Políticas de Storage
-- ----------------------------------------------------------------------------

-- Lectura pública: cualquiera puede ver imágenes del bucket productos
create policy "lectura_publica_imagenes_productos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'productos');

-- Escritura admin: solo service_role puede subir (INSERT)
-- Las Server Actions usan service_role que bypassa RLS, pero esta política
-- da explícitamente permiso por seguridad en profundidad.
create policy "admin_subir_imagenes_productos"
  on storage.objects for insert
  to service_role
  with check (bucket_id = 'productos');

-- Eliminación admin: solo service_role puede eliminar (DELETE)
create policy "admin_eliminar_imagenes_productos"
  on storage.objects for delete
  to service_role
  using (bucket_id = 'productos');
