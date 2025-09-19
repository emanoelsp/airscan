// src/app/system/client/alerts/thresholds/page.tsx

"use client"

import { useState, useEffect, FormEvent, useMemo } from "react";
import { useAuth } from "@/lib/controllers/authcontroller";
import assetsController, { Asset, Network } from "@/lib/controllers/assetscontroller";
import { Settings, Loader2, CheckCircle, XCircle, Trash2, Edit, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";
import { confirmDeleteWithText } from "@/components/allerts/thresholdsalert";

const initialLimitsState = { low: '', normal: '', risk: '', critical: '' };

export default function SetThresholdsPage() {
    const { account, loading: authLoading } = useAuth();

    // --- ESTADOS GLOBAIS ---
    const [view, setView] = useState<'list' | 'form'>('list');
    const [networks, setNetworks] = useState<Network[]>([]);
    const [allAssets, setAllAssets] = useState<Asset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // --- ESTADOS DO FORMULÁRIO ---
    const [selectedNetworkId, setSelectedNetworkId] = useState('');
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [limits, setLimits] = useState(initialLimitsState);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- CARREGAMENTO INICIAL DE REDES E ATIVOS ---
    useEffect(() => {
        if (!authLoading && account?.id) {
            const fetchData = async () => {
                setIsLoading(true);
                setFeedback(null);
                try {
                    const clientNetworks = await assetsController.getNetworksByAccountId(account.id);
                    const userAssets = await assetsController.getAssetsByAccountId(account.id);
                    setNetworks(clientNetworks);
                    setAllAssets(userAssets);
                } catch (error) {
                    console.error("Erro ao carregar dados:", error);
                    setFeedback({ type: 'error', message: "Falha ao carregar os dados da página." });
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }
    }, [account, authLoading]);
    
    // --- LÓGICA DE FILTRAGEM ---
    const { configuredAssets, unconfiguredAssets } = useMemo(() => {
        const configured = allAssets.filter(a => a.limitNormal !== undefined && a.limitNormal !== null);
        const unconfigured = allAssets.filter(a => a.limitNormal === undefined || a.limitNormal === null);
        return { configuredAssets: configured, unconfiguredAssets: unconfigured };
    }, [allAssets]);

    const assetsAvailableToConfigure = useMemo(() => {
        if (!selectedNetworkId) return [];
        return unconfiguredAssets.filter(a => a.networkId === selectedNetworkId);
    }, [unconfiguredAssets, selectedNetworkId]);

    // --- MANIPULADORES DE EVENTOS ---
    const handleEdit = (asset: Asset) => {
        setSelectedAsset(asset);
        setLimits({
            low: asset.limitLow?.toString() || '',
            normal: asset.limitNormal?.toString() || '',
            risk: asset.limitRisk?.toString() || '',
            critical: asset.limitCritical?.toString() || '',
        });
        setView('form');
        setFeedback(null);
    };
    
    const handleConfigureNew = (assetId: string) => {
        if (!assetId) {
            setSelectedAsset(null);
            return;
        }
        const asset = allAssets.find(a => a.id === assetId);
        if (asset) {
            handleEdit(asset);
        }
    };
    
    const handleDelete = async (asset: Asset) => {
        const result = await confirmDeleteWithText(asset.name);

        if (result.isConfirmed) {
            try {
                await assetsController.deleteAssetLimits(asset.id);
                setAllAssets(prev => prev.map(a => 
                    a.id === asset.id ? { ...a, limitLow: undefined, limitNormal: undefined, limitRisk: undefined, limitCritical: undefined } : a
                ));
                
                Swal.fire({
                    title: 'Excluído!',
                    text: `Os limites de ${asset.name} foram removidos.`,
                    icon: 'success',
                    background: '#1e293b',
                    color: '#f8fafc',
                    confirmButtonColor: '#3085d6',
                });

            } catch (error) {
                console.error("Erro ao excluir limites:", error)
                Swal.fire({
                    title: 'Erro!',
                    text: 'Falha ao excluir os limites. Tente novamente.',
                    icon: 'error',
                    background: '#1e293b',
                    color: '#f8fafc',
                    confirmButtonColor: '#d33',
                });
            }
        }
    };

    const handleBackToList = () => {
        setView('list');
        setSelectedAsset(null);
        setSelectedNetworkId('');
        setLimits(initialLimitsState);
    };
    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedAsset) return;
        setIsSubmitting(true);
        setFeedback(null);
        try {
            const dataToUpdate = {
                limitLow: limits.low ? Number(limits.low) : undefined,
                limitNormal: limits.normal ? Number(limits.normal) : undefined,
                limitRisk: limits.risk ? Number(limits.risk) : undefined,
                limitCritical: limits.critical ? Number(limits.critical) : undefined,
            };
            await assetsController.updateAsset(selectedAsset.id, dataToUpdate);
            setAllAssets(prev => prev.map(a => a.id === selectedAsset.id ? { ...a, ...dataToUpdate } : a));
            setFeedback({ type: 'success', message: `Limites para ${selectedAsset.name} foram salvos!` });
            handleBackToList();
        } catch (error) {
            console.error("Erro ao salvar limites:", error);
            setFeedback({ type: 'error', message: 'Erro ao salvar os limites.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <main className="relative min-h-screen bg-slate-900 text-white px-4 py-16 sm:px-6 lg:px-8">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-blue-600/20 rounded-full blur-3xl -z-0" />
            <div className="relative z-10 max-w-4xl mx-auto">
                <div className="mb-12 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100">Configurar Limites de Pressão</h1>
                    <p className="text-slate-300 mt-2 text-lg">
                        {view === 'list' ? 'Gerencie os limites existentes ou configure novos.' : `Editando limites para ${selectedAsset?.name}`}
                    </p>
                </div>

                {feedback && view === 'list' && (
                    <div className={`mb-6 flex items-center gap-3 p-3 rounded-lg text-sm ${feedback.type === 'success' ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
                       {feedback.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                       {feedback.message}
                    </div>
                )}
                
                {isLoading && <div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>}

                {!isLoading && view === 'list' && (
                    <div className="space-y-8">
                        <div className="bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                            <h2 className="text-xl font-semibold mb-4 text-slate-200">Configurar Novo Limite</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="network" className="block text-sm font-medium text-slate-300 mb-2">1. Selecione a Rede</label>
                                    <select id="network" value={selectedNetworkId} onChange={(e) => setSelectedNetworkId(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3">
                                        <option value="">-- Escolha uma rede --</option>
                                        {networks.map(net => <option key={net.id} value={net.id}>{net.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="asset" className="block text-sm font-medium text-slate-300 mb-2">2. Selecione o Equipamento</label>
                                    <select id="asset" value={selectedAsset?.id || ''} onChange={(e) => handleConfigureNew(e.target.value)} disabled={!selectedNetworkId} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 disabled:bg-slate-800 disabled:cursor-not-allowed">
                                        <option value="">-- Escolha um equipamento --</option>
                                        {assetsAvailableToConfigure.map(asset => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                            <h2 className="text-xl font-semibold mb-4 text-slate-200">Limites Atuais</h2>
                            {configuredAssets.length > 0 ? (
                                <ul className="space-y-3">
                                    {configuredAssets.map(asset => (
                                        <li key={asset.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900/50 rounded-lg">
                                            <div>
                                                <p className="font-semibold text-slate-100">{asset.name}</p>
                                                <p className="text-sm text-slate-400">{asset.networkName} | Baixo: {asset.limitLow ?? 'N/A'}, Normal: {asset.limitNormal ?? 'N/A'}, Risco: {asset.limitRisk ?? 'N/A'}, Crítico: {asset.limitCritical ?? 'N/A'}</p>
                                            </div>
                                            <div className="flex items-center gap-2 mt-3 sm:mt-0">
                                                <button onClick={() => handleEdit(asset)} className="flex items-center gap-2 bg-blue-600/80 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-600 transition"><Edit className="w-4 h-4"/>Alterar</button>
                                                <button onClick={() => handleDelete(asset)} className="flex items-center gap-2 bg-red-600/80 text-white px-3 py-1.5 rounded-md text-sm hover:bg-red-600 transition"><Trash2 className="w-4 h-4"/>Excluir</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-center text-slate-400 py-4">Nenhum limite configurado.</p>}
                        </div>
                    </div>
                )}
                
                {view === 'form' && selectedAsset && (
                    <form onSubmit={handleSubmit} className="bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
                        {feedback && (
                            <div className={`flex items-center gap-3 p-3 rounded-lg text-sm ${feedback.type === 'success' ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
                                {feedback.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                {feedback.message}
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="low" className="block text-sm font-medium text-slate-400 mb-2">Fora de Operação (bar)</label>
                                <input type="number" step="0.1" name="low" value={limits.low} onChange={(e) => setLimits({...limits, low: e.target.value})} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3" placeholder="Ex: 5.0"/>
                            </div>
                             <div>
                                <label htmlFor="normal" className="block text-sm font-medium text-green-400 mb-2">Normal (bar)</label>
                                <input type="number" step="0.1" name="normal" value={limits.normal} onChange={(e) => setLimits({...limits, normal: e.target.value})} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3" placeholder="Ex: 7.5"/>
                            </div>
                             <div>
                                <label htmlFor="risk" className="block text-sm font-medium text-yellow-400 mb-2">Alerta (bar)</label>
                                <input type="number" step="0.1" name="risk" value={limits.risk} onChange={(e) => setLimits({...limits, risk: e.target.value})} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3" placeholder="Ex: 8.5"/>
                            </div>
                             <div>
                                <label htmlFor="critical" className="block text-sm font-medium text-red-400 mb-2">Crítico (bar)</label>
                                <input type="number" step="0.1" name="critical" value={limits.critical} onChange={(e) => setLimits({...limits, critical: e.target.value})} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3" placeholder="Ex: 9.0"/>
                            </div>
                        </div>
                        <div className="flex justify-end items-center gap-4 pt-4 border-t border-slate-700">
                           <button type="button" onClick={handleBackToList} className="flex items-center gap-2 text-slate-300 font-bold px-6 py-3 rounded-lg hover:bg-slate-700">
                                <ArrowLeft className="w-5 h-5"/>Voltar
                            </button>
                            <button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 text-white font-bold px-6 py-3 rounded-lg">
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin"/> : <Settings className="w-5 h-5"/>}
                                <span>Salvar Limites</span>
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </main>
    );
}
