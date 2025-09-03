"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/controllers/authcontroller"
import networkController, { NetworkTopology, Asset } from "@/lib/controllers/networkcontroller"
import { ArrowLeft, Cpu, Activity, Zap, Gauge, Clock, ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import * as AccountAlerts from "@/components/allerts/accountsallert"

// --- INTERFACES FOR REAL-TIME DATA ---
interface RealTimeMetrics {
  pressure: number;
  lastUpdate: string;
}

interface PressureRecord {
  value: number;
  time: string;
}

function AssetNode({ asset, selectedAsset, onSelect }: { asset: Asset, selectedAsset: Asset | null, onSelect: (asset: Asset) => void }) {
  const getAssetIcon = (type: string) => {
    switch (type) {
      case "compressor": return Cpu
      case "sensor": return Activity
      case "distributor": return Zap
      default: return Activity
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return { border: "border-green-500", text: "text-green-600" }
      case "warning": return { border: "border-yellow-500", text: "text-yellow-600" }
      case "offline": return { border: "border-red-500", text: "text-red-600" }
      default: return { border: "border-gray-400", text: "text-gray-500" }
    }
  };

  const Icon = getAssetIcon(asset.type);
  const colors = getStatusColor(asset.status);

  return (
    <div
      className="absolute cursor-pointer transition-transform hover:scale-110"
      style={{ left: `${asset.x}px`, top: `${asset.y}px` }}
      onClick={() => onSelect(asset)}
    >
      <div className={`w-16 h-16 rounded-full border-4 bg-white shadow-lg flex flex-col items-center justify-center ${colors.border} ${selectedAsset?.id === asset.id ? 'ring-4 ring-blue-400' : ''}`}>
        <Icon className={`w-7 h-7 ${colors.text}`} />
      </div>
      <p className="text-xs text-center mt-2 font-medium text-gray-700 w-20 truncate">{asset.name}</p>
    </div>
  );
}

export default function ViewNetworkPage() {
  const router = useRouter();
  const params = useParams();
  const { account, loading: authLoading } = useAuth();
  
  const networkId = params.id as string;

  const [network, setNetwork] = useState<NetworkTopology | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [realTimeData, setRealTimeData] = useState<RealTimeMetrics | null>(null);
  const [minPressure, setMinPressure] = useState<PressureRecord | null>(null);
  const [maxPressure, setMaxPressure] = useState<PressureRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && account?.role !== 'admin') {
      router.push('/login');
    }
  }, [account, authLoading, router]);

  useEffect(() => {
    if (networkId) {
      const loadNetwork = async () => {
        try {
          const topologyData = await networkController.getNetworkTopology(networkId);
          setNetwork(topologyData);
          if (topologyData?.assets && topologyData.assets.length > 0) {
            setSelectedAsset(topologyData.assets[0]);
          }
        } catch { // CORREÇÃO: Removido '(error)' pois não estava sendo usado.
          AccountAlerts.showError("Falha ao carregar dados da rede.");
        } finally {
          setLoading(false);
        }
      };
      loadNetwork();
    }
  }, [networkId]);

  // Lógica de fetch de dados em tempo real, agora com registro de min/max
  useEffect(() => {
    setRealTimeData(null);
    setMinPressure(null);
    setMaxPressure(null);

    if (!selectedAsset || selectedAsset.type !== 'compressor' || !selectedAsset.apiUrl) {
        return;
    }

    const fetchRealTimeData = async () => {
      try {
        const response = await fetch(selectedAsset.apiUrl!, {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        });
        
        if (!response.ok) throw new Error(`A API retornou o status ${response.status}`);
        
        const data = await response.json();
        
        if (data && typeof data.nova_pressao !== 'undefined') {
            const pressureValue = parseFloat(data.nova_pressao);
            const currentTime = new Date();
            
            setRealTimeData({
              pressure: pressureValue,
              lastUpdate: currentTime.toLocaleTimeString('pt-BR'),
            });

            setMinPressure(prevMin => {
                if (!prevMin || pressureValue < prevMin.value) {
                    return { value: pressureValue, time: currentTime.toLocaleString('pt-BR') };
                }
                return prevMin;
            });
            
            setMaxPressure(prevMax => {
                if (!prevMax || pressureValue > prevMax.value) {
                    return { value: pressureValue, time: currentTime.toLocaleString('pt-BR') };
                }
                return prevMax;
            });

        } else {
            console.error("Resposta da API não contém o campo 'nova_pressao'.", data);
            setRealTimeData(prev => ({ ...(prev || { pressure: 0 }), lastUpdate: "Dado inválido" })); 
        }

      } catch (error) {
        console.error("Erro ao buscar ou processar dados em tempo real:", error);
        setRealTimeData(prev => ({ ...(prev || { pressure: 0 }), lastUpdate: "Falha" })); 
      }
    };

    fetchRealTimeData();
    const interval = setInterval(fetchRealTimeData, 5000);
    return () => clearInterval(interval);
  }, [selectedAsset]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!network) {
    return (
       <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-xl font-bold text-red-600">Rede Não Encontrada</h2>
        <p className="text-gray-600 mt-2">A rede que você está procurando não existe ou foi removida.</p>
        <Link href="/system/admin/network" className="mt-6 flex items-center text-blue-600 hover:text-blue-700 font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para a Lista de Redes
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/system/admin/network" className="flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Lista de Redes
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{network.name}</h1>
          <p className="text-gray-600">{network.clientCompanyName} - {network.clientContactName}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Topology View */}
          <div className="lg:col-span-2 bg-white p-4 rounded-xl border shadow-sm min-h-[500px] lg:min-h-[600px]">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Topologia da Rede</h2>
            <div className="relative bg-slate-50 rounded-lg w-full h-[400px] lg:h-[500px] overflow-auto">
              {network.assets.map(asset => (
                <AssetNode key={asset.id} asset={asset} selectedAsset={selectedAsset} onSelect={setSelectedAsset} />
              ))}
            </div>
          </div>

          {/* Asset Details Panel */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Detalhes do Ativo</h2>
            {selectedAsset ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-gray-800">{selectedAsset.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{selectedAsset.type} - {selectedAsset.model || 'N/A'}</p>
                </div>

                <div className={`p-3 rounded-lg flex items-center gap-2 text-sm font-medium ${
                    selectedAsset.status === 'online' ? 'bg-green-100 text-green-800' : 
                    selectedAsset.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>
                  <div className={`w-3 h-3 rounded-full ${
                      selectedAsset.status === 'online' ? 'bg-green-500' :
                      selectedAsset.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  Status: {selectedAsset.status.charAt(0).toUpperCase() + selectedAsset.status.slice(1)}
                </div>

                {/* Real-time data section */}
                {selectedAsset.type === 'compressor' && (
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold text-gray-800 mb-3">Dados em Tempo Real</h4>
                    {realTimeData ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                            <Gauge className="w-5 h-5 text-blue-500"/>
                            <span>Pressão Atual</span>
                          </div>
                          <p className="font-bold text-lg text-blue-600">{realTimeData.pressure.toFixed(2)} <span className="text-sm font-normal text-gray-600">bar</span></p>
                        </div>
                        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                            <Clock className="w-5 h-5 text-gray-500"/>
                            <span>Última Atualização</span>
                          </div>
                          <p className="font-semibold text-gray-800">{realTimeData.lastUpdate}</p>
                        </div>

                        {/* Mínima e Máxima Pressão */}
                        {(minPressure && maxPressure) && (
                          <div className="pt-3 border-t border-gray-200 space-y-2">
                             <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                    <ArrowUpCircle className="w-5 h-5 text-red-500"/>
                                    <span>Máxima do Dia</span>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg text-red-600">{maxPressure.value.toFixed(2)} <span className="text-sm font-normal text-gray-600">bar</span></p>
                                    <p className="text-xs text-gray-500">{maxPressure.time}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                    <ArrowDownCircle className="w-5 h-5 text-green-500"/>
                                    <span>Mínima do Dia</span>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg text-green-600">{minPressure.value.toFixed(2)} <span className="text-sm font-normal text-gray-600">bar</span></p>
                                    <p className="text-xs text-gray-500">{minPressure.time}</p>
                                </div>
                            </div>
                          </div>
                        )}

                      </div>
                    ) : (
                       <p className="text-sm text-gray-500">Aguardando dados da API...</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Selecione um ativo no mapa para ver os detalhes.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

