KEWEE

Quiero diseñar en Stitch by Google la interfaz completa de un e-commerce profesional llamado:

KEWEE MASCOTAS

La plataforma será una tienda virtual especializada en productos para mascotas en Colombia, principalmente perros y gatos.

IMPORTANTE:
No quiero solamente una landing page. Quiero que diseñes el SISTEMA COMPLETO DE PANTALLAS de un e-commerce moderno, incluyendo tienda pública, catálogo, productos, carrito, checkout y panel administrativo.

El diseño posteriormente será implementado utilizando Next.js, Supabase, Vercel, Mercado Pago, Resend, GitHub y WhatsApp.

Stitch debe enfocarse en:
- Arquitectura visual.
- UX/UI.
- Diseño responsive.
- Jerarquía de información.
- Componentes reutilizables.
- Estados de interacción.
- Navegación entre pantallas.

NO diseñes todavía código ni backend.
Primero quiero establecer una arquitectura visual clara y consistente.

==================================================
1. IDENTIDAD VISUAL
==================================================

Marca:
KEWEE MASCOTAS

Color principal:
#7AAC55

Este color corresponde al verde Kiwi que utilizaremos como color principal de la marca.

Logo:
Utiliza el logo y los recursos gráficos que adjunto como referencia visual oficial de la marca.

El logo contiene:
- La palabra "Kewee"  con una tipografía orgánica, redondeada y amigable.
- El texto secundario "mascotas".
- Una ilustración de un oso perezoso/personaje Kiwi.
- Una personalidad visual cálida, amigable y relacionada con mascotas.

IMPORTANTE:
No reemplaces la personalidad del logo por un diseño corporativo genérico.
La interfaz debe sentirse como una extensión natural de la identidad del logo.

Paleta visual sugerida:
- Verde principal: #7AAC55
- Verde oscuro para contraste
- Crema/beige cálido inspirado en el logo
- Gris oscuro para textos
- Blanco para fondos
- Tonos suaves y naturales como colores secundarios

La interfaz debe sentirse:
- Moderna
- Limpia
- Cálida
- Alegre
- Profesional
- Confiable
- Cercana
- Pet-friendly

NO quiero un diseño infantil.
Debe ser una marca profesional de e-commerce, pero con personalidad y pequeños detalles divertidos.

==================================================
2. IDIOMA
==================================================

TODO el e-commerce debe estar en ESPAÑOL.

No utilizar textos de interfaz en inglés.

Ejemplos:

"Buscar productos"

"Agregar al carrito"

"Comprar ahora"

"Ver productos"

"Seleccionar peso"

"Cantidad"

"Subtotal"

"Total"

"Continuar comprando"

"Finalizar compra"

"Productos más vendidos"

"Promociones"

"Perros"

"Gatos"

"Marcas"

"Nosotros"

"Contacto"

"Pedidos"

"Inventario"

etc.

La interfaz administrativa también debe estar completamente en español.

==================================================
3. PERSONALIDAD DE LA INTERFAZ
==================================================

Quiero que los botones y cards tengan expresiones llamativas y agradables para los clientes.

Ejemplos de tono:

"¡Lo quiero!"

"Comprar ahora"

"Agregar al carrito"

"Consentir a mi mascota"

"Ver producto"

"Descubrir más"

"Quiero este"

"Ver promociones"

Utilizar este tono de forma estratégica, sin convertir toda la interfaz en algo infantil.

Los botones principales deben ser visualmente atractivos y tener buena jerarquía.

Las cards de productos deben sentirse modernas, apetecibles y fáciles de comprar.

==================================================
4. WHATSAPP
==================================================

Debe existir un botón flotante de WhatsApp visible en la tienda.

MUY IMPORTANTE:

NO debe tener un mensaje como:
"¿Necesitas ayuda?"
"¿En qué podemos ayudarte?"

Debe ser únicamente un botón flotante de WhatsApp, limpio y discreto.

WhatsApp tendrá un papel importante en el negocio.

Existirá una modalidad especial de compra:

