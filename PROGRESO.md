# PROGRESO — KEWEE MASCOTAS

## Fases 1–5 — Completadas
- FASE 1: Arquitectura y base del proyecto (Next.js App Router, Tailwind, estructura de carpetas).
- FASE 2: Diseño del e-commerce (layout de tienda, header, footer, estilos de marca, Home con secciones).
- FASE 3: Catálogo de productos conectado a Supabase (listado, detalle, variantes, marcas, promociones, búsqueda).
- FASE 4: Carrito (persistente vía localStorage con `useSyncExternalStore`).
- FASE 5: Panel de administración (CRUD productos, variantes flexibles, marcas, imágenes, búsqueda, login).

## FASE 6 — Pedidos y checkout
- Migración `0007_pedidos.sql`: tablas `clientes`, `pedidos`, `detalles_pedido` + secuencia/trigger `KP-XXXXXX`.
- Carrito persistente funcional.
- Checkout (`/checkout`) que construye la entrada y llama `crearPedido()`.
- `crearPedido()`: validación servidor, recálculo de precios/stock/totales (fuente de verdad), rollback best-effort.
- Pantalla de pedido confirmado con `numero_pedido`.
- **WhatsApp funcionando**: mensaje de pedido confirmado con datos reales (`PedidoConRelaciones`) y enlace `wa.me`.
- **Resend: integración completa y prueba técnica exitosa.** Pendiente verificar un dominio en Resend para permitir envíos a correos de clientes reales. Actualmente `onboarding@resend.dev` solo permite enviar al correo propietario de la cuenta en modo testing.
- **Estados de pedido simplificados** a 5 definitivos: `recibido | en_proceso | entregado | cancelado | rechazado` (se eliminaron `en_procesamiento`, `despachado` y `en_entrega`). Tipo `EstadoPedido` actualizado y migración `0008_estados_pedido.sql` creada (aplicada).
- **Administración de pedidos (`/admin/pedidos`)**: listado con contadores por estado, filtros (estado, búsqueda por N°/cliente/teléfono, rango de fechas) y detalle con cambio de estado. Consultas `obtenerPedidosAdmin` / `obtenerConteosPorEstado`, Server Action `actualizarEstadoPedido` (protegida con `requerirAdmin`).
- Home migrado a productos reales de Supabase (UUID) para compatibilidad con pedidos.

## FASE 7 — Completa
- **Mercado Pago Checkout Pro**: preferencias desde el pedido persistido (línea "Envío" si `costo_envio > 0`, `transaction_amount` = `pedido.total`), retorno `/checkout/pago`, `verificarPagoYActualizar` (status + `external_reference` + monto) y webhook firmado en `/api/webhooks/mercadopago`.
- Estado de pago persistido en `pedidos.estado_pago` (`pendiente | pagado | rechazado`), `payment_id` y `preference_id` (migración `0009_mercadopago.sql`).

## FASE 8 — Panel admin (completa)
- CRUD de catálogo, administración de pedidos (filtros, cambio de estado, export CSV), Dashboard con selector de período (`hoy/7d/15d/30d/mes/personalizado`, default "mes").

## Última prueba realizada
- Pedido **KP-000004** enviado correctamente por WhatsApp.

## #11 — Domicilio por zonas (COMPLETADO, probado y funcionando)
- **Config central** en `lib/config/domicilio.ts`: `ZONAS_DOMICILIO` (Medellín $11.990, Envigado/Itagüí/Bello $12.990, Niquía $13.990, Sabaneta/Copacabana $14.990), `MINIMO_ENVIO_GRATIS` ($199.000), helpers `tarifaDomicilioPara(subtotal, ciudad)` y `esZonaDeCobertura(ciudad)`.
- **Checkout**: selector de zona (7 municipios) en lugar de campo libre; muestra tarifa dinámica y "Envío gratis desde $199.000".
- **Servidor como fuente de verdad**: `crearPedido` ignora el `costoEnvio` del navegador y lo recalcula con el subtotal real y la ciudad; valida cobertura y calcula `total` solo en servidor.
- **Dashboard**: "Cobrado del período" reemplazado por "Venta de productos" (suma `subtotal`) y "Domicilios" (suma `costo_envio`), ambos solo con `estado_pago = pagado`; envío gratis = $0.

## Próximo paso recomendado
- Verificar un dominio en Resend para envíos de correo a clientes reales (hoy solo funciona con la casilla propietaria en modo testing).
- Continuar con la siguiente tarea del plan (#12 o la que corresponda) sobre el estado actual del dashboard y domicilios.
