import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,          // placehold.co devuelve SVG en Etapa 2
    contentDispositionType: "attachment", // buena práctica de seguridad al habilitar SVG
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Permitimos cualquier dominio HTTPS para no bloquear las imágenes reales de la Seller App
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

export default nextConfig;
