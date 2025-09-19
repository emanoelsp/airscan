// src/app/system/client/alerts/page.tsx

"use client"

import { useState, useEffect, FormEvent, useMemo } from "react";
import { useAuth } from "@/lib/controllers/authcontroller";
import assetsController, { Asset, Network } from "@/lib/controllers/assetscontroller";
import { confirmContactDelete } from "@/components/allerts/receiptallert"; // Reutilizando o alerta
import Swal from "sweetalert2";
import { Trash2, Save, Loader2, BellRing, Plus, X } from "lucide-react";

export default function ManageAssetContactsPage() {
    const { account, loading: authLoading } = useAuth();
    
    // Estados para seleção
    const [networks, setNetworks] = useState<Network[]>([]);
    const [allAssets, setAllAssets] = useState<Asset[]>([]);
    const [selectedNetworkId, setSelectedNetworkId] = useState('');
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Estados do Formulário
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [name, setName] = useState('');
    const [emails, setEmails] = useState<string[]>([]);
    const [currentEmail, setCurrentEmail] = useState('');
    const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
    const [currentPhone, setCurrentPhone] = useState('');

    // Efeito para carregar redes e ativos
    useEffect(() => {
        if (!authLoading && account?.id) {
            const fetchInitialData = async () => {
                setIsLoading(true);
                try {
                    const [fetchedNetworks, fetchedAssets] = await Promise.all([
                        assetsController.getNetworksByAccountId(account.id),
                        assetsController.getAssetsByAccountId(account.id)
                    ]);
                    setNetworks(fetchedNetworks);
                    setAllAssets(fetchedAssets);
                } catch (error) {
                    console.error("Erro ao carregar dados iniciais:", error);
                    setFeedback({ type: 'error', message: 'Falha ao carregar dados.' });
                } finally {
                    setIsLoading(false);
                }
            };
            fetchInitialData();
        }
    }, [account, authLoading]);
    
    // Efeito para popular o formulário quando um ativo é selecionado
    useEffect(() => {
        if (selectedAsset) {
            setName(selectedAsset.contactName || '');
            setEmails(selectedAsset.contactEmails || []);
            setPhoneNumbers(selectedAsset.contactPhones || []);
        } else {
            // Limpa o formulário se nenhum ativo estiver selecionado
            setName('');
            setEmails([]);
            setPhoneNumbers([]);
        }
        setCurrentEmail('');
        setCurrentPhone('');
        setFeedback(null);
    }, [selectedAsset]);

    const filteredAssets = useMemo(() => {
        if (!selectedNetworkId) return [];
        return allAssets.filter(asset => asset.networkId === selectedNetworkId);
    }, [selectedNetworkId, allAssets]);

    const handleAssetSelection = (assetId: string) => {
        const asset = allAssets.find(a => a.id === assetId) || null;
        setSelectedAsset(asset);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedAsset) return;
        setIsSubmitting(true);
        setFeedback(null);
        try {
            const contactsToUpdate = { contactName: name, contactEmails: emails, contactPhones: phoneNumbers };
            await assetsController.updateAsset(selectedAsset.id, contactsToUpdate);

            // Atualiza o estado local para refletir a mudança instantaneamente
            setAllAssets(allAssets.map(a => a.id === selectedAsset.id ? { ...a, ...contactsToUpdate } : a));
            setSelectedAsset(prev => prev ? { ...prev, ...contactsToUpdate } : null);

            setFeedback({ type: 'success', message: 'Contatos salvos com sucesso!' });
        } catch (error) {
            console.error("Erro ao salvar contatos:", error);
            setFeedback({ type: 'error', message: 'Ocorreu um erro ao salvar.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedAsset) return;
        const result = await confirmContactDelete(selectedAsset.contactName || 'este grupo');
        if (result.isConfirmed) {
            try {
                await assetsController.deleteAssetContacts(selectedAsset.id);

                // Limpa os contatos do estado local
                const updatedAsset = { ...selectedAsset };
                delete updatedAsset.contactName;
                delete updatedAsset.contactEmails;
                delete updatedAsset.contactPhones;
                setAllAssets(allAssets.map(a => a.id === selectedAsset.id ? updatedAsset : a));
                setSelectedAsset(updatedAsset);

                Swal.fire('Excluído!', 'Os contatos deste ativo foram removidos.', 'success');
            } catch (error) {
                console.error("Erro ao excluir contatos:", error);
                Swal.fire('Erro!', 'Falha ao excluir os contatos.', 'error');
            }
        }
    };

    // Funções auxiliares do formulário
    const handleAddEmail = () => { if (currentEmail && !emails.includes(currentEmail)) { setEmails([...emails, currentEmail]); setCurrentEmail(''); }};
    const handleRemoveEmail = (index: number) => setEmails(emails.filter((_, i) => i !== index));
    const handleAddPhone = () => { if (currentPhone) { setPhoneNumbers([...phoneNumbers, currentPhone]); setCurrentPhone(''); }};
    const handleRemovePhone = (index: number) => setPhoneNumbers(phoneNumbers.filter((_, i) => i !== index));

    return (
        <main className="relative min-h-screen bg-slate-900 text-white px-4 py-16 sm:px-6 lg:px-8">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-blue-600/20 rounded-full blur-3xl -z-0" />
            <div className="relative z-10 max-w-5xl mx-auto space-y-12">
                <div className="text-center">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100">Contatos para Alertas por Equipamento</h1>
                    <p className="text-slate-300 mt-2 text-lg">Selecione um equipamento para adicionar, editar ou remover seus contatos de alerta.</p>
                </div>

                <div className="bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label htmlFor="network" className="block text-sm font-medium text-slate-300 mb-2">1. Selecione a Rede</label>
                        <select id="network" value={selectedNetworkId} onChange={e => { setSelectedNetworkId(e.target.value); setSelectedAsset(null); }} disabled={isLoading} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 disabled:opacity-50">
                            <option value="">-- Escolha uma rede --</option>
                            {networks.map(net => <option key={net.id} value={net.id}>{net.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="asset" className="block text-sm font-medium text-slate-300 mb-2">2. Selecione o Equipamento</label>
                        <select id="asset" value={selectedAsset?.id || ''} onChange={e => handleAssetSelection(e.target.value)} disabled={!selectedNetworkId || isLoading} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 disabled:opacity-50">
                            <option value="">-- Escolha um equipamento --</option>
                            {filteredAssets.map(asset => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
                        </select>
                    </div>
                </div>

                {selectedAsset && (
                    <div className="bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8">
                        <h2 className="text-xl font-semibold text-slate-100 mb-6 flex items-center gap-3">
                            <BellRing className="w-6 h-6 text-yellow-400"/>
                            {`Editando contatos de: "${selectedAsset.name}"`}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="contactName" className="block text-sm font-medium text-slate-300 mb-2">Nome do Grupo de Contato (Opcional)</label>
                                <input type="text" id="contactName" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3" placeholder="Ex: Equipe de Manutenção" />
                            </div>
                            
                            {/* Seção de E-mails */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-slate-300">E-mails para Alerta</label>
                                <div className="flex gap-2">
                                    <input type="email" value={currentEmail} onChange={e => setCurrentEmail(e.target.value)} className="flex-grow bg-slate-700/50 border border-slate-600 rounded-lg p-3" placeholder="novo.email@exemplo.com" />
                                    <button type="button" onClick={handleAddEmail} className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-lg flex items-center justify-center"><Plus className="w-5 h-5"/></button>
                                </div>
                                <div className="space-y-2">
                                    {emails.map((email, index) => (
                                        <div key={index} className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg text-sm">
                                            <span>{email}</span>
                                            <button type="button" onClick={() => handleRemoveEmail(index)} className="text-red-400 hover:text-red-300 p-1"><X className="w-4 h-4"/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Seção de Telefones */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-slate-300">Telefones para Alerta (WhatsApp)</label>
                                <div className="flex gap-2">
                                    <input type="tel" value={currentPhone} onChange={e => setCurrentPhone(e.target.value)} className="flex-grow bg-slate-700/50 border border-slate-600 rounded-lg p-3" placeholder="+55 (47) 99999-9999" />
                                    <button type="button" onClick={handleAddPhone} className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-lg flex items-center justify-center"><Plus className="w-5 h-5"/></button>
                                </div>
                                <div className="space-y-2">
                                    {phoneNumbers.map((phone, index) => (
                                        <div key={index} className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg text-sm">
                                            <span>{phone}</span>
                                            <button type="button" onClick={() => handleRemovePhone(index)} className="text-red-400 hover:text-red-300 p-1"><X className="w-4 h-4"/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                             {feedback && (
                                <p className={`text-sm text-center font-semibold ${feedback.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                    {feedback.message}
                                </p>
                            )}

                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-700">
                                <button type="button" onClick={handleDelete} disabled={!selectedAsset.contactName && !selectedAsset.contactEmails?.length && !selectedAsset.contactPhones?.length} className="w-full sm:w-auto text-red-400 font-bold px-6 py-3 rounded-lg hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    <Trash2 className="w-5 h-5"/> Excluir Contatos
                                </button>
                                <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-600 text-slate-900 font-bold px-6 py-3 rounded-lg flex items-center justify-center gap-2">
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5"/>}
                                    {isSubmitting ? 'Salvando...' : 'Salvar Contatos'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </main>
    );
}

