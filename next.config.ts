import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Imágenes de productos servidas desde Supabase Storage.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rlutvhkyoqdmsvfxcyja.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
