import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // 2. Bỏ qua lỗi ESLint khi build
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ["@uploadthing/mime-types"],
} as any; 

export default nextConfig;