import type { NextConfig } from "next";

const extraDevOrigins =
  process.env.ALLOWED_DEV_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];

const nextConfig: NextConfig = {
  // Allow phones/other PCs on your LAN to use the dev server without HMR errors
  allowedDevOrigins: ["localhost", "127.0.0.1", ...extraDevOrigins],
};

export default nextConfig;
