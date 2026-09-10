-- ============================================================================
-- KEWEE MASCOTAS · MIGRACIÓN 0014 — Permisos de ejecución de RPC admin
-- FASE 9 · Bloque E · Optimización (Ciclo 2.2)
--
-- Restringe EXECUTE de las RPC administrativas al rol service_role (el único
-- que las consume: el servidor Next.js usa SUPABASE_SERVICE_ROLE_KEY para
-- todas las operaciones del panel admin), retirando el EXECUTE a PUBLIC
-- (por defecto PostgreSQL lo otorga al crear la función).
--
-- · No cambia SECURITY INVOKER (se mantiene el default de las funciones).
-- · No modifica RLS ni otros permisos de tablas.
-- ============================================================================

revoke execute on function public.top_productos_mas_vendidos(p_limite int)
  from public;

grant execute on function public.top_productos_mas_vendidos(p_limite int)
  to service_role;

revoke execute on function public.productos_admin_paginados(
  p_busqueda text, p_pagina int, p_por_pagina int
) from public;

grant execute on function public.productos_admin_paginados(
  p_busqueda text, p_pagina int, p_por_pagina int
) to service_role;