/**
 * Ayuda a construir un enlace wa.me a partir del teléfono de un cliente.
 * Uso interno del panel admin (acceso directo al cliente).
 */

/**
 * Normaliza un teléfono a formato wa.me: solo dígitos y, si es un número
 * colombiano (empieza por 3 tras quitar el prefijo opcional 57), le antepone
 * el código de país +57. Devuelve "" si no hay un número válido.
 */
export function normalizarTelefonoParaWame(telefono: string): string {
  const soloDigitos = telefono.replace(/\D/g, "");
  if (soloDigitos.length < 7 || soloDigitos.length > 13) return "";

  if (soloDigitos.startsWith("57")) return soloDigitos;
  if (soloDigitos.startsWith("3")) return `57${soloDigitos}`;
  return soloDigitos;
}

/** Devuelve el enlace wa.me para contactar al cliente, o null si es inválido. */
export function construirEnlaceWhatsAppCliente(
  telefono: string,
  texto?: string
): string | null {
  const numero = normalizarTelefonoParaWame(telefono);
  if (!numero) return null;
  const base = `https://wa.me/${numero}`;
  const mensaje = texto?.trim();
  return mensaje
    ? `${base}?text=${encodeURIComponent(mensaje)}`
    : base;
}
