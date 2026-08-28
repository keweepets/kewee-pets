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

## FASE 7 — Pendiente
- Mercado Pago (pago real) + webhooks.

## Última prueba realizada
- Pedido **KP-000004** enviado correctamente por WhatsApp.

## Próximo paso recomendado
- Implementar Resend (correo de confirmación) y terminar FASE 6.
