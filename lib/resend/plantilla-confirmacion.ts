/**
 * Plantilla HTML del correo de confirmación de pedido (FASE 6 · RESEND).
 *
 * · Función pura: recibe PedidoConRelaciones y devuelve un string HTML listo
 *   para resend. No envía nada.
 * · Usa los mismos auxiliares que el resto del módulo de pedidos
 *   (formatPriceCOP, etiquetas de método de pago, dirección de entrega).
 * · Diseño visual aprobado: logo grande sobre fondo verde de marca (#7AAC55),
 *   título con número de pedido en verde, tarjeta destacada (número + fecha),
 *   tabla de productos espaciada con encabezado verde, tarjeta de totales con
 *   total destacado, bloques separados de pago/dirección con íconos, bloque de
 *   agradecimiento con corazón y footer verde con datos de contacto. Fondo
 *   blanco, tablas + estilos inline (compatibles Gmail/Outlook) y responsive.
 *
 * ¡OJO! Este módulo SI se conecta con crearPedido() desde lib/pedidos/acciones.ts.
 * No cambiar aquí la lógica (solo presentación).
 */

import type { PedidoConRelaciones } from "@/lib/pedidos/consultas";
import { TIENDA } from "@/lib/config/tienda";
import { formatPriceCOP } from "@/utils/formato";

const ETIQUETA_METODO_PAGO: Record<string, string> = {
  contraentrega: "Contraentrega",
  mercadopago: "Mercado Pago",
};

/** Verde de marca Pantone 16-0235 TCX. */
const VERDE = "#7AAC55";

/** Verde muy claro para fondos de tarjetas. */
const VERDE_CLARO = "#f2f9ec";

/** Verde intermedio para bordes suaves. */
const VERDE_BORDE = "#d4e8c4";

/** Logo público de la tienda (archivo estático en /public/images/IMG_1437.PNG). */
const RUTA_LOGO = "/images/IMG_1437.PNG";

/** Wordmark/logo del footer (archivo estático en /public/images/IMG_1434.PNG). */
const RUTA_LOGO_FOOTER = "/images/IMG_1434.PNG";

/**
 * URL pública de producción para resolver imágenes del correo. Se usa cuando
 * NEXT_PUBLIC_SITE_URL falta o apunta a un host local (localhost), porque esos
 * valores nunca son accesibles desde clientes de correo (Gmail/Outlook y el
 * logo aparecería roto).
 */
const URL_PUBLICA_IMAGENES = "https://kewee-pets.vercel.app";

/**
 * Base URL absoluta del sitio para resolver los logos. Usa NEXT_PUBLIC_SITE_URL
 * (mismo patrón que lib/mercadopago/preferencias.ts); si falta o es un host
 * local, se degrada a URL_PUBLICA_IMAGENES para que las imágenes se vean.
 */
function obtenerUrlBase(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (!base) return URL_PUBLICA_IMAGENES;
  if (
    /localhost/i.test(base) ||
    /^https?:\/\/(127\.0\.0\.1|0\.0\.0\.0|::1)(:\d+)?(?:\/|$)/i.test(base)
  ) {
    return URL_PUBLICA_IMAGENES;
  }
  return base;
}

