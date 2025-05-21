import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   output: "export",

  // ✅ Remove basePath and assetPrefix for custom domain hosting at root
  images: {
    unoptimized: true, // Required for static export to work with <Image>
  },

  trailingSlash: true, // Optional: keeps URLs consistent with a slash
};

export default nextConfig;
