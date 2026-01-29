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



      // ============================================
      // URLs DO SISTEMA - VISÃO CLIENTE
      // ============================================
      
      // Dashboard
      {
        source: '/painel',
        destination: '/system/client/dashboard',
      },
      
      // Rede
      {
        source: '/painel/rede',
        destination: '/system/client/network',
      },
      {
        source: '/painel/rede/topologia',
        destination: '/system/client/network/view-network',
      },
      {
        source: '/painel/rede/equipamentos',
        destination: '/system/client/assets',
      },
      
      // Análise
      {
        source: '/painel/analise',
        destination: '/system/client/analysis',
      },
      {
        source: '/painel/analise/relatorios',
        destination: '/system/client/analysis/reports',
      },
      {
        source: '/painel/analise/inteligencia-artificial',
        destination: '/system/client/analysis/ai',
      },
      
      // Suporte
      {
        source: '/painel/suporte',
        destination: '/system/client/support',
      },
      {
        source: '/painel/suporte/abrir-chamado',
        destination: '/system/client/support/ticket_register',
      },
      {
        source: '/painel/suporte/consultar-chamados',
        destination: '/system/client/support/ticket_view',
      },
      
      // Alertas
      {
        source: '/painel/alertas',
        destination: '/system/client/alerts',
      },
      {
        source: '/painel/alertas/configurar-contatos',
        destination: '/system/client/alerts',
      },
      {
        source: '/painel/alertas/configurar-limites',
        destination: '/system/client/alerts/register_thresholds',
      },
      {
        source: '/painel/alertas/cadastrar-recebimento',
        destination: '/system/client/alerts/register_receipt',
      },
      
      // Perfil
      {
        source: '/painel/perfil',
        destination: '/client/profile',
      },

      // ============================================
      // URLs DO SISTEMA - VISÃO ADMINISTRADOR
      // ============================================
      
      // Dashboard
      {
        source: '/administracao',
        destination: '/system/admin/dashboard',
      },
      
      // Rede
      {
        source: '/administracao/rede',
        destination: '/system/admin/network',
      },
      {
        source: '/administracao/rede/criar-rede',
        destination: '/system/admin/network/create-network',
      },
      {
        source: '/administracao/rede/visualizar-rede',
        destination: '/system/admin/network/search-network',
      },
      {
        source: '/administracao/rede/visualizar-rede/:id',
        destination: '/system/admin/network/view-network/:id',
      },
      
      // Equipamentos
      {
        source: '/administracao/equipamentos',
        destination: '/system/admin/assets',
      },
      {
        source: '/administracao/equipamentos/criar',
        destination: '/system/admin/assets/create-asset',
      },
      {
        source: '/administracao/equipamentos/visualizar/:id',
        destination: '/system/admin/assets/view-asset/:id',
      },
      {
        source: '/administracao/equipamentos/editar/:id',
        destination: '/system/admin/assets/edit-asset/:id',
      },
      
      // Análises
      {
        source: '/administracao/analises',
        destination: '/system/admin/analysis',
      },
      {
        source: '/administracao/analises/relatorios',
        destination: '/system/admin/analysis/reports',
      },
      {
        source: '/administracao/analises/inteligencia-artificial',
        destination: '/system/admin/analysis/ai',
      },
      
      // Suporte
      {
        source: '/administracao/suporte',
        destination: '/system/admin/messages',
      },
      {
        source: '/administracao/suporte/chamados',
        destination: '/system/admin/messages/tickets',
      },
      {
        source: '/administracao/suporte/orcamentos',
        destination: '/system/admin/messages/solicitations',
      },
      {
        source: '/administracao/suporte/mensagens',
        destination: '/system/admin/messages/contacts',
      },
      
      // Clientes
      {
        source: '/administracao/clientes',
        destination: '/system/admin/accounts',
      },
      
      // Perfil
      {
        source: '/administracao/perfil',
        destination: '/system/admin/profile',
      },

    ];
  },
};

export default nextConfig;