function escapeHtml(valor: string): string {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function etiquetaMetodoPago(metodo: string): string {
  return ETIQUETA_METODO_PAGO[metodo] ?? metodo;
}

function formatearFechaSolo(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function construirDireccion(pedido: PedidoConRelaciones): string {
  const { direccion, barrio, ciudad, departamento } = pedido.pedido;
  const partes = [direccion];
  if (barrio) partes.push(barrio);
  partes.push(ciudad);
  if (departamento) partes.push(departamento);
  return partes.join(", ");
}

/** Construye el HTML del correo de confirmación de pedido. */
export function construirHtmlConfirmacionPedido(
  pedido: PedidoConRelaciones
): string {
  const { pedido: p, cliente, detalles } = pedido;
  const urlBase = obtenerUrlBase();
  const urlLogo = `${urlBase}${RUTA_LOGO}`;
  const urlFooterLogo = `${urlBase}${RUTA_LOGO_FOOTER}`;

  const filasProductos = detalles
    .map((d) => {
      const nombre = escapeHtml(
        d.nombre_variante ? `${d.nombre_producto} (${d.nombre_variante})` : d.nombre_producto
      );
      return `
        <tr>
          <td style="padding:18px 20px;border-bottom:1px solid #e8efe2;color:#2d2d2d;vertical-align:top;width:100%">
            <div style="font-weight:600;color:#1f2937;font-size:15px">${nombre}</div>
            <div style="font-size:13px;color:#6b7b8d;margin-top:5px">${d.cantidad} × ${formatPriceCOP(d.precio_unitario)}</div>
          </td>
          <td style="padding:18px 20px;border-bottom:1px solid #e8efe2;text-align:right;color:#1f2937;white-space:nowrap;font-size:15px;font-weight:600;vertical-align:top">
            ${formatPriceCOP(d.subtotal_linea)}
          </td>
        </tr>`;
    })
    .join("");

  const filaDescuento =
    p.descuento_total > 0
      ? `<tr><td style="padding:12px 20px;color:#2d2d2d;font-size:14px">Descuento</td>
         <td style="padding:12px 20px;text-align:right;color:#c0392b;white-space:nowrap;font-size:14px">-${formatPriceCOP(p.descuento_total)}</td></tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    /* Responsive para móvil */
    @media only screen and (max-width: 600px) {
      .contenedor { width: 100% !important; max-width: 100% !important; }
      .cuerpo { padding: 20px 16px !important; }
      .logo-header img { width: 55% !important; height: auto !important; }
      .titulo { font-size: 22px !important; }
      .cards-row td { display: block !important; width: 100% !important; }
      .cards-row table { width: 100% !important; margin-bottom: 12px !important; }
      .footer-block { padding: 20px 24px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:Arial,Helvetica,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;padding:28px 12px">
    <tr>
      <td align="center">
        <table role="presentation" width="720" cellpadding="0" cellspacing="0" class="contenedor" style="max-width:720px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,0.06)">

          <!-- ═══════════════════════════════════════════════════════════
               ENCABEZADO VERDE CON LOGO
               ═══════════════════════════════════════════════════════════ -->
          <tr>
            <td align="center" style="background-color:${VERDE};padding:16px 40px 8px 40px;border-radius:16px 16px 0 0">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" class="logo-header">
                    <img src="${urlLogo}" alt="Kewee Mascotas" width="240" style="display:block;width:240px;max-width:240px;height:auto;border:0;outline:none;text-decoration:none" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════════════════════════════════════════════════════════
               TÍTULO: PEDIDO CONFIRMADO
               ═══════════════════════════════════════════════════════════ -->
          <tr>
            <td align="center" style="padding:36px 40px 28px 40px;background-color:#ffffff">
              <div class="titulo" style="font-size:30px;font-weight:800;color:${VERDE};line-height:1.3;font-family:Arial,Helvetica,sans-serif">
                Pedido ${escapeHtml(p.numero_pedido)} confirmado
              </div>
            </td>
          </tr>

          <!-- ═══════════════════════════════════════════════════════════
               TARJETA: N° DE PEDIDO + FECHA
               ═══════════════════════════════════════════════════════════ -->
          <tr>
            <td style="padding:0 40px 28px 40px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-radius:14px;overflow:hidden;background-color:rgba(122,172,85,0.12);border:1px solid ${VERDE_BORDE}">
                <tr>
                  <td align="center" style="padding:26px 24px">
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#5a7a3c;font-weight:600">N° de pedido</div>
                    <div style="font-size:28px;font-weight:800;color:${VERDE};margin:8px 0 4px 0">${escapeHtml(p.numero_pedido)}</div>
                    <div style="font-size:14px;color:#4a6a2e">${formatearFechaSolo(p.created_at)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════════════════════════════════════════════════════════
               CUERPO: SALUDO + TABLA DE PRODUCTOS + TOTALES
               ═══════════════════════════════════════════════════════════ -->
          <tr>
            <td style="padding:4px 40px 8px 40px" class="cuerpo">
              <p style="margin:0 0 28px 0;color:#2d2d2d;font-size:17px;line-height:1.5">¡Hola, <strong>${escapeHtml(cliente.nombre)}</strong>!</p>

              <!-- Tabla de productos -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;border-radius:14px;overflow:hidden;border:1px solid ${VERDE_BORDE}">
                <thead>
                  <tr>
                    <th align="left" style="padding:16px 20px;background-color:${VERDE};border-bottom:1px solid ${VERDE};font-size:12px;text-transform:uppercase;letter-spacing:0.8px;color:#ffffff;font-weight:700">Producto</th>
                    <th align="right" style="padding:16px 20px;background-color:${VERDE};border-bottom:1px solid ${VERDE};font-size:12px;text-transform:uppercase;letter-spacing:0.8px;color:#ffffff;font-weight:700">Subtotal</th>
                  </tr>
                </thead>
                <tbody style="background-color:#ffffff">${filasProductos}</tbody>
              </table>

              <!-- Tarjeta de totales -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;margin-top:16px;border-radius:14px;overflow:hidden;border:1px solid ${VERDE_BORDE}">
                <tr>
                  <td style="padding:14px 20px;color:#2d2d2d;font-size:14px">Subtotal</td>
                  <td style="padding:14px 20px;text-align:right;color:#2d2d2d;white-space:nowrap;font-size:14px">${formatPriceCOP(p.subtotal)}</td>
                </tr>
                ${filaDescuento}
                <tr>
                  <td style="padding:14px 20px;color:#2d2d2d;font-size:14px;border-bottom:1px solid ${VERDE_BORDE}">Envío</td>
                  <td style="padding:14px 20px;text-align:right;color:#2d2d2d;white-space:nowrap;font-size:14px;border-bottom:1px solid ${VERDE_BORDE}">${p.costo_envio > 0 ? formatPriceCOP(p.costo_envio) : "Gratis"}</td>
                </tr>
                <tr>
                  <td style="padding:18px 20px;background-color:${VERDE};color:#ffffff;font-size:17px;font-weight:800">Total</td>
                  <td style="padding:18px 20px;background-color:${VERDE};text-align:right;color:#ffffff;font-size:20px;font-weight:800;white-space:nowrap">${formatPriceCOP(p.total)}</td>
                </tr>
              </table>

              <!-- Espacio -->
              <div style="height:24px"></div>

              <!-- ═══════════════════════════════════════════════════════════
                   MÉTODO DE PAGO + DIRECCIÓN DE ENTREGA (2 columnas en desktop)
                   ═══════════════════════════════════════════════════════════ -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="cards-row" style="border-collapse:separate;border-spacing:12px 0">
                <tr>
                  <!-- Método de pago -->
                  <td valign="top" style="width:50%;padding:0">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-radius:14px;overflow:hidden;background-color:${VERDE_CLARO};border:1px solid ${VERDE_BORDE}">
                      <tr>
                        <td style="padding:22px 20px">
                          <table role="presentation" cellpadding="0" cellspacing="0">
                            <tr>
                              <td valign="middle" style="padding-right:12px">
                                <div style="width:40px;height:40px;background-color:${VERDE};border-radius:50%;text-align:center;line-height:40px">
                                  <span style="color:#ffffff;font-size:18px;font-weight:bold;font-family:Arial,Helvetica,sans-serif">$</span>
                                </div>
                              </td>
                              <td valign="middle">
                                <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.2px;color:#5a7a3c;font-weight:700;margin-bottom:4px">Método de pago</div>
                                <div style="color:#1f2937;font-weight:600;font-size:15px">${etiquetaMetodoPago(p.metodo_pago)}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Dirección de entrega -->
                  <td valign="top" style="width:50%;padding:0">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-radius:14px;overflow:hidden;background-color:${VERDE_CLARO};border:1px solid ${VERDE_BORDE}">
                      <tr>
                        <td style="padding:22px 20px">
                          <table role="presentation" cellpadding="0" cellspacing="0">
                            <tr>
                              <td valign="middle" style="padding-right:12px">
                                <div style="width:40px;height:40px;background-color:${VERDE};border-radius:50%;text-align:center;line-height:40px">
                                  <span style="color:#ffffff;font-size:16px;font-weight:bold;font-family:Arial,Helvetica,sans-serif">&#9906;</span>
                                </div>
                              </td>
                              <td valign="middle">
                                <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.2px;color:#5a7a3c;font-weight:700;margin-bottom:4px">Dirección de entrega</div>
                                <div style="color:#1f2937;font-size:14px;line-height:1.5">${escapeHtml(construirDireccion(pedido))}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════════════════════════════════════════════════════════
               MENSAJE DE AGRADECIMIENTO
               ═══════════════════════════════════════════════════════════ -->
          <tr>
            <td style="padding:8px 40px 36px 40px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-radius:14px;overflow:hidden;background-color:${VERDE_CLARO};border:1px solid ${VERDE_BORDE}">
                <tr>
                  <td style="padding:28px 24px">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td valign="top" style="padding-right:14px">
                          <div style="width:44px;height:44px;background-color:${VERDE};border-radius:50%;text-align:center;line-height:44px">
                            <span style="color:#ffffff;font-size:20px;font-family:Arial,Helvetica,sans-serif">&#9825;</span>
                          </div>
                        </td>
                        <td valign="middle">
                          <div style="font-size:16px;color:#2d2d2d;line-height:1.6;font-weight:500">Gracias por confiar en nosotros para el bienestar de tu mascota. Estaremos atentos para ayudarte en lo que necesites.</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ═══════════════════════════════════════════════════════════
               FOOTER VERDE CON DATOS DE CONTACTO
               ═══════════════════════════════════════════════════════════ -->
          <tr>
            <td class="footer-block" style="background-color:${VERDE};padding:30px 40px;text-align:center;border-radius:0 0 16px 16px">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 14px">
                <tr>
                  <td width="300" height="111" align="center" valign="middle" background="${urlFooterLogo}" style="width:300px;height:111px;background-color:${VERDE};background-image:url('${urlFooterLogo}');background-repeat:no-repeat;background-position:center;background-size:contain;font-size:0;line-height:0;vertical-align:middle">&nbsp;</td>
                </tr>
              </table>
              <div style="font-size:16px;color:rgba(255,255,255,0.92);line-height:1.8">
                ${escapeHtml(TIENDA.telefonoVisible)}<br />
                ${escapeHtml(TIENDA.email)}<br />
                ${escapeHtml(TIENDA.ubicacion)}
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}