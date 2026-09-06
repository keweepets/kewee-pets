import type { Metadata } from "next";
import { Nunito, Outfit } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Kewee Mascotas — Todo lo que tu mascota necesita",
    template: "%s | Kewee Mascotas",
  },
  description:
    "Tienda virtual colombiana de productos para mascotas: alimentos premium, juguetes y accesorios para perros y gatos. Contraentrega en Medellín y envíos a toda Colombia.",
  keywords: [
    "mascotas",
    "perros",
    "gatos",
    "alimentos para mascotas",
    "accesorios",
    "Medellín",
    "contraentrega",
  ],
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "Kewee Mascotas",
    title: "Kewee Mascotas — Todo lo que tu mascota necesita",
    description:
      "Alimentos premium, juguetes y accesorios seleccionados con amor. Contraentrega en Medellín.",
    url: siteUrl,
    images: [
      {
        url: `${siteUrl}/og-default.png`,
        width: 1200,
        height: 630,
        alt: "Kewee Mascotas — Tienda de productos para mascotas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kewee Mascotas — Todo lo que tu mascota necesita",
    description:
      "Alimentos premium, juguetes y accesorios seleccionados con amor. Contraentrega en Medellín.",
    images: [`${siteUrl}/og-default.png`],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${nunito.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