"Contraentrega en Medellín"

Los pedidos contraentrega se gestionarán ÚNICAMENTE mediante WhatsApp.

La página debe comunicar claramente esta modalidad.

==================================================
5. MAPA GENERAL DE PANTALLAS
==================================================

Diseña el siguiente sistema de pantallas:

------------------------------------------
TIENDA PÚBLICA
------------------------------------------

1. Inicio / Home
2. Catálogo general
3. Categoría
4. Resultados de búsqueda
5. Página de marca
6. Página individual de producto
7. Carrito
8. Checkout
9. Confirmación de pedido
10. Página de promociones
11. Página de nosotros
12. Página de contacto

------------------------------------------
FLUJOS ESPECIALES
------------------------------------------

13. Flujo de pedido contraentrega por WhatsApp
14. Estado de pedido

------------------------------------------
ADMINISTRACIÓN
------------------------------------------

15. Login administrador
16. Dashboard administrativo
17. Gestión de productos
18. Crear producto
19. Editar producto
20. Gestión de categorías
21. Gestión de marcas
22. Gestión de pedidos
23. Crear pedido manual
24. Detalle de pedido
25. Gestión de promociones
26. Configuración

No es necesario crear una pantalla independiente para cada pequeña variante de estado si puede resolverse mediante componentes y estados visuales.

==================================================
6. PANTALLA HOME
==================================================

La Home debe ser la principal experiencia de venta.

Estructura:

HEADER
- Logo
- Nombre de la marca
- Buscador central
- Icono de WhatsApp
- Icono de carrito
- Indicador de cantidad de productos
- Valor total del carrito

El header debe ser DELGADO.
No quiero un header excesivamente alto.

Debajo:

BARRA DE NAVEGACIÓN

Opciones:

Perros
Gatos
Accesorios
Servicios
Promociones

Puede utilizar menús desplegables cuando corresponda.

------------------------------------------

HERO / SLIDER PRINCIPAL

Slider visual de promociones y marcas recomendadas.

Cada slide puede contener:

- Imagen grande
- Título
- Subtítulo
- CTA
- Marca/producto/categoría relacionada

Ejemplo:

"Todo lo que tu mascota necesita"

"Descubre nuestras marcas favoritas"

CTA:
"Comprar ahora"

Debe ser visualmente impactante.

------------------------------------------

SECCIÓN PERROS + GATOS

Dos imágenes grandes lado a lado.

Bloque 1:
Cuidado de perros.

Mensaje relacionado con bienestar y cuidado.

CTA:
"Comprar para perros"

Bloque 2:
Importancia del juego para gatos.

CTA:
"Comprar para gatos"

En mobile deben convertirse en bloques verticales.

------------------------------------------

PRODUCTOS MÁS VENDIDOS

Título:

"Los favoritos de nuestros peludos"

Crear un carrusel horizontal.

Las cards deben ser ligeramente alargadas y modernas.

Cada card debe mostrar:

- Imagen del producto
- Marca
- Nombre
- Precio
- Precio anterior si existe
- Descuento
- Selector de variante
- Disponibilidad
- Botón de compra

Ejemplo:

Royal Canin Medium Adult

Peso:
4 lb
10 lb
14 lb
25 lb

La card debe permitir seleccionar una variante.

Debe existir interacción de carrusel mediante drag and drop

------------------------------------------

BANNER PROMOCIONAL

Crear espacio para un banner promocional grande.

proporciona una imagen generica teniendo en cuenta que La imagen definitiva será proporcionada posteriormente por el propietario de la tienda.

Diseñar el espacio para que pueda utilizarse como:

- Banner promocional
- Campaña
- Oferta
- Temporada

------------------------------------------

NOSOTROS

Sección visual de presentación de Kewee Mascotas.

Debe incluir:

- Imagen
- Título
- Descripción
- Valores
- CTA

La comunicación debe transmitir:

confianza + cercanía + amor por los animales + servicio.

------------------------------------------

MARCAS

Grid de logos de marcas.

