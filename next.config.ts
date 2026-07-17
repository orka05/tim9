import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fiksiraj koren projekta (postoji stray package-lock.json u home folderu)
  turbopack: {
    root: __dirname,
  },
  experimental: {
    serverActions: {
      // Dozvoli upload video fajlova vežbi (do 50 MB)
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
