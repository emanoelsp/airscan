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



      // URLS do sistema do visão do cliente
       {
        source: '/sistema/alertas',
        destination: '/system/client/alerts',
      },
       {
        source: '/sistema/alertas/cadastra-limites',
        destination: '/system/client/alerts/register_thresholds',
      },
       {
        source: '/sistema/alertas/cadastra-recebimento',
        destination: '/system/client/alerts/register_receipt',
      },

    ];
  },
};

export default nextConfig;