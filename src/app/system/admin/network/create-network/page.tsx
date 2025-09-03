"use client";

import { useState, useEffect, ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
    ArrowLeft, ArrowRight, Check, Wifi, WifiOff, Loader2, Building2, Share2, 
    Type, Server, Gauge, Zap, Link2, KeyRound, FileText, MapPin 
} from "lucide-react";
import { useAuth } from "@/lib/controllers/authcontroller";
import accountsController, { Account } from "@/lib/controllers/accountscontroller";
import networkController from "@/lib/controllers/networkcontroller";
import * as AccountAlerts from "@/components/allerts/accountsallert";

// --- REUSABLE FORM COMPONENTS ---

type InputFieldProps = {
    icon: React.ElementType;
    id: string;
    label: string;
    type?: string;
    placeholder: string;
    required?: boolean;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function InputField({ icon: Icon, id, label, type = "text", placeholder, required = true, value, onChange }: InputFieldProps): ReactElement {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-slate-300">{label}</label>
            <div className="relative mt-2">
                <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input id={id} name={id} type={type} required={required} placeholder={placeholder} value={value} onChange={onChange}
                    className="block w-full rounded-md border-0 bg-slate-800/50 py-3 pl-10 text-white shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-yellow-400 sm:text-sm"
                />
            </div>
        </div>
    );
}

type TextareaFieldProps = {
    icon: React.ElementType;
    id: string;
    label: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

function TextareaField({ icon: Icon, id, label, placeholder, value, onChange }: TextareaFieldProps): ReactElement {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-slate-300">{label}</label>
            <div className="relative mt-2">
                <Icon className="pointer-events-none absolute left-3 top-4 w-5 h-5 text-slate-400" />
                <textarea id={id} name={id} rows={4} placeholder={placeholder} value={value} onChange={onChange}
                    className="block w-full rounded-md border-0 bg-slate-800/50 py-3 pl-10 text-white shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-yellow-400 sm:text-sm"
                />
            </div>
        </div>
    );
}


