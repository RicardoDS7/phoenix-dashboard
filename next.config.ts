// next.config.ts
import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // export to static HTML
  output: "export",
  // generate trailing slashes so folders work on GH-Pages
  trailingSlash: true,

  // in prod, prefix all routes & assets with /phoenix-dashboard
  ...(isProd
    ? {
        basePath: "/phoenix-dashboard",
        assetPrefix: "/phoenix-dashboard",
      }
    : {}),

  // expose it at runtime in case you ever need to build absolute URLs
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? "/phoenix-dashboard" : "",
  },
};

export default nextConfig;
