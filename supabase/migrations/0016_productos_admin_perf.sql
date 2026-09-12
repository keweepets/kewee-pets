-- ============================================================================
-- KEWEE MASCOTAS · MIGRACIÓN 0016 — Optimización RPC productos admin
-- FASE 9 · Bloque E · Optimización (fix Gateway Timeout en /admin/productos)
--
-- Causa del 504 "Gateway Timeout" al consultar `productos_admin_paginados`:
--   1. `p.slug ilike v_patron` y `p.nombre ilike v_patron` no tienen índice
--      trgm sobre slug (solo existía sobre nombre y descripcion_corta) →
--      escaneo secuencial al buscar.
--   2. El CTE `coincidencias` ejecutaba una subconsulta correlacionada
--      `exists (select 1 from variantes_producto v where v.producto_id = p.id
--      and v.sku ilike v_patron)` POR CADA producto, sin índice trgm sobre
--      sku ⇒ N escaneos de variantes en cada búsqueda.
--
-- Optimización (sin cambiar resultados ni la firma de la RPC):
--   · Índices trgm sobre productos.slug y variantes_producto.sku (pg_trgm ya
--     está creado desde la migración 0001).
--   · Reescritura del CTE `coincidencias`: los matches por SKU se resuelven
--     en UNA pasada indexada (distinct producto_id) y se cruzan con LEFT JOIN
--     en lugar de la subconsulta correlacionada por fila.
-- Conserva la semántica exacta previa: segmento 0 = nombre/slug, segmento 1
-- = solo SKU, y el pedido "bloques" por segmento antes de paginar.
--
-- Aplicar en Supabase Dashboard → SQL Editor (ver convención de 0001).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Índices trgm faltantes para los ILIKE de la búsqueda.
-- ----------------------------------------------------------------------------
create index if not exists idx_productos_slug_trgm
  on public.productos using gin (slug gin_trgm_ops);

create index if not exists idx_variantes_sku_trgm
  on public.variantes_producto using gin (sku gin_trgm_ops);

-- ----------------------------------------------------------------------------
-- 2. Reescritura de productos_admin_paginados (misma firma → los permisos de
--    la migración 0014 siguen vigentes).
-- ----------------------------------------------------------------------------
create or replace function public.productos_admin_paginados(
  p_busqueda text default null,
  p_pagina int default 1,
  p_por_pagina int default 15
)
returns table (
  id uuid,
  nombre text,
  slug text,
  activo boolean,
  es_destacado boolean,
  es_mas_vendido boolean,
  marcas json,
  categorias json,
  variantes_producto json,
  imagenes_producto json,
  total int
)
language plpgsql
stable
as $$
declare
  v_busqueda  text;
  v_patron    text;
  v_pagina    int;
  v_por_pagina int;
begin
  -- Sanitiza igual que el código previo en JS: quita (),% y recorta espacios.
  v_busqueda := trim(translate(coalesce(p_busqueda, ''), '(),%', '    '));

  -- Sin término → lista completa (un solo segmento).
  v_patron := case when v_busqueda = '' then null else '%' || v_busqueda || '%' end;

  v_pagina := greatest(coalesce(p_pagina, 1), 1);
  v_por_pagina := least(greatest(coalesce(p_por_pagina, 15), 1), 100);

  return query
  with sku_emparejados as (
    -- Productos que matchean SOLO por SKU: una sola pasada indexada (trgm)
    -- en lugar de la subconsulta correlacionada por producto.
    select distinct v.producto_id
    from public.variantes_producto v
    where v_patron is not null
      and v.sku is not null
      and v.sku ilike v_patron
  ),
  coincidencias as (
    select
      p.id,
      case
        when v_patron is null then 0
        when p.nombre ilike v_patron or p.slug ilike v_patron then 0
        when s.producto_id is not null then 1
        else null
      end as segmento
    from public.productos p
    left join sku_emparejados s on s.producto_id = p.id
  ),
  totales as (
    select count(*)::int as total
    from coincidencias
    where segmento is not null
  ),
  desplazamiento as (
    select
      t.total,
      case
        when t.total = 0 then 1
        when (v_pagina - 1) * v_por_pagina >= t.total
          then ((t.total - 1) / v_por_pagina) + 1
        else v_pagina
      end as pagina_efectiva
    from totales t
  ),
  numeradas as (
    select
      p.id,
      row_number() over (
        order by c.segmento, p.created_at desc, p.id desc
      ) as rn
    from public.productos p
    join coincidencias c on c.id = p.id and c.segmento is not null
  )
  select
    p.id,
    p.nombre,
    p.slug,
    p.activo,
    p.es_destacado,
    p.es_mas_vendido,
    (select json_build_object('id', m.id, 'nombre', m.nombre)
       from public.marcas m
      where m.id = p.marca_id) as marcas,
    (select json_build_object('id', c.id, 'nombre', c.nombre, 'slug', c.slug)
       from public.categorias c
      where c.id = p.categoria_id) as categorias,
    (select coalesce(json_agg(json_build_object(
              'id', v.id,
              'nombre', v.nombre,
              'sku', v.sku,
              'precio', v.precio,
              'stock', v.stock,
              'activo', v.activo)
            order by v.orden, v.id), '[]'::json)
       from public.variantes_producto v
      where v.producto_id = p.id) as variantes_producto,
    (select coalesce(json_agg(json_build_object(
              'url', i.url,
              'orden', i.orden,
              'activo', i.activo)
            order by i.orden, i.id), '[]'::json)
       from public.imagenes_producto i
      where i.producto_id = p.id) as imagenes_producto,
    d.total
  from numeradas n
  join public.productos p on p.id = n.id
  cross join desplazamiento d
  where n.rn > (d.pagina_efectiva - 1) * v_por_pagina
    and n.rn <= (d.pagina_efectiva - 1) * v_por_pagina + v_por_pagina
  order by n.rn;
end;
$$;