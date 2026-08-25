import type { ReactNode } from "react";

import BotonFlotanteWhatsApp from "@/components/whatsapp/boton-flotante";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { ProveedorCarrito } from "@/components/carrito/proveedor-carrito";

/**
 * Layout público de la tienda: header, footer, carrito y botón WhatsApp.
 * El panel /admin tiene su propio layout (app/admin/layout.tsx) y no hereda
 * la navegación pública.
 */
export default function TiendaLayout({ children }: { children: ReactNode }) {
  return (
    <ProveedorCarrito>
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
      <BotonFlotanteWhatsApp />
    </ProveedorCarrito>
  );
}
