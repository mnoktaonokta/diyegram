import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  extendDefaultRuntimeCaching: true,
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: ({ sameOrigin, url }) =>
          Boolean(sameOrigin && url.pathname.startsWith("/api/auth/")),
        handler: "NetworkOnly",
      },
    ],
  },
});

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-better-sqlite3",
    "better-sqlite3",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default withPWA(nextConfig);
