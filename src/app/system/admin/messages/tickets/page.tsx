"use client";

import { useState } from "react";
import {
  User,

  Mail,
  Building2,
  Search,
  Ticket,
  Wrench, // Ícone para Tratar/Manusear
  Trash2,
  ArrowLeft,
  MessageSquare,
  CheckCircle,
  ClipboardList, // Ícone para Tipo de Ticket
  Circle, // Status Aberto
  CircleDotDashed, // Status Em Tratamento
  CircleCheck, // Status Encerrado
} from "lucide-react";

// --- TIPOS E DADOS MOCKADOS ---

type TicketStatus = "open" | "in_progress" | "closed";

interface Ticket {
  id: string;
  name: string;
  email: string;
  company: string;
  ticketType: "Dúvida Técnica" | "Problema no Acesso" | "Sugestão" | "Outros";
  message: string;
  status: TicketStatus;
  timestamp: Date;
  resolution?: string; // Parecer do atendente
}

const mockTickets: Ticket[] = [
  {
    id: "tkt001",
    name: "Carlos Mendes",
    email: "carlos.m@metalurgica-sp.com.br",
    company: "Metalúrgica SP Forte",
    ticketType: "Dúvida Técnica",
    message: "O sensor do compressor 3 está mostrando uma leitura de pressão negativa. Isso é normal ou um defeito?",
    status: "open",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 horas atrás
  },
  {
    id: "tkt002",
    name: "Ana Pereira",
    email: "ana.p@plasticosul.ind.br",
    company: "Plásticos do Sul Ltda.",
    ticketType: "Problema no Acesso",
    message: "Minha senha expirou e não estou conseguindo redefini-la pelo link enviado ao meu e-mail.",
    status: "open",
    timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000), // 28 horas atrás
  },
  {
    id: "tkt003",
    name: "João Silva",
    email: "joao.s@textil-inovadora.net",
    company: "Têxtil Inovadora",
    ticketType: "Sugestão",
    message: "Seria ótimo se pudéssemos exportar os relatórios de consumo de energia em formato CSV, além do PDF.",
    status: "in_progress",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
    resolution: "A equipe de desenvolvimento foi notificada sobre a sugestão e está avaliando a viabilidade de implementação no Q4.",
  },
   {
    id: "tkt004",
    name: "Beatriz Lima",
    email: "beatriz.l@farma-rio.com",
    company: "Farma Rio Químicos",
    ticketType: "Dúvida Técnica",
    message: "Qual o procedimento para recalibrar os sensores de vazamento? O manual não está claro.",
    status: "closed",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
    resolution: "Enviado para a cliente o guia passo-a-passo para recalibração via e-mail e agendado um call de suporte para acompanhamento. Problema resolvido.",
  },
];

// --- COMPONENTES AUXILIARES REUTILIZADOS (com readOnly e defaultValue) ---

function InputField({ icon: Icon, label, defaultValue, readOnly = false }: { icon: React.ElementType, label: string, defaultValue: string, readOnly?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      <div className="relative mt-2">
        <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input type="text" defaultValue={defaultValue} readOnly={readOnly} className={`block w-full rounded-md border-0 py-3 pl-10 text-white shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 sm:text-sm ${readOnly ? "bg-slate-900/50 cursor-default" : "bg-slate-800/50"}`} />
      </div>
    </div>
  );
}

function TextareaField({ icon: Icon, label, defaultValue, readOnly = false, placeholder = "" }: { icon: React.ElementType, label: string, defaultValue: string, readOnly?: boolean, placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      <div className="relative mt-2">
        <Icon className="pointer-events-none absolute left-3 top-4 w-5 h-5 text-slate-400" />
        <textarea rows={4} defaultValue={defaultValue} readOnly={readOnly} placeholder={placeholder} className={`block w-full rounded-md border-0 py-3 pl-10 text-white shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 sm:text-sm ${readOnly ? "bg-slate-900/50 cursor-default" : "bg-slate-800/50 focus:ring-2 focus:ring-inset focus:ring-yellow-400"}`} />
      </div>
    </div>
  );
}


