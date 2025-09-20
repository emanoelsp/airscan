"use client"

import { useState, useEffect, ElementType } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/controllers/authcontroller";
import supportController from "@/lib/controllers/supportcontroller";
import { 
    LayoutDashboard, 
    LifeBuoy,
    FileText,
    FilePlus,
    History,
    ArrowRight, 
    Loader2 
} from "lucide-react";

// --- INTERFACES ---

interface SummaryCardProps {
    icon: ElementType;
    title: string;
    value: string | number;
    description: string;
    color: "blue" | "purple" | "green";
}

interface ActionCardProps {
    href: string;
    icon: ElementType;
    title: string;
    description: string;
}

// --- SUB-COMPONENTES ---

function SummaryCard({ icon: Icon, title, value, description, color }: SummaryCardProps) {
    const colorClasses = {
        blue: "text-blue-400 border-blue-500/30 bg-blue-500/10",
        purple: "text-purple-400 border-purple-500/30 bg-purple-500/10",
        green: "text-green-400 border-green-500/30 bg-green-500/10",
    };
    return (
        <div className={`border rounded-2xl p-6 flex flex-col ${colorClasses[color]}`}>
            <div className="flex justify-between items-start">
                <h3 className="font-semibold text-slate-200">{title}</h3>
                <Icon className="w-7 h-7" />
            </div>
            <p className="text-4xl font-bold mt-4 text-white">{value}</p>
            <p className="text-sm text-slate-400 mt-2">{description}</p>
        </div>
    );
}

function ActionCard({ href, icon: Icon, title, description }: ActionCardProps) {
    return (
        <Link href={href} className="group block bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transition-all hover:border-blue-400/50 hover:bg-slate-800/60 flex flex-col h-full">
            <div className="w-16 h-16 bg-slate-700/50 rounded-xl flex items-center justify-center mb-6 transition-colors group-hover:bg-blue-500/20 group-hover:text-blue-300">
                <Icon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-slate-100 mb-2">{title}</h3>
            <p className="text-slate-400 text-sm mb-4 flex-grow">{description}</p>
            <div className="font-semibold flex items-center gap-2 transition-colors mt-auto text-blue-400 group-hover:text-blue-300">
                Acessar <ArrowRight className="w-4 h-4" />
            </div>
        </Link>
    );
}

// --- PÁGINA PRINCIPAL ---

export default function SupportDashboardPage() {
    const { account, loading: authLoading } = useAuth();
    const [summary, setSummary] = useState({ open: 0, inProgress: 0, closed: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && account?.id) {
            const fetchTickets = async () => {
                setIsLoading(true);
                try {
                    const tickets = await supportController.getTicketsByAccountId(account.id);
                    const open = tickets.filter(t => t.status === 'open').length;
                    const inProgress = tickets.filter(t => t.status === 'in_progress').length;
                    const closed = tickets.filter(t => t.status === 'closed').length;
                    setSummary({ open, inProgress, closed });
                } catch (error) {
                    console.error("Falha ao carregar chamados:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchTickets();
        }
    }, [account, authLoading]);

    return (
        <main className="relative min-h-screen bg-slate-900 text-white px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-purple-600/20 rounded-full blur-3xl -z-0" aria-hidden="true" />
            <div className="relative z-10 max-w-7xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
                        <LayoutDashboard className="w-8 h-8"/>
                        Central de Suporte
                    </h1>
                    <p className="text-slate-300 mt-2 text-lg">
                        Abra e acompanhe seus chamados de suporte técnico.
                    </p>
                </div>
                
                {isLoading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Seção de Resumo */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <SummaryCard 
                                icon={FileText} 
                                title="Chamados Abertos" 
                                value={summary.open}
                                description="Aguardando atendimento inicial."
                                color="blue"
                            />
                             <SummaryCard 
                                icon={LifeBuoy} 
                                title="Em Andamento" 
                                value={summary.inProgress}
                                description="Nossa equipe já está trabalhando no seu caso."
                                color="purple"
                            />
                             <SummaryCard 
                                icon={History} 
                                title="Resolvidos" 
                                value={summary.closed}
                                description="Chamados já concluídos."
                                color="green"
                            />
                        </div>

                        {/* Seção de Ações Rápidas */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-200 mb-6">O que você precisa?</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ActionCard 
                                    href="/system/client/support/ticket_register"
                                    icon={FilePlus}
                                    title="Abrir Novo Chamado"
                                    description="Precisa de ajuda? Registre um novo ticket para nossa equipe de suporte."
                                />
                                <ActionCard 
                                    href="/system/client/support/ticket_view"
                                    icon={History}
                                    title="Consultar Meus Chamados"
                                    description="Acompanhe o andamento e o histórico de todos os seus tickets de suporte."
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
