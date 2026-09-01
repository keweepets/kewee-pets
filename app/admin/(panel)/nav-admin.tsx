"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ENLACES = [
  { href: "/admin", etiqueta: "Resumen" },
  { href: "/admin/pedidos", etiqueta: "Pedidos" },
  { href: "/admin/productos", etiqueta: "Productos" },
  { href: "/admin/marcas", etiqueta: "Marcas" },
  { href: "/admin/categorias", etiqueta: "Categorías" },
  { href: "/admin/promociones", etiqueta: "Promociones" },
] as const;

const CLASE_ACTIVA =
  "rounded-full bg-green-500 px-4 py-1.5 text-sm font-bold text-white";
const CLASE_INACTIVA =
  "rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-sm font-bold text-green-700 transition-colors hover:bg-green-100";

export default function NavAdmin() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Secciones del panel"
      className="mx-auto flex w-full max-w-7xl gap-2 px-6 pb-3"
    >
      {ENLACES.map(({ href, etiqueta }) => {
        const activo =
          href === "/admin"
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link key={href} href={href} className={activo ? CLASE_ACTIVA : CLASE_INACTIVA}>
            {etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}
