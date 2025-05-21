import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // this makes it a static site
  basePath: '/phoenix-dashboard', // match the repo name if it's a project page
  trailingSlash: true, // optional: improves compatibility with GitHub Pages
};

export default nextConfig;