Ejemplo:

Royal Canin
Pro Plan
Hill's
KONG
Zee.Dog
etc.

Los logos deben funcionar como botones.

Al hacer clic en una marca:

/marca/[marca]

y mostrar sus productos disponibles.

------------------------------------------

CTA FINAL

Crear una sección final antes del footer:

"Todo lo que tu mascota necesita, en un solo lugar."

CTA:
"Explorar productos"

También puede incluir CTA de WhatsApp.

------------------------------------------

FOOTER

Incluir:

Kewee Mascotas

Tienda virtual

Contacto

Teléfonos

WhatsApp

Correo

Horarios

Perros

Gatos

Marcas

Promociones

Nosotros

Políticas

Términos y condiciones

Información de envíos

Y destacar:

"Contraentrega disponible en Medellín"

"Pedidos contraentrega únicamente por WhatsApp."

==================================================
7. CATÁLOGO
==================================================

Diseñar pantalla:

/productos

Debe tener:

- Breadcrumb
- Título
- Descripción
- Cantidad de productos
- Filtros
- Ordenamiento
- Grid de productos

Filtros:

- Categoría
- Marca
- Precio
- Disponibilidad
- Promociones
- Tipo de producto

Desktop:
Sidebar de filtros.

Mobile:
Botón "Filtrar productos".

Las cards deben mantener el mismo diseño utilizado en Home.

==================================================
8. CATEGORÍA
==================================================

Diseñar una página reutilizable para:

/categoria/[slug]

Ejemplos:

Perros
Gatos
Alimentos
Juguetes
Accesorios

Debe mostrar:

- Banner de categoría
- Título
- Descripción
- Subcategorías
- Productos
- Filtros
- Ordenamiento

==================================================
9. BÚSQUEDA
==================================================

Diseñar:

/buscar

Debe mostrar:

"Resultados para: Royal Canin"

Mostrar:

- Cantidad de resultados
- Filtros
- Ordenamiento
- Cards

Si no existen resultados:

"¡Ups! No encontramos lo que buscas."

Y CTA:

"Explorar productos"

==================================================
10. PÁGINA DE MARCA
==================================================

Diseñar:

/marca/[slug]

Debe mostrar:

- Logo de marca
- Nombre
- Descripción
- Banner opcional
- Productos disponibles de esa marca

==================================================
11. PRODUCTO
==================================================

Diseñar:

/productos/[slug]

Esta pantalla es MUY IMPORTANTE.

Debe incluir:

- Breadcrumb
- Galería de imágenes
- Imagen principal
- Miniaturas
- Marca
- Nombre
- Precio
- Precio anterior
- Descuento
- Disponibilidad

VARIANTES

Ejemplo:

Royal Canin Medium Adult

Peso:

[4 lb]
[10 lb]
[14 lb]
[25 lb]

La selección de variante debe ser muy clara.

Cada variante puede tener:

- Precio diferente
- SKU diferente
- Inventario diferente

Luego:

Cantidad

[-] [1] [+]

CTA principal:

"Agregar al carrito"

CTA secundario:

"Comprar ahora"

Información adicional:

- Descripción
- Características
- Beneficios
- Ingredientes cuando corresponda
- Información de uso
- Información de envío

Agregar sección:

"También puede gustarle"

con productos relacionados.

Mostrar botón flotante de WhatsApp.

==================================================
12. MODELO DE PRODUCTOS
==================================================

IMPORTANTE PARA EL DISEÑO:

Un producto puede tener múltiples variantes.

NO crear un producto separado para cada peso.

Ejemplo:

Producto:
Royal Canin Medium Adult

Variantes:
4 lb
10 lb
14 lb
25 lb

El diseño debe representar correctamente esta lógica.

También debe poder soportar otros tipos de variantes:

- Talla
- Color
- Sabor
- Presentación
- Cantidad

==================================================
13. CARRITO
==================================================

Diseñar:

/carrito

Mostrar:

- Imagen
- Productos
- Variantes
- Precio
- Cantidad
- Subtotal
- Eliminar

