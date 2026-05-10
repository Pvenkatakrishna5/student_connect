import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: ".",
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ["localhost:3000"] },
  },
};

export default withPWA(nextConfig);
