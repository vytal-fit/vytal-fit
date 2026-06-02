import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@vytal-fit/api",
    "@vytal-fit/auth",
    "@vytal-fit/db",
    "@vytal-fit/shared",
  ],
};

export default nextConfig;
