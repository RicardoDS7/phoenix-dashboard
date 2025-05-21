// next.config.ts or next.config.js
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: isProd ? "/phoenix-dashboard" : "",
  assetPrefix: isProd ? "/phoenix-dashboard/" : "",
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? "/phoenix-dashboard" : "",
  },
};

export default nextConfig;
