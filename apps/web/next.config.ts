import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Lets several dev servers run side by side (e.g. NEXT_DIST_DIR=.next-a).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
}

export default nextConfig
