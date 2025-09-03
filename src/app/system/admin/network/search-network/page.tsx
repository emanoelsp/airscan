"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/controllers/authcontroller"
import networkController, { NetworkSummary } from "@/lib/controllers/networkcontroller"
import { Building2, User, Search, Wifi, WifiOff, PlusCircle } from "lucide-react"

// Component for individual network card
function NetworkCard({ network }: { network: NetworkSummary }) {
  return (
    <Link href={`/system/admin/network/view-network/${network.id}`} className="block bg-white p-5 rounded-lg border shadow-sm hover:shadow-md hover:border-blue-500 transition-all group">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-gray-800 group-hover:text-blue-600">{network.name}</h3>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Building2 className="w-4 h-4 mr-2" />
            <span>{network.clientCompanyName}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <User className="w-4 h-4 mr-2" />
            <span>{network.clientContactName}</span>
          </div>
        </div>
        <div className={`px-2 py-1 text-xs font-semibold rounded-full ${
          network.status === 'active' 
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-800'
        }`}>
          {network.status === 'active' ? 'Ativa' : 'Inativa'}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t flex justify-around text-center">
        <div>
          <p className="font-bold text-lg text-green-600">{network.activeAssets}</p>
          <p className="text-xs text-gray-500">Ativos Online</p>
        </div>
        <div>
          <p className="font-bold text-lg text-red-600">{network.inactiveAssets}</p>
          <p className="text-xs text-gray-500">Ativos Offline</p>
        </div>
        <div>
          <p className="font-bold text-lg text-gray-800">{network.totalAssets}</p>
          <p className="text-xs text-gray-500">Total de Ativos</p>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Redes de Monitoramento</h1>
            <p className="text-gray-600 mt-1">Visualize e gerencie as redes dos seus clientes.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/system/admin/network/create-network" className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
              <PlusCircle className="w-5 h-5" />
              <span>Criar Nova Rede</span>
            </Link>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por rede, empresa ou contato..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Active Networks */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Wifi className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-800">Redes Ativas ({activeNetworks.length})</h2>
          </div>
          {activeNetworks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeNetworks.map(net => <NetworkCard key={net.id} network={net} />)}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg border">
              <p className="text-gray-500">Nenhuma rede ativa encontrada.</p>
            </div>
          )}
        </section>

        {/* Inactive Networks */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <WifiOff className="w-6 h-6 text-gray-500" />
            <h2 className="text-xl font-semibold text-gray-800">Redes Inativas ({inactiveNetworks.length})</h2>
          </div>
          {inactiveNetworks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {inactiveNetworks.map(net => <NetworkCard key={net.id} network={net} />)}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg border">
              <p className="text-gray-500">Nenhuma rede inativa encontrada.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
