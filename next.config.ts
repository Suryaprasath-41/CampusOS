import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Remove sandbox-specific allowedDevOrigins for deployment
  // Add your own domain if needed
  allowedDevOrigins: [
    'http://localhost:3000',
  ],
};

export default nextConfig;