Resumen:

Subtotal
Descuento
Envío
Total

Botones:

"Seguir comprando"

"Finalizar compra"

Y una alternativa:

"Comprar por WhatsApp"

==================================================
14. CHECKOUT
==================================================

Diseñar un checkout limpio, simple y confiable.

IMPORTANTE:

Los clientes NO necesitan crear una cuenta.

El checkout debe permitir comprar como invitado.

Campos:

Nombre
Apellido
Teléfono
Correo electrónico

Dirección:

Departamento
Ciudad
Barrio
Dirección
Complemento

Resumen del pedido.

Método de entrega.

Método de pago:

"Pago online"

"Contraentrega en Medellín"

Pero la opción contraentrega NO debe procesarse como pago online.

Debe indicar:

"Los pedidos contraentrega en Medellín se gestionan exclusivamente por WhatsApp."

CTA:

"Continuar con Mercado Pago"

Para compra online.

Y:

"Pedir por WhatsApp"

Para contraentrega.

==================================================
15. FLUJO WHATSAPP
==================================================

Diseñar visualmente el flujo de:

Contraentrega en Medellín.

El usuario selecciona:

"Contraentrega en Medellín"

La interfaz explica:

"Realiza tu pedido por WhatsApp y confirma los detalles con nuestro equipo."

Mostrar resumen:

Producto
Variante
Cantidad
Total estimado

CTA:

"Continuar en WhatsApp"

El botón debe generar posteriormente un mensaje contextual con la información del pedido.

==================================================
16. CONFIRMACIÓN DE PEDIDO
==================================================

Diseñar pantalla de éxito:

"¡Pedido recibido!"

Número de pedido.

Resumen.

Estado:

"Estamos preparando tu pedido."

Si fue pago online:
mostrar confirmación del pago.

Si fue WhatsApp:
mostrar:

"Tu solicitud fue enviada por WhatsApp. Nuestro equipo confirmará tu pedido."

==================================================
17. NOSOTROS
==================================================

Diseñar página:

/nosotros

Debe ser emocional y visual.

Incluir:

- Historia
- Quiénes somos
- Nuestra filosofía
- Compromiso con las mascotas
- Imágenes

Debe sentirse humana y cercana.

==================================================
18. CONTACTO
==================================================

Diseñar:

/contacto

Mostrar:

WhatsApp
Teléfonos
Correo
Horarios
Información de atención

CTA principal:

"Hablar por WhatsApp"

==================================================
19. ADMINISTRACIÓN
==================================================

Diseñar una interfaz administrativa independiente del e-commerce público.

Debe ser mucho más funcional y sencilla.

No necesita tener el mismo nivel visual de marketing de la tienda.

Debe ser:

- Limpia
- Profesional
- Rápida
- Fácil de utilizar
- Clara

Todo en español.

==================================================
20. LOGIN ADMINISTRADOR
==================================================

Pantalla:

/admin/login

Campos:

Correo
Contraseña

CTA:

"Iniciar sesión"

Diseño minimalista utilizando la identidad de Kewee Mascotas.

==================================================
21. DASHBOARD
==================================================

Diseñar:

/admin/dashboard

Mostrar:

Ventas del período
Pedidos
Pedidos pendientes
Productos vendidos
Inventario bajo
Productos agotados

También mostrar:

Ventas por canal:

Tienda online
WhatsApp

Y pedidos por método:

Mercado Pago
Contraentrega
Otros

==================================================
22. PRODUCTOS ADMIN
==================================================

Diseñar:

/admin/productos

Tabla/listado con:

Imagen
Producto
Marca
Categoría
Variantes
Precio
Inventario
Estado
Acciones

Acciones:

Editar
Desactivar
Eliminar

CTA:

"+ Crear producto"

==================================================
23. CREAR PRODUCTO
==================================================

Diseñar formulario:

Nombre
Marca
Categoría
Descripción corta
Descripción completa
Imágenes

Luego:

VARIANTES

