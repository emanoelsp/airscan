"use client"

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/controllers/authcontroller";
import supportController, { SupportTicket } from "@/lib/controllers/supportcontroller";
import { 
    ArrowLeft,
    History,
    Loader2,
    Search,
    Filter,
    MessageSquare,
    User,
    Clock,
    CheckCircle,
    Settings,
    XCircle,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { format } from 'date-fns';

// --- SUB-COMPONENTES ---

function TicketItem({ ticket, onSelect, isSelected }: { ticket: SupportTicket, onSelect: () => void, isSelected: boolean }) {
    
    const statusConfig = {
        open: { text: "Aberto", icon: XCircle, color: "text-red-400 bg-red-500/10" },
        in_progress: { text: "Em Andamento", icon: Settings, color: "text-yellow-400 bg-yellow-500/10" },
        closed: { text: "Resolvido", icon: CheckCircle, color: "text-green-400 bg-green-500/10" }
    };

    const priorityConfig = {
        low: "Baixa",
        normal: "Normal",
        high: "Alta",
        critical: "Crítica"
    };

    const { text, icon: Icon, color } = statusConfig[ticket.status];

    return (
        <div className="border-b border-slate-700">
            <button onClick={onSelect} className="w-full text-left p-4 hover:bg-slate-800/50 transition-colors">
                <div className="flex justify-between items-center">
                    <p className="font-semibold text-slate-100 truncate pr-4">{ticket.subject}</p>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2 ${color}`}><Icon className="w-3 h-3"/>{text}</span>
                </div>
                <div className="flex items-center text-xs text-slate-400 mt-2 gap-4">
                    <span>#{ticket.ticketNumber}</span>
                    <span>{format(ticket.createdAt.toDate(), "dd/MM/yyyy 'às' HH:mm")}</span>
                    <span>Prioridade: {priorityConfig[ticket.priority]}</span>
                    {isSelected ? <ChevronUp className="w-4 h-4 ml-auto"/> : <ChevronDown className="w-4 h-4 ml-auto"/>}
                </div>
            </button>
            {isSelected && (
                <div className="p-4 bg-slate-900/50">
                    <h4 className="font-semibold text-slate-200 mb-2">Descrição do Problema:</h4>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap mb-4">{ticket.description}</p>
                    
                     <h4 className="font-semibold text-slate-200 mb-2">Histórico de Atualizações:</h4>
                     {ticket.updates && ticket.updates.length > 0 ? (
                        <div className="space-y-3 border-l-2 border-slate-700 pl-4">
                            {ticket.updates.map((update, index) => (
                                <div key={index} className="relative">
                                    <div className="absolute -left-[23px] top-1 w-3 h-3 bg-slate-600 rounded-full border-2 border-slate-900"></div>
                                    <p className="text-xs text-slate-400 mb-1 flex items-center gap-2">
                                        <Clock className="w-3 h-3"/> {format(update.timestamp.toDate(), "dd/MM/yyyy HH:mm")} 
                                        <User className="w-3 h-3 ml-2"/> {update.updatedBy}
                                    </p>
                                    <p className="text-sm bg-slate-800 p-3 rounded-lg">{update.comment}</p>
                                </div>
                            ))}
                        </div>
                     ) : (
                        <p className="text-sm text-slate-400">Nenhuma atualização ainda.</p>
                     )}
                </div>
            )}
        </div>
    );
}

// --- PÁGINA PRINCIPAL ---

export default function ViewTicketsPage() {
    const { account, loading: authLoading } = useAuth();
    
    const [allTickets, setAllTickets] = useState<SupportTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && account?.id) {
            const fetchTickets = async () => {
                setIsLoading(true);
                try {
                    const tickets = await supportController.getTicketsByAccountId(account.id);
                    setAllTickets(tickets);
                } catch (error) {
                    console.error("Falha ao carregar chamados:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchTickets();
        }
    }, [account, authLoading]);

    const filteredTickets = useMemo(() => {
        return allTickets
            .filter(ticket => statusFilter === 'all' || ticket.status === statusFilter)
            .filter(ticket => 
                ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ticket.ticketNumber.toString().includes(searchTerm)
            );
    }, [allTickets, searchTerm, statusFilter]);

    const toggleTicket = (ticketId: string) => {
        setSelectedTicketId(prevId => prevId === ticketId ? null : ticketId);
    };

    return (
        <main className="relative min-h-screen bg-slate-900 text-white px-4 py-16 sm:px-6 lg:px-8">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-teal-600/20 rounded-full blur-3xl -z-0" />
            <div className="relative z-10 max-w-4xl mx-auto">
                 <div className="mb-8">
                    <Link href="/system/client/support" className="flex items-center text-blue-400 hover:text-blue-300 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar para a Central de Suporte
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
                        <History className="w-8 h-8"/>
                        Meus Chamados de Suporte
                    </h1>
                    <p className="text-slate-300 mt-2">
                        Acompanhe o status e o histórico das suas solicitações.
                    </p>
                </div>
                
                <div className="bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                    {/* Filtros e Busca */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
                            <input 
                                type="text"
                                placeholder="Buscar por assunto ou nº do chamado..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 pl-10"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="w-full md:w-auto bg-slate-700/50 border border-slate-600 rounded-lg p-3 pl-10 appearance-none"
                            >
                                <option value="all">Todos os Status</option>
                                <option value="open">Abertos</option>
                                <option value="in_progress">Em Andamento</option>
                                <option value="closed">Resolvidos</option>
                            </select>
                        </div>
                    </div>

                    {/* Lista de Chamados */}
                    {isLoading ? (
                         <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin"/></div>
                    ) : (
                        <div className="border border-slate-700 rounded-lg">
                            {filteredTickets.length > 0 ? (
                                filteredTickets.map(ticket => (
                                    <TicketItem 
                                        key={ticket.id} 
                                        ticket={ticket} 
                                        onSelect={() => toggleTicket(ticket.id)}
                                        isSelected={selectedTicketId === ticket.id}
                                    />
                                ))
                            ) : (
                                <div className="text-center p-8 text-slate-400">
                                    <MessageSquare className="w-10 h-10 mx-auto mb-4"/>
                                    <p>Nenhum chamado encontrado.</p>
                                    <p className="text-sm">Tente ajustar seus filtros ou <Link href="/system/client/support/ticket_register" className="text-blue-400 hover:underline">abrir um novo chamado</Link>.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
