"use client";

import { useState } from "react";
import {
  Search,
  Clock,
  CornerUpRight, // Ícone para 'Responder'
  Inbox,
} from "lucide-react";

// --- DADOS MOCKADOS E FUNÇÕES AUXILIARES ---

const mockMessages = [
  {
    id: "msg001",
    senderName: "Ana Clara",
    senderEmail: "ana.clara@cliente.com",
    subject: "Dúvida sobre o plano Pro",
    message: "Olá, equipe AIRscan. Gostaria de saber mais detalhes sobre os sensores adicionais do plano Pro. Quantos estão inclusos e qual o custo para adicionar mais?",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
    status: "new",
  },
  {
    id: "msg002",
    senderName: "Bruno Costa",
    senderEmail: "bruno.costa@industria-bc.com",
    subject: "Solicitação de Orçamento",
    message: "Prezados, temos uma planta com 12 compressores e gostaríamos de um orçamento detalhado para a instalação do sistema de monitoramento de vocês. Aguardo contato.",
    timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000), // 22 horas atrás
    status: "new",
  },
  {
    id: "msg003",
    senderName: "Carlos Eduardo",
    senderEmail: "c.eduardo@mecanica-precisao.com.br",
    subject: "Problema ao acessar o dashboard",
    message: "Não estou conseguindo visualizar os dados do compressor 3 no dashboard desde ontem. Podem verificar o que está acontecendo? Obrigado.",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
    status: "read",
  },
    {
    id: "msg004",
    senderName: "Fernanda Lima",
    senderEmail: "fernanda.l@textil-inovadora.net",
    subject: "Feedback sobre a plataforma",
    message: "Gostaria de parabenizar pelo sistema! A detecção de vazamentos nos ajudou a economizar bastante no último mês. Uma sugestão seria ter relatórios em PDF.",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás
    status: "read",
  },
];

// Função simples para formatar o tempo relativo
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " anos atrás";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " meses atrás";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " dias atrás";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " horas atrás";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutos atrás";
  return "agora mesmo";
}

// --- PÁGINA DE MENSAGENS DE CONTATO ---
export default function ContactMessagesPage() {
  const [messages, setMessages] = useState(mockMessages);

  const handleReplyClick = (messageId: string) => {
    // Em um app real, isso abriria um modal de resposta
    // ou navegaria para uma página de composição de e-mail.
    alert(`Preparando para responder a mensagem ID: ${messageId}`);
    
    // Opcional: Marcar a mensagem como lida ao clicar em responder
    setMessages(
      messages.map((msg) =>
        msg.id === messageId ? { ...msg, status: "read" } : msg
      )
    );
  };

  return (
    <main className="relative min-h-screen bg-slate-900 text-white px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
      {/* Efeito de iluminação de fundo */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-blue-600/20 rounded-full blur-3xl -z-0"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Cabeçalho e Ações */}
        <div className="md:flex md:items-center md:justify-between mb-12">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight inline-flex items-center gap-3">
              <Inbox className="h-8 w-8" />
              Caixa de Entrada
            </h1>
            <p className="mt-2 text-lg text-slate-300">
              Visualize e responda as mensagens enviadas pelo formulário de contato.
            </p>
          </div>
          <div className="mt-6 flex md:mt-0 md:ml-4">
            <div className="relative w-full max-w-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="block w-full rounded-md border-0 bg-slate-800/50 py-2.5 pl-10 text-white shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-yellow-400 sm:text-sm"
                placeholder="Pesquisar mensagens..."
              />
            </div>
          </div>
        </div>

        {/* Lista de Mensagens */}
        <div className="bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
          <ul role="list" className="divide-y divide-white/10">
            {messages.map((msg) => (
              <li
                key={msg.id}
                className={`p-6 transition-colors hover:bg-slate-800/50 flex flex-col md:flex-row gap-4 border-l-4 ${
                  msg.status === 'new' ? 'border-blue-400' : 'border-transparent'
                }`}
              >
                <div className="flex-grow">
                  {/* Informações do Remetente e Tempo */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <p className="text-base font-semibold text-white">{msg.senderName}</p>
                      <a href={`mailto:${msg.senderEmail}`} className="text-sm text-slate-400 hover:text-yellow-400 transition-colors truncate">
                        {msg.senderEmail}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock className="h-4 w-4" />
                      <span>{formatTimeAgo(msg.timestamp)}</span>
                    </div>
                  </div>

                  {/* Assunto e Preview da Mensagem */}
                  <div className="mt-4">
                    <p className="font-semibold text-slate-100">{msg.subject}</p>
                    <p className="mt-1 text-slate-300 text-sm line-clamp-2">
                      {msg.message}
                    </p>
                  </div>
                </div>
                
                {/* Botão de Ação */}
                <div className="flex-shrink-0 flex items-center justify-end md:justify-center">
                  <button
                    onClick={() => handleReplyClick(msg.id)}
                    type="button"
                    className="inline-flex items-center gap-x-2 rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-600 transition-colors"
                  >
                    <CornerUpRight className="h-4 w-4" />
                    Responder
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}