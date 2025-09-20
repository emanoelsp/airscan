"use client"

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/controllers/authcontroller";
import assetsController, { Asset, Network } from "@/lib/controllers/assetscontroller";
import supportController, { TicketCreationData } from "@/lib/controllers/supportcontroller";
import * as Alerts from "@/components/allerts/accountsallert";
import { 
    ArrowLeft,
    FilePlus,
    Loader2,
    Send,
    Network as NetworkIcon,
    HardDrive,
    AlertTriangle,
    Wrench,
    Info
} from "lucide-react";

// Define um tipo para o estado do formulário para garantir a compatibilidade.
type TicketFormData = Pick<TicketCreationData, "networkId" | "assetId" | "priority" | "issueType" | "subject" | "description"> & {
    errorCode: string;
    operatorObservation: string;
};

const initialTicketState: TicketFormData = {
    networkId: "",
    assetId: "",
    priority: "normal", // Este valor agora corresponde ao tipo esperado.
    issueType: "general",
    subject: "",
    description: "",
    errorCode: "",
    operatorObservation: ""
};

export default function RegisterTicketPage() {
    const router = useRouter();
    const { account, loading: authLoading } = useAuth();
    
    const [ticketData, setTicketData] = useState<TicketFormData>(initialTicketState);
    const [networks, setNetworks] = useState<Network[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                    setAssets(fetchedAssets);
                } catch (error) {
                    // CORREÇÃO: Adiciona o log do erro para depuração, resolvendo o warning.
                    console.error("Falha ao carregar dados iniciais:", error);
                    Alerts.showError("Falha ao carregar redes e equipamentos.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchInitialData();
        }
    }, [account, authLoading]);

    useEffect(() => {
        if (ticketData.networkId) {
            setFilteredAssets(assets.filter(asset => asset.networkId === ticketData.networkId));
            setTicketData(prev => ({ ...prev, assetId: "" })); // Reset asset selection
        } else {
            setFilteredAssets([]);
        }
    }, [ticketData.networkId, assets]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        // Garante que a prioridade seja tratada com o tipo correto
        if (name === 'priority') {
            setTicketData(prev => ({ ...prev, [name]: value as TicketFormData['priority'] }));
        } else {
            setTicketData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!account) return;

        setIsSubmitting(true);
        try {
            // O objeto enviado agora está em conformidade com TicketCreationData.
            await supportController.createTicket({
                ...ticketData,
                accountId: account.id,
                contactName: account.contactName,
                email: account.email,
                companyName: account.companyName,
            });
            await Alerts.confirmAction({
                title: "Chamado Enviado!",
                text: "Sua solicitação foi registrada. Nossa equipe entrará em contato em breve.",
                icon: "info"
            });
            router.push("/system/client/support/ticket_view");
        } catch (error) {
            Alerts.showError(error instanceof Error ? error.message : "Não foi possível abrir o chamado.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="relative min-h-screen bg-slate-900 text-white px-4 py-16 sm:px-6 lg:px-8">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-cyan-600/20 rounded-full blur-3xl -z-0" />
            <div className="relative z-10 max-w-4xl mx-auto">
                 <div className="mb-8">
                    <Link href="/system/client/support" className="flex items-center text-blue-400 hover:text-blue-300 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar para a Central de Suporte
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
                        <FilePlus className="w-8 h-8"/>
                        Abrir Novo Chamado de Suporte
                    </h1>
                    <p className="text-slate-300 mt-2">
                        Detalhe o problema para que nossa equipe possa ajudar da forma mais eficiente possível.
                    </p>
                </div>
                
                {isLoading ? (
                    <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin"/></div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-8 space-y-8">
                        {/* Seção de Identificação */}
                        <div className="border-b border-white/10 pb-8">
                            <h2 className="text-xl font-semibold text-white mb-6">1. Identificação do Equipamento</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="networkId" className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2"><NetworkIcon className="w-4 h-4"/>Rede</label>
                                    <select id="networkId" name="networkId" value={ticketData.networkId} onChange={handleInputChange} required className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3">
                                        <option value="">Selecione a rede...</option>
                                        {networks.map(net => <option key={net.id} value={net.id}>{net.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="assetId" className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2"><HardDrive className="w-4 h-4"/>Equipamento</label>
                                    <select id="assetId" name="assetId" value={ticketData.assetId} onChange={handleInputChange} required disabled={!ticketData.networkId} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 disabled:opacity-50">
                                        <option value="">Selecione o equipamento...</option>
                                        {filteredAssets.map(asset => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Seção de Detalhes do Problema */}
                        <div className="border-b border-white/10 pb-8">
                            <h2 className="text-xl font-semibold text-white mb-6">2. Detalhes do Problema</h2>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="priority" className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2"><AlertTriangle className="w-4 h-4"/>Prioridade</label>
                                    <select id="priority" name="priority" value={ticketData.priority} onChange={handleInputChange} required className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3">
                                        <option value="low">Baixa - O problema não impede a operação</option>
                                        <option value="normal">Normal - Operação parcialmente afetada</option>
                                        <option value="high">Alta - Operação significativamente afetada</option>
                                        <option value="critical">Crítica - Produção parada</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="issueType" className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2"><Wrench className="w-4 h-4"/>Tipo de Problema</label>
                                    <select id="issueType" name="issueType" value={ticketData.issueType} onChange={handleInputChange} required className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3">
                                        <option value="general">Dúvida ou Consulta Geral</option>
                                        <option value="mechanical">Problema Mecânico (Ruído, Vibração)</option>
                                        <option value="electrical">Problema Elétrico (Não liga, desarma)</option>
                                        <option value="performance">Problema de Performance (Baixa pressão, vazamento)</option>
                                        <option value="panel">Problema no Painel/Controlador</option>
                                        <option value="maintenance">Solicitação de Manutenção</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                     <label htmlFor="subject" className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2"><Info className="w-4 h-4"/>Assunto</label>
                                     <input id="subject" name="subject" type="text" value={ticketData.subject} onChange={handleInputChange} required placeholder="Ex: Compressor principal não atinge a pressão" className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3"/>
                                </div>
                                <div className="md:col-span-2">
                                     <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">Descrição Completa</label>
                                     <textarea id="description" name="description" value={ticketData.description} onChange={handleInputChange} required rows={5} placeholder="Descreva o que está acontecendo, quando começou, e quais ações já foram tomadas." className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3"></textarea>
                                </div>
                                <div>
                                    <label htmlFor="errorCode" className="block text-sm font-medium text-slate-300 mb-2">Código de Erro (se houver)</label>
                                    <input id="errorCode" name="errorCode" type="text" value={ticketData.errorCode} onChange={handleInputChange} placeholder="Ex: E101, F2" className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3" />
                                </div>
                                <div>
                                    <label htmlFor="operatorObservation" className="block text-sm font-medium text-slate-300 mb-2">Observação do Operador</label>
                                    <input id="operatorObservation" name="operatorObservation" type="text" value={ticketData.operatorObservation} onChange={handleInputChange} placeholder="Ex: Estava fazendo um barulho estranho antes de parar." className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3" />
                                </div>
                             </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button type="submit" disabled={isSubmitting} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-bold px-8 py-3 rounded-lg">
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5"/>}
                                {isSubmitting ? "Enviando..." : "Enviar Chamado"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </main>
    );
}

