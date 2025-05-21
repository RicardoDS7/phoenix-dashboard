import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // this makes it a static site
  trailingSlash: true, // optional: improves compatibility with GitHub Pages
};

export default nextConfig;
