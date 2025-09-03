"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  Mail,
  Database,
  Network,
  AlertTriangle,
  ZapOff,
  Inbox,
  CheckCircle,
  Trash2,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/lib/controllers/authcontroller";
import solicitationsController, { Solicitation } from "@/lib/controllers/solicitationscontroller";
import * as AccountAlerts from "@/components/allerts/accountsallert";

// Componente para exibir um único card de solicitação com o novo layout
function SolicitationCard({ solicitation, onMarkReplied, onDelete }: {
  solicitation: Solicitation;
  onMarkReplied: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const isNew = solicitation.status === 'new';

  return (
    // Layout do card adaptado para o tema escuro
    <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6 flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-white">{solicitation.companyName}</h3>
          <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
            <User className="w-4 h-4" /> {solicitation.contactName}
          </p>
        </div>
        <div className={`px-2 py-1 text-xs font-semibold rounded-full ring-1 ring-inset ${
          isNew ? 'bg-blue-400/10 text-blue-400 ring-blue-400/30' : 'bg-slate-400/10 text-slate-400 ring-slate-400/30'
        }`}>
          {isNew ? 'Nova' : 'Respondida'}
        </div>
      </div>

      <div className="space-y-3 text-sm text-slate-300 border-t border-white/10 pt-4 flex-grow">
        <p className="flex items-start gap-3"><Mail className="w-4 h-4 mt-0.5 flex-shrink-0" /> <span>{solicitation.email}</span></p>
        <p className="flex items-start gap-3"><Phone className="w-4 h-4 mt-0.5 flex-shrink-0" /> <span>{solicitation.phone}</span></p>
        <p className="flex items-start gap-3"><Database className="w-4 h-4 mt-0.5 flex-shrink-0" /> <span>{solicitation.compressorCount} compressores</span></p>
        <p className="flex items-start gap-3"><Network className="w-4 h-4 mt-0.5 flex-shrink-0" /> <span>{solicitation.networkDescription}</span></p>
        <p className="flex items-start gap-3"><AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-400" /> <span>{solicitation.leakImpact}</span></p>
        <p className="flex items-start gap-3"><ZapOff className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" /> <span>{solicitation.shutdownImpact}</span></p>
      </div>
      
      <div className="text-xs text-slate-500 pt-4 mt-4 border-t border-white/10">
        <p className="flex items-center gap-2">
            <Calendar className="w-3 h-3"/> <span>{new Date(solicitation.createdAt.toDate()).toLocaleString('pt-BR')}</span>
        </p>
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
        <button
          onClick={() => onMarkReplied(solicitation.id)}
          disabled={!isNew}
          className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white px-3 py-2 text-sm font-medium rounded-md hover:bg-green-600 transition-colors disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed"
        >
          <CheckCircle className="w-4 h-4" />
          Marcar como Respondida
        </button>
        <button
          onClick={() => onDelete(solicitation.id)}
          className="p-2.5 text-red-400 hover:text-white hover:bg-red-500/50 rounded-md transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}


export default function SolicitationsPage() {
  const router = useRouter();
  const { account, loading: authLoading } = useAuth();
  const [solicitations, setSolicitations] = useState<Solicitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Proteção da Rota (sem alterações)
  useEffect(() => {
    if (!authLoading && account?.role !== 'admin') {
      router.push('/login');
    }
  }, [account, authLoading, router]);

  // Busca inicial dos dados (sem alterações)
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await solicitationsController.getSolicitations();
        setSolicitations(data);
      } catch {
        AccountAlerts.showError("Falha ao carregar solicitações.");
      } finally {
        setIsLoading(false);
      }
    };
    if (account?.role === 'admin') {
      loadData();
    }
  }, [account]);

  // Lógica de manipulação de dados (sem alterações)
  const handleMarkAsReplied = async (id: string) => {
    try {
      await solicitationsController.markAsReplied(id);
      setSolicitations(prev => prev.map(s => s.id === id ? { ...s, status: 'replied' } : s));
      AccountAlerts.showSuccess("Solicitação marcada como respondida.");
    } catch {
      AccountAlerts.showError("Erro ao atualizar o status.");
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await AccountAlerts.confirmAction({
      title: "Confirmar Exclusão?",
      text: "Esta ação não pode ser desfeita.",
      confirmButtonText: "Sim, excluir"
    });

    if (confirmed) {
      try {
        await solicitationsController.deleteSolicitation(id);
        setSolicitations(prev => prev.filter(s => s.id !== id));
        AccountAlerts.showSuccess("Solicitação excluída.");
      } catch {
        AccountAlerts.showError("Erro ao excluir solicitação.");
      }
    }
  };

  const { newSolicitations, repliedSolicitations } = useMemo(() => {
    const newS = solicitations.filter(s => s.status === 'new');
    const repliedS = solicitations.filter(s => s.status === 'replied');
    return { newSolicitations: newS, repliedSolicitations: repliedS };
  }, [solicitations]);

  if (authLoading || isLoading) {
    return (
      <main className="relative min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </main>
    );
  }

  return (
    // Layout principal adaptado para o tema escuro
    <main className="relative min-h-screen bg-slate-900 text-white px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-blue-600/20 rounded-full blur-3xl -z-0"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Solicitações de Contato</h1>
          <p className="mt-2 text-lg text-slate-300">Gerencie os pedidos de orçamento e demonstração dos clientes.</p>
        </div>

        {solicitations.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl">
             <Inbox className="w-16 h-16 mx-auto text-slate-500" />
             <h3 className="mt-4 text-lg font-medium text-white">Nenhuma solicitação encontrada</h3>
             <p className="mt-1 text-sm text-slate-400">A caixa de entrada está vazia no momento.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Novas Solicitações */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-6">Novas ({newSolicitations.length})</h2>
              {newSolicitations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {newSolicitations.map(sol => (
                    <SolicitationCard key={sol.id} solicitation={sol} onMarkReplied={handleMarkAsReplied} onDelete={handleDelete} />
                  ))}
                </div>
              ) : <p className="text-slate-400 text-sm">Não há novas solicitações.</p>}
            </section>

            {/* Respondidas */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-6">Respondidas ({repliedSolicitations.length})</h2>
              {repliedSolicitations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {repliedSolicitations.map(sol => (
                    <SolicitationCard key={sol.id} solicitation={sol} onMarkReplied={handleMarkAsReplied} onDelete={handleDelete} />
                  ))}
                </div>
              ) : <p className="text-slate-400 text-sm">Não há solicitações respondidas.</p>}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

