import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.PLAYWRIGHT_TEST === 'true' 
              ? 'http://127.0.0.1.nip.io:3000' 
              : 'http://localhost:3000',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
