-- ============================================================================
-- KEWEE MASCOTAS · MIGRACIÓN 0015 — RPC resúmenes del dashboard (pedidos)
-- FASE 9 · Bloque E · Optimización (Ciclo 2.3)
--
-- Mueve a PostgreSQL las agregaciones del dashboard de pedidos que antes se
-- calculaban en JavaScript:
--   · resumen_ventas_y_domicilios  → COUNT + SUM de pagados (1 fila).
--   · conteos_por_estado           → GROUP BY estado + COUNT (máx. 5 filas).
--   · resumen_metodo_pago          → GROUP BY metodo_pago + COUNT/SUM (2 filas).
--
-- Replica el comportamiento previo (calculado en JS) sin cambiar resultados:
--   · COALESCE en las sumas para devolver 0 cuando no hay filas (equivalente
--     al acumulador JS);
--   · los rangos de fecha se reciben como timestamptz (el cliente ya los
--     convierte a UTC con limitesRangoEnUtc, igual que el resto del flujo);
--   · en resumen_metodo_pago se reciben listas de ids ya resueltas por la
--     búsqueda (texto separado por comas) y se comparan como texto para
--     evitar colisiones de cast uuid/text.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. resumen_ventas_y_domicilios: venta de productos, domicilios y nº de
--    pedidos pagados en el rango (SUM subtotal, SUM costo_envio, COUNT).
-- ----------------------------------------------------------------------------
create or replace function public.resumen_ventas_y_domicilios(
  p_desde timestamptz default null,
  p_hasta timestamptz default null
)
returns table (venta_productos bigint, domicilios bigint, cantidad_pagados bigint)
language sql
stable
as $$
  select
    coalesce(sum(subtotal), 0)::bigint as venta_productos,
    coalesce(sum(costo_envio), 0)::bigint as domicilios,
    count(*)::bigint as cantidad_pagados
  from public.pedidos
  where estado_pago = 'pagado'
    and (p_desde is null or created_at >= p_desde)
    and (p_hasta is null or created_at <= p_hasta);
$$;

-- ----------------------------------------------------------------------------
-- 2. conteos_por_estado: conteo de pedidos agrupado por estado en el rango.
-- ----------------------------------------------------------------------------
create or replace function public.conteos_por_estado(
  p_desde timestamptz default null,
  p_hasta timestamptz default null
)
returns table (estado text, cantidad int)
language sql
stable
as $$
  select
    estado,
    count(*)::int as cantidad
  from public.pedidos
  where (p_desde is null or created_at >= p_desde)
    and (p_hasta is null or created_at <= p_hasta)
  group by estado;
$$;

-- ----------------------------------------------------------------------------
-- 3. resumen_metodo_pago: pedidos pagados agrupados por metodo_pago, con
--    cantidad y suma de `total` por grupo. Acepta los mismos filtros que la
--    pantalla (rango, estado, estado_pago y búsqueda ya resuelta en ids).
--    Devuelve SIEMPRE las dos filas (contraentrega, mercadopago), incluso si
--    un método tiene 0 pedidos pagados (equivale al array fijo de la función
--    anterior). La búsqueda combina cliente_id OR pedido_id, igual que la
--    función aplicarBusqueda del código anterior.
-- ----------------------------------------------------------------------------
create or replace function public.resumen_metodo_pago(
  p_desde timestamptz default null,
  p_hasta timestamptz default null,
  p_estado text default null,
  p_estado_pago text default null,
  p_cliente_ids text default null,
  p_pedido_ids text default null
)
returns table (metodo_pago text, cantidad int, suma_total bigint)
language sql
stable
as $$
  select
    mp.metodo_pago,
    count(p.id)::int as cantidad,
    coalesce(sum(p.total), 0)::bigint as suma_total
  from (values ('contraentrega'), ('mercadopago')) as mp(metodo_pago)
  left join public.pedidos p
    on p.metodo_pago = mp.metodo_pago
    and p.estado_pago = 'pagado'
    and (p_estado is null or p.estado = p_estado)
    and (p_estado_pago is null or p.estado_pago = p_estado_pago)
    and (p_desde is null or p.created_at >= p_desde)
    and (p_hasta is null or p.created_at <= p_hasta)
    and (
      (p_cliente_ids is null and p_pedido_ids is null)
      or (p_cliente_ids is not null
            and p.cliente_id::text = any(string_to_array(p_cliente_ids, ',')))
      or (p_pedido_ids is not null
            and p.id::text = any(string_to_array(p_pedido_ids, ',')))
    )
  group by mp.metodo_pago
  order by mp.metodo_pago;
$$;

-- ----------------------------------------------------------------------------
-- 4. Permisos (patrón migración 0014): solo service_role. Sin estos REVOKE,
--    PostgreSQL otorga EXECUTE a PUBLIC por defecto.
-- ----------------------------------------------------------------------------
revoke execute on function public.resumen_ventas_y_domicilios(timestamptz, timestamptz)
  from public;

grant execute on function public.resumen_ventas_y_domicilios(timestamptz, timestamptz)
  to service_role;

revoke execute on function public.conteos_por_estado(timestamptz, timestamptz)
  from public;

grant execute on function public.conteos_por_estado(timestamptz, timestamptz)
  to service_role;

revoke execute on function public.resumen_metodo_pago(
  timestamptz, timestamptz, text, text, text, text
) from public;

grant execute on function public.resumen_metodo_pago(
  timestamptz, timestamptz, text, text, text, text
) to service_role;