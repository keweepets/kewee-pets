-- ============================================================================
-- KEWEE MASCOTAS · MIGRACIÓN 0007 — Pedidos, clientes y detalle de pedidos
-- FASE 6 · Ticket de compra con snapshot inmutable.
--
-- Decisiones de modelo (aprobadas):
--   1. clientes SIN vínculo a auth.users → checkout como invitado.
--   2. numero_pedido: siempre generado por secuencia, formato KP-XXXXXX,
--      columna NOT NULL + UNIQUE.
--   3. Snapshots inmutables: nombre del producto/variante y precio_unitario
--      se copian al momento de la compra; la FK al catálogo es débil
--      (on delete set null) para preservar el histórico del pedido.
--   4. Precios enteros en COP (bigint), consistentes con el catálogo.
--   5. RLS de pedidos se agregará en una migración separada (paso posterior).
--
-- Estado: NO ejecutada aún. Revisar en SQL Editor antes de aplicar.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CLIENTES (snapshot propio)
-- ----------------------------------------------------------------------------
create table public.clientes (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  telefono      text not null,
  email         text,
  direccion     text,
  barrio        text,
  ciudad        text not null,
  departamento  text,
  notas         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_clientes_telefono on public.clientes(telefono);
create index idx_clientes_email on public.clientes(email);

create trigger trg_clientes_updated_at
  before update on public.clientes
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 2. PEDIDOS (cabecera)
-- ----------------------------------------------------------------------------
create table public.pedidos (
  id               uuid primary key default gen_random_uuid(),
  numero_pedido    text not null unique,
  cliente_id       uuid not null references public.clientes(id) on delete restrict,
  estado           text not null default 'recibido'
    check (estado in (
      'recibido','en_procesamiento','despachado',
      'en_entrega','entregado','cancelado','rechazado'
    )),
  metodo_pago      text not null check (metodo_pago in ('contraentrega','mercadopago')),
  subtotal         bigint not null check (subtotal >= 0),
  costo_envio      bigint not null default 0 check (costo_envio >= 0),
  descuento_total  bigint not null default 0 check (descuento_total >= 0),
  total            bigint not null check (total >= 0),
  direccion        text not null,
  barrio           text,
  ciudad           text not null,
  departamento     text,
  notas            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint chk_pedidos_total check (total = subtotal + costo_envio - descuento_total)
);

create index idx_pedidos_cliente on public.pedidos(cliente_id);
create index idx_pedidos_estado on public.pedidos(estado);
create index idx_pedidos_creado on public.pedidos(created_at desc);

create trigger trg_pedidos_updated_at
  before update on public.pedidos
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. NÚMERO LEGIBLE KP-XXXXXX — secuencia + trigger de asignación exclusiva
--    El trigger ignora cualquier valor manual: el número siempre proviene de
--    la secuencia, garantizando formato uniforme y unicidad bajo concurrencia
--    (nextval es no-transaccional).
-- ----------------------------------------------------------------------------
create sequence public.pedidos_numero_seq start 1;

create function public.asignar_numero_pedido()
returns trigger
language plpgsql
as $$
declare
  siguiente bigint;
begin
  select nextval('public.pedidos_numero_seq') into siguiente;
  new.numero_pedido := 'KP-' || lpad(siguiente::text, 6, '0');
  return new;
end;
$$;

create trigger trg_pedidos_numero
  before insert on public.pedidos
  for each row execute function public.asignar_numero_pedido();

-- ----------------------------------------------------------------------------
-- 4. DETALLES_PEDIDO (líneas con snapshot inmutable)
-- ----------------------------------------------------------------------------
create table public.detalles_pedido (
  id              uuid primary key default gen_random_uuid(),
  pedido_id       uuid not null references public.pedidos(id) on delete cascade,
  producto_id     uuid references public.productos(id) on delete set null,
  variante_id     uuid references public.variantes_producto(id) on delete set null,
  nombre_producto text not null,
  nombre_variante text not null default '',
  cantidad        int not null check (cantidad > 0),
  precio_unitario bigint not null check (precio_unitario >= 0),
  subtotal_linea  bigint not null check (subtotal_linea >= 0),
  constraint chk_detalle_subtotal check (subtotal_linea = cantidad * precio_unitario)
);

create index idx_detalles_pedido on public.detalles_pedido(pedido_id);
create index idx_detalles_producto on public.detalles_pedido(producto_id);
create index idx_detalles_variante on public.detalles_pedido(variante_id);
