import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || "",
};

export default nextConfig;
