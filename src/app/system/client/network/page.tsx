"use client"

import Link from "next/link"
// 1. Importando o tipo 'ElementType' do React.
import { ElementType } from "react";
import { Share2, Server, AlertTriangle, Ticket, ArrowRight } from "lucide-react"
import { useAuth } from "@/lib/controllers/authcontroller"

// --- INTERFACES E TIPOS ---

// 2. Criando uma interface dedicada para as propriedades do ActionCard.
interface ActionCardProps {
  href: string;
  // 3. Substituindo 'any' por 'ElementType' para uma tipagem segura.
  icon: ElementType;
  title: string;
  description: string;
  // 4. Usando uma união de tipos para garantir que apenas cores válidas sejam usadas.
  color: "blue" | "purple" | "yellow" | "orange";
}


// --- SUB-COMPONENTES ---

// Card para as ações principais
function ActionCard({ href, icon: Icon, title, description, color }: ActionCardProps) {
  const colorClasses = {
    blue: "bg-blue-500/10 group-hover:bg-blue-500/20 text-blue-400",
    purple: "bg-purple-500/10 group-hover:bg-purple-500/20 text-purple-400",
    yellow: "bg-yellow-500/10 group-hover:bg-yellow-500/20 text-yellow-400",
    orange: "bg-orange-500/10 group-hover:bg-orange-500/20 text-orange-400",
  };
  const arrowColorClasses = {
    blue: "text-blue-400 group-hover:text-blue-300",
    purple: "text-purple-400 group-hover:text-purple-300",
    yellow: "text-yellow-400 group-hover:text-yellow-300",
    orange: "text-orange-400 group-hover:text-orange-300",
  };

  return (
    <Link href={href} className="group block bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transition-all hover:border-white/20 hover:scale-[1.02] flex flex-col h-full">
      <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-colors ${colorClasses[color]}`}>
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-semibold text-slate-100 mb-2">{title}</h3>
      <p className="text-slate-400 text-sm mb-4 flex-grow">{description}</p>
      <div className={`font-semibold flex items-center gap-2 transition-colors mt-auto ${arrowColorClasses[color]}`}>
        Acessar <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  );
}

// --- PÁGINA PRINCIPAL ---
export default function ClientNetworkPage() {
    const { account } = useAuth();

    return (
        <main className="relative min-h-screen bg-slate-900 text-white px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-blue-600/20 rounded-full blur-3xl -z-0" aria-hidden="true" />
            <div className="relative z-10 max-w-7xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100">Minha Rede</h1>
                    <p className="text-slate-300 mt-2 text-lg">
                        {account?.companyName || 'Sua empresa'} - Resumo e acesso rápido às ferramentas de monitoramento.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <ActionCard 
                        href="/system/client/network/view-network" 
                        icon={Share2} 
                        title="Topologia da Rede" 
                        description="Visualize o mapa completo de sua rede de ar comprimido e o status de cada equipamento." 
                        color="blue"
                    />
                    <ActionCard 
                        href="/system/client/assets" 
                        icon={Server} 
                        title="Listar Equipamentos" 
                        description="Acesse a lista detalhada de todos os seus ativos monitorados, verifique status e acesse seus dashboards." 
                        color="purple"
                    />
                    <ActionCard 
                        href="/client/alerts/panel" 
                        icon={AlertTriangle} 
                        title="Painel de Alertas" 
                        description="Confira todos os alertas gerados pelo sistema, desde avisos de manutenção a eventos críticos." 
                        color="yellow"
                    />
                    <ActionCard 
                        href="/system/client/tickets/create-ticket" 
                        icon={Ticket} 
                        title="Abrir Chamado" 
                        description="Precisa de ajuda ou suporte técnico? Abra um novo chamado diretamente por aqui." 
                        color="orange"
                    />
                </div>
            </div>
        </main>
    );
}