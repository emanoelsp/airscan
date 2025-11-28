"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase/firebaseconfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import leakController from "@/lib/controllers/leakcontroller";
import { 
  ArrowLeft, Activity, Siren, CheckCircle2, Loader2, AlertTriangle, TrendingUp, Cpu, Clock, Gauge, BarChart3 
} from "lucide-react";
import { showSuccess, showError } from "@/components/allerts/accountsallert";
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    RadialBarChart, RadialBar, PolarAngleAxis, BarChart, Bar, ReferenceLine
} from 'recharts';
import { Asset } from "@/lib/controllers/networkcontroller";
import { useAuth } from "@/lib/controllers/authcontroller";

// --- INTERFACES ---
interface RealTimeDataAI {
    pressao: number;
    is_anomaly: boolean;
    status_sistema: string;
    mse: number;
    uncertainty: number;
    drift: string;
    lpm_vazamento: number;
    gap: number;
    threshold: number;
    lastUpdate: string;
    duracao_vazamento_min?: number;
}

type ConsumptionStatus = 'normal' | 'waiting' | 'anomaly' | 'risk' | 'severe';

// --- COMPONENTE DE STATUS ---
function ConsumptionStatusDisplay({ status, text, duration }: { status: ConsumptionStatus, text?: string, duration?: number }) {
  const statusConfig = {
    normal: { text: "Operação Normal", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
    waiting: { text: "Aguardando (Carga)", icon: Loader2, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20 animate-pulse" },
    anomaly: { text: "Alerta (Atenção)", icon: Siren, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
    risk: { text: "Vazamento Crítico", icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20 animate-pulse" },
    severe: { text: "Vazamento GRAVE", icon: Siren, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20 animate-bounce" }
  };

  const config = statusConfig[status] || statusConfig.normal;
  const Icon = config.icon;
  const displayText = (text && text !== "Normal") ? text : config.text;

  return (
    <div className={`p-4 rounded-xl border flex items-center justify-between h-full transition-all duration-300 ${config.bg}`}>
      <div className="flex items-center gap-3">
        <Icon className={`w-8 h-8 ${config.color}`} />
        <div>
            <p className="text-xs opacity-70 uppercase tracking-wider font-semibold text-slate-300">Status IA</p>
            <p className={`text-lg font-bold leading-tight ${config.color}`}>{displayText}</p>
        </div>
      </div>
      {duration && duration > 0 && (
          <div className="text-right">
              <p className="text-xs opacity-70 uppercase text-slate-400">Duração</p>
              <p className="text-xl font-mono font-bold text-white">{duration.toFixed(0)} min</p>
          </div>
      )}
    </div>
  );
}

function ViewAssetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { account, loading: authLoading } = useAuth();

  // Dados
  const [currentAsset, setCurrentAsset] = useState<Asset | null>(null);
  const [networkAssets, setNetworkAssets] = useState<Asset[]>([]);
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  
  // UI & Controle
  const [loading, setLoading] = useState(true);
  const [chartRange, setChartRange] = useState(50); // Slider Default

  // Monitoramento IA
  const [realTimeData, setRealTimeData] = useState<RealTimeDataAI | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  
  // Lógica de Vazamento
  const [consumptionStatus, setConsumptionStatus] = useState<ConsumptionStatus>('normal');
  const [leakStartTime, setLeakStartTime] = useState<number | null>(null);
  const [leakDuration, setLeakDuration] = useState(0);
  const leakDbIdRef = useRef<string | null>(null);

  // Estatísticas Locais (Mín/Máx do histórico visível)
  const [stats, setStats] = useState({ min: 0, max: 0, current: 0 });

  // --- 1. CARREGAMENTO ---
  useEffect(() => {
    const assetDataString = searchParams.get("data");
    if (!assetDataString) { setLoading(false); return; }
    try {
      const initialAsset = JSON.parse(decodeURIComponent(assetDataString));
      setCurrentAsset(initialAsset);
      
      const fetchNet = async () => {
        setLoading(true);
        const q = query(collection(db, "airscan_assets"), where("networkId", "==", initialAsset.networkId));
        const snap = await getDocs(q);
        setNetworkAssets(snap.docs.map(d => ({ id: d.id, ...d.data() } as Asset)));
        
        const netQuery = query(collection(db, "airscan_networks"), where("__name__", "==", initialAsset.networkId));
        const netSnap = await getDocs(netQuery);
        if(!netSnap.empty) setNetworkInfo({id: netSnap.docs[0].id, name: netSnap.docs[0].data().name});
        setLoading(false);
      };
      fetchNet();
    } catch { setLoading(false); }
  }, [searchParams]);

  // --- 2. POLLING & LÓGICA ---
  useEffect(() => {
    setHistoryData([]); setRealTimeData(null);
    setConsumptionStatus('normal'); setLeakStartTime(null); setLeakDuration(0);
    leakDbIdRef.current = null;

    if (!currentAsset?.apiUrl) return;

    const fetchRealTimeData = async () => {
      try {
        const response = await fetch(currentAsset.apiUrl ?? "", { headers: { 'ngrok-skip-browser-warning': 'true' } });        if (!response.ok) throw new Error("API Error");
        const data = await response.json();
        
        const newData: RealTimeDataAI = {
            pressao: parseFloat(data.pressao),
            is_anomaly: data.is_anomaly,
            status_sistema: data.status_sistema || "Desconhecido",
            mse: data.mse || 0,
            uncertainty: data.uncertainty || 0,
            drift: data.drift || "n/a",
            lpm_vazamento: data.lpm_vazamento || 0,
            gap: data.gap || 0,
            threshold: data.threshold || 0,
            lastUpdate: new Date().toLocaleTimeString(),
            duracao_vazamento_min: data.duracao_minutos || 0 
        };
        setRealTimeData(newData);

        setHistoryData(prev => {
            const pt = { time: newData.lastUpdate, pressao: newData.pressao, mse: newData.mse, limiar: newData.threshold };
            return [...prev, pt].slice(-2000); // Buffer
        });

        // Lógica de Vazamento (Controller Integration)
        if (newData.status_sistema.includes("Aguardando")) {
            setConsumptionStatus('waiting');
        } else if (newData.is_anomaly) {
            const now = Date.now();
            if (!leakStartTime) setLeakStartTime(now);
            const currentStart = leakStartTime || now;
            const durationMin = (now - currentStart) / 60000;
            setLeakDuration(durationMin);

            // Chama Controller
            const result = await leakController.syncLeakEvent({
                assetId: currentAsset.id, assetName: currentAsset.name, networkId: currentAsset.networkId,
                currentLpm: newData.lpm_vazamento, currentPressure: newData.pressao, startTime: currentStart,
                currentDbId: leakDbIdRef.current
            });

            if (result.dbId) leakDbIdRef.current = result.dbId;
            if (result.severity !== 'normal') setConsumptionStatus(result.severity as ConsumptionStatus);
            else setConsumptionStatus('anomaly');

            if (result.action === 'created') showError(`Vazamento confirmado em ${currentAsset.name}!`);
        } else {
            if (leakDbIdRef.current) {
                await leakController.resolveLeak(leakDbIdRef.current);
                leakDbIdRef.current = null;
                showSuccess("Sistema normalizado.");
            }
            setConsumptionStatus('normal'); setLeakStartTime(null); setLeakDuration(0);
        }
      } catch (err) { console.error(err); }
    };
    fetchRealTimeData();
    const interval = setInterval(fetchRealTimeData, 5000);
    return () => clearInterval(interval);
  }, [currentAsset]);

  // Calcula Estatísticas para o Gráfico de Barras
  useEffect(() => {
      if (historyData.length > 0) {
          const pressures = historyData.map(d => d.pressao);
          setStats({
              min: Math.min(...pressures),
              max: Math.max(...pressures),
              current: pressures[pressures.length - 1]
          });
      }
  }, [historyData]);

  // Dados Visuais
  const displayHistory = historyData.slice(-chartRange);
  const custoHora = realTimeData ? (realTimeData.lpm_vazamento * 350 / (365*24)) : 0;
  const custoTotalEvento = custoHora * (leakDuration / 60);
  const barStatsData = [
      { name: 'Mín', value: stats.min, fill: '#10b981' },
      { name: 'Atual', value: stats.current, fill: '#3b82f6' },
      { name: 'Máx', value: stats.max, fill: '#ef4444' }
  ];

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500 w-10 h-10"/></div>;
  if (!currentAsset) return <div className="min-h-screen bg-slate-900 text-white p-10">Ativo não encontrado.</div>;

  const gaugeData = [{ name: 'Pressure', value: realTimeData?.pressao || 0, fill: '#3b82f6' }];

  return (
    <main className="relative min-h-screen bg-slate-900 text-white px-4 py-8 sm:px-6 lg:px-8 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <button onClick={() => router.back()} className="flex items-center text-blue-400 hover:text-blue-300"><ArrowLeft className="w-4 h-4 mr-2"/> Voltar</button>
                <div className="text-right">
                    <h1 className="text-3xl font-bold">{currentAsset.name}</h1>
                    <p className="text-slate-400 text-sm">{currentAsset.model}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                <div className="lg:col-span-1 bg-slate-800/40 border border-white/10 rounded-2xl p-4 h-fit">
                    <h3 className="text-lg font-semibold mb-4 text-slate-200">Rede: {networkInfo?.name}</h3>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                        {networkAssets.map(a => (
                            <div key={a.id} onClick={() => setCurrentAsset(a)} 
                                 className={`p-3 rounded-lg cursor-pointer flex justify-between items-center transition-colors ${a.id === currentAsset.id ? 'bg-blue-600/20 border border-blue-500/50' : 'hover:bg-slate-700/50 border border-transparent'}`}>
                                <div className="flex items-center gap-3">
                                    <Cpu className={`w-5 h-5 ${a.status==='online'?'text-green-400':'text-slate-500'}`}/>
                                    <span className="text-sm font-medium">{a.name}</span>
                                </div>
                                <span className={`w-2 h-2 rounded-full ${a.status==='online'?'bg-green-400':'bg-red-400'}`}/>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    
                    {/* LINHA 1: KPIs OPERACIONAIS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Card Pressão */}
                        <div className="bg-slate-800/60 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-full"><Gauge className="w-6 h-6 text-blue-400"/></div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase font-bold">Pressão Atual</p>
                                <p className="text-2xl font-bold text-white">{realTimeData?.pressao.toFixed(2)} <span className="text-sm text-slate-500">bar</span></p>
                            </div>
                        </div>

                        {/* Card Status (Semáforo) */}
                        <div className="md:col-span-1">
                             <ConsumptionStatusDisplay status={consumptionStatus} text={realTimeData?.status_sistema} duration={leakDuration} />
                        </div>

                        {/* Card Última Leitura */}
                        <div className="bg-slate-800/60 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                            <div className="p-3 bg-purple-500/10 rounded-full"><Clock className="w-6 h-6 text-purple-400"/></div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase font-bold">Última Leitura</p>
                                <p className="text-xl font-bold text-white">{realTimeData?.lastUpdate}</p>
                            </div>
                        </div>
                    </div>

                    {/* LINHA 2: GRÁFICO DE LINHA (TENDÊNCIA) + SLIDER */}
                    <div className="bg-slate-800/40 border border-white/10 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                            <h3 className="font-semibold flex items-center gap-2 text-slate-200"><Activity className="w-5 h-5 text-blue-400"/> Tendência de Pressão</h3>
                            
                            {/* SLIDER DE ZOOM */}
                            <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-full border border-white/10">
                                <span className="text-xs text-slate-400 font-bold uppercase">Zoom Histórico</span>
                                <input 
                                    type="range" min="10" max="1000" step="10" 
                                    value={chartRange} 
                                    onChange={(e) => setChartRange(Number(e.target.value))}
                                    className="w-32 md:w-48 accent-blue-500 cursor-pointer h-1 bg-slate-600 rounded-lg appearance-none"
                                />
                                <span className="text-xs font-mono w-12 text-right text-blue-300">{chartRange} pts</span>
                            </div>
                        </div>

                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={displayHistory}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} interval="preserveStartEnd" minTickGap={30} />
                                    <YAxis domain={['auto', 'auto']} stroke="#64748b" fontSize={10} tickLine={false} width={30} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} itemStyle={{color: '#e2e8f0'}}/>
                                    <Line type="monotone" dataKey="pressao" name="Pressão" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* LINHA 3: MANÔMETRO E ESTATÍSTICAS FÍSICAS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* GAUGE */}
                        <div className="md:col-span-1 bg-slate-800/40 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center relative">
                             <h4 className="absolute top-4 left-4 text-xs font-bold text-slate-500 uppercase">Manômetro</h4>
                             <div className="w-full h-[180px]">
                                <ResponsiveContainer>
                                    <RadialBarChart innerRadius="80%" outerRadius="100%" data={gaugeData} startAngle={180} endAngle={0}>
                                        <PolarAngleAxis type="number" domain={[0, 12]} angleAxisId={0} tick={false} />
                                        <RadialBar background dataKey="value" angleAxisId={0} cornerRadius={10} />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                             </div>
                             <div className="absolute inset-0 flex flex-col items-center justify-center mt-8">
                                <span className="text-4xl font-bold text-white">{realTimeData?.pressao.toFixed(1)}</span>
                                <span className="text-xs text-slate-400 font-bold">BAR</span>
                             </div>
                        </div>

                        {/* BAR CHART (MIN/MÁX) */}
                        <div className="md:col-span-2 bg-slate-800/40 border border-white/10 rounded-2xl p-6">
                             <h4 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4"/> Estatística do Período (Zoom)</h4>
                             <div className="h-[160px] flex items-end justify-around gap-4">
                                 {barStatsData.map((item, idx) => (
                                     <div key={idx} className="flex flex-col items-center w-full group">
                                         <div className="text-lg font-bold text-white mb-2">{item.value.toFixed(2)}</div>
                                         <div className="w-full bg-slate-700/50 rounded-t-lg relative overflow-hidden" style={{height: '100px'}}>
                                             <div 
                                                className="absolute bottom-0 left-0 right-0 transition-all duration-500 rounded-t-lg" 
                                                style={{
                                                    height: `${(item.value / (stats.max + 0.1)) * 100}%`, 
                                                    backgroundColor: item.fill
                                                }}
                                             />
                                         </div>
                                         <div className="mt-2 text-xs font-bold text-slate-400 uppercase">{item.name}</div>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    </div>

                    {/* LINHA 4: DIAGNÓSTICO NEURAL E DETALHES DE VAZAMENTO */}
                    <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                             <h3 className="font-bold text-purple-400 flex items-center gap-2"><TrendingUp className="w-5 h-5"/> Diagnóstico IA (Neural Engine)</h3>
                             <div className="flex gap-4 text-xs">
                                 <span className="text-slate-400">Incerteza: <strong className={realTimeData?.uncertainty || 0 > 0.1 ? "text-yellow-400":"text-green-400"}>{(realTimeData?.uncertainty || 0).toFixed(4)}</strong></span>
                                 <span className="text-slate-400">Drift: <strong className="text-blue-400">{realTimeData?.drift}</strong></span>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Gráfico de Erro MSE */}
                            <div className="lg:col-span-2 h-[150px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={displayHistory.slice(-40)}> 
                                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                                        <Bar dataKey="mse" name="Erro de Reconstrução" fill="#a855f7" radius={[2, 2, 0, 0]} />
                                        <ReferenceLine y={realTimeData?.threshold} stroke="orange" strokeDasharray="3 3" label={{ value: 'Limiar', position: 'insideTopRight', fill: 'orange', fontSize: 10 }} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Painel de Detalhes do Vazamento (Condicional) */}
                            <div className="lg:col-span-1 bg-slate-800 rounded-xl p-4 border border-white/5 flex flex-col justify-center">
                                {leakDuration >= 5 ? (
                                    <div className="space-y-3 animate-in fade-in">
                                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                            <span className="text-xs text-slate-400 uppercase">Início</span>
                                            <span className="font-mono text-red-400 font-bold">{leakStartTime ? new Date(leakStartTime).toLocaleTimeString() : '--'}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                            <span className="text-xs text-slate-400 uppercase">Intensidade</span>
                                            <span className="font-mono text-white font-bold">{realTimeData?.lpm_vazamento.toFixed(1)} LPM</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-400 uppercase">Custo Total</span>
                                            <span className="font-mono text-green-400 font-bold">R$ {custoTotalEvento.toFixed(2)}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-slate-500 text-sm flex flex-col items-center">
                                        <CheckCircle2 className="w-8 h-8 mb-2 opacity-50"/>
                                        Nenhuma anomalia crítica ativa.
                                        <br/><span className="text-xs opacity-60">O sistema está operando dentro dos parâmetros.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </main>
  );
}

export default function ViewAssetPageWrapper() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500"/></div>}>
            <ViewAssetPage />
        </Suspense>
    );
}