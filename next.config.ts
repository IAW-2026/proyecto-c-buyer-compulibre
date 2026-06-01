import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,          // placehold.co devuelve SVG en Etapa 2
    contentDispositionType: "attachment", // buena práctica de seguridad al habilitar SVG
    remotePatterns: [
      {
        // Imágenes de los mocks (Etapa 2). En Etapa 3 agregar dominio real de la Seller App.
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/products",
        permanent: false, // Usar redirección 307 temporal
      },
    ];
  },
};

export default nextConfig;
