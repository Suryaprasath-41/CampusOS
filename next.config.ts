import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    'http://localhost:81',
    'http://21.0.3.91:3000',
    'http://21.0.3.91:81',
    'http://0.0.0.0:3000',
  ],
};

export default nextConfig;
