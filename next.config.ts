import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  redirects: async () => [
    // old canonical stays /articles/show/:id; catch links to the short-lived /article/:id path
    {
      source: "/article/:id",
      destination: "/articles/show/:id",
      permanent: true,
    },
  ],
};

export default nextConfig;
