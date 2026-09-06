# Kewee Mascotas — Estado de sesión

> Documento de cierre de sesión para retomar el trabajo exactamente donde quedó.
> Última actualización: 2026-09-05.

## Punto de retorno

**FASE 9 — BLOQUE D: RESPONSIVE**

Estado: **Diagnóstico completado** → pendiente: revisión/prioritización por el usuario → autorización → implementación.
**NO iniciar la implementación todavía.**

---

## Historial resumido

- **Fase 9 — Bloque A (Email confirmación):** committeado (`ee39250`). NO tocar.
- **Fase 9 — Bloque B (correo/electrónico):** committeado (`eb8ade9`).
- **Fase 9 — Bloque C (SEO):** committeado (`8882306`, `seo: implement production SEO foundation`). Verificado en producción: robots.txt 200, sitemap.xml 200 (8 URLs), og-default.png 200 (1200×630). Sin canonical, sin JSON-LD, dominio definitivo diferido.
- **Fase 9 — Bloque D (Responsive):** DIAGNÓSTICO completado (abajo). Implementación pendiente de aprobación.

---

## FASE 9 — BLOQUE D: RESPONSIVE (diagnóstico completo)

**Estado general: requiere correcciones.**

Proyecto: Next.js + **Tailwind v4** (tokens en `app/globals.css` `@theme`; breakpoints por defecto sm=640, md=768, lg=1024, xl=1280, 2xl=1536). Sin `tailwind.config`; `postcss.config.mjs` para v4.

### CRÍTICOS

- **Header: búsqueda desborda < 380px.** `<form flex-1 max-w-xl mx-auto>` sin `min-w-0` (header.tsx:38,64); el input (min-content ~150–200px) no encoge y empuja logo/iconos/sangra. Alto. `components/layout/header.tsx`.
- **Detalle producto: fila de precios sangra < 360px con ofertas.** `mt-6 flex items-baseline gap-3` sin `flex-wrap` (detalle-producto.tsx:147); precio `text-4xl font-black` + tachado + badge superan `px-4`. Alto. `components/productos/detalle-producto.tsx`.
- **Checkout pago: `numero_pedido` en `inline-block` no envuelve** (pago/page.tsx:88). Medio-alto (hoy IDs cortos, frágil). `app/(tienda)/checkout/pago/page.tsx`.

### IMPORTANTES

- **Admin nav pestañas desborda < 540px.** `nav flex w-full max-w-7xl gap-2 px-6` sin `flex-wrap`/`overflow-x-auto` (nav-admin.tsx:24); ~130px de exceso a 375px. `app/admin/(panel)/nav-admin.tsx`.
- **Admin tablas sin ocultar columnas:** patrón `overflow-x-auto`+`min-w-full` sin `hidden` en breakpoint: Pedidos 9 col (pedidos/page.tsx:156), Promociones 9 col (promociones/page.tsx:232), Productos 7 col (productos/page.tsx:166). Acciones/"Ver" última columna solo por scroll. Celda Variantes (productos/page.tsx:235, `flex ... text-xs` sin wrap) ensancha más.
- **Admin formularios de una fila sin `flex-wrap` (inconsistente):** `marcas/formulario.tsx:28` y `pedidos/[id]/cambiar-estado.tsx:39` desbordan; `categorias/formulario.tsx:41` y `pedidos/filtros.tsx:125` sí wrap. `productos/buscador.tsx:29` input+2 botones sin wrap.
- **Admin acciones de imagen solo hover → inaccesibles en táctil:** `opacity-0 group-hover:opacity-100` (productos/nuevo/formulario.tsx:800; [id]:869,934). No se puede marcar principal/eliminar en móvil.
- **Card producto: variantes y precios recortados en 2 col.** Chips `px-2 py-0.5 text-xs` ~22px, `line-through` recortado por `overflow-hidden` (card-producto.tsx:58,103). `components/productos/card-producto.tsx`.
- **Header input impracticable + breakpoint Home vs Catálogo inconsistente:** Home `sm:grid-cols-3` (grid-destacados.tsx:17) vs Catálogo `md:grid-cols-3` (catalogo/page.tsx:227); input h-9 36px. `components/layout/header.tsx`, `components/home/grid-destacados.tsx`, `app/(tienda)/catalogo/page.tsx`.
- **Carrito: subtotal COP se sale ≤ 345px con montos altos.** `flex items-center justify-between gap-3` sin wrap (carrito/page.tsx:132). `app/(tienda)/carrito/page.tsx`.

### MENORES

- **Zoom iOS:** todos los inputs usan `text-sm` (<16px) → zoom al enfocar (header.tsx:72, catalogo:190, checkout:321–420).
- **Dots hero:** botones `h-2 w-2` ~8px sin área táctil (hero-slider.tsx:118).
- **Chips filtro catálogo:** ~34px, bajo estándar 44px.
- **"Ver todos"** carrusel: `hidden sm:flex` (carrusel-favoritos.tsx:20).
- **Admin toggles/eliminar:** botones solo texto ~18–20px (boton-toggle/eliminar).
- **Admin reordenar categorías:** botones 24×24 pegados (boton-reordenar.tsx:43).
- **Admin acciones producto:** `flex gap-3` sin wrap < 375px (formulario.tsx:816/951).
- **Nosotros (Home):** grid valores `grid-cols-2` apretado 320–400px (cosmético).

### PÁGINAS SIN PROBLEMAS

- **Home** (hero-slider ✓, categorias 2→4 ✓, seccion-perros-gatos 1→2 ✓, marcas wrap ✓, cta-final col→row ✓, seccion-nosotros ✓, carrusel overflow-x intencional ✓)
- **Nosotros / Contacto** (`pagina-en-construccion` ✓)
- **Checkout** (grid `sm:grid-cols-2`, resumen `lg:w-96 shrink-0` ✓)
- **Footer** (banner flex-wrap, grid 1/2/4 ✓)
- **Botón flotante WhatsApp** (`h-14 w-14 fixed` ✓)
- **Admin:** Login, Update Password, Dashboard, Detalle pedido, Nota interna, Gestión stock, Selector periodo, Filtros ✓

### Notas del diagnóstico

- Sin cambios de código; solo lectura. No se probó en viewports reales (determinado por análisis de código/Tailwind v4 breakpoints por defecto).
- `proveedor-carrito.tsx` no renderiza drawer; el carrito es página `/carrito`.
- `banner-promocion.tsx` comentado en Home, no se renderiza.

---

## Contexto técnico recurrente

- Repo: `keweepets/kewee-pets`. Vercel: `kewee-pets` (`https://kewee-pets.vercel.app`).
- Tailwind v4 (sin `tailwind.config`; tokens en `@theme`). `rg` no instalado → usar `Select-String`. Grep tool falla.
- `NEXT_PUBLIC_SITE_URL` en prod = `https://kewee-pets.vercel.app`; en local = `http://localhost:3000`.
- Excluir siempre: `public/images/IMG_1434 - copia.PNG`, `IMG_1435.PNG`, `IMG_1436.PNG`.
- `lib/resend/plantilla-confirmacion.ts` (footer logo 300×111, background-image, textos 16px) — NO tocar.