-- ============================================================================
-- KEWEE MASCOTAS · MIGRACIÓN 0004 — Campos de variante flexible y prueba
-- FASE 6B · Diseño técnico aprobado.
--
-- Cambios:
--   1. productos.es_prueba → exclusion de productos de prueba de la tienda.
--   2. variantes_producto.tipo_variante → clasificacion de variante.
--   3. variantes_producto.valor / unidad → datos estructurados de variante.
--   4. variantes_producto.descuento_porcentaje → descuento directo en variante.
--
-- Notas:
--   · Defaults compatibles con datos existentes (sin BREAKING CHANGE).
--   · CHECK constraints protegen integridad sin necesidad de app-level validation.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PRODUCTOS — columna es_prueba
-- ----------------------------------------------------------------------------
alter table public.productos
  add column es_prueba boolean not null default false;

create index idx_productos_es_prueba on public.productos(es_prueba) where es_prueba;

-- ----------------------------------------------------------------------------
-- 2. VARIANTES — tipo_variante, valor, unidad
-- ----------------------------------------------------------------------------
alter table public.variantes_producto
  add column tipo_variante text not null default 'unico'
    check (tipo_variante in (
      'unico', 'peso', 'talla', 'tamano',
      'cantidad', 'volumen', 'presentacion'
    )),
  add column valor text,
  add column unidad text;

-- ----------------------------------------------------------------------------
-- 3. VARIANTES — descuento_porcentaje
-- ----------------------------------------------------------------------------
alter table public.variantes_producto
  add column descuento_porcentaje numeric(5,2)
    check (
      descuento_porcentaje is null
      or (descuento_porcentaje >= 0 and descuento_porcentaje <= 100)
    );