Permitir agregar múltiples variantes.

Ejemplo:

Peso:
4 lb

SKU:
RC-MED-4

Precio:
$XX.XXX

Inventario:
XX

Agregar variante.

También:

Precio anterior
Descuento
Producto destacado
Más vendido
Estado

CTA:

"Guardar producto"

==================================================
24. EDITAR PRODUCTO
==================================================

Misma estructura que crear producto.

Debe permitir editar:

- Información
- Imágenes
- Variantes
- Precios
- Inventario
- Descuentos
- Estado

==================================================
25. CATEGORÍAS
==================================================

Diseñar:

/admin/categorias

Permitir:

Crear
Editar
Desactivar
Ordenar

Mostrar:

Nombre
Categoría padre
Cantidad de productos
Estado

==================================================
26. MARCAS
==================================================

Diseñar:

/admin/marcas

Permitir:

Crear marca
Subir logo
Editar
Desactivar

Mostrar:

Logo
Nombre
Productos asociados
Estado

==================================================
27. PEDIDOS
==================================================

Diseñar:

/admin/pedidos

Esta pantalla es MUY IMPORTANTE.

Mostrar tabla:

Número
Cliente
Fecha
Canal
Método de pago
Total
Estado
Acciones

CANAL:

Tienda online
WhatsApp

MÉTODO DE PAGO:

Mercado Pago
Contraentrega
Otro

Estados:

Pendiente
Confirmado
Preparando
Enviado
Entregado
Cancelado

Agregar filtros por:

- Fecha
- Canal
- Estado
- Método de pago

==================================================
28. CREAR PEDIDO MANUAL
==================================================

Diseñar:

/admin/pedidos/nuevo

El administrador debe poder crear manualmente un pedido.

Esto es MUY IMPORTANTE.

El administrador debe poder:

Seleccionar cliente existente o crear nuevo.

Agregar productos.

Seleccionar variante.

Definir cantidad.

Agregar productos adicionales.

Aplicar descuento.

Elegir tipo de descuento:

Porcentaje
Valor fijo

Ejemplo:

Subtotal:
$100.000

Descuento:
10%

Descuento:
$10.000

Total:
$90.000

Debe quedar registrado en el pedido.

==================================================
29. CANAL DE VENTA
==================================================

Al crear manualmente un pedido, debe existir:

"Canal de venta"

Opciones:

Tienda online
WhatsApp
Venta manual

Para un pedido vendido por WhatsApp:

Canal:
WhatsApp

Esto permite registrar que la venta fue gestionada directamente por WhatsApp.

==================================================
30. DESCUENTOS EN PEDIDOS WHATSAPP
==================================================

El administrador debe poder registrar descuentos otorgados manualmente.

Ejemplo:

Producto:
$100.000

Descuento:
10%

Motivo:
"Descuento acordado por WhatsApp"

Total:
$90.000

El descuento debe quedar visible en el detalle del pedido y en el registro administrativo.

==================================================
31. DETALLE DE PEDIDO
==================================================

Diseñar:

/admin/pedidos/[id]

Mostrar:

Número de pedido
Fecha
Cliente
Teléfono
Dirección

Canal:

WhatsApp

Método de pago:

Contraentrega

Productos
Variantes
Cantidades
Precio unitario
Subtotal

Descuento
Motivo del descuento

Total

Estado del pedido.


==================================================
32. PROMOCIONES
==================================================

Diseñar:

/admin/promociones

Permitir crear:

- Descuento por producto
- Descuento por categoría
- Descuento por marca
- Código promocional
- Fecha de inicio
- Fecha final
- Estado

==================================================
33. CONFIGURACIÓN
==================================================

Diseñar:

/admin/configuracion

Opciones:

Información de la tienda
Teléfonos
WhatsApp
Correo
Dirección
Horarios
Configuración de envíos
Configuración de contraentrega
Configuración general

==================================================
34. COMPONENTES REUTILIZABLES
==================================================

Crear un sistema visual coherente.

Componentes principales:

