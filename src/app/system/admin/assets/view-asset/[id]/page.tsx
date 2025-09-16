"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase/firebaseconfig";
import { collection, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";
import { 
  Eye, Pencil, Trash2, ChevronDown, Share2, HardDrive, 
  Clock, Activity, Siren, CheckCircle2 
} from "lucide-react";
import { confirmAssetDelete } from "@/components/allerts/assetsallert";
import { showSuccess, showError } from "@/components/allerts/accountsallert";
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    RadialBarChart, RadialBar, PolarAngleAxis, BarChart, Bar 
} from 'recharts';


// --- INTERFACES E TIPOS ---
interface Asset {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'maintenance';
  networkId: string;
  location: string;
  model: string;
  apiUrl: string;
  apiKey: string;
  maxPressure: number;
}

interface Network {
    id: string;
    name: string;
}

// Interface para dados da API com IA
interface ApiDataPoint {
    time: string;
    pressao: number;
    is_anomaly: boolean;
}

// Registro de picos de pressão
interface PressureRecord {
    value: number;
    time: string;
}

// Tipo para o status do consumo
type ConsumptionStatus = 'normal' | 'anomaly' | 'risk';


// --- COMPONENTE DE STATUS (REUTILIZÁVEL) ---
function ConsumptionStatusDisplay({ status }: { status: ConsumptionStatus }) {
  const statusConfig = {
    normal: {
      text: "Consumo Normal",
      icon: CheckCircle2,
      colorClasses: "bg-green-500/10 text-green-400",
      iconColor: "text-green-400",
    },
    anomaly: {
      text: "Alerta de Anomalia",
      icon: Siren,
      colorClasses: "bg-orange-500/10 text-orange-400",
      iconColor: "text-orange-400",
    },
    risk: {
      text: "Risco Operacional",
      icon: Siren,
      colorClasses: "bg-red-500/10 text-red-400 animate-pulse",
      iconColor: "text-red-400",
    },
  };

  const { text, icon: Icon, colorClasses, iconColor } = statusConfig[status];

  return (
    <div className={`p-6 rounded-2xl border border-white/10 flex items-center gap-4 ${colorClasses}`}>
      <Icon className={`w-10 h-10 ${iconColor}`}/>
      <div>
        <p className="text-slate-400 text-sm">Status do Consumo</p>
        <p className="text-2xl font-bold">{text}</p>
      </div>
    </div>
  );
}


// --- COMPONENTE PRINCIPAL DA PÁGINA ---

function ViewAssetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados dos ativos
  const [currentAsset, setCurrentAsset] = useState<Asset | null>(null);
  const [networkAssets, setNetworkAssets] = useState<Asset[]>([]);
  const [networkInfo, setNetworkInfo] = useState<Network | null>(null);

  // Estados de UI
  const [isNetworkListOpen, setIsNetworkListOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de monitoramento
  const [liveData, setLiveData] = useState<ApiDataPoint[]>([]);
  const [minPressure, setMinPressure] = useState<PressureRecord | null>(null);
  const [maxPressure, setMaxPressure] = useState<PressureRecord | null>(null);
  
  // Estados para a lógica de anomalia
  const [consumptionStatus, setConsumptionStatus] = useState<ConsumptionStatus>('normal');
  const [anomalyStartTime, setAnomalyStartTime] = useState<number | null>(null);
  
  const latestData = liveData[liveData.length - 1];

  // Efeito para carregar dados iniciais do Firestore
  useEffect(() => {
    const assetDataString = searchParams.get("data");
    if (!assetDataString) {
      setError("Dados do ativo não encontrados na URL.");
      setLoading(false);
      return;
    }

    try {
      const initialAsset = JSON.parse(decodeURIComponent(assetDataString));
      setCurrentAsset(initialAsset);

      const fetchNetworkAssets = async () => {
        setLoading(true);
        const assetsRef = collection(db, "airscan_assets");
        const q = query(assetsRef, where("networkId", "==", initialAsset.networkId));
        const snapshot = await getDocs(q);
        const assets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));
        setNetworkAssets(assets);

        if (assets.length > 0) {
             const netQuery = query(collection(db, "airscan_networks"), where("__name__", "==", initialAsset.networkId));
             const netSnapshot = await getDocs(netQuery);
             if(!netSnapshot.empty) {
                const netDoc = netSnapshot.docs[0];
                setNetworkInfo({id: netDoc.id, name: netDoc.data().name});
             }
        }
        setLoading(false);
      };
      fetchNetworkAssets();
    } catch {
      setError("Erro ao processar dados do ativo.");
      setLoading(false);
    }
  }, [searchParams]);

  // Efeito para buscar dados da API em tempo real
  useEffect(() => {
    // Reseta os dados ao trocar de ativo
    setLiveData([]);
    setMinPressure(null);
    setMaxPressure(null);
    setConsumptionStatus('normal');
    setAnomalyStartTime(null);

    if (!currentAsset?.apiUrl) return;

    const fetchRealTimeData = async () => {
      try {
        const response = await fetch(currentAsset.apiUrl, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        
        if (!response.ok) throw new Error(`API retornou status ${response.status}`);
        
        const data = await response.json();
        
        if (data && typeof data.pressao !== 'undefined' && typeof data.is_anomaly !== 'undefined') {
            const pressureValue = parseFloat(data.pressao);
            const isAnomaly = data.is_anomaly;
            const currentTime = new Date();
            
            const newPoint: ApiDataPoint = {
                time: currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                pressao: pressureValue,
                is_anomaly: isAnomaly,
            };
            setLiveData(prevData => [...prevData.slice(-29), newPoint]);

            // Lógica de Mín/Máx
            setMinPressure(prevMin => (!prevMin || pressureValue < prevMin.value) ? { value: pressureValue, time: currentTime.toLocaleString('pt-BR') } : prevMin);
            setMaxPressure(prevMax => (!prevMax || pressureValue > prevMax.value) ? { value: pressureValue, time: currentTime.toLocaleString('pt-BR') } : prevMax);

            // Lógica para definir o status do consumo
            if (isAnomaly) {
              const now = Date.now();
              const startTime = anomalyStartTime ?? now;
              if (!anomalyStartTime) {
                setAnomalyStartTime(startTime);
              }
              if (now - startTime >= 120000) { // 2 minutos
                setConsumptionStatus('risk');
              } else {
                setConsumptionStatus('anomaly');
              }
            } else {
              setConsumptionStatus('normal');
              setAnomalyStartTime(null);
            }

        } else {
            console.error("Resposta da API inválida:", data);
        }

      } catch (error) {
        console.error("Erro ao buscar dados da API:", error);
      }
    };

    fetchRealTimeData();
    const interval = setInterval(fetchRealTimeData, 5000);
    return () => clearInterval(interval);
  }, [currentAsset, anomalyStartTime]);


  // --- FUNÇÕES DE NAVEGAÇÃO E AÇÃO ---
  const handleEditAsset = (asset: Asset) => {
    const assetQuery = encodeURIComponent(JSON.stringify(asset));
    router.push(`/system/admin/assets/edit-asset/${asset.id}?data=${assetQuery}`);
  };

  const handleDeleteAsset = async (assetToDelete: Asset) => {
     const isConfirmed = await confirmAssetDelete(assetToDelete.name);
     if(isConfirmed) {
        try {
            await deleteDoc(doc(db, "airscan_assets", assetToDelete.id));
            showSuccess(`Ativo ${assetToDelete.name} excluído.`);
            if(assetToDelete.id === currentAsset?.id) {
                router.push("/system/admin/assets");
            } else {
                setNetworkAssets(prev => prev.filter(a => a.id !== assetToDelete.id));
            }
        } catch {
            showError("Erro ao excluir o ativo.");
        }
     }
  };
  
  const handleViewAsset = (assetToView: Asset) => {
    setCurrentAsset(assetToView);
  };

  // --- RENDERIZAÇÃO ---
  if (loading) {
    return (
        <main className="relative min-h-screen bg-slate-900 text-white flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        </main>
    );
  }
  if (error) {
    return (
        <main className="relative min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
            <div className="text-center bg-slate-800 p-8 rounded-lg">
                <h2 className="text-2xl font-bold text-red-400 mb-4">Erro</h2>
                <p className="text-slate-300">{error}</p>
            </div>
        </main>
    );
  }
  if (!currentAsset) {
     return (
        <main className="relative min-h-screen bg-slate-900 text-white flex items-center justify-center">
            <p>Nenhum ativo selecionado.</p>
        </main>
     );
  }

  const gaugeData = [{ name: 'Pressure', value: latestData?.pressao || 0, fill: '#3b82f6' }];
  const barChartData = [
    { name: 'Mín', pressure: minPressure?.value || 0, fill: '#22c55e' },
    { name: 'Atual', pressure: latestData?.pressao || 0, fill: '#3b82f6' },
    { name: 'Máx', pressure: maxPressure?.value || 0, fill: '#ef4444' },
  ];

  return (
    <main className="relative min-h-screen bg-slate-900 text-white px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-blue-600/20 rounded-full blur-3xl -z-0"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Seção da Rede */}
        <div className="mb-8 bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-2 flex flex-col transition-all">
          <button onClick={() => setIsNetworkListOpen(!isNetworkListOpen)} className="w-full flex justify-between items-center p-4 text-left rounded-lg">
            <div className="flex items-center gap-4"><Share2 className="w-6 h-6 text-blue-400" /><span className="font-semibold text-lg text-slate-100">{networkInfo?.name || "Rede"}</span></div>
            <div className="flex items-center gap-3"><span className="text-sm font-medium bg-slate-700/50 text-slate-300 px-3 py-1 rounded-full">{networkAssets.length} ativos</span><ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isNetworkListOpen ? 'rotate-180' : ''}`} /></div>
          </button>
          {isNetworkListOpen && (
            <div className="border-t border-white/10 mx-4 mt-2 pt-4"><ul className="space-y-3 p-2">
              {networkAssets.map(asset => (
                <li key={asset.id} className={`p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center rounded-lg transition-colors ${asset.id === currentAsset.id ? 'bg-blue-600/20' : 'bg-slate-900/50 hover:bg-slate-900/80'}`}>
                   <div className="flex items-center gap-4 mb-3 sm:mb-0"><HardDrive className="w-6 h-6 text-slate-300"/><div><p className="font-semibold text-slate-100">{asset.name}</p><p className="text-sm text-slate-400">{asset.model}</p></div></div>
                   <div className="flex items-center gap-2 self-end sm:self-center">
                      <button onClick={() => handleViewAsset(asset)} className="p-2 text-slate-400 hover:text-green-400 rounded-full hover:bg-green-500/10"><Eye className="w-5 h-5"/></button>
                      <button onClick={() => handleEditAsset(asset)} className="p-2 text-slate-400 hover:text-blue-400 rounded-full hover:bg-blue-500/10"><Pencil className="w-5 h-5"/></button>
                      <button onClick={() => handleDeleteAsset(asset)} className="p-2 text-slate-400 hover:text-red-400 rounded-full hover:bg-red-500/10"><Trash2 className="w-5 h-5"/></button>
                   </div>
                </li>
              ))}
            </ul></div>
          )}
        </div>

        {/* Dashboard do Ativo */}
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-100">Monitoramento: <span className="text-blue-400">{currentAsset.name}</span></h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/40 p-6 rounded-2xl border border-white/10 flex items-center gap-4">
                    <Activity className="w-10 h-10 text-blue-400"/>
                    <div>
                        <p className="text-slate-400 text-sm">Pressão Atual</p>
                        <p className="text-2xl font-bold">{latestData?.pressao.toFixed(2) || '...'} <span className="text-base font-normal text-slate-400">bar</span></p>
                    </div>
                </div>
                
                <ConsumptionStatusDisplay status={consumptionStatus} />

                <div className="bg-slate-800/40 p-6 rounded-2xl border border-white/10 flex items-center gap-4">
                    <Clock className="w-10 h-10 text-green-400"/>
                    <div>
                        <p className="text-slate-400 text-sm">Última Leitura</p>
                        <p className="text-2xl font-bold">{latestData?.time || '...'}</p>
                    </div>
                </div>
            </div>

            <div className="bg-slate-800/40 p-6 rounded-2xl border border-white/10">
                <h3 className="text-lg font-semibold mb-4">Histórico de Pressão (últimos 30 pontos)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={liveData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                        <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} domain={['dataMin - 1', 'dataMax + 1']} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                        <Legend />
                        <Line type="monotone" dataKey="pressao" name="Pressão (bar)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800/40 p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center">
                     <h3 className="text-lg font-semibold mb-4">Nível de Pressão</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <RadialBarChart innerRadius="70%" outerRadius="100%" data={gaugeData} startAngle={180} endAngle={0} barSize={30}>
                            <PolarAngleAxis type="number" domain={[0, currentAsset.maxPressure]} angleAxisId={0} tick={false} />
                            <RadialBar background dataKey="value" angleAxisId={0} />
                             <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" className="fill-white text-4xl font-bold">{latestData?.pressao.toFixed(2) || '0.00'}</text>
                             <text x="50%" y="70%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-400 text-sm">bar</text>
                        </RadialBarChart>
                    </ResponsiveContainer>
                </div>
                 <div className="bg-slate-800/40 p-6 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-semibold mb-4">Comparativo de Pressão</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barChartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                            <YAxis stroke="#94a3b8" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} cursor={{fill: '#ffffff1a'}} />
                            <Bar dataKey="pressure" name="Pressão (bar)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      </div>
    </main>
  );
}

// O Suspense é necessário para que o useSearchParams funcione corretamente.
export default function ViewAssetPageWrapper() {
    return (
        <Suspense fallback={
            <main className="relative min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
            </main>
        }>
            <ViewAssetPage />
        </Suspense>
    )
}