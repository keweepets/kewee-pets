/**
 * Plantilla HTML del correo de confirmación de pedido (FASE 6 · RESEND).
 *
 * · Función pura: recibe PedidoConRelaciones y devuelve un string HTML listo
 *   para resend. No envía nada.
 * · Usa los mismos auxiliares que el resto del módulo de pedidos
 *   (formatPriceCOP, etiquetas de método de pago, dirección de entrega).
 * · Aún no se conecta con crearPedido() ni con el checkout (pasos posteriores).
 */

import type { PedidoConRelaciones } from "@/lib/pedidos/consultas";
import { formatPriceCOP } from "@/utils/formato";

const ETIQUETA_METODO_PAGO: Record<string, string> = {
  contraentrega: "Contraentrega",
  mercadopago: "Mercado Pago",
};

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

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

  const filasProductos = detalles
    .map((d) => {
      const nombre = escapeHtml(
        d.nombre_variante ? `${d.nombre_producto} (${d.nombre_variante})` : d.nombre_producto
      );
      return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;color:#333">
            <div style="font-weight:600">${nombre}</div>
            <div style="font-size:12px;color:#888">${d.cantidad} × ${formatPriceCOP(d.precio_unitario)}</div>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;color:#333;white-space:nowrap">
            ${formatPriceCOP(d.subtotal_linea)}
          </td>
        </tr>`;
    })
    .join("");

  const filaDescuento =
    p.descuento_total > 0
      ? `<tr><td style="padding:6px 0;color:#333">Descuento</td>
         <td style="padding:6px 0;text-align:right;color:#c0392b;white-space:nowrap">-${formatPriceCOP(p.descuento_total)}</td></tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background-color:#f6f6f6;font-family:Arial,Helvetica,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f6f6;padding:24px 12px">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden">
          <tr>
            <td style="background-color:#111827;color:#ffffff;padding:24px 32px">
              <div style="font-size:20px;font-weight:700">Keweepets</div>
              <div style="font-size:12px;opacity:.75">Confirmación de pedido</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px">
              <p style="margin:0 0 16px;color:#333;font-size:16px">¡Hola, <strong>${escapeHtml(cliente.nombre)}</strong>!</p>
              <p style="margin:0 0 24px;color:#666;font-size:14px">
                Gracias por tu compra. Hemos recibido tu pedido y está en proceso.<br />
                <span style="color:#111827;font-weight:700">N° de pedido: ${escapeHtml(p.numero_pedido)}</span><br />
                <span style="color:#999;font-size:12px">${formatearFecha(p.created_at)}</span>
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px">
                <thead>
                  <tr>
                    <th align="left" style="padding:8px 0;border-bottom:2px solid #111827;font-size:12px;text-transform:uppercase;color:#888">Producto</th>
                    <th align="right" style="padding:8px 0;border-bottom:2px solid #111827;font-size:12px;text-transform:uppercase;color:#888">Subtotal</th>
                  </tr>
                </thead>
                <tbody>${filasProductos}</tbody>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;margin-top:12px">
                <tr><td style="padding:6px 0;color:#333">Subtotal</td>
                    <td style="padding:6px 0;text-align:right;color:#333;white-space:nowrap">${formatPriceCOP(p.subtotal)}</td></tr>
                ${filaDescuento}
                <tr><td style="padding:6px 0;color:#333">Envío</td>
                    <td style="padding:6px 0;text-align:right;color:#333;white-space:nowrap">${p.costo_envio > 0 ? formatPriceCOP(p.costo_envio) : "Gratis"}</td></tr>
                <tr>
                  <td style="padding:12px 0;border-top:2px solid #111827;font-size:16px;font-weight:700;color:#111827">Total</td>
                  <td style="padding:12px 0;border-top:2px solid #111827;text-align:right;font-size:18px;font-weight:700;color:#111827;white-space:nowrap">${formatPriceCOP(p.total)}</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;margin-top:24px;border:1px solid #eee;border-radius:8px;overflow:hidden">
                <tr>
                  <td style="padding:16px;color:#333">
                    <div style="font-size:12px;text-transform:uppercase;color:#888;margin-bottom:6px">Método de pago</div>
                    <div style="color:#111827">${etiquetaMetodoPago(p.metodo_pago)}</div>
                  </td>
                  <td style="padding:16px;color:#333">
                    <div style="font-size:12px;text-transform:uppercase;color:#888;margin-bottom:6px">Dirección de entrega</div>
                    <div style="color:#111827">${escapeHtml(construirDireccion(pedido))}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f6f6f6;padding:16px 32px;color:#999;font-size:12px;text-align:center">
              Keweepets · Gracias por confiar en nosotros
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