export default function CreateNetworkPage() {
  const router = useRouter();
  const { account, loading: authLoading } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [clients, setClients] = useState<Account[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [networkData, setNetworkData] = useState({
    name: "", description: "", location: "", compressorType: "", compressorModel: "",
    maxPressure: "", powerRating: "", apiUrl: "", apiKey: "",
    clientId: "", clientCompanyName: "",
  });
  
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientList = await accountsController.getAccounts();
        setClients(clientList.filter(c => c.role === 'cliente'));
      } catch {
        AccountAlerts.showError("Falha ao carregar a lista de clientes.");
      } finally {
        setLoadingClients(false);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    if (!authLoading && account?.role !== 'admin') {
      router.push('/login');
    }
  }, [account, authLoading, router]);

  const steps = [
    { number: 1, title: "Configurar Rede", description: "Informações e cliente" },
    { number: 2, title: "Ativo Principal", description: "Dados do compressor" },
    { number: 3, title: "Conexão API", description: "Configurar dados" },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNetworkData(prev => ({ ...prev, [name]: value }));
  };

  const handleClientChange = (clientId: string) => {
    const selectedClient = clients.find(c => c.id === clientId);
    if (selectedClient) {
      setNetworkData(prev => ({
        ...prev,
        clientId: selectedClient.id,
        clientCompanyName: selectedClient.companyName,
        name: `Rede - ${selectedClient.companyName}`,
      }));
    }
  };

  const testApiConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus("idle");
    try {
      const response = await fetch(networkData.apiUrl, { headers: { 'ngrok-skip-browser-warning': 'true' } });
      if (response.ok) {
        setConnectionStatus("success");
        AccountAlerts.showSuccess("Conexão estabelecida com sucesso!");
      } else { throw new Error(`Status ${response.status}`); }
    } catch (error) {
      setConnectionStatus("error");
      AccountAlerts.showError("Erro ao testar a URL da API.");
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleNext = () => { if (currentStep < 3) setCurrentStep(currentStep + 1); };
  const handlePrevious = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await networkController.createNetworkAndAsset(networkData);
      await AccountAlerts.confirmAction({
        title: "Sucesso!", text: "Rede e ativo principal criados.",
        icon: 'info', confirmButtonText: "OK"
      });
      router.push("/system/admin/network");
    } catch (error) {
      AccountAlerts.showError(error instanceof Error ? error.message : "Erro ao criar rede.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loadingClients) {
    return (
      <main className="relative min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-yellow-400" />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-slate-900 text-white px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-blue-600/20 rounded-full blur-3xl -z-0" aria-hidden="true" />
        <div className="relative z-10 max-w-4xl mx-auto">
            <div className="mb-8">
                <Link href="/system/admin/network" className="flex items-center text-blue-400 hover:text-blue-300 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para a Lista de Redes
                </Link>
                <h1 className="text-3xl font-bold text-slate-100 mb-2">Criar Nova Rede</h1>
                <p className="text-slate-300">Configure uma nova rede e seu ativo principal.</p>
            </div>

            <div className="bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8">
                <ol className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
                    {steps.map((step, index) => (
                        <li key={step.number} className="w-full flex items-center">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 flex-shrink-0 ${ currentStep >= step.number ? "bg-blue-500 border-blue-500 text-white" : "border-slate-600 text-slate-400" }`}>
                                {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                            </div>
                            <div className="ml-4">
                                <h4 className={`text-sm font-medium ${currentStep >= step.number ? "text-blue-400" : "text-slate-400"}`}>{step.title}</h4>
                                <p className="text-xs text-slate-500">{step.description}</p>
                            </div>
                            {index < steps.length - 1 && (<div className="w-full h-0.5 bg-slate-700 ml-4 hidden sm:block"></div>)}
                        </li>
                    ))}
                </ol>

                <div className="mt-8">
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-white mb-6">Configurar Rede</h2>
                            <div>
                                <label htmlFor="clientId" className="block text-sm font-medium text-slate-300 mb-2">Associar a um Cliente *</label>
                                <select id="clientId" name="clientId" value={networkData.clientId} onChange={(e) => handleClientChange(e.target.value)} required className="block w-full appearance-none rounded-md border-0 bg-slate-800/50 py-3 px-4 text-white shadow-sm ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-yellow-400 sm:text-sm">
                                    <option value="">Selecione um cliente</option>
                                    {clients.map(client => (<option key={client.id} value={client.id}>{client.companyName}</option>))}
                                </select>
                            </div>
                            <InputField icon={Share2} id="name" label="Nome da Rede *" placeholder="Ex: Rede - Nome da Empresa" value={networkData.name} onChange={handleInputChange} />
                            <InputField icon={MapPin} id="location" label="Localização" placeholder="Ex: Blumenau, SC" value={networkData.location} onChange={handleInputChange} required={false}/>
                            <TextareaField icon={FileText} id="description" label="Descrição da Rede" placeholder="Descreva o propósito desta rede" value={networkData.description} onChange={handleInputChange} />
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6">
                          <h2 className="text-xl font-semibold text-white mb-6">Ativo Principal (Compressor)</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField icon={Type} id="compressorType" label="Tipo do Compressor *" placeholder="Ex: Parafuso" value={networkData.compressorType} onChange={handleInputChange} />
                            <InputField icon={Server} id="compressorModel" label="Modelo/Marca" placeholder="Ex: Atlas Copco GA30" value={networkData.compressorModel} onChange={handleInputChange} required={false} />
                            <InputField icon={Gauge} id="maxPressure" label="Pressão Máxima (bar) *" type="number" placeholder="Ex: 8" value={networkData.maxPressure} onChange={handleInputChange} />
                            <InputField icon={Zap} id="powerRating" label="Potência (kW) *" type="number" placeholder="Ex: 30" value={networkData.powerRating} onChange={handleInputChange} />
                          </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-white mb-6">Conexão com API</h2>
                            <InputField icon={Link2} id="apiUrl" label="URL da API *" type="url" placeholder="https://.../api/data" value={networkData.apiUrl} onChange={handleInputChange} />
                            <InputField icon={KeyRound} id="apiKey" label="API Key (Opcional)" placeholder="Chave de acesso, se necessário" value={networkData.apiKey} onChange={handleInputChange} required={false} />
                            <div className="border border-slate-700 rounded-lg p-4 bg-slate-900/50">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium text-slate-200">Testar Conexão</h3>
                                    <button onClick={testApiConnection} disabled={!networkData.apiUrl || isTestingConnection} className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors text-slate-900 bg-yellow-400 hover:bg-yellow-500 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed">
                                        {isTestingConnection ? "Testando..." : "Testar"}
                                    </button>
                                </div>
                                {connectionStatus !== "idle" && (
                                    <div className={`mt-4 flex items-center space-x-2 p-3 rounded-lg text-sm font-medium ${ connectionStatus === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400" }`}>
                                        {connectionStatus === "success" ? (<><Wifi className="w-5 h-5" /><span>Conexão bem-sucedida!</span></>) : (<><WifiOff className="w-5 h-5" /><span>Falha na conexão.</span></>)}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
                    <button onClick={handlePrevious} disabled={currentStep === 1} className="flex items-center px-6 py-3 rounded-lg font-bold text-sm transition-colors bg-slate-700 hover:bg-slate-600 text-white disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed">
                        <ArrowLeft className="w-4 h-4 mr-2" />Anterior
                    </button>
                    {currentStep < 3 ? (
                        <button onClick={handleNext} disabled={(currentStep === 1 && !networkData.clientId) || (currentStep === 2 && !networkData.maxPressure)} className="flex items-center px-6 py-3 rounded-lg font-bold text-sm transition-colors bg-blue-600 hover:bg-blue-500 text-white disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed">
                            Próximo<ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    ) : (
                        <button onClick={handleSubmit} disabled={isSubmitting || !networkData.apiUrl} className="flex items-center px-6 py-3 rounded-lg font-bold text-sm transition-colors bg-green-600 hover:bg-green-500 text-white disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed">
                            <Check className="w-4 h-4 mr-2" />{isSubmitting ? "Criando..." : "Criar Rede"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    </main>
  );
}
