"use client"

import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "@/lib/controllers/authcontroller";
import assetsController, { Asset } from "@/lib/controllers/assetscontroller";
import { Settings, Loader2, CheckCircle, XCircle } from "lucide-react";

// --- PÁGINA PRINCIPAL ---
export default function SetThresholdPage() {
    const { account, loading: authLoading } = useAuth();
    
    // --- ESTADOS ---
    const [assets, setAssets] = useState<Asset[]>([]);
    const [selectedAssetId, setSelectedAssetId] = useState<string>('');
    const [limits, setLimits] = useState({
        low: '',
        normal: '',
        risk: '',
        critical: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // --- EFEITOS ---

    // Busca os equipamentos quando a conta do usuário é carregada
    useEffect(() => {
        // Roda o efeito apenas quando a autenticação não estiver mais carregando
        if (!authLoading) {
            const fetchAssets = async () => {
                if (account?.id) {
                    try {
                        setIsLoading(true);
                        const userAssets = await assetsController.getAssetsByAccountId(account.id);
                        setAssets(userAssets);
                    } catch (error) {
                        console.error(error);
                        setFeedback({ type: 'error', message: 'Falha ao carregar seus equipamentos.' });
                    } finally {
                        setIsLoading(false);
                    }
                } else {
                    // Se não houver conta, para de carregar e limpa a lista
                    setIsLoading(false);
                    setAssets([]);
                }
            };
            fetchAssets();
        }
    }, [account, authLoading]);

    // Atualiza os campos do formulário quando um equipamento é selecionado
    useEffect(() => {
        if (selectedAssetId) {
            const selectedAsset = assets.find(asset => asset.id === selectedAssetId);
            if (selectedAsset) {
                setLimits({
                    low: selectedAsset.limitLow?.toString() || '',
                    normal: selectedAsset.limitNormal?.toString() || '',
                    risk: selectedAsset.limitRisk?.toString() || '',
                    critical: selectedAsset.limitCritical?.toString() || ''
                });
            }
        } else {
            // Limpa o formulário se nenhum equipamento estiver selecionado
            setLimits({ low: '', normal: '', risk: '', critical: '' });
        }
    }, [selectedAssetId, assets]);


    // --- MANIPULADORES DE EVENTOS ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLimits(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedAssetId) {
            setFeedback({ type: 'error', message: 'Por favor, selecione um equipamento.' });
            return;
        }

        setIsSubmitting(true);
        setFeedback(null);

        try {
            const dataToUpdate = {
                limitLow: Number(limits.low),
                limitNormal: Number(limits.normal),
                limitRisk: Number(limits.risk),
                limitCritical: Number(limits.critical)
            };
            
            await assetsController.updateAsset(selectedAssetId, dataToUpdate);
            setFeedback({ type: 'success', message: 'Limites atualizados com sucesso!' });

            // Atualiza o estado local para refletir a mudança sem precisar recarregar
            setAssets(prevAssets => prevAssets.map(asset => 
                asset.id === selectedAssetId ? { ...asset, ...dataToUpdate } : asset
            ));

        } catch (error) {
            console.error(error);
            setFeedback({ type: 'error', message: 'Ocorreu um erro ao salvar os limites.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- RENDERIZAÇÃO ---
    return (
        <main className="relative min-h-screen bg-slate-900 text-white px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-yellow-600/10 rounded-full blur-3xl -z-0" aria-hidden="true" />
            <div className="relative z-10 max-w-4xl mx-auto">
                <div className="mb-12 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100">Definir Limites de Alerta</h1>
                    <p className="text-slate-300 mt-2 text-lg">
                        Selecione um equipamento e configure os valores para cada nível de criticidade.
                    </p>
                </div>

                <div className="bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="asset" className="block text-sm font-medium text-slate-300 mb-2">
                                    Selecione o Equipamento
                                </label>
                                <select
                                    id="asset"
                                    name="asset"
                                    value={selectedAssetId}
                                    onChange={(e) => setSelectedAssetId(e.target.value)}
                                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
                                >
                                    <option value="">-- Escolha um equipamento --</option>
                                    {assets.map(asset => (
                                        <option key={asset.id} value={asset.id}>{asset.name} - ({asset.model})</option>
                                    ))}
                                </select>
                            </div>

                            {selectedAssetId && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-700">
                                    {/* Limite Baixo */}
                                    <div>
                                        <label htmlFor="low" className="block text-sm font-medium text-blue-400 mb-2">Limite Baixo</label>
                                        <input type="number" name="low" id="low" value={limits.low} onChange={handleInputChange} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400" placeholder="Ex: 5.0" />
                                    </div>
                                    {/* Limite Normal */}
                                    <div>
                                        <label htmlFor="normal" className="block text-sm font-medium text-green-400 mb-2">Limite Normal</label>
                                        <input type="number" name="normal" id="normal" value={limits.normal} onChange={handleInputChange} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-400 focus:border-green-400" placeholder="Ex: 7.5" />
                                    </div>
                                    {/* Limite de Risco */}
                                    <div>
                                        <label htmlFor="risk" className="block text-sm font-medium text-orange-400 mb-2">Limite de Risco</label>
                                        <input type="number" name="risk" id="risk" value={limits.risk} onChange={handleInputChange} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-400 focus:border-orange-400" placeholder="Ex: 8.5" />
                                    </div>
                                    {/* Limite Crítico */}
                                    <div>
                                        <label htmlFor="critical" className="block text-sm font-medium text-red-400 mb-2">Limite Crítico</label>
                                        <input type="number" name="critical" id="critical" value={limits.critical} onChange={handleInputChange} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-400 focus:border-red-400" placeholder="Ex: 9.0" />
                                    </div>
                                </div>
                            )}

                            {feedback && (
                                <div className={`flex items-center gap-3 p-3 rounded-lg text-sm ${feedback.type === 'success' ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
                                    {feedback.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                    {feedback.message}
                                </div>
                            )}

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={!selectedAssetId || isSubmitting}
                                    className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 font-bold px-6 py-2 rounded-lg transition-all"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Settings className="w-5 h-5" />}
                                    <span>{isSubmitting ? 'Salvando...' : 'Salvar Limites'}</span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
}



