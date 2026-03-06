import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Disallow embedding in iframes (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Legacy XSS filter for older browsers
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Limit referrer info sent to third parties
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restrict access to browser features we don't use
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Allow external images from any domain (OG images come from arbitrary URLs)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },

  async headers() {
    return [
      {
        // Apply to all routes (pages and API)
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
