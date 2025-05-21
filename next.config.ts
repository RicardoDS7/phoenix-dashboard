import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,

  // always expose this so you can reference it in code
  env: {
    NEXT_PUBLIC_BASE_PATH: isDev ? "" : "/phoenix-dashboard",
  },

  // only apply these in production
  ...(isDev
    ? {}
    : {
        basePath: "/phoenix-dashboard",    // ↩️ no trailing slash
        assetPrefix: "/phoenix-dashboard", // ↩️ no trailing slash
      }),
};

export default nextConfig;
