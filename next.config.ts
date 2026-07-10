import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // Consider adding a Content-Security-Policy once your script/style/image
  // sources are settled; a strict CSP needs nonce wiring for Next's inline
  // scripts. See https://nextjs.org/docs/app/guides/content-security-policy
];

const nextConfig: NextConfig = {
  headers: () =>
    Promise.resolve([
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ]),
  // Allowlist hosts here if blog post frontmatter uses absolute image URLs,
  // e.g. images: { remotePatterns: [{ protocol: "https", hostname: "cdn.example.com" }] }
};

export default nextConfig;
