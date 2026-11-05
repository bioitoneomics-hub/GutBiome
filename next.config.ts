import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' http://localhost:3000 http://127.0.0.1:3000 https://*.vercel.app https://*.oneomics.io https://nipton.in https://*.nipton.in http://localhost:*",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
