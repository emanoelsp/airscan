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
  MessageSquare,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/controllers/authcontroller";
import solicitationsController, { Solicitation } from "@/lib/controllers/solicitationscontroller";
import * as AccountAlerts from "@/components/allerts/accountsallert";

// NOVO: Modal para responder à solicitação
function ReplyModal({ solicitation, onSave, onCancel }: {
  solicitation: Solicitation;
  onSave: (id: string, replyMessage: string) => void;
  onCancel: () => void;
}) {
  const [replyMessage, setReplyMessage] = useState(solicitation.replyMessage || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyMessage.trim()) {
      onSave(solicitation.id, replyMessage);
    } else {
      AccountAlerts.showError("A mensagem de resposta não pode estar vazia.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-slate-800 border border-white/10 rounded-xl p-8 max-w-lg w-full space-y-6">
        <div className="flex justify-between items-start">
            <div>
                <h2 className="text-xl font-bold text-white">Responder Solicitação</h2>
                <p className="text-slate-400 mt-1 text-sm">Para: {solicitation.companyName}</p>
            </div>
            <button type="button" onClick={onCancel} className="p-2 rounded-full hover:bg-slate-700 transition-colors">
              <X className="w-6 h-6 text-slate-400" />
            </button>
        </div>
        
        <div>
            <label htmlFor="replyMessage" className="block text-sm font-medium text-slate-300 mb-2">
                Sua Resposta
            </label>
            <textarea
              id="replyMessage"
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Digite sua resposta para o cliente aqui..."
              rows={6}
              className="block w-full rounded-md border-0 bg-slate-900/50 py-3 px-4 text-white shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-yellow-400"
            />
        </div>

        <div className="flex justify-end gap-x-4">
          <button type="button" onClick={onCancel} className="px-6 py-2 text-sm font-bold text-slate-300 hover:bg-slate-700 rounded-md">
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-sm font-bold bg-yellow-400 text-slate-900 rounded-md hover:bg-yellow-500"
          >
            Salvar e Marcar como Respondida
          </button>
        </div>
      </form>
    </div>
  );
}

// Componente para exibir um único card de solicitação com o novo layout
function SolicitationCard({ solicitation, onReply, onDelete }: {
  solicitation: Solicitation;
  onReply: (solicitation: Solicitation) => void; // Alterado para passar o objeto todo
  onDelete: (id: string) => void;
}) {
  const isNew = solicitation.status === 'new';

  return (
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
      
      {!isNew && solicitation.replyMessage && (
        <div className="mt-4 pt-4 border-t border-white/10 text-sm">
            <p className="font-semibold text-white mb-2">Resposta Enviada:</p>
            <p className="bg-slate-700/50 p-3 rounded-md text-slate-300 whitespace-pre-wrap">{solicitation.replyMessage}</p>
            {solicitation.repliedAt && (
                <p className="text-xs text-slate-500 mt-2">em {new Date(solicitation.repliedAt.toDate()).toLocaleString('pt-BR')}</p>
            )}
        </div>
      )}

      <div className="text-xs text-slate-500 pt-4 mt-4 border-t border-white/10">
        <p className="flex items-center gap-2">
            <Calendar className="w-3 h-3"/> <span>Recebida em: {new Date(solicitation.createdAt.toDate()).toLocaleString('pt-BR')}</span>
        </p>
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
        <button
          onClick={() => onReply(solicitation)}
          className="flex-1 flex items-center justify-center gap-2 bg-yellow-400 text-slate-900 px-3 py-2 text-sm font-bold rounded-md hover:bg-yellow-500 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          {isNew ? 'Responder' : 'Editar Resposta'}
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
  const [replyingTo, setReplyingTo] = useState<Solicitation | null>(null);

  useEffect(() => {
    if (!authLoading && account?.role !== 'admin') {
      router.push('/login');
    }
  }, [account, authLoading, router]);

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

  useEffect(() => {
    if (account?.role === 'admin') {
      loadData();
    }
  }, [account]);

  const handleSaveReply = async (id: string, message: string) => {
    try {
      await solicitationsController.replyToSolicitation(id, message);
      await loadData(); // Recarrega os dados para mostrar a resposta atualizada
      AccountAlerts.showSuccess("Resposta salva com sucesso!");
      setReplyingTo(null); // Fecha o modal
    } catch (error) {
      AccountAlerts.showError("Erro ao salvar a resposta.");
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
    <main className="relative min-h-screen bg-slate-900 text-white px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-blue-600/20 rounded-full blur-3xl -z-0"
        aria-hidden="true"
      />

      {replyingTo && (
        <ReplyModal
          solicitation={replyingTo}
          onSave={handleSaveReply}
          onCancel={() => setReplyingTo(null)}
        />
      )}

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
            <section>
              <h2 className="text-2xl font-semibold text-white mb-6">Novas ({newSolicitations.length})</h2>
              {newSolicitations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {newSolicitations.map(sol => (
                    <SolicitationCard key={sol.id} solicitation={sol} onReply={setReplyingTo} onDelete={handleDelete} />
                  ))}
                </div>
              ) : <p className="text-slate-400 text-sm">Não há novas solicitações.</p>}
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-6">Respondidas ({repliedSolicitations.length})</h2>
              {repliedSolicitations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {repliedSolicitations.map(sol => (
                    <SolicitationCard key={sol.id} solicitation={sol} onReply={setReplyingTo} onDelete={handleDelete} />
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

