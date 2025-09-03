"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/controllers/authcontroller";
import { db } from "@/lib/model/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { 
    ArrowLeft, Share2, HardDrive, Server, Eye, Loader2,
    Activity, Clock
} from "lucide-react";
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    RadialBarChart, RadialBar, PolarAngleAxis, BarChart, Bar
} from 'recharts';

// --- INTERFACES ---
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
  apiUrl: string;
  maxPressure: number;
}

interface NetworkWithAssets {
  network: Network;
  assets: Asset[];
}

interface ApiDataPoint {
    time: string;
    pressure: number;
}

interface PressureRecord {
    value: number;
    time: string;
}

// --- PÁGINA PRINCIPAL ---
export default function ClientDevicesPage() {
    const { account, loading: authLoading } = useAuth();

    const [networksWithAssets, setNetworksWithAssets] = useState<NetworkWithAssets[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [loading, setLoading] = useState(true);

    // Dados de monitoramento
    const [liveData, setLiveData] = useState<ApiDataPoint[]>([]);
    const [minPressure, setMinPressure] = useState<PressureRecord | null>(null);
    const [maxPressure, setMaxPressure] = useState<PressureRecord | null>(null);
    const latestData = liveData[liveData.length - 1];

    // Carregar redes e ativos do cliente
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

    // Buscar dados da API quando um ativo é selecionado
    useEffect(() => {
        setLiveData([]);
        setMinPressure(null);
        setMaxPressure(null);

        if (!selectedAsset?.apiUrl) return;

        const apiUrl = selectedAsset.apiUrl;
        const fetchRealTimeData = async () => {
            try {
                const response = await fetch(apiUrl, { headers: { 'ngrok-skip-browser-warning': 'true' } });
                if (!response.ok) throw new Error(`API Error: ${response.status}`);
                const data = await response.json();
                if (data && typeof data.nova_pressao !== 'undefined') {
                    const pressureValue = parseFloat(data.nova_pressao);
                    const currentTime = new Date();
                    setLiveData(prev => [...prev.slice(-29), { time: currentTime.toLocaleTimeString('pt-BR'), pressure: pressureValue }]);
                    setMinPressure(prev => (!prev || pressureValue < prev.value) ? { value: pressureValue, time: currentTime.toLocaleString('pt-BR') } : prev);
                    setMaxPressure(prev => (!prev || pressureValue > prev.value) ? { value: pressureValue, time: currentTime.toLocaleString('pt-BR') } : prev);
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
            case 'offline': return { text: 'Offline', className: 'bg-red-500/10 text-red-400' };
            default: return { text: 'Manutenção', className: 'bg-yellow-500/10 text-yellow-400' };
        }
    };
    
    if (loading || authLoading) {
        return (
            <main className="relative min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-yellow-400" />
            </main>
        );
    }
    
    // Preparando dados para os gráficos
    const gaugeData = [{ name: 'Pressure', value: latestData?.pressure || 0, fill: '#3b82f6' }];
    const barChartData = [
        { name: 'Mín', pressure: minPressure?.value || 0, fill: '#22c55e' },
        { name: 'Atual', pressure: latestData?.pressure || 0, fill: '#3b82f6' },
        { name: 'Máx', pressure: maxPressure?.value || 0, fill: '#ef4444' },
    ];

    // --- RENDERIZAÇÃO ---
    return (
        <main className="relative min-h-screen bg-slate-900 text-white px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-blue-600/20 rounded-full blur-3xl -z-0" aria-hidden="true" />
            <div className="relative z-10 max-w-7xl mx-auto">
                {selectedAsset ? (
                    // --- VISÃO DO DASHBOARD ---
                    <div>
                        <button onClick={handleBackToList} className="flex items-center text-blue-400 hover:text-blue-300 mb-8 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar para a Lista de Ativos
                        </button>
                        <div className="space-y-6">
                            <h1 className="text-3xl font-bold text-slate-100">Monitoramento: <span className="text-blue-400">{selectedAsset.name}</span></h1>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-slate-800/40 p-6 rounded-2xl border border-white/10 flex items-center gap-4"><Activity className="w-10 h-10 text-blue-400"/><div><p className="text-slate-400 text-sm">Pressão Atual</p><p className="text-2xl font-bold">{latestData?.pressure.toFixed(2) || '...'} <span className="text-base font-normal text-slate-400">bar</span></p></div></div>
                                <div className="bg-slate-800/40 p-6 rounded-2xl border border-white/10 flex items-center gap-4"><Clock className="w-10 h-10 text-green-400"/><div><p className="text-slate-400 text-sm">Última Leitura</p><p className="text-2xl font-bold">{latestData?.time || '...'}</p></div></div>
                            </div>
                            <div className="bg-slate-800/40 p-6 rounded-2xl border border-white/10">
                                <h3 className="text-lg font-semibold mb-4">Histórico de Pressão</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={liveData}><CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" /><XAxis dataKey="time" stroke="#94a3b8" fontSize={12} /><YAxis stroke="#94a3b8" fontSize={12} domain={['dataMin - 1', 'dataMax + 1']} /><Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} /><Legend /><Line type="monotone" dataKey="pressure" name="Pressão (bar)" stroke="#3b82f6" strokeWidth={2} dot={false} /></LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-slate-800/40 p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center">
                                    <h3 className="text-lg font-semibold mb-4">Nível de Pressão</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <RadialBarChart innerRadius="70%" outerRadius="100%" data={gaugeData} startAngle={180} endAngle={0} barSize={30}>
                                            <PolarAngleAxis type="number" domain={[0, selectedAsset.maxPressure]} angleAxisId={0} tick={false} />
                                            <RadialBar background dataKey="value" angleAxisId={0} />
                                            <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" className="fill-white text-4xl font-bold">{latestData?.pressure.toFixed(2) || '0.00'}</text>
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
                ) : (
                    // --- VISÃO DA LISTA DE ATIVOS ---
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
                                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusProps(asset.status).className}`}>{getStatusProps(asset.status).text}</span>
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
