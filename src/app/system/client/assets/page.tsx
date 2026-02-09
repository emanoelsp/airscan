"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/controllers/authcontroller";
import { db } from "@/lib/firebase/firebaseconfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { 
    ArrowLeft, Share2, HardDrive, Server, Eye, Loader2,
    Activity, Clock, Siren, CheckCircle2, AlertTriangle, TrendingUp
} from "lucide-react";
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    RadialBarChart, RadialBar, PolarAngleAxis, BarChart, Bar, ReferenceLine
} from 'recharts';

// --- INTERFACES E TIPOS (ATUALIZADOS) ---
interface Network {
  id: string;
  name: string;
}

interface Asset {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'maintenance';
  networkId: string;
  location: string;
  model: string;
  apiUrl?: string;
  maxPressure: number;
  limitLow?: number;
  limitNormal?: number;
  limitRisk?: number;
  limitCritical?: number;
}

interface NetworkWithAssets {
  network: Network;
  assets: Asset[];
}

// --- Dados da API (completo como na visão admin para diagnóstico IA) ---
interface ApiDataPoint {
  time: string;
  pressao: number;
  is_anomaly: boolean;
  mse?: number;
  limiar?: number;
}

interface RealTimeDataAI {
  pressao: number;
  is_anomaly: boolean;
  status_sistema: string;
  mse: number;
  uncertainty: number;
  drift: string;
  lpm_vazamento: number;
  threshold: number;
  lastUpdate: string;
}

interface PressureRecord {
  value: number;
  time: string;
}

type ConsumptionStatus = 'normal' | 'waiting' | 'anomaly' | 'risk';

