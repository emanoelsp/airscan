"use client";

import {
  Inbox, // Ícone para mensagens de contato
  Package, // Ícone para solicitações de produto
  LifeBuoy, // Ícone para tickets de suporte (alternativa a 'Ticket')
  ArrowRight, // Ícone para os botões de ação
} from "lucide-react";
import React from "react"; // Importação explícita do React

// --- COMPONENTE AUXILIAR PARA OS CARTÕES DO DASHBOARD ---

interface DashboardCardProps {
  icon: React.ElementType;
  colorClass: string; // Ex: "text-blue-400"
  title: string;
  count: number;
  description: string;
  buttonText: string;
  buttonHref: string;
}

function DashboardCard({
  icon: Icon,
  colorClass,
  title,
  count,
  description,
  buttonText,
  buttonHref,
}: DashboardCardProps) {
  return (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col transition-all hover:border-white/20 hover:scale-[1.02]">
      {/* Cabeçalho do Cartão */}
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-slate-700/50">
          <Icon className={`h-6 w-6 ${colorClass}`} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-grow mt-6">
        <p className="text-3xl font-bold text-white">
          {count}
          <span className="text-base font-normal text-slate-400 ml-2">
            {count === 1 ? 'novo item' : 'novos itens'}
          </span>
        </p>
        <p className="mt-2 text-slate-300">{description}</p>
      </div>
      
      {/* Botão de Ação */}
      <div className="mt-6">
        <a
          href={buttonHref}
          className={`inline-flex items-center gap-x-2 font-semibold text-sm ${colorClass} hover:brightness-125 transition-all`}
        >
          {buttonText}
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}


// --- PÁGINA PRINCIPAL DO DASHBOARD DE MENSAGENS ---
export default function DashboardMessagesPage() {
  // Dados que viriam de uma API no futuro
  const stats = {
    contactMessages: 3,
    productRequests: 2,
    supportTickets: 5,
  };

  return (
    <main className="relative min-h-screen bg-slate-900 text-white px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
      {/* Efeito de iluminação de fundo */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-indigo-600/20 rounded-full blur-3xl -z-0"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Cabeçalho da Página */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Central de Notificações
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-300">
            Acompanhe as novas interações e demandas diretamente do seu dashboard.
          </p>
        </div>

        {/* Grid com os cartões de informação */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Cartão de Mensagens de Contato */}
          <DashboardCard
            icon={Inbox}
            colorClass="text-blue-400"
            title="Mensagens de Contato"
            count={stats.contactMessages}
            description={`Você tem ${stats.contactMessages} novas mensagens de contato aguardando resposta.`}
            buttonText="Ir para Mensagens"
            buttonHref="/messages/contact"
          />

          {/* Cartão de Solicitações de Produto */}
          <DashboardCard
            icon={Package}
            colorClass="text-yellow-400"
            title="Solicitações de Produto"
            count={stats.productRequests}
            description={`Você tem ${stats.productRequests} novas solicitações de produtos para avaliar.`}
            buttonText="Ir para Solicitações"
            buttonHref="/messages/products"
          />
          
          {/* Cartão de Tickets de Chamado */}
          <DashboardCard
            icon={LifeBuoy}
            colorClass="text-green-400"
            title="Tickets de Suporte"
            count={stats.supportTickets}
            description={`Você tem ${stats.supportTickets} novos tickets de chamado que precisam de atenção.`}
            buttonText="Ir para Tickets"
            buttonHref="/messages/support"
          />
        </div>
      </div>
    </main>
  );
}

