-- ============================================================================
-- KEWEE MASCOTAS · MIGRACIÓN 0009 — Estado de pago Mercado Pago
-- FASE 7 · Checkout Pro
--
-- Decide separar el ESTADO DEL PEDIDO (logístico) del ESTADO DEL PAGO:
--   · estado      : recibido | en_proceso | entregado | cancelado | rechazado
--   · estado_pago : pendiente | pagado | rechazado
--
-- NO se toca ni `estado` ni `metodo_pago`.
--
-- Seguridad para registros existentes: todas las columnas nuevas se agregan
-- con valores por defecto (estado_pago = 'pendiente', payment_id/preference_id
-- NULL), por lo que los pedidos ya creados quedan consistentes sin UPDATE.
--
-- Se difiere conscientemente: NO agregar aún 'devuelto' ni fecha_pago.
-- ============================================================================

alter table public.pedidos
  add column estado_pago    text not null default 'pendiente'
    check (estado_pago in ('pendiente','pagado','rechazado')),
  add column payment_id     text,
  add column preference_id  text;