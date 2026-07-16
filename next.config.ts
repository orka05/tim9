import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Dozvoli upload video fajlova vežbi (do 50 MB)
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
