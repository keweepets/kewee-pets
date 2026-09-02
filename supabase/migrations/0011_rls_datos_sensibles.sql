-- ============================================================================
-- KEWEE MASCOTAS · MIGRACIÓN 0011 — RLS para datos sensibles (C2 / FASE 9)
--
-- Objetivo: los clientes NO están autenticados; el rol anon no debe leer ni
-- escribir datos de clientes, pedidos, detalles de pedido ni notas internas.
--
-- Diseño: habilitar RLS SIN crear políticas de permiso. En RLS la ausencia de
-- política = denegar todo (fail-closed) para cualquier rol que no sea el dueño
-- o bypass de RLS. La service role OMITE RLS, por lo que las Server Actions /
-- Route Handlers del servidor (que usan obtenerClienteServicioSupabase)
-- continúan funcionando sin cambios.
--
-- `nota_interna` es una COLUMNA de public.pedidos (migración 0010): queda
-- protegida automáticamente al habilitar RLS en pedidos.
-- ============================================================================

-- 1) Habilitar RLS (sin políticas → todo denegado para anon/authenticated)
alter table public.clientes         enable row level security;
alter table public.pedidos          enable row level security;
alter table public.detalles_pedido  enable row level security;

-- 2) Defensa en profundidad: revocar privilegios de las tablas a los roles
--    de cliente. Las operaciones del servidor usan la service role (omite
--    RLS y no se ve afectada por este revoke).
revoke all on public.clientes        from anon, authenticated;
revoke all on public.pedidos         from anon, authenticated;
revoke all on public.detalles_pedido from anon, authenticated;
