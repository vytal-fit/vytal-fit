import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@vytal-fit/shared", "@vytal-fit/content"],
};

export default nextConfig;
