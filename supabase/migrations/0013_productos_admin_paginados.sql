-- ============================================================================
-- KEWEE MASCOTAS · MIGRACIÓN 0013 — RPC Productos admin paginados
-- FASE 9 · Bloque E · Optimización (Ciclo 2.2)
--
-- Mueve la carga de la tabla de productos del panel admin a PostgreSQL para
-- paginar en el servidor (evita transferir todo el catálogo al cliente).
--
-- Replica el comportamiento previo (calculado en JS):
--   · búsqueda por nombre, slug y SKU;
--     el conjunto de resultados es la UNIÓN de los productos que matchean
--     por nombre/slug (segmento 0) y los que matchean SOLO por SKU
--     (segmento 1), de modo que los productos encontrados únicamente por SKU
--     también pueden aparecer en páginas posteriores;
--   · la sanitización del término replica `q.replace(/[(),%]/g, " ").trim()`;
--   · orden actual `created_at DESC` con `id DESC` como desempate estable,
--     preservando dos bloques: primero los match por nombre/slug y después
--     los match solo por SKU;
--   · si la página pedida queda fuera de rango (p. ej. tras desactivar o
--     eliminar un producto), se recorre a la última página válida;
--   · el recorte de página NO usa LIMIT/OFFSET porque PostgreSQL rechaza
--     variables y referencias a columnas dentro de OFFSET
--     (42P10: "argument of OFFSET must not contain variables"); en su lugar
--     se numera el conjunto con ROW_NUMBER() y se filtra por rango en el
--     WHERE (mismos resultados, mismo orden).
--
-- Devuelve la fila con los mismos campos que el `select` embebido previo
-- (marcas, categorías, variantes e imágenes en formato JSON) y el total de
-- resultados del conjunto completo ANTES de paginar.
-- ============================================================================

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
  with coincidencias as (
    select
      p.id,
      case
        when v_patron is null then 0
        when p.nombre ilike v_patron or p.slug ilike v_patron then 0
        when exists (
          select 1
          from public.variantes_producto v
          where v.producto_id = p.id and v.sku ilike v_patron
        ) then 1
        else null
      end as segmento
    from public.productos p
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