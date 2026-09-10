import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Fotos de item chegam como data URL (base64) já redimensionadas no
      // navegador, mas o overhead do base64 + multipart pede folga acima do 1MB padrão.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
