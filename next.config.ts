import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/produto',
        destination: '/pages/product',
      },
      {
        source: '/recursos',
        destination: '/pages/resources',
      },
      {
        source: '/empresa',
        destination: '/pages/about',
      },
      {
        source: '/entrar',
        destination: '/pages/login',
      },
      {
        source: '/comecar',
        destination: '/pages/startnow',
      },
      {
        source: '/login',
        destination: '/pages/login',
      },

    ];
  },
};

export default nextConfig;