// next.config.js
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,

  // only add these in production builds
  ...(isDev
    ? {}
    : {
        basePath: "/phoenix-dashboard",
        assetPrefix: "/phoenix-dashboard/",
      }),
};

export default nextConfig;
