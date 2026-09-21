import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Lets dev-only resources (HMR, etc.) load when the app is reached through
  // a temporary tunnel (trycloudflare.com, loca.lt) instead of localhost.
  allowedDevOrigins: ["*.trycloudflare.com", "*.loca.lt"],
};

export default nextConfig;
