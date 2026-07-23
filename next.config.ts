import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// ponytail: pragmatic CSP. script/style allow 'unsafe-inline' because Next's
// hydration + next-themes inject inline scripts and Tailwind injects inline
// styles. Upgrade path: nonce-based CSP via proxy if you ever need to drop
// 'unsafe-inline'. 'unsafe-eval' + ws: only in dev (HMR needs them).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  headers: async () => [
    { source: "/:path*", headers: securityHeaders },
  ],
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
