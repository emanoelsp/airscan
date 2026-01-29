"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/controllers/authcontroller";
import networkController, { NetworkTopology, Asset } from "@/lib/controllers/networkcontroller";
// AJUSTE: Adicionados ícones para os status de anomalia
import { ArrowLeft, Cpu, Activity, Zap, Gauge, Clock, Loader2, Siren, CheckCircle2 } from "lucide-react";
import * as AccountAlerts from "@/components/allerts/accountsallert";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

// --- INTERFACES ---

// AJUSTE: Interface para os dados da API com IA
interface RealTimeDataAI {
  pressao: number;
  is_anomaly: boolean;
  mse: number;
  threshold: number;
  lastUpdate: string;
}

// FIX: Define a local type that extends the imported Asset interface.
type AssetWithPressure = Asset & {
  maxPressure?: number;
};

// NOVO: Tipo para o status do consumo
type ConsumptionStatus = 'normal' | 'anomaly' | 'risk';


// --- COMPONENTES ---

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

// NOVO: Componente para exibir o status do consumo com base na anomalia
function ConsumptionStatusDisplay({ status }: { status: ConsumptionStatus }) {
  const statusConfig = {
    normal: {
      text: "Consumo Normal",
      icon: CheckCircle2,
      colorClasses: "bg-green-500/10 text-green-400",
      iconColor: "text-green-400",
    },
    anomaly: {
      text: "Alerta: Anomalia de consumo detectada",
      icon: Siren,
      colorClasses: "bg-orange-500/10 text-orange-400",
      iconColor: "text-orange-400",
    },
    risk: {
      text: "Alerta: Risco operacional detectado",
      icon: Siren,
      colorClasses: "bg-red-500/10 text-red-400 animate-pulse",
      iconColor: "text-red-400",
    },
  };

  const { text, icon: Icon, colorClasses, iconColor } = statusConfig[status];

  return (
    <div className={`flex justify-between items-center p-3 rounded-lg ${colorClasses}`}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <span>Status do Consumo</span>
      </div>
      <p className="font-semibold text-right">{text}</p>
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
  // AJUSTE: Tipo de estado atualizado para a nova interface
  const [realTimeData, setRealTimeData] = useState<RealTimeDataAI | null>(null);
  const [loading, setLoading] = useState(true);

  // NOVO: Estados para controlar a lógica de anomalia
  const [consumptionStatus, setConsumptionStatus] = useState<ConsumptionStatus>('normal');
  const [anomalyStartTime, setAnomalyStartTime] = useState<number | null>(null);


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
        } catch {
          AccountAlerts.showError("Falha ao carregar dados da rede.");
        } finally {
          setLoading(false);
        }
      };
      loadNetwork();
    }
  }, [networkId]);

  useEffect(() => {
    // AJUSTE: Resetar todos os estados ao trocar de ativo
    setRealTimeData(null);
    setConsumptionStatus('normal');
    setAnomalyStartTime(null);

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
        
        // AJUSTE: Lógica para processar a nova resposta da API
        const data = await response.json();
        
        if (data && typeof data.pressao !== 'undefined' && typeof data.is_anomaly !== 'undefined') {
            setRealTimeData({
              pressao: parseFloat(data.pressao),
              is_anomaly: data.is_anomaly,
              mse: data.mse,
              threshold: data.threshold,
              lastUpdate: new Date().toLocaleTimeString('pt-BR'),
            });

            // Marca o ativo como online na topologia e no painel
            setSelectedAsset(prev => prev ? { ...prev, status: 'online' } : prev);
            setNetwork(prev => prev ? ({
              ...prev,
              assets: prev.assets.map(a =>
                a.id === selectedAsset.id ? { ...a, status: 'online' } : a
              ),
            }) : prev);

            // NOVO: Lógica para definir o status do consumo
            if (data.is_anomaly) {
              const now = Date.now();
              // Se é a primeira vez que a anomalia é detectada, marca o tempo
              const startTime = anomalyStartTime ?? now;
              if (!anomalyStartTime) {
                setAnomalyStartTime(startTime);
              }
              // Verifica se a anomalia persiste por mais de 2 minutos (120000 ms)
              if (now - startTime >= 120000) {
                setConsumptionStatus('risk');
              } else {
                setConsumptionStatus('anomaly');
              }
            } else {
              // Se não há anomalia, reseta o status e o timer
              setConsumptionStatus('normal');
              setAnomalyStartTime(null);
            }

        } else {
            console.error("Resposta da API inválida.", data);
            setRealTimeData(prev => ({ ...(prev || { pressao: 0, is_anomaly: false, mse: 0, threshold: 0 }), lastUpdate: "Dado inválido" })); 
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        // Marca o ativo como offline / aguardando dados da API
        setSelectedAsset(prev => prev ? { ...prev, status: 'offline' } : prev);
        setNetwork(prev => prev ? ({
          ...prev,
          assets: prev.assets.map(a =>
            a.id === selectedAsset.id ? { ...a, status: 'offline' } : a
          ),
        }) : prev);
        setRealTimeData(prev => ({
          ...(prev || { pressao: 0, is_anomaly: false, mse: 0, threshold: 0 }),
          lastUpdate: "Aguardando dados da API",
        })); 
      }
    };

    fetchRealTimeData();
    const interval = setInterval(fetchRealTimeData, 5000); // Busca a cada 5 segundos
    return () => clearInterval(interval);
  }, [selectedAsset, anomalyStartTime]); // Adiciona anomalyStartTime como dependência

  /**
   * Monitoramento leve de todos os ativos com API na rede para exibir status online/offline
   * na visão de topologia, independente do ativo selecionado.
   */
  useEffect(() => {
    if (!network) return;

    const assetsWithApi = network.assets.filter(
      (asset) => asset.type === "compressor" && asset.apiUrl
    );

    if (assetsWithApi.length === 0) return;

    let isCancelled = false;

    const updateAssetsStatus = async () => {
      await Promise.all(
        assetsWithApi.map(async (asset) => {
          const apiUrl = (asset.apiUrl || "").trim();
          if (!apiUrl) return;

          return fetch(apiUrl, {
            headers: { "ngrok-skip-browser-warning": "true" },
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`API retornou ${response.status}`);
              }

              if (isCancelled) return;
              // Resposta OK -> ativo online
              setNetwork((prev) =>
                prev
                  ? {
                      ...prev,
                      assets: prev.assets.map((a) =>
                        a.id === asset.id ? { ...a, status: "online" } : a
                      ),
                    }
                  : prev
              );
            })
            .catch(() => {
              if (isCancelled) return;
              // Erro de fetch -> considera offline / aguardando dados da API
              setNetwork((prev) =>
                prev
                  ? {
                      ...prev,
                      assets: prev.assets.map((a) =>
                        a.id === asset.id ? { ...a, status: "offline" } : a
                      ),
                    }
                  : prev
              );
            });
        })
      );
    };

    // Atualiza imediatamente (somente na carga / mudança da rede)
    updateAssetsStatus();
    return () => {
      isCancelled = true;
    };
  }, [network]);

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
        <h2 className="text-xl font-bold text-red-400">Rede Não Encontrada</h2>
        <p className="text-slate-300 mt-2">A rede que você está procurando não existe ou foi removida.</p>
        <Link href="/system/admin/network" className="mt-6 flex items-center text-blue-400 hover:text-blue-300 font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para a Lista de Redes
        </Link>
      </main>
    );
  }
  
  // AJUSTE: usa 'pressao' ao invés de 'pressure'
  const gaugeData = [{ name: 'Pressure', value: realTimeData?.pressao || 0, fill: '#3b82f6' }];

  // Contadores de equipamentos online/offline baseados no status já ajustado pela API
  const onlineCount = network.assets.filter((a) => a.status === "online").length;
  const offlineCount = network.assets.length - onlineCount;

  return (
    <main className="relative min-h-screen bg-slate-900 text-white px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-blue-600/20 rounded-full blur-3xl -z-0" aria-hidden="true" />
        <div className="relative z-10 max-w-7xl mx-auto">
            <div className="mb-8">
                <Link href="/system/admin/network" className="flex items-center text-blue-400 hover:text-blue-300 mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para Lista de Redes
                </Link>
                <h1 className="text-3xl font-bold text-slate-100">{network.name}</h1>
                <p className="text-slate-300">{network.clientCompanyName} - {network.clientContactName}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-300">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    {onlineCount} online
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1 text-sm text-red-300">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    {offlineCount} offline
                  </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Topology View */}
                <div className="lg:col-span-2 bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 min-h-[500px] lg:min-h-[600px]">
                    <h2 className="text-xl font-semibold text-slate-100 mb-4">Topologia da Rede</h2>
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
                            selectedAsset.status === 'online' ? 'bg-green-500/10 text-green-400' : 
                            selectedAsset.status === 'warning' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                            <div className={`w-3 h-3 rounded-full ${
                                selectedAsset.status === 'online' ? 'bg-green-400' :
                                selectedAsset.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                            }`}></div>
                            Status: {selectedAsset.status.charAt(0).toUpperCase() + selectedAsset.status.slice(1)}
                        </div>

                        {selectedAsset.type === 'compressor' && (
                        <div className="pt-4 border-t border-white/10">
                            <h4 className="font-semibold text-slate-200 mb-3">Dados em Tempo Real</h4>
                            {realTimeData ? (
                            <div className="space-y-3">
                                {/* NOVO: Componente de status de consumo */}
                                <ConsumptionStatusDisplay status={consumptionStatus} />
                                
                                <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg">
                                    <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                                        <Gauge className="w-5 h-5 text-blue-400"/>
                                        <span>Pressão Atual</span>
                                    </div>
                                    {/* AJUSTE: usa 'pressao' */}
                                    <p className="font-bold text-lg text-blue-400">{realTimeData.pressao.toFixed(2)} <span className="text-sm font-normal text-slate-400">bar</span></p>
                                </div>
                                <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg">
                                    <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                                        <Clock className="w-5 h-5 text-slate-400"/>
                                        <span>Última Atualização</span>
                                    </div>
                                    <p className="font-semibold text-slate-200">{realTimeData.lastUpdate}</p>
                                </div>
                                {/* GAUGE */}
                                <div className="pt-4 border-t border-white/10">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <RadialBarChart innerRadius="70%" outerRadius="100%" data={gaugeData} startAngle={180} endAngle={0} barSize={25}>
                                            <PolarAngleAxis type="number" domain={[0, (selectedAsset as AssetWithPressure)?.maxPressure || 10]} angleAxisId={0} tick={false} />
                                            <RadialBar background dataKey="value" angleAxisId={0} />
                                            {/* AJUSTE: usa 'pressao' */}
                                            <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" className="fill-white text-3xl font-bold">{realTimeData.pressao.toFixed(2)}</text>
                                            <text x="50%" y="70%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-400 text-sm">bar</text>
                                        </RadialBarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            ) : (
                                <p className="text-sm text-slate-400 text-center py-4">Aguardando dados da API...</p>
                            )}
                        </div>
                        )}
                    </div>
                    ) : (
                        <p className="text-center text-slate-400 py-8">Selecione um ativo no mapa para ver os detalhes.</p>
                    )}
                </div>
            </div>
        </div>
    </main>
  )
}