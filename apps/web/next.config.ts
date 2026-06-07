import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@geopulse/core",
    "@geopulse/database",
    "@geopulse/ai",
    "@geopulse/crawler",
  ],
};

export default nextConfig;
