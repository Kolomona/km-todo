import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    const port = process.env.PORT || '3000';
    const baseUrl = process.env.PLAYWRIGHT_TEST === 'true' 
      ? `http://127.0.0.1.nip.io:${port}` 
      : `http://localhost:${port}`;
    
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: baseUrl,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
