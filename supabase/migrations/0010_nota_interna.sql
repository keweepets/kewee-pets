-- ============================================================================
-- KEWEE MASCOTAS · MIGRACIÓN 0010 - Nota interna en pedidos
-- FASE 8D-3
--
-- Agrega una nota INTERNA de gestión al pedido. Es un campo privado:
--   · Solo se escribe/lee desde el panel admin (service role).
--   · NUNCA se envía al cliente (ni en email de Resend ni en WhatsApp).
-- La nota del cliente sigue viviendo en la columna `notas` (ya existente).
-- ============================================================================

alter table public.pedidos
  add column nota_interna text;
