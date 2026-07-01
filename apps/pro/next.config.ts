import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
    ],
  },
  transpilePackages: [
    "@vytal-fit/api",
    "@vytal-fit/auth",
    "@vytal-fit/content",
    "@vytal-fit/db",
    "@vytal-fit/shared",
  ],
};

export default nextConfig;
