"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Share2 as Topology, Wifi, WifiOff, ArrowRight, Loader2 } from "lucide-react";
import networkController, { NetworkSummary } from "@/lib/controllers/networkcontroller";

// --- SUB-COMPONENTES ---

// Card para as ações principais
function ActionCard({ href, icon: Icon, title, description, color }: { href: string; icon: any; title: string; description: string; color: string; }) {
  const colorClasses = {
    blue: "bg-blue-500/10 group-hover:bg-blue-500/20 text-blue-400",
    orange: "bg-orange-500/10 group-hover:bg-orange-500/20 text-orange-400",
    green: "bg-green-500/10 group-hover:bg-green-500/20 text-green-400",
    purple: "bg-purple-500/10 group-hover:bg-purple-500/20 text-purple-400",
  };
  const arrowColorClasses = {
    blue: "text-blue-400 group-hover:text-blue-300",
    orange: "text-orange-400 group-hover:text-orange-300",
    green: "text-green-400 group-hover:text-green-300",
    purple: "text-purple-400 group-hover:text-purple-300",
  };
  return (
    <Link href={href} className="group block bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transition-all hover:border-white/20 hover:scale-[1.02]">
      <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-colors ${colorClasses[color as keyof typeof colorClasses]}`}>
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-semibold text-slate-100 mb-2">{title}</h3>
      <p className="text-slate-400 text-sm mb-4 h-16">{description}</p>
      <div className={`font-semibold flex items-center gap-2 transition-colors ${arrowColorClasses[color as keyof typeof arrowColorClasses]}`}>
        Acessar <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  );
}

// Card para redes existentes
function ExistingNetworkCard({ network }: { network: NetworkSummary }) {
    return (
        <Link href={`/system/admin/network/view-network/${network.id}`} className="group block bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col transition-all hover:border-white/20 hover:scale-[1.02]">
            <div className="flex justify-between items-start flex-grow">
                <h3 className="text-lg font-semibold text-slate-100 group-hover:text-blue-400">{network.name}</h3>
                <div className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                    network.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-slate-400/10 text-slate-400'
                }`}>
                    {network.status === 'active' ? 'Ativa' : 'Inativa'}
                </div>
            </div>
            <p className="text-sm text-slate-400 mt-1 mb-4">{network.clientCompanyName}</p>
            <div className="mt-auto pt-4 border-t border-white/10 flex justify-around text-center">
                <div>
                    <p className="font-bold text-lg text-green-400">{network.activeAssets}</p>
                    <p className="text-xs text-slate-400">Online</p>
                </div>
                <div>
                    <p className="font-bold text-lg text-red-400">{network.inactiveAssets}</p>
                    <p className="text-xs text-slate-400">Offline</p>
                </div>
                <div>
                    <p className="font-bold text-lg text-slate-200">{network.totalAssets}</p>
                    <p className="text-xs text-slate-400">Total</p>
                </div>
            </div>
        </Link>
    );
}


export default function NetworkPage() {
  const [networks, setNetworks] = useState<NetworkSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const summaries = await networkController.getNetworkSummaries();
        setNetworks(summaries);
      } catch (error) {
        console.error("Failed to load networks:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <main className="relative min-h-screen bg-slate-900 text-white px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-blue-600/20 rounded-full blur-3xl -z-0" aria-hidden="true" />
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100">Rede de Monitoramento</h1>
          <p className="text-slate-300 mt-2 text-lg">Gerencie suas redes e ativos conectados.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ActionCard href="/system/admin/network/create-network" icon={Plus} title="Criar Nova Rede" description="Configure uma nova rede de monitoramento do zero." color="blue"/>
          <ActionCard href="/system/admin/assets/create-asset" icon={Plus} title="Criar Novo Ativo" description="Adicione um novo equipamento a uma rede existente." color="orange"/>
          <ActionCard href="/system/admin/network/search-network" icon={Topology} title="Procurar Redes" description="Visualize a topologia completa dos seus ativos monitorados." color="green"/>
          <ActionCard href="/system/admin/assets" icon={Search} title="Procurar Ativos" description="Encontre e gerencie ativos específicos por nome ou tipo." color="purple"/>
        </div>

        <div className="mt-16">
          <div className="flex items-center gap-3 mb-6">
            <Wifi className="w-6 h-6 text-slate-300" />
            <h2 className="text-2xl font-semibold text-slate-100">Redes Existentes</h2>
          </div>
          {isLoading ? (
             <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-yellow-400"/>
             </div>
          ) : networks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {networks.map((network) => (
                <ExistingNetworkCard key={network.id} network={network} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl">
              <p className="text-slate-400">Nenhuma rede encontrada no sistema.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
