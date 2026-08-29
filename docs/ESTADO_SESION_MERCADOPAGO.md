# ESTADO DE SESIÓN — Integración Mercado Pago Checkout Pro (FASE 7)

> **Propósito:** Este documento sirve como punto de continuación exacto para cualquier
> sesión futura. Describe el estado real del repositorio y de la integración con
> Mercado Pago Checkout Pro, las pruebas realizadas y el diagnóstico del error 145.
> No se repite código inventado: todo refleja el estado actual del repo.

**Fecha de la sesión:** continua al diagnóstico de Mercado Pago.
**Regla de oro:** no ejecutar otra prueba de pago real hasta resolver el desajuste de cuentas/entorno descrito abajo.

---

## 1. ESTADO DEL PROYECTO

### Stack actual
- **Framework:** Next.js 16.3.1 (App Router) — *versión con breaking changes*.
- **Lenguaje:** TypeScript 5.
- **Estilos:** Tailwind CSS v4.
- **Base de datos:** Supabase (Postgres) con pg-mem/supabase CLI local y columnas `estado_pago`/`preference_id`/`payment_id` (migración 0009).
- **Paquete de Mercado Pago:** `mercadopago` ^3.5.1.
- **Correo transaccional:** Resend.
- **WhatsApp:** enlace `wa.me` generado para pedidos.
- **Gestor de paquetes:** pnpm 11.22.0.

### Fases / componentes implementados (según el repo real)
- **FASE 1 — Fundación técnica:** Next.js + Tailwind v4 + design system Kewee.
- **FASE 2 — Sistema visual + componentes:** layout, tipografía, tarjetas.
- **FASE 3 — Catálogo + productos + categorías + marcas + variantes:** conexión a Supabase, promociones, precio efectivo.
- **FASE 4 — Carrito:** proveedor global de carrito.
- **FASE 5 — Checkout:** formulario de cliente/dirección/pago en `app/(tienda)/checkout/page.tsx`.
- **FASE 6 — Pedidos + WhatsApp + Resend:** `crearPedido()`, confirmación por correo y WhatsApp.
- **FASE 7A — Base técnica de Mercado Pago:** SDK, migración 0009 (`estado_pago`, `payment_id`, `preference_id`), `lib/mercadopago/cliente.ts`, `lib/mercadopago/preferencias.ts`, tipo `EstadoPago`.
- **FASE 7B — Conexión del checkout:** `lib/mercadopago/acciones.ts` (`iniciarPagoMercadoPago`) + redirección a `init_point`.
- **FASE 7C — Retorno y verificación:** `/checkout/pago` + `lib/mercadopago/verificar-pago.ts` (GET `/v1/payments/:id`).
- **FASE 8/9/10:** panel admin (avanzado), seguridad/SEO/responsive y producción — **no son objeto de esta sesión**.

> No se inventan avances: este es el estado real verificado en el repositorio.

---

## 2. MERCADO PAGO

- Integración mediante **Checkout Pro** (preferencias + redirección a `init_point`).
- `MERCADOPAGO_ACCESS_TOKEN` proviene de **`.env.local`** (leído server-side en `lib/mercadopago/cliente.ts`).
- El token **comienza por `TEST-`**, por lo tanto es **de prueba (sandbox)**, no de producción.
- El token actual pertenece al usuario de Mercado Pago con **ID `3646998037`** (correo `keweepets@gmail.com`, nickname `HDFBEACHG29153`, `user_type: normal`, `test_user: null`).
- La preferencia creada mediante la API devuelve **`collector_id` = `3646998037`** (es decir, el vendedor/cobrador real de la preferencia es ese usuario).
- Para las pruebas se crearon cuentas de prueba sugeridas por Mercado Pago:
  - **Vendedor de prueba:** `3650352568`
  - **Comprador de prueba:** `3650352566`
- **Estos IDs NO coinciden con el collector actual `3646998037` del Access Token.**
  - El collector real (via token) es `3646998037`.
  - El vendedor/comprador de prueba son `3650352568` / `3650352566`.
  - → Posible causa raíz del error de entorno al pagar.

---

## 3. PRUEBAS REALIZADAS

- Se intentó realizar el **pago real (de prueba)** con Checkout Pro usando las cuentas/tarjetas de prueba indicadas por Mercado Pago.
- El checkout permite avanzar hasta el **botón "Pagar"**.
- **Después de pagar** aparece el error:

```
Una de las partes con la que intentas hacer el pago es de prueba.
status_detail: 145 - Invalid users involved
```

- El error se produce **posterior al pago**; la creación de la preferencia y la redirección funcionan (el flujo llega al "Pagar").
- **No** se considera un error de catch del código: es una validación del lado de Mercado Pago sobre el entorno de las partes involucradas.

---

## 4. PREFERENCIA — `construirCuerpoPreferencia()`

Archivo: `lib/mercadopago/preferencias.ts` → `construirCuerpoPreferencia(pedido)`.

Campos reales que construye (desde el pedido persistido `PedidoConRelaciones`):

- **`items`**: una línea por cada `detalle_pedido`:
  - `id`: `d.variante_id ?? "linea-<id>"`.
  - `title`: `"<nombre_producto> (<nombre_variante>)"` o solo `nombre_producto`.
  - `quantity`: `d.cantidad`.
  - `unit_price`: `d.precio_unitario` (snapshot del servidor).
  - `currency_id`: `"COP"`.
  - Si `costo_envio > 0`, se agrega una línea `"Envío"` (quantity 1, unit_price = costo_envio).
- **`external_reference`**: `p.id` (UUID del pedido en Supabase).
- **`statement_descriptor`**: `"KEWEE MASCOTAS"`.
- **`back_urls`**: `success` / `pending` / `failure` → `${NEXT_PUBLIC_SITE_URL}/checkout/pago?resultado=exito|pendiente|fallo`.
- **`auto_return`**: `"approved"` **solo** si el host de `NEXT_PUBLIC_SITE_URL` no es localhost (si es localhost se omite).
- **`notification_url`**: `${NEXT_PUBLIC_SITE_URL}/api/webhooks/mercadopago` (ruta aún no implementada; solo se declara como string).
- **`payment_methods`: `{ installments: 1 }`** — tarjetas limitadas a una sola cuota.
- **`payer`**: **NO se construye explícitamente** en este cuerpo. No se envían `payer.email`, `payer.name` ni `payer.surname`.

> La moneda y montos SIEMPRE provienen de los snapshots recalculados en servidor;
> nunca se aceptan precios del cliente.

---

## 5. CAMBIO RECIENTE (sin commit)

Se modificó `lib/mercadopago/preferencias.ts` agregando:

```ts
payment_methods: { installments: 1 }
```

- **Motivo:** limitar las tarjetas a una sola cuota (decisión de producto).
- **Verificaciones:**
  - `pnpm lint` → **pasa**.
  - `pnpm exec tsc --noEmit` → **pasa**.
- **El cambio todavía NO tiene commit.**

> Además de este cambio, en sesiones anteriores (7B/7C) quedaron sin commit los archivos
> `app/(tienda)/checkout/page.tsx`, `app/(tienda)/checkout/pago/page.tsx`,
> `lib/mercadopago/acciones.ts` y `lib/mercadopago/verificar-pago.ts` (ver `git status`).

---

## 6. DIAGNÓSTICO ACTUAL

- **El error 145 NO se considera resuelto.**
- **Hipótesis actual:** incompatibilidad entre las **credenciales/cuentas de prueba** utilizadas y el **collector asociado a la preferencia**.
  - El Access Token (y por tanto la preferencia) apunta al collector **`3646998037`**.
  - Las cuentas de prueba usadas para pagar (vendedor `3650352568` / comprador `3650352566`) pertenecen a otro entorno/usuario.
  - Mercado Pago detecta que **una parte es de prueba y la otra no coincide en el mismo entorno** → `145 Invalid users involved`.

### Próximos pasos sugeridos (para la próxima sesión)
1. Verificar a qué cuenta/entorno pertenecen realmente las cuentas de prueba `3650352568` (vendedor) y `3650352566` (comprador).
2. Alinear el entorno: o bien usar un **par de prueba de la MISMA cuenta `3646998037`** del Access Token, o bien regenerar/rotar el Access Token para el vendedor de prueba `3650352568` y configurarlo en `.env.local`.
3. Usar **tarjetas de prueba de Mercado Pago** correspondientes al entorno elegido (vendedor y comprador del MISMO sandbox).
4. Tras alinear el entorno, repetir la prueba de pago **únicamente** en sandbox y verificar que el `status_detail` deje de ser `145`.

### Advertencias de seguridad para futuras sesiones
- **NO** exponer `MERCADOPAGO_ACCESS_TOKEN` en el navegador (es server-only).
- **NO** mostrar tokens/credenciales en logs ni commits.
- **NO** borrar cuentas de prueba de Mercado Pago.
- Respetar el orden de fases: webhook real y validación de firma pertenecen a fases posteriores (7D/7E).
