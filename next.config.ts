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


      // sistema de suporte
      {
        source: '/sistema/suporte',
        destination: '/system/client/support',
      },
      {
        source: '/sistema/suporte/cadastrar-chamados',
        destination: '/system/client/support/ticket_register',
      },
      {
        source: '/sistema/suporte/consultar-chamados',
        destination: '/system/client/support/ticket_view',
      },

      // sistema de alertas
      {
        source: '/sistema/alertas',
        destination: '/system/client/alerts',
      },
      {
        source: '/sistema/alertas/cadastrar-limites',
        destination: '/system/client/alerts/register_thresholds',
      },
      {
        source: '/sistema/alertas/cadastrar-recebimento',
        destination: '/system/client/alerts/register_receipt',
      },

    ];
  },
};

export default nextConfig;