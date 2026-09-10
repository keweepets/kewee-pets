-- ============================================================================
-- KEWEE MASCOTAS · MIGRACIÓN 0012 — RPC Top productos más vendidos
-- FASE 9 · Bloque E · Optimización (Ciclo 2.1)
--
-- Mueve la agregación del Top 5 de productos (KPI del dashboard) a PostgreSQL
-- para que la BD haga el GROUP BY, SUM y ORDER/LIMIT en lugar de transferir
-- todo el histórico de detalles_pedido al cliente.
--
-- Replica el comportamiento previo (calculado en JS):
--   · clave de agrupación = COALESCE(producto_id::text, nombre_producto)
--     (uuid a text para unificar tipos con el fallback al snapshot cuando el
--      producto fue eliminado: la FK es débil, on delete set null);
--   · nombre mostrado = COALESCE(productos.nombre, nombre_producto);
--   · SUM(cantidad), orden por unidades DESC con desempate alfabético ASC.
-- ============================================================================

create or replace function public.top_productos_mas_vendidos(p_limite int default 5)
returns table (nombre text, unidades_vendidas int)
language sql
stable
as $$
  select
    coalesce(p.nombre, dp.nombre_producto)::text as nombre,
    sum(dp.cantidad)::int as unidades_vendidas
  from public.detalles_pedido dp
  left join public.productos p on p.id = dp.producto_id
  group by
    coalesce(dp.producto_id::text, dp.nombre_producto),
    coalesce(p.nombre, dp.nombre_producto)
  order by sum(dp.cantidad) desc, coalesce(p.nombre, dp.nombre_producto) asc
  limit p_limite;
$$;