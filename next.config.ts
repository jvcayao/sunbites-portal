import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // MSW's CJS build requires these ESM-only packages; list them so next/jest
  // transpiles them during tests instead of failing on bare ESM syntax.
  transpilePackages: [
    "rettime",
    "until-async",
    "headers-polyfill",
    "@open-draft/deferred-promise",
  ],
  images: {
    remotePatterns: [
      // Local dev — MinIO at localhost:9000, bucket sunbites-dev
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/sunbites-dev/**",
      },
      // Production — AWS S3 (narrow to application bucket once production name is known)
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      // Production — DigitalOcean Spaces (narrow to application space once name is known)
      {
        protocol: "https",
        hostname: "*.digitaloceanspaces.com",
      },
      // Production — custom CDN / Laravel Cloud app URL
      {
        protocol: "https",
        hostname: "*.sunbites.com.ph",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
