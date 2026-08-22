-- ============================================================================
-- KEWEE MASCOTAS · MIGRACIÓN 0001 — Esquema del catálogo y promociones
-- FASE 3 · Modelo aprobado por el cliente.
--
-- Decisiones de modelo (definitivas):
--   1. Todo producto tiene >= 1 variante ("Único" cuando aplica).
--   2. Precio y stock viven EXCLUSIVAMENTE en variantes_producto.
--   3. SKU UNIQUE; slug UNIQUE en productos/marcas/categorías.
--   4. activo en productos Y variantes.
--   5. precio_anterior = rebaja fija informativa (siempre > precio).
--   6. Promociones con fechas obligatorias en tabla independiente;
--      NUNCA mutan el precio base de la variante.
--   7. "Ofertas" NO es categoría: filtro derivado (promo vigente o rebaja fija).
--   8. Precios enteros en COP.
--
-- Ejecutar en Supabase Dashboard → SQL Editor (o CLI) cuando exista el proyecto.
-- ============================================================================

-- Búsqueda por texto (índices trigram para ILIKE)
create extension if not exists pg_trgm;

-- ----------------------------------------------------------------------------
-- Helper updated_at
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- MARCAS
-- ----------------------------------------------------------------------------
create table public.marcas (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null unique,
  slug       text not null unique,
  logo_url   text,
  activo     boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- CATEGORIAS (jerárquica: parent_id permite subcategorías sin migraciones)
-- ----------------------------------------------------------------------------
create table public.categorias (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null unique,
  slug       text not null unique,
  parent_id  uuid references public.categorias(id) on delete restrict,
  orden      int not null default 0,
  activo     boolean not null default true,
  created_at timestamptz not null default now(),
  constraint chk_categorias_sin_auto_referencia check (id <> parent_id)
);

create index idx_categorias_parent on public.categorias(parent_id);

-- ----------------------------------------------------------------------------
-- PRODUCTOS
-- ----------------------------------------------------------------------------
create table public.productos (
  id                uuid primary key default gen_random_uuid(),
  categoria_id      uuid not null references public.categorias(id) on delete restrict,
  marca_id          uuid not null references public.marcas(id) on delete restrict,
  nombre            text not null,
  slug              text not null unique,
  descripcion       text not null default '',
  descripcion_corta text not null default '',
  activo            boolean not null default true,
  es_destacado      boolean not null default false,
  es_mas_vendido    boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_productos_categoria on public.productos(categoria_id);
create index idx_productos_marca on public.productos(marca_id);
create index idx_productos_destacados on public.productos(es_destacado) where activo;
create index idx_productos_mas_vendidos on public.productos(es_mas_vendido) where activo;
create index idx_productos_nombre_trgm on public.productos using gin (nombre gin_trgm_ops);
create index idx_productos_descripcion_corta_trgm on public.productos using gin (descripcion_corta gin_trgm_ops);

create trigger trg_productos_updated_at
  before update on public.productos
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- VARIANTES_PRODUCTO (única fuente de precio y stock — regla: >=1 por producto)
-- ----------------------------------------------------------------------------
create table public.variantes_producto (
  id              uuid primary key default gen_random_uuid(),
  producto_id     uuid not null references public.productos(id) on delete cascade,
  nombre          text not null,                    -- '15 lb', 'Único', 'S'
  sku             text unique,
  precio          bigint not null check (precio >= 0),
  precio_anterior bigint check (precio_anterior is null or precio_anterior > precio),
  stock           int not null default 0 check (stock >= 0),
  orden           int not null default 0,
  activo          boolean not null default true,
  created_at      timestamptz not null default now(),
  constraint uq_variante_nombre_por_producto unique (producto_id, nombre)
);

-- ----------------------------------------------------------------------------
-- IMAGENES_PRODUCTO (producto siempre; variante opcional)
-- Nota: la coherencia variante_id→mismo producto se valida en la capa de
-- escritura (solo backend/admin escribe).
-- ----------------------------------------------------------------------------
create table public.imagenes_producto (
  id          uuid primary key default gen_random_uuid(),
  producto_id uuid not null references public.productos(id) on delete cascade,
  variante_id uuid references public.variantes_producto(id) on delete cascade,
  url         text not null,
  alt         text not null default '',
  orden       int not null default 0,
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

create index idx_imagenes_producto_orden on public.imagenes_producto(producto_id, orden);
create index idx_imagenes_variante on public.imagenes_producto(variante_id);

-- ----------------------------------------------------------------------------
-- PROMOCIONES (fechas obligatorias; sin acumulación; precio base intacto)
-- Resolución (capa de aplicación): precio_efectivo = min(precio_lista,
--   precio − mejor promo vigente aplicable), piso 0.
-- ----------------------------------------------------------------------------
create table public.promociones (
  id           uuid primary key default gen_random_uuid(),
  nombre       text not null,
  tipo         text not null check (tipo in ('porcentaje', 'monto')),
  valor        bigint not null check (
                 (tipo = 'porcentaje' and valor > 0 and valor <= 100)
                 or (tipo = 'monto' and valor > 0)
               ),
  alcance      text not null check (alcance in ('global','categoria','marca','producto','variante')),
  categoria_id uuid references public.categorias(id) on delete cascade,
  marca_id     uuid references public.marcas(id) on delete cascade,
  producto_id  uuid references public.productos(id) on delete cascade,
  variante_id  uuid references public.variantes_producto(id) on delete cascade,
  fecha_inicio timestamptz not null,
  fecha_fin    timestamptz not null,
  activo       boolean not null default true,
  created_at   timestamptz not null default now(),

  constraint chk_promocion_fechas check (fecha_fin > fecha_inicio),

  -- Un objetivo claro y único según el alcance:
  constraint chk_promocion_alcance_objetivo check (
       (alcance = 'global'    and categoria_id is null     and marca_id   is null     and producto_id is null     and variante_id is null)
    or (alcance = 'categoria' and categoria_id is not null and marca_id   is null     and producto_id is null     and variante_id is null)
    or (alcance = 'marca'     and categoria_id is null     and marca_id   is not null and producto_id is null     and variante_id is null)
    or (alcance = 'producto'  and categoria_id is null     and marca_id   is null     and producto_id is not null and variante_id is null)
    or (alcance = 'variante'  and categoria_id is null     and marca_id   is null     and producto_id is null     and variante_id is not null)
  )
);

create index idx_promociones_vigencia on public.promociones(activo, fecha_inicio, fecha_fin);
create index idx_promociones_categoria on public.promociones(categoria_id);
create index idx_promociones_marca on public.promociones(marca_id);
create index idx_promociones_producto on public.promociones(producto_id);
create index idx_promociones_variante on public.promociones(variante_id);