// --- COMPONENTE PARA LISTAS DE TICKETS ---
function TicketList({ title, tickets, onHandle, onDelete, Icon, colorClass }: { title: string, tickets: Ticket[], onHandle: (t: Ticket) => void, onDelete: (id: string) => void, Icon: React.ElementType, colorClass: string }) {
  return (
    <div>
      <h2 className={`text-xl font-semibold mb-6 flex items-center gap-3 ${colorClass}`}>
        <Icon className="h-6 w-6"/>
        {title} ({tickets.length})
      </h2>
      <ul className="space-y-4">
        {tickets.length === 0 && <li className="text-slate-500 text-sm">Nenhum ticket nesta categoria.</li>}
        {tickets.map((ticket) => (
          <li key={ticket.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 flex justify-between items-center gap-4">
            <div className="min-w-0">
              <p className="font-semibold text-white truncate">{ticket.company}</p>
              <p className="text-sm text-slate-400 truncate">{ticket.ticketType}</p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
              <button onClick={() => onHandle(ticket)} title="Tratar Ticket" className="p-2 text-slate-300 hover:text-white hover:bg-slate-600 rounded-full transition-colors">
                <Wrench className="h-4 w-4" />
              </button>
              <button onClick={() => onDelete(ticket.id)} title="Excluir Ticket" className="p-2 text-red-400 hover:text-white hover:bg-red-500/50 rounded-full transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}


// --- PÁGINA PRINCIPAL DE TICKETS ---
export default function SupportTicketsPage() {
  const [view, setView] = useState<"list" | "details">("list");
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const openTickets = tickets.filter(t => t.status === 'open');
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress');
  const closedTickets = tickets.filter(t => t.status === 'closed');
  
  const handleTreatClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setView("details");
  };

  const handleDeleteClick = (ticketId: string) => {
    if(window.confirm("Deseja realmente excluir este ticket?")) {
      setTickets(tickets.filter(t => t.id !== ticketId));
    }
  };

  const handleBackToList = () => {
    setSelectedTicket(null);
    setView("list");
  };
  
  const handleUpdateTicket = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTicket) return;

    const formData = new FormData(event.currentTarget);
    const newStatus = formData.get("status") as TicketStatus;
    const resolution = formData.get("resolution") as string;

    setTickets(tickets.map(t => 
      t.id === selectedTicket.id ? { ...t, status: newStatus, resolution: resolution } : t
    ));
    
    alert("Ticket atualizado com sucesso!");
    handleBackToList();
  }

  return (
    <main className="relative min-h-screen bg-slate-900 text-white px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-indigo-600/10 rounded-full blur-3xl -z-0" aria-hidden="true" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {view === 'list' && (
          <>
            <div className="md:flex md:items-center md:justify-between mb-12">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight inline-flex items-center gap-3">
                  <Ticket className="h-8 w-8 text-indigo-400" />
                  Painel de Suporte
                </h1>
                <p className="mt-2 text-lg text-slate-300">Gerencie os tickets de suporte dos clientes.</p>
              </div>
              <div className="mt-6 flex md:mt-0 md:ml-4">
                <div className="relative w-full max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input type="text" placeholder="Pesquisar por empresa..." className="block w-full rounded-md border-0 bg-slate-800/50 py-2.5 pl-10 text-white ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-400 sm:text-sm" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <TicketList title="Abertos" tickets={openTickets} onHandle={handleTreatClick} onDelete={handleDeleteClick} Icon={Circle} colorClass="text-blue-400"/>
              <TicketList title="Em Tratamento" tickets={inProgressTickets} onHandle={handleTreatClick} onDelete={handleDeleteClick} Icon={CircleDotDashed} colorClass="text-yellow-400"/>
              <TicketList title="Encerrados" tickets={closedTickets} onHandle={handleTreatClick} onDelete={handleDeleteClick} Icon={CircleCheck} colorClass="text-green-400"/>
            </div>
          </>
        )}
        
        {view === 'details' && selectedTicket && (
          <>
            <div className="mb-8">
              <button onClick={handleBackToList} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Voltar para o painel
              </button>
            </div>

            <form onSubmit={handleUpdateTicket} className="bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 space-y-8">
              <div className="border-b border-white/10 pb-4">
                <h1 className="text-2xl font-bold text-white">Tratando Ticket #{selectedTicket.id.slice(-4)}</h1>
                <p className="mt-1 text-slate-400">De: {selectedTicket.company}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Coluna de Informações do Ticket */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Detalhes do Cliente</h2>
                  <InputField icon={User} label="Nome do Solicitante" defaultValue={selectedTicket.name} readOnly />
                  <InputField icon={Mail} label="Email" defaultValue={selectedTicket.email} readOnly />
                  <InputField icon={Building2} label="Empresa" defaultValue={selectedTicket.company} readOnly />
                  <InputField icon={ClipboardList} label="Tipo de Ticket" defaultValue={selectedTicket.ticketType} readOnly />
                  <TextareaField icon={MessageSquare} label="Mensagem Original" defaultValue={selectedTicket.message} readOnly />
                </div>
                
                {/* Coluna de Ações do Suporte */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Ações do Suporte</h2>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-slate-300">Alterar Status</label>
                    <select id="status" name="status" defaultValue={selectedTicket.status} className="mt-2 block w-full rounded-md border-0 bg-slate-800/50 py-3 pl-3 pr-10 text-white ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-yellow-400 sm:text-sm">
                      <option value="open">Aberto</option>
                      <option value="in_progress">Em Tratamento</option>
                      <option value="closed">Encerrado</option>
                    </select>
                  </div>
                  <TextareaField icon={MessageSquare} label="Parecer Técnico / Resolução" defaultValue={selectedTicket.resolution || ''} placeholder="Descreva a solução aplicada, próximos passos ou o motivo do encerramento..." />
                  
                  <div className="pt-6 flex justify-end">
                     <button type="submit" className="flex justify-center items-center gap-2 rounded-lg bg-yellow-400 px-8 py-3 text-sm font-bold leading-6 text-slate-900 shadow-lg shadow-yellow-400/20 transition-all hover:scale-105 hover:bg-yellow-500">
                       <CheckCircle className="h-5 w-5"/>
                       Atualizar Ticket
                     </button>
                  </div>
                </div>
              </div>

            </form>
          </>
        )}
      </div>
    </main>
  );
}