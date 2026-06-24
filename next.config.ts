import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow external image resources
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Turbopack config (Next.js 16 default)
  turbopack: {
    resolveAlias: {
      fs: { browser: "./empty-module.js" },
      path: { browser: "./empty-module.js" },
      crypto: { browser: "./empty-module.js" },
    },
  },
};

export default nextConfig;