-- ============================================================================
-- KEWEE MASCOTAS · MIGRACIÓN 0008 — Simplificación de estados de pedido
-- FASE 6
--
-- Reduce el modelo a 5 estados definitivos:
--   recibido, en_proceso, entregado, cancelado, rechazado
-- Y elimina: en_procesamiento, despachado, en_entrega.
--
-- La migración 0007 (que ya fue ejecutada) se conserva intacta como registro
-- histórico; esta migración ajusta SOLO los datos y la restricción actuales.
-- ============================================================================

-- 1) Reasignar el único estado eliminado que reaparece con nuevo nombre.
--    (No-op hoy porque todos los pedidos están en 'recibido', pero queda para
--     robustez en entornos donde ya existan registros intermedios.)
update public.pedidos
   set estado = 'en_proceso'
 where estado = 'en_procesamiento';

-- 2) Eliminar la restricción de estados actual.
alter table public.pedidos drop constraint if exists pedidos_estado_check;

-- 3) Recrear la restricción con los 5 estados definitivos.
alter table public.pedidos
  add constraint pedidos_estado_check
  check (estado in ('recibido','en_proceso','entregado','cancelado','rechazado'));