function ConsumptionStatusDisplay({ status, text, duration }: { status: ConsumptionStatus; text?: string; duration?: number }) {
  const statusConfig = {
    normal: { text: "Operação Normal", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
    waiting: { text: "Aguardando (Carga)", icon: Loader2, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20 animate-pulse" },
    anomaly: { text: "Alerta (Atenção)", icon: Siren, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
    risk: { text: "Vazamento Crítico", icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20 animate-pulse" },
  };
  const config = statusConfig[status] || statusConfig.normal;
  const Icon = config.icon;
  const displayText = (text && text !== "Normal") ? text : config.text;

  return (
    <div className={`p-6 rounded-2xl border flex items-center justify-between h-full transition-all duration-300 ${config.bg}`}>
      <div className="flex items-center gap-3">
        <Icon className={`w-10 h-10 ${config.color}`} />
        <div>
          <p className="text-xs opacity-70 uppercase tracking-wider font-semibold text-slate-300">Status IA</p>
          <p className={`text-xl font-bold leading-tight ${config.color}`}>{displayText}</p>
        </div>
      </div>
      {duration != null && duration > 0 && (
        <div className="text-right">
          <p className="text-xs opacity-70 uppercase text-slate-400">Duração</p>
          <p className="text-xl font-mono font-bold text-white">{duration.toFixed(0)} min</p>
        </div>
      )}
    </div>
  );
}


// --- PÁGINA PRINCIPAL ---
export default function ClientDevicesPage() {
    const { account, loading: authLoading } = useAuth();

    const [networksWithAssets, setNetworksWithAssets] = useState<NetworkWithAssets[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [loading, setLoading] = useState(true);
    const [apiStatusByAssetId, setApiStatusByAssetId] = useState<Record<string, boolean>>({});
    const apiCheckReqRef = useRef(0);

    const [liveData, setLiveData] = useState<ApiDataPoint[]>([]);
    const [historyData, setHistoryData] = useState<{ time: string; pressao: number; mse: number; limiar: number }[]>([]);
    const [realTimeDataAI, setRealTimeDataAI] = useState<RealTimeDataAI | null>(null);
    const [minPressure, setMinPressure] = useState<PressureRecord | null>(null);
    const [maxPressure, setMaxPressure] = useState<PressureRecord | null>(null);
    const [consumptionStatus, setConsumptionStatus] = useState<ConsumptionStatus>('normal');
    const [leakStartTime, setLeakStartTime] = useState<number | null>(null);
    const [leakDuration, setLeakDuration] = useState(0);
    const [chartRange, setChartRange] = useState(100);
    const leakStartTimeRef = useRef<number | null>(null);
    const pressureReadingsRef = useRef<number[]>([]);

    const has10ConsecutiveDecreasing = (readings: number[]): boolean => {
        if (readings.length < 11) return false;
        for (let i = 0; i < 10; i++) if (readings[i] <= readings[i + 1]) return false;
        return true;
    };

    const latestData = liveData[liveData.length - 1];
    const displayHistory = historyData.slice(-chartRange);
    const custoHora = realTimeDataAI ? (realTimeDataAI.lpm_vazamento * 350 / (365 * 24)) : 0;
    const custoTotalEvento = custoHora * (leakDuration / 60);

    // Carregar redes e ativos do cliente (sem alterações aqui)
    useEffect(() => {
        if (authLoading || !account) return;

        const fetchData = async () => {
            try {
                const networksRef = collection(db, "airscan_networks");
                const qNetworks = query(networksRef, where("clientId", "==", account.id));
                const networksSnapshot = await getDocs(qNetworks);
                const clientNetworks = networksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Network));

                if (clientNetworks.length === 0) {
                    setNetworksWithAssets([]);
                    setLoading(false);
                    return;
                }

                const allData = await Promise.all(
                    clientNetworks.map(async (network) => {
                        const assetsRef = collection(db, "airscan_assets");
                        const qAssets = query(assetsRef, where("networkId", "==", network.id));
                        const assetsSnapshot = await getDocs(qAssets);
                        const assets = assetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));
                        return { network, assets };
                    })
                );
                setNetworksWithAssets(allData);
            } catch (error) {
                console.error("Erro ao carregar dados do cliente:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [account, authLoading]);

    const isApiOnline = async (apiUrl: string, timeoutMs = 5000): Promise<boolean> => {
        const url = (apiUrl || "").trim();
        if (!url) return false;
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const res = await fetch(url, { headers: { "ngrok-skip-browser-warning": "true" }, signal: controller.signal });
            return res.ok;
        } catch {
            return false;
        } finally {
            clearTimeout(t);
        }
    };

    const getEffectiveStatus = (asset: Asset): Asset["status"] => {
        if (asset.status === "maintenance") return "maintenance";
        if (asset.apiUrl && asset.apiUrl.trim()) {
            const online = apiStatusByAssetId[asset.id];
            if (online === true) return "online";
            if (online === false) return "offline";
            return asset.status;
        }
        return asset.status;
    };

    // Verificação de status via API para todos os ativos com apiUrl (igual à visão admin)
    useEffect(() => {
        if (networksWithAssets.length === 0) return;
        const assetsToCheck = networksWithAssets.flatMap(({ assets }) =>
            assets.filter((a) => typeof a.apiUrl === "string" && a.apiUrl!.trim().length > 0)
        );
        if (assetsToCheck.length === 0) return;

        const reqId = ++apiCheckReqRef.current;

        const runCheck = async () => {
            const results = await Promise.all(
                assetsToCheck.map(async (asset) => {
                    const ok = await isApiOnline(asset.apiUrl!);
                    return { id: asset.id, ok };
                })
            );
            if (apiCheckReqRef.current !== reqId) return;
            setApiStatusByAssetId((prev) => {
                const next = { ...prev };
                for (const r of results) next[r.id] = r.ok;
                return next;
            });
        };

        runCheck();
        const intervalId = setInterval(runCheck, 10000);
        return () => clearInterval(intervalId);
    }, [networksWithAssets]);

    useEffect(() => {
        setLiveData([]);
        setHistoryData([]);
        setRealTimeDataAI(null);
        setMinPressure(null);
        setMaxPressure(null);
        setConsumptionStatus('normal');
        setLeakStartTime(null);
        setLeakDuration(0);
        pressureReadingsRef.current = [];

        if (!selectedAsset?.apiUrl) return;

        const apiUrl = selectedAsset.apiUrl;
        leakStartTimeRef.current = null;

        const fetchRealTimeData = async () => {
            try {
                const response = await fetch(apiUrl, { headers: { 'ngrok-skip-browser-warning': 'true' } });
                if (!response.ok) throw new Error(`API Error: ${response.status}`);
                const data = await response.json();

                const pressureValue = typeof data.pressao !== 'undefined' ? parseFloat(data.pressao) : 0;
                const isAnomaly = Boolean(data.is_anomaly);
                const lastUpdate = new Date().toLocaleTimeString('pt-BR');
                const mse = Number(data.mse ?? 0);
                const threshold = Number(data.threshold ?? 0);

                const newAI: RealTimeDataAI = {
                    pressao: pressureValue,
                    is_anomaly: isAnomaly,
                    status_sistema: data.status_sistema ?? "Desconhecido",
                    mse,
                    uncertainty: Number(data.uncertainty ?? 0),
                    drift: data.drift ?? "n/a",
                    lpm_vazamento: Number(data.lpm_vazamento ?? 0),
                    threshold,
                    lastUpdate,
                };
                setRealTimeDataAI(newAI);

                const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                setLiveData(prev => [...prev.slice(-29), { time: timeStr, pressao: pressureValue, is_anomaly: isAnomaly }]);
                setHistoryData(prev => [...prev, { time: lastUpdate, pressao: pressureValue, mse, limiar: threshold }].slice(-2000));

                setMinPressure(prev => (!prev || pressureValue < prev.value) ? { value: pressureValue, time: new Date().toLocaleString('pt-BR') } : prev);
                setMaxPressure(prev => (!prev || pressureValue > prev.value) ? { value: pressureValue, time: new Date().toLocaleString('pt-BR') } : prev);

                const prevReadings = pressureReadingsRef.current;
                const nextReadings = [...prevReadings, pressureValue].slice(-11);
                pressureReadingsRef.current = nextReadings;
                const canResumeAnalysis = has10ConsecutiveDecreasing(nextReadings);

                // Aguardando compressor em carga: mesmo critério do admin; após 10 leituras consecutivas baixando, volta a analisar
                if ((data.status_sistema || "").toString().includes("Aguardando") && !canResumeAnalysis) {
                    setConsumptionStatus('waiting');
                } else if (isAnomaly) {
                    const now = Date.now();
                    if (leakStartTimeRef.current == null) leakStartTimeRef.current = now;
                    const start = leakStartTimeRef.current;
                    setLeakStartTime(start);
                    setLeakDuration((now - start) / 60000);
                    setConsumptionStatus((now - start) >= 120000 ? 'risk' : 'anomaly');
                } else {
                    leakStartTimeRef.current = null;
                    setLeakStartTime(null);
                    setLeakDuration(0);
                    setConsumptionStatus('normal');
                }
            } catch (error) {
                console.error("Erro ao buscar dados da API:", error);
            }
        };

        fetchRealTimeData();
        const interval = setInterval(fetchRealTimeData, 5000);
        return () => clearInterval(interval);
    }, [selectedAsset]);

    const handleViewAsset = (asset: Asset) => setSelectedAsset(asset);
    const handleBackToList = () => setSelectedAsset(null);
    
    const getStatusProps = (status: string) => {
        switch (status) {
            case 'online': return { text: 'Online', className: 'bg-green-500/10 text-green-400' };
            case 'maintenance': return { text: 'Manutenção', className: 'bg-yellow-500/10 text-yellow-400' };
            case 'offline': return { text: 'Offline', className: 'bg-red-500/10 text-red-400' };
            default: return { text: 'Indefinido', className: 'bg-slate-500/10 text-slate-400' };
        }
    };
    
    if (loading || authLoading) {
        return (
            <main className="relative min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-yellow-400" />
            </main>
        );
    }
    
    // --- MODIFICADO: Preparando dados para os gráficos com os novos nomes de campo ---
    const currentPress = realTimeDataAI?.pressao ?? latestData?.pressao ?? 0;
    const gaugeData = [{ name: 'Pressure', value: currentPress, fill: '#3b82f6' }];
    const barChartData = [
        { name: 'Mín', pressure: minPressure?.value ?? 0, fill: '#22c55e' },
        { name: 'Atual', pressure: currentPress, fill: '#3b82f6' },
        { name: 'Máx', pressure: maxPressure?.value ?? 0, fill: '#ef4444' },
    ];

    // --- RENDERIZAÇÃO ---
    return (
        <main className="relative min-h-screen bg-slate-900 text-white px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-blue-600/20 rounded-full blur-3xl -z-0" aria-hidden="true" />
            <div className="relative z-10 max-w-7xl mx-auto">
                {selectedAsset ? (
                    // --- MODIFICADO: VISÃO DO DASHBOARD ---
                    <div>
                        <button onClick={handleBackToList} className="flex items-center text-blue-400 hover:text-blue-300 mb-8 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar para a Lista de Ativos
                        </button>
                        <div className="space-y-6">
                            <h1 className="text-3xl font-bold text-slate-100">Monitoramento: <span className="text-blue-400">{selectedAsset.name}</span></h1>
                            {/* Layout de cards atualizado para 3 colunas para incluir o status de consumo */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-slate-800/40 p-6 rounded-2xl border border-white/10 flex items-center gap-4"><Activity className="w-10 h-10 text-blue-400"/><div><p className="text-slate-400 text-sm">Pressão Atual</p><p className="text-2xl font-bold">{(realTimeDataAI?.pressao ?? latestData?.pressao ?? 0).toFixed(2)} <span className="text-base font-normal text-slate-400">bar</span></p></div></div>
                                <ConsumptionStatusDisplay status={consumptionStatus} text={realTimeDataAI?.status_sistema} duration={leakDuration} />
                                <div className="bg-slate-800/40 p-6 rounded-2xl border border-white/10 flex items-center gap-4"><Clock className="w-10 h-10 text-green-400"/><div><p className="text-slate-400 text-sm">Última Leitura</p><p className="text-2xl font-bold">{realTimeDataAI?.lastUpdate ?? latestData?.time ?? '...'}</p></div></div>
                            </div>
                            <div className="bg-slate-800/40 p-6 rounded-2xl border border-white/10">
                                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                                    <h3 className="text-lg font-semibold">Histórico de Pressão</h3>
                                    <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-full border border-white/10">
                                        <span className="text-xs text-slate-400 font-bold uppercase">Zoom</span>
                                        <input type="range" min="20" max="500" step="10" value={chartRange} onChange={(e) => setChartRange(Number(e.target.value))} className="w-28 accent-blue-500 h-1 bg-slate-600 rounded-lg" />
                                        <span className="text-xs font-mono text-blue-300 w-10">{chartRange} pts</span>
                                    </div>
                                </div>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={displayHistory.length > 0 ? displayHistory : liveData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                                        <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                                        <YAxis stroke="#94a3b8" fontSize={12} domain={['auto', 'auto']} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} formatter={(value: number) => [typeof value === 'number' ? value.toFixed(2) : value, 'Pressão']} />
                                        {typeof selectedAsset?.limitLow === 'number' && <ReferenceLine y={selectedAsset.limitLow} stroke="#22c55e" strokeDasharray="5 5" />}
                                        {typeof selectedAsset?.limitNormal === 'number' && <ReferenceLine y={selectedAsset.limitNormal} stroke="#3b82f6" strokeDasharray="5 5" />}
                                        {typeof selectedAsset?.limitRisk === 'number' && <ReferenceLine y={selectedAsset.limitRisk} stroke="#f59e0b" strokeDasharray="5 5" />}
                                        {typeof selectedAsset?.limitCritical === 'number' && <ReferenceLine y={selectedAsset.limitCritical} stroke="#ef4444" strokeDasharray="5 5" />}
                                        <Line type="monotone" dataKey="pressao" name="Pressão (bar)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                                {(typeof selectedAsset?.limitLow === 'number' || typeof selectedAsset?.limitNormal === 'number' || typeof selectedAsset?.limitRisk === 'number' || typeof selectedAsset?.limitCritical === 'number') && (
                                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                                        {typeof selectedAsset?.limitLow === 'number' && <span>Baixo: {selectedAsset.limitLow.toFixed(2)} bar</span>}
                                        {typeof selectedAsset?.limitNormal === 'number' && <span>Normal: {selectedAsset.limitNormal.toFixed(2)} bar</span>}
                                        {typeof selectedAsset?.limitRisk === 'number' && <span>Risco: {selectedAsset.limitRisk.toFixed(2)} bar</span>}
                                        {typeof selectedAsset?.limitCritical === 'number' && <span>Crítico: {selectedAsset.limitCritical.toFixed(2)} bar</span>}
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-slate-800/40 p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center">
                                    <h3 className="text-lg font-semibold mb-4">Nível de Pressão</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <RadialBarChart innerRadius="70%" outerRadius="100%" data={gaugeData} startAngle={180} endAngle={0} barSize={30}>
                                            <PolarAngleAxis type="number" domain={[0, selectedAsset.maxPressure]} angleAxisId={0} tick={false} />
                                            <RadialBar background dataKey="value" angleAxisId={0} />
                                            <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" className="fill-white text-4xl font-bold">{currentPress.toFixed(2)}</text>
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
                                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} formatter={(value: number) => [typeof value === 'number' ? value.toFixed(2) : value, 'Pressão']} cursor={{fill: '#ffffff1a'}} />
                                            {typeof selectedAsset?.limitLow === 'number' && <ReferenceLine y={selectedAsset.limitLow} stroke="#22c55e" strokeDasharray="5 5" />}
                                            {typeof selectedAsset?.limitNormal === 'number' && <ReferenceLine y={selectedAsset.limitNormal} stroke="#3b82f6" strokeDasharray="5 5" />}
                                            {typeof selectedAsset?.limitRisk === 'number' && <ReferenceLine y={selectedAsset.limitRisk} stroke="#f59e0b" strokeDasharray="5 5" />}
                                            {typeof selectedAsset?.limitCritical === 'number' && <ReferenceLine y={selectedAsset.limitCritical} stroke="#ef4444" strokeDasharray="5 5" />}
                                            <Bar dataKey="pressure" name="Pressão (bar)" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                    {(typeof selectedAsset?.limitLow === 'number' || typeof selectedAsset?.limitNormal === 'number' || typeof selectedAsset?.limitRisk === 'number' || typeof selectedAsset?.limitCritical === 'number') && (
                                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                                            {typeof selectedAsset?.limitLow === 'number' && <span>Baixo: {selectedAsset.limitLow.toFixed(2)} bar</span>}
                                            {typeof selectedAsset?.limitNormal === 'number' && <span>Normal: {selectedAsset.limitNormal.toFixed(2)} bar</span>}
                                            {typeof selectedAsset?.limitRisk === 'number' && <span>Risco: {selectedAsset.limitRisk.toFixed(2)} bar</span>}
                                            {typeof selectedAsset?.limitCritical === 'number' && <span>Crítico: {selectedAsset.limitCritical.toFixed(2)} bar</span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Diagnóstico IA (igual à visão admin) */}
                            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                                    <h3 className="font-bold text-purple-400 flex items-center gap-2"><TrendingUp className="w-5 h-5"/> Diagnóstico IA (Neural Engine)</h3>
                                    <div className="flex gap-4 text-xs">
                                        <span className="text-slate-400">Incerteza: <strong className={(realTimeDataAI?.uncertainty ?? 0) > 0.1 ? "text-yellow-400" : "text-green-400"}>{(realTimeDataAI?.uncertainty ?? 0).toFixed(4)}</strong></span>
                                        <span className="text-slate-400">Drift: <strong className="text-blue-400">{realTimeDataAI?.drift ?? "—"}</strong></span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 h-[150px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={displayHistory.slice(-40)} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                                                <XAxis dataKey="time" stroke="#64748b" fontSize={9} tickLine={false} interval="preserveStartEnd" hide />
                                                <YAxis stroke="#64748b" fontSize={10} tickLine={false} width={30} />
                                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                                                <Bar dataKey="mse" name="Erro de Reconstrução" fill="#a855f7" radius={[2, 2, 0, 0]} />
                                                {typeof realTimeDataAI?.threshold === 'number' && <ReferenceLine y={realTimeDataAI.threshold} stroke="orange" strokeDasharray="3 3" label={{ value: 'Limiar', position: 'insideTopRight', fill: 'orange', fontSize: 10 }} />}
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="lg:col-span-1 bg-slate-800 rounded-xl p-4 border border-white/5 flex flex-col justify-center">
                                        {leakDuration >= 5 ? (
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                                    <span className="text-xs text-slate-400 uppercase">Início</span>
                                                    <span className="font-mono text-red-400 font-bold">{leakStartTime ? new Date(leakStartTime).toLocaleTimeString('pt-BR') : '—'}</span>
                                                </div>
                                                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                                    <span className="text-xs text-slate-400 uppercase">Intensidade</span>
                                                    <span className="font-mono text-white font-bold">{(realTimeDataAI?.lpm_vazamento ?? 0).toFixed(2)} LPM</span>
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
                                                <span className="text-xs opacity-60 mt-1">O sistema está operando dentro dos parâmetros.</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // --- VISÃO DA LISTA DE ATIVOS (sem alterações) ---
                    <div>
                        <div className="mb-12">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100">Meus Equipamentos</h1>
                            <p className="text-slate-300 mt-2 text-lg">Liste e visualize o status de todos os seus ativos monitorados.</p>
                        </div>
                        {networksWithAssets.length > 0 ? (
                            <div className="space-y-6">
                                {networksWithAssets.map(({ network, assets }) => (
                                    <div key={network.id} className="bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                                        <div className="flex items-center gap-4 p-4">
                                            <Share2 className="w-6 h-6 text-blue-400" />
                                            <h2 className="font-semibold text-xl text-slate-100">{network.name}</h2>
                                        </div>
                                        <div className="border-t border-white/10 mt-2 pt-4">
                                            {assets.length > 0 ? (
                                                <ul className="space-y-3 p-2">
                                                    {assets.map(asset => (
                                                        <li key={asset.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900/50 rounded-lg">
                                                            <div className="flex items-center gap-4 mb-3 sm:mb-0"><HardDrive className="w-6 h-6 text-slate-300"/><div><p className="font-semibold text-slate-100">{asset.name}</p><p className="text-sm text-slate-400">{asset.model} • {asset.location}</p></div></div>
                                                            <div className="flex items-center gap-4 self-end sm:self-center">
                                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusProps(getEffectiveStatus(asset)).className}`}>{getStatusProps(getEffectiveStatus(asset)).text}</span>
                                                                <button onClick={() => handleViewAsset(asset)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"><Eye className="w-4 h-4"/>Visualizar</button>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : ( <p className="p-4 text-center text-slate-400">Nenhum ativo encontrado para esta rede.</p> )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (<div className="text-center py-12 bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl"><Server className="w-12 h-12 mx-auto text-slate-500 mb-4" /><h3 className="text-xl font-semibold text-slate-200">Nenhuma Rede Encontrada</h3><p className="text-sm text-slate-400 mt-2">Você ainda não possui redes de monitoramento cadastradas.</p></div>)}
                    </div>
                )}
            </div>
        </main>
    );
}