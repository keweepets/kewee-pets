# Kewee Mascotas — Tienda Virtual

E-commerce profesional para la tienda de mascotas **KEWEE MASCOTAS** (Medellín, Colombia).

> ⚠️ Regla de marca: el nombre siempre es **KEWEE MASCOTAS**. Nunca "Kiwi", "Kiwee", "Kewee Pets" ni "Kiwi Pets".

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** — design system portado desde `/referencia-figma` (fuente de verdad visual)
- **Supabase** — base de datos Postgres + Auth (solo administradores; los clientes compran sin registro)
- **Mercado Pago** — pagos en línea con webhooks
- **Resend** — emails transaccionales
- **WhatsApp Business** — contraentrega en Medellín y canal alternativo de pedidos
- **pnpm** · despliegue en **Vercel**

## Estructura

```
app/               Rutas App Router
components/ui/     Componentes UI base (Boton, Badge, CampoTexto…)
lib/utils.ts       Helper cn() (clsx + tailwind-merge)
lib/supabase/      Clientes Supabase: cliente.ts (navegador/anon) y servidor.ts (service role)
utils/formato.ts   Formato de moneda COP
referencia-figma/  Export de Figma Make — SOLO referencia. No modificar ni importar.
```

## Puesta en marcha

```bash
pnpm install
cp .env.example .env.local   # y completar los valores
pnpm dev                     # http://localhost:3000
```

Scripts: `pnpm dev` · `pnpm build` · `pnpm start` · `pnpm lint`

## Variables de entorno

Ver `.env.example`. `.env.local` nunca se sube al repositorio.

## Plan de desarrollo (10 fases)

1. ✅ **Fundación** — scaffold, design system, estructura base
2. Design System completo — portar Header, Home y Footer desde Figma
3. Catálogo público — productos, filtros, detalle
4. Carrito de compras
5. Checkout — datos del cliente (compra sin registro)
6. Pedidos + WhatsApp + emails Resend
7. Mercado Pago + webhooks
8. Panel de administración (Supabase Auth)
9. Seguridad + SEO
10. Pruebas + puesta en producción

## Convenciones

- Textos visibles de la interfaz: **español**.
- Código (variables, funciones, componentes): inglés cuando sea práctica estándar; nombres de negocio (pedidos, variantes, etc.) pueden usar español.
- Montos siempre en **COP sin decimales**, formateados con `formatPriceCOP`.
- Estados de pedido: `pendiente | confirmado | preparando | enviado | entregado | cancelado`.
- Un pedido solo se marca como pagado tras confirmación del webhook de Mercado Pago.
