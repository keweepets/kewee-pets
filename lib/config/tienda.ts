/**
 * Configuración central de la tienda.
 * Único lugar donde se define identidad de marca y datos de contacto,
 * para que ningún componente repita valores sueltos.
 *
 * Nota de marca: el nombre siempre es KEWEE MASCOTAS. El logo usa
 * "kewee" en minúsculas por decisión visual del diseño aprobado.
 */

const numeroWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "573001234567";

export const TIENDA = {
  nombreLegal: "KEWEE MASCOTAS",
  logoPrincipal: "kewee",
  logoSecundario: "mascotas",
  urlWhatsApp: `https://wa.me/${numeroWhatsApp}`,
  email: "hola@keweetienda.com",
  telefonoVisible: "+57 300 123 4567",
  ubicacion: "Medellín, Antioquia, Colombia",
  horario: ["Lun–Sáb: 8am–6pm", "Dom: 10am–3pm"],
} as const;

/** Rutas públicas del e-commerce (arquitectura aprobada). */
export const RUTAS = {
  inicio: "/",
  catalogo: "/catalogo",
  producto: (slug: string) => `/producto/${slug}`,
  catalogoCategoria: (categoria: string) => `/catalogo?categoria=${categoria}`,
  carrito: "/carrito",
  checkout: "/checkout",
  nosotros: "/nosotros",
  contacto: "/contacto",
  admin: "/admin",
} as const;
