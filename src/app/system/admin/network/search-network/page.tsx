"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/controllers/authcontroller";
import networkController, { NetworkSummary } from "@/lib/controllers/networkcontroller";
import { Building2, User, Search, Wifi, WifiOff, PlusCircle, Loader2 } from "lucide-react";

// Componente para o card individual da rede com o novo layout
function NetworkCard({ network }: { network: NetworkSummary }) {
  return (
    <Link 
      href={`/system/admin/network/view-network/${network.id}`} 
      className="block bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col transition-all hover:border-white/20 hover:scale-[1.02]"
    >
      <div className="flex justify-between items-start flex-grow">
        <div>
          <h3 className="font-bold text-slate-100 transition-colors group-hover:text-blue-400">{network.name}</h3>
          <div className="flex items-center text-sm text-slate-400 mt-2">
            <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{network.clientCompanyName}</span>
          </div>
          <div className="flex items-center text-sm text-slate-400 mt-1">
            <User className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{network.clientContactName}</span>
          </div>
        </div>
        <div className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
          network.status === 'active' 
          ? 'bg-green-500/10 text-green-400'
          : 'bg-slate-400/10 text-slate-400'
        }`}>
          {network.status === 'active' ? 'Ativa' : 'Inativa'}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-white/10 flex justify-around text-center">
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

export default function NetworkListPage() {
  const router = useRouter();
  const { account, loading: authLoading } = useAuth();
  const [networks, setNetworks] = useState<NetworkSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!authLoading && account?.role !== 'admin') {
      router.push('/login');
    }
  }, [account, authLoading, router]);

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

  const filteredNetworks = useMemo(() => {
    return networks.filter(net => 
      net.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      net.clientCompanyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      net.clientContactName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [networks, searchTerm]);

  const activeNetworks = filteredNetworks.filter(n => n.status === 'active');
  const inactiveNetworks = filteredNetworks.filter(n => n.status === 'inactive');

  if (authLoading || isLoading) {
    return (
      <main className="relative min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-yellow-400" />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-slate-900 text-white px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-blue-600/20 rounded-full blur-3xl -z-0" aria-hidden="true" />
        <div className="relative z-10 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100">Redes de Monitoramento</h1>
                    <p className="text-slate-300 mt-2 text-lg">Visualize e gerencie as redes dos seus clientes.</p>
                </div>
                <Link href="/system/admin/network/create-network" className="inline-flex items-center justify-center gap-x-2 rounded-md bg-yellow-400 px-4 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-yellow-400/20 transition-all hover:scale-105 hover:bg-yellow-500">
                    <PlusCircle className="w-5 h-5" />
                    <span>Criar Nova Rede</span>
                </Link>
            </div>
          
            {/* Search Bar */}
            <div className="mb-12">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Pesquisar por rede, empresa ou contato..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="block w-full rounded-md border-0 bg-slate-800/50 py-3.5 pl-12 text-white shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-yellow-400 sm:text-sm"
                    />
                </div>
            </div>

            {/* Active Networks */}
            <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                    <Wifi className="w-6 h-6 text-green-400" />
                    <h2 className="text-2xl font-semibold text-slate-100">Redes Ativas ({activeNetworks.length})</h2>
                </div>
                {activeNetworks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeNetworks.map(net => <NetworkCard key={net.id} network={net} />)}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl">
                        <p className="text-slate-400">Nenhuma rede ativa encontrada.</p>
                    </div>
                )}
            </section>

            {/* Inactive Networks */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <WifiOff className="w-6 h-6 text-slate-500" />
                    <h2 className="text-2xl font-semibold text-slate-100">Redes Inativas ({inactiveNetworks.length})</h2>
                </div>
                {inactiveNetworks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {inactiveNetworks.map(net => <NetworkCard key={net.id} network={net} />)}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl">
                        <p className="text-slate-400">Nenhuma rede inativa encontrada.</p>
                    </div>
                )}
            </section>
        </div>
    </main>
  );
}
