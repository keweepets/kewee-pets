/**
 * PRUEBA TEMPORAL (FASE 6 · RESEND · PASO 4)
 *
 * Envía un correo de prueba usando enviarCorreo() de lib/resend/servicio.ts.
 * El destinatario se configura con RESEND_TEST_EMAIL en .env.local y la API
 * key con RESEND_API_KEY. Ni la API key ni el destinatario se exponen al
 * cliente: solo se leen en servidor desde variables de entorno.
 *
 * Uso: pnpm run prueba:resend
 */

import { fileURLToPath } from "node:url";
import path from "node:path";
import { enviarCorreo } from "./lib/resend/servicio.js";

const raiz = path.dirname(fileURLToPath(import.meta.url));
try {
  process.loadEnvFile(path.join(raiz, ".env.local"));
} catch (e) {
  console.error("[prueba:resend] No se pudo cargar .env.local:", e);
  process.exit(1);
}

async function main(): Promise<void> {
  const to = process.env.RESEND_TEST_EMAIL;
  if (!to) {
    console.error(
      "[prueba:resend] Falta RESEND_TEST_EMAIL en .env.local. " +
        "Agrega, por ejemplo: RESEND_TEST_EMAIL=tu@correo.com"
    );
    process.exit(1);
  }
  if (!process.env.RESEND_API_KEY) {
    console.error(
      "[prueba:resend] Falta RESEND_API_KEY en .env.local."
    );
    process.exit(1);
  }

  const resultado = await enviarCorreo({
    to,
    subject: "Keweepets · prueba Resend",
    html:
      "<h1>Hola 👋</h1>" +
      "<p>Este es un correo de prueba enviado desde el servicio de Resend " +
      "de Keweepets (Fase 6).</p>" +
      "<p>Si lo estás viendo, la integración funciona.</p>",
  });

  if (resultado.ok) {
    console.log(`[prueba:resend] OK · id=${resultado.id} · to=${to}`);
  } else {
    console.error(`[prueba:resend] ERROR · ${resultado.error}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("[prueba:resend] ERROR inesperado:", e);
  process.exit(1);
});
