/**
 * Configuración central del servicio de domicilio.
 *
 * Único lugar donde se definen las tarifas por zona y el mínimo para envío
 * gratis. Las tarifas viven aquí para que puedan ajustarse en un solo punto
 * sin tocar componentes, checkout o lógica de pedidos.
 */

/** Compra mínima (subtotal) para envío gratis en todas las zonas de cobertura. */
export const MINIMO_ENVIO_GRATIS = 199000;

export interface ZonaDomicilio {
  id: string;
  nombre: string;
  tarifa: number;
}

/** Zonas cubiertas por el servicio de domicilio y su tarifa. */
export const ZONAS_DOMICILIO: ZonaDomicilio[] = [
  { id: "medellin", nombre: "Medellín", tarifa: 11990 },
  { id: "envigado", nombre: "Envigado", tarifa: 12990 },
  { id: "itagui", nombre: "Itagüí", tarifa: 12990 },
  { id: "bello", nombre: "Bello", tarifa: 12990 },
  { id: "niquia", nombre: "Niquía", tarifa: 13990 },
  { id: "sabaneta", nombre: "Sabaneta", tarifa: 14990 },
  { id: "copacabana", nombre: "Copacabana", tarifa: 14990 },
];

/** Indica si una ciudad/zona está dentro de la cobertura configurada. */
export function esZonaDeCobertura(ciudad: string): boolean {
  return ZONAS_DOMICILIO.some((z) => z.nombre === ciudad);
}

/**
 * Tarifa de domicilio para una compra:
 * · $0 si el subtotal alcanza el mínimo de envío gratis.
 * · si no, la tarifa configurada de la zona (0 si la zona no está en
 *   cobertura; el checkout solo ofrece zonas cubiertas).
 */
export function tarifaDomicilioPara(subtotal: number, ciudad: string): number {
  if (subtotal >= MINIMO_ENVIO_GRATIS) return 0;
  const zona = ZONAS_DOMICILIO.find((z) => z.nombre === ciudad);
  return zona?.tarifa ?? 0;
}