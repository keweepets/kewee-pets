import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Imágenes de presentación temporal (mock data). Al conectar Supabase Storage
    // o el CDN definitivo, ajustar/eliminar estos patrones.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