Header
Barra de navegación
Buscador
Carrito
Botón WhatsApp
Botones primarios
Botones secundarios
Cards de producto
Cards de categoría
Cards de marca
Carruseles
Badges
Selectores de variantes
Selector de cantidad
Breadcrumbs
Filtros
Modal
Toast/notificaciones
Footer
Tablas administrativas
Formularios
Estados
Paginación

==================================================
35. DISEÑO RESPONSIVE
==================================================

Diseñar pensando primero en mobile.

Debe funcionar perfectamente en:

Mobile
Tablet
Desktop

En mobile:

- Header compacto
- Navegación adaptada
- Carruseles táctiles
- Cards adaptadas
- Checkout sencillo
- Botón WhatsApp flotante
- Menú desplegable

No simplemente reduzcas el diseño desktop.

La experiencia mobile debe ser diseñada específicamente.

==================================================
36. ACCESIBILIDAD
==================================================

Utilizar:

- Contraste adecuado
- Tipografías legibles
- Botones suficientemente grandes
- Estados hover/focus
- Jerarquía visual clara
- Labels claros
- Iconos acompañados de texto cuando sea necesario

==================================================
37. DISEÑO DE CARDS DE PRODUCTO
==================================================

Las cards deben ser uno de los elementos más atractivos de la tienda.

Deben transmitir:

- Calidad
- Confianza
- Deseabilidad
- Facilidad de compra

Mostrar claramente:

Imagen
Marca
Nombre
Precio
Precio anterior
Descuento
Variante
Disponibilidad

Utilizar pequeños elementos visuales como:

"Más vendido"

"Oferta"

"Nuevo"

"Favorito"

cuando corresponda.

==================================================
38. EXPERIENCIA GENERAL
==================================================

La tienda debe sentirse inspirada conceptualmente en grandes e-commerce de mascotas como Kanu (https://kanu.pet/) y Laika (https://laika.com.co/), pero NO debe copiar su diseño.

Tomar como referencia:

- Organización
- Claridad
- Experiencia de compra
- Jerarquía
- Categorías
- Presentación de productos

Pero crear una identidad propia para Kewee Mascotas.

La marca debe sentirse:

"Una tienda de mascotas colombiana moderna, cercana y alegre."

==================================================
39. REGLAS IMPORTANTES
==================================================

1. Todo en español.

2. Color principal #7AAC55.

3. Utilizar el logo proporcionado como referencia principal.

4. Mantener la identidad visual del personaje Kiwi.

5. Header delgado.

6. Botón flotante de WhatsApp únicamente con el icono/botón, SIN texto adicional.

7. Clientes NO necesitan registrarse para comprar.

8. Los productos deben soportar variantes.

9. Un producto puede tener múltiples pesos/tallas/colores/etc.

10. El inventario pertenece a cada variante.

11. Contraentrega en Medellín se gestiona exclusivamente mediante WhatsApp.

12. WhatsApp debe ser un canal de venta.

13. El administrador debe poder crear pedidos manualmente.

14. El administrador debe poder registrar ventas realizadas por WhatsApp.

15. El administrador debe poder aplicar descuentos manuales.

16. El administrador debe poder registrar el motivo del descuento.

17. La interfaz administrativa debe estar completamente en español.

18. El diseño debe ser mobile-first.

19. No crear una interfaz infantil.

20. Mantener un equilibrio entre profesionalismo, calidez y personalidad.

==================================================
40. OBJETIVO FINAL
==================================================

Quiero que Stitch genere un SISTEMA DE DISEÑO Y MAPA VISUAL COMPLETO para kewee Mascotas.

La prioridad es:

1. Arquitectura clara.
2. UX de e-commerce.
3. Identidad visual.
4. Conversión.
5. Facilidad de navegación.
6. Mobile-first.
7. Componentes reutilizables.
8. Coherencia entre tienda y administración.

La tienda debe verse lista para convertirse posteriormente en un e-commerce real construido con Next.js + Supabase + Mercado Pago + WhatsApp.