"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/controllers/authcontroller"
import networkController, { NetworkTopology, Asset } from "@/lib/controllers/networkcontroller"
import { ArrowLeft, Cpu, Activity, Zap, Gauge, Clock, Loader2, Share2 } from "lucide-react"
import * as AccountAlerts from "@/components/allerts/accountsallert"
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'
import { db } from "@/lib/model/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

// --- CONSTANTES ---
const REALTIME_UPDATE_INTERVAL_MS = 5000;

// --- INTERFACES ---
interface RealTimeMetrics {
  pressure: number;
  lastUpdate: string;
}

// --- SUB-COMPONENTES ---

function AssetNode({ asset, selectedAsset, onSelect }: { asset: Asset, selectedAsset: Asset | null, onSelect: (asset: Asset) => void }) {
  const getAssetIcon = (type: string) => {
    switch (type) {
      case "compressor": return Cpu;
      case "sensor": return Activity;
      case "distributor": return Zap;
      default: return Activity;
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return { border: "border-green-400", text: "text-green-400" };
      case "warning": return { border: "border-yellow-400", text: "text-yellow-400" };
      case "offline": return { border: "border-red-400", text: "text-red-400" };
      default: return { border: "border-slate-500", text: "text-slate-500" };
    }
  };

  const Icon = getAssetIcon(asset.type);
  const colors = getStatusColor(asset.status);

  return (
    <div
      className="absolute cursor-pointer transition-transform hover:scale-110 flex flex-col items-center group"
      style={{ left: `${asset.x}px`, top: `${asset.y}px` }}
      onClick={() => onSelect(asset)}
    >
      <div className={`w-16 h-16 rounded-full border-4 bg-slate-800 shadow-lg flex items-center justify-center ${colors.border} ${selectedAsset?.id === asset.id ? 'ring-4 ring-blue-500' : ''}`}>
        <Icon className={`w-8 h-8 ${colors.text}`} />
      </div>
      <p className="text-xs text-center mt-2 font-medium text-slate-300 w-24 truncate group-hover:text-blue-400">{asset.name}</p>
    </div>
  );
}

// --- PÁGINA PRINCIPAL ---
export default function ClientTopologyPage() {
  const { account, loading: authLoading } = useAuth();
  
  const [network, setNetwork] = useState<NetworkTopology | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [realTimeData, setRealTimeData] = useState<RealTimeMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Efeito para carregar os dados da rede do cliente
  useEffect(() => {
    if (authLoading || !account) return;

    const loadClientNetwork = async () => {
      try {
        const networksRef = collection(db, "airscan_networks");
        const q = query(networksRef, where("clientId", "==", account.id), where("status", "==", "active"));
        const networkSnapshot = await getDocs(q);

        if (networkSnapshot.empty) {
          setNetwork(null); 
          return;
        }

        const clientNetwork = networkSnapshot.docs[0];
        const topologyData = await networkController.getNetworkTopology(clientNetwork.id);
        
        setNetwork(topologyData);
        if (topologyData?.assets && topologyData.assets.length > 0) {
          setSelectedAsset(topologyData.assets[0]);
        }
      } catch (error) {
        console.error("Erro ao carregar dados da rede do cliente:", error);
        AccountAlerts.showError("Falha ao carregar os dados da sua rede.");
      } finally {
        setLoading(false);
      }
    };
    
    loadClientNetwork();
  }, [account, authLoading]);


  // Efeito para buscar dados da API em tempo real
  useEffect(() => {
    setRealTimeData(null);
    if (!selectedAsset || selectedAsset.type !== 'compressor' || !selectedAsset.apiUrl) {
        return;
    }

    const apiUrl = selectedAsset.apiUrl;

    const fetchRealTimeData = async () => {
      try {
        const response = await fetch(apiUrl, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        if (!response.ok) throw new Error(`API retornou ${response.status}`);
        const data = await response.json();
        
        if (data && typeof data.nova_pressao !== 'undefined') {
            const pressureValue = parseFloat(data.nova_pressao);
            setRealTimeData({
              pressure: pressureValue,
              lastUpdate: new Date().toLocaleTimeString('pt-BR'),
            });
        } else {
            console.error("Resposta da API inválida.", data);
        }
      } catch (error) {
        console.error("Erro ao buscar dados da API:", error);
      }
    };

    fetchRealTimeData();
    const interval = setInterval(fetchRealTimeData, REALTIME_UPDATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [selectedAsset]);

  if (authLoading || loading) {
    return (
      <main className="relative min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-yellow-400" />
      </main>
    );
  }

  if (!network) {
    return (
       <main className="relative min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center text-center p-4">
        <Share2 className="w-16 h-16 text-slate-600 mb-4" />
        <h2 className="text-xl font-bold text-slate-300">Nenhuma Rede Ativa Encontrada</h2>
        <p className="text-slate-400 mt-2">Parece que você ainda não tem uma rede de monitoramento ativa.</p>
        <Link href="/system/client/dashboard" className="mt-6 flex items-center text-blue-400 hover:text-blue-300 font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o Dashboard
        </Link>
      </main>
    );
  }
  
  const gaugeData = [{ name: 'Pressure', value: realTimeData?.pressure || 0, fill: '#3b82f6' }];

  return (
    <main className="relative min-h-screen bg-slate-900 text-white px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-blue-600/20 rounded-full blur-3xl -z-0" aria-hidden="true" />
        <div className="relative z-10 max-w-7xl mx-auto">
            <div className="mb-8">
                <Link href="/system/client/dashboard" className="flex items-center text-blue-400 hover:text-blue-300 mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para o Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-slate-100">{network.name}</h1>
                <p className="text-slate-300">Topologia da sua rede de monitoramento.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Topology View */}
                <div className="lg:col-span-2 bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 min-h-[500px] lg:min-h-[600px]">
                    <h2 className="text-xl font-semibold text-slate-100 mb-4">Mapa da Rede</h2>
                    <div className="relative bg-slate-900/50 rounded-lg w-full h-[400px] lg:h-[500px] overflow-auto border border-white/10">
                        {network.assets.map(asset => (
                            <AssetNode key={asset.id} asset={asset} selectedAsset={selectedAsset} onSelect={setSelectedAsset} />
                        ))}
                    </div>
                </div>

                {/* Asset Details Panel */}
                <div className="bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold text-slate-100 mb-4">Detalhes do Ativo</h2>
                    {selectedAsset ? (
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-bold text-lg text-slate-100">{selectedAsset.name}</h3>
                            <p className="text-sm text-slate-400 capitalize">{selectedAsset.type} - {selectedAsset.model || 'N/A'}</p>
                        </div>
                        <div className={`p-3 rounded-lg flex items-center gap-2 text-sm font-medium ${
                            selectedAsset.status === 'online' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                            <div className={`w-3 h-3 rounded-full ${
                                selectedAsset.status === 'online' ? 'bg-green-400' : 'bg-red-400'
                            }`}></div>
                            Status: {selectedAsset.status.charAt(0).toUpperCase() + selectedAsset.status.slice(1)}
                        </div>

                        {selectedAsset.type === 'compressor' && (
                        <div className="pt-4 border-t border-white/10">
                            <h4 className="font-semibold text-slate-200 mb-3">Dados em Tempo Real</h4>
                            {realTimeData ? (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg">
                                    <div className="flex items-center gap-2 text-sm text-slate-300 font-medium"><Gauge className="w-5 h-5 text-blue-400"/><span>Pressão Atual</span></div>
                                    <p className="font-bold text-lg text-blue-400">{realTimeData.pressure.toFixed(2)} <span className="text-sm font-normal text-slate-400">bar</span></p>
                                </div>
                                <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg">
                                    <div className="flex items-center gap-2 text-sm text-slate-300 font-medium"><Clock className="w-5 h-5 text-slate-400"/><span>Última Atualização</span></div>
                                    <p className="font-semibold text-slate-200">{realTimeData.lastUpdate}</p>
                                </div>
                                <div className="pt-4 border-t border-white/10">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <RadialBarChart innerRadius="70%" outerRadius="100%" data={gaugeData} startAngle={180} endAngle={0} barSize={25}>
                                            <RadialBar background dataKey="value" angleAxisId={0} />
                                            <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" className="fill-white text-3xl font-bold">{realTimeData.pressure.toFixed(2)}</text>
                                            <text x="50%" y="70%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-400 text-sm">bar</text>
                                        </RadialBarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            ) : (<p className="text-sm text-slate-400 text-center py-4">Aguardando dados da API...</p>)}
                        </div>
                        )}
                    </div>
                    ) : (<p className="text-center text-slate-400 py-8">Selecione um ativo no mapa para ver os detalhes.</p>)}
                </div>
            </div>
        </div>
    </main>
  )
}