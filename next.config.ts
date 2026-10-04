import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false, // Security: remove X-Powered-By header
  compress: true,
};

export default nextConfig;
