"use client";

import { useState, useEffect, ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
    ArrowLeft, ArrowRight, Check, Wifi, WifiOff, Loader2, HardDrive, 
    Server, Type, MapPin, Gauge, Zap, Link2, KeyRound 
} from "lucide-react";
import { useAuth } from "@/lib/controllers/authcontroller";
import networkController from "@/lib/controllers/networkcontroller";
// CORREÇÃO: Renomeia a importação para evitar conflito e estendê-la localmente
import assetsController, { Network as BaseNetwork, AssetCreationData } from "@/lib/controllers/assetscontroller";
import * as AccountAlerts from "@/components/allerts/accountsallert";


// --- TIPOS E INTERFACES LOCAIS ---

// CORREÇÃO: Cria uma interface local mais completa para o estado, estendendo a base
interface Network extends BaseNetwork {
    location?: string;
    apiUrl?: string;
    apiKey?: string;
}


// --- COMPONENTES DE FORMULÁRIO REUTILIZADOS ---
type InputFieldProps = {
    icon: React.ElementType;
    id: string;
    name: string;
    label: string;
    type?: string;
    placeholder: string;
    required?: boolean;
    value?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };
  
  function InputField({ icon: Icon, id, name, label, type = "text", placeholder, required = true, value, onChange }: InputFieldProps): ReactElement {
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-300">{label}</label>
        <div className="relative mt-2">
          <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input id={id} name={name} type={type} required={required} placeholder={placeholder} value={value} onChange={onChange}
            className="block w-full rounded-md border-0 bg-slate-800/50 py-3 pl-10 text-white shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-yellow-400 sm:text-sm"
          />
        </div>
      </div>
    );
}

type SelectFieldProps = {
    icon: React.ElementType;
    id: string;
    name: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    children: React.ReactNode;
};

function SelectField({ icon: Icon, id, name, label, value, onChange, children }: SelectFieldProps) {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-slate-300">{label}</label>
            <div className="relative mt-2">
                <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select id={id} name={name} value={value} onChange={onChange}
                    className="block w-full appearance-none rounded-md border-0 bg-slate-800/50 py-3 pl-10 pr-10 text-white shadow-sm ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-yellow-400 sm:text-sm">
                    {children}
                </select>
            </div>
        </div>
    );
}


export default function CreateAssetPage() {
  const router = useRouter();
  const { account, loading: authLoading } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  // CORREÇÃO: Usa a interface local mais completa para o estado
  const [networks, setNetworks] = useState<Network[]>([]);
  const [loading, setLoading] = useState(true);
  const [assetData, setAssetData] = useState<AssetCreationData>({
    accountId: "", 
    networkId: "", networkName: "", name: "", type: "compressor", model: "",
    description: "", location: "", maxPressure: "", powerRating: "",
    apiUrl: "", apiKey: "",
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && account?.role !== 'admin') {
      router.push('/login');
    }
  }, [account, authLoading, router]);

  useEffect(() => {
    async function fetchNetworks() {
      try {
        const networksList = await networkController.getNetworkSummaries();
        // CORREÇÃO: Faz o cast para a interface local
        setNetworks(networksList as Network[]);
      } catch (error) {
        console.error("Falha ao buscar redes:", error);
        AccountAlerts.showError("Falha ao buscar redes.");
      } finally {
        setLoading(false);
      }
    }
    if (account?.role === 'admin') {
        fetchNetworks();
    }
  }, [account]);

  const steps = [
    { number: 1, title: "Selecionar Rede", description: "Escolha a rede para o ativo" },
    { number: 2, title: "Detalhes do Ativo", description: "Informações do equipamento" },
    { number: 3, title: "Conexão API", description: "Configurar fonte de dados" },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAssetData(prev => ({ ...prev, [name]: value }));
  };

  const handleNetworkChange = (networkId: string) => {
    // CORREÇÃO: O cast não é mais necessário aqui, pois o estado já tem o tipo correto
    const selectedNetwork = networks.find(n => n.id === networkId);
    if (selectedNetwork) {
      setAssetData(prev => ({
        ...prev, 
        accountId: selectedNetwork.clientId, 
        networkId, 
        networkName: selectedNetwork.name,
        apiUrl: selectedNetwork.apiUrl || "",
        apiKey: selectedNetwork.apiKey || "",
      }));
    }
  };

  const testApiConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus("idle");
    try {
      const response = await fetch(assetData.apiUrl, { headers: { 'ngrok-skip-browser-warning': 'true' }});
      if (response.ok) {
        setConnectionStatus("success");
        AccountAlerts.showSuccess("Conexão estabelecida com sucesso!");
      } else {
        throw new Error(`Status ${response.status}`);
      }
    } catch (error) {
      console.error("Falha na conexão com a API:", error);
      setConnectionStatus("error");
      AccountAlerts.showError("Falha na conexão com a API.");
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    if (!assetData.accountId) {
        AccountAlerts.showError("Não foi possível identificar o cliente associado a esta rede.");
        setIsSubmitting(false);
        return;
    }
    try {
      await assetsController.createAsset(assetData);
      await AccountAlerts.confirmAction({
          title: "Sucesso!", text: "O novo ativo foi criado.",
          icon: 'info', confirmButtonText: "OK"
      });
      router.push("/system/admin/assets");
    } catch (error) {
      AccountAlerts.showError(error instanceof Error ? error.message : "Erro ao criar ativo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loading) {
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
          <Link href="/system/admin/assets" className="flex items-center text-blue-400 hover:text-blue-300 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Gerenciamento de Ativos
          </Link>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Criar Novo Ativo</h1>
          <p className="text-slate-300">Adicione um novo equipamento a uma rede de monitoramento.</p>
        </div>

        <div className="bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8">
            {/* STEPS - Mobile friendly */}
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
                        {index < steps.length - 1 && (
                            <div className="w-full h-0.5 bg-slate-700 ml-4 hidden sm:block"></div>
                        )}
                    </li>
                ))}
            </ol>


            {/* FORM CONTENT */}
            <div className="mt-8">
              {currentStep === 1 && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-6">Selecionar Rede</h2>
                  {networks.length > 0 ? (
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-slate-300 mb-2">Rede de Monitoramento *</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {networks.map(network => (
                          <div key={network.id} onClick={() => handleNetworkChange(network.id)}
                            className={`rounded-lg p-4 cursor-pointer transition-all border-2 ${ assetData.networkId === network.id ? "border-blue-500 bg-blue-500/10" : "border-slate-700 bg-slate-800/50 hover:border-slate-600" }`}>
                            <h3 className="font-medium text-slate-100">{network.name}</h3>
                            {/* CORREÇÃO: @ts-ignore removido pois o tipo agora está correto */}
                            <p className="text-sm text-slate-400 mt-1">{network.location || "Sem localização"}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-slate-800/50 rounded-lg">
                      <p className="text-slate-400 mb-4">Nenhuma rede encontrada.</p>
                      <Link href="/system/admin/network/create-network" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bold text-sm">
                        Criar Nova Rede
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-6">Detalhes do Ativo</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField icon={HardDrive} id="name" name="name" label="Nome do Ativo *" placeholder="Ex: Compressor Principal" value={assetData.name} onChange={handleInputChange} />
                    <SelectField icon={Type} id="type" name="type" label="Tipo do Ativo *" value={assetData.type} onChange={handleInputChange}>
                        <option value="compressor">Compressor</option><option value="sensor">Sensor</option><option value="distributor">Distribuidor</option>
                    </SelectField>
                    <InputField icon={Server} id="model" name="model" label="Modelo/Marca" placeholder="Ex: Atlas Copco GA30" value={assetData.model} onChange={handleInputChange} required={false} />
                    <InputField icon={MapPin} id="location" name="location" label="Localização" placeholder="Ex: Setor A - Linha 1" value={assetData.location} onChange={handleInputChange} required={false}/>
                    {assetData.type === "compressor" && (<>
                        <InputField icon={Gauge} id="maxPressure" name="maxPressure" type="number" label="Pressão Máxima (bar)" placeholder="Ex: 8" value={assetData.maxPressure} onChange={handleInputChange} required={false} />
                        <InputField icon={Zap} id="powerRating" name="powerRating" type="number" label="Potência (kW)" placeholder="Ex: 30" value={assetData.powerRating} onChange={handleInputChange} required={false} />
                    </>)}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-6">Conexão com API</h2>
                  <div className="space-y-6">
                    <InputField icon={Link2} id="apiUrl" name="apiUrl" label="URL da API *" type="url" placeholder="https://.../api/data" value={assetData.apiUrl} onChange={handleInputChange} />
                    <InputField icon={KeyRound} id="apiKey" name="apiKey" label="API Key (Opcional)" placeholder="Chave de acesso, se necessário" value={assetData.apiKey} onChange={handleInputChange} required={false} />
                    <div className="border border-slate-700 rounded-lg p-4 bg-slate-900/50">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-slate-200">Testar Conexão</h3>
                            <button onClick={testApiConnection} disabled={!assetData.apiUrl || isTestingConnection} className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors text-slate-900 bg-yellow-400 hover:bg-yellow-500 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed">
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
                </div>
              )}
            </div>

            {/* NAVIGATION BUTTONS */}
            <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
              <button onClick={handlePrevious} disabled={currentStep === 1} className="flex items-center px-6 py-3 rounded-lg font-bold text-sm transition-colors bg-slate-700 hover:bg-slate-600 text-white disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed">
                <ArrowLeft className="w-4 h-4 mr-2" />Anterior
              </button>
              {currentStep < 3 ? (
                <button onClick={handleNext} disabled={(currentStep === 1 && !assetData.networkId) || (currentStep === 2 && !assetData.name)} className="flex items-center px-6 py-3 rounded-lg font-bold text-sm transition-colors bg-blue-600 hover:bg-blue-500 text-white disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed">
                  Próximo<ArrowRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={isSubmitting || !assetData.name} className="flex items-center px-6 py-3 rounded-lg font-bold text-sm transition-colors bg-green-600 hover:bg-green-500 text-white disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed">
                  <Check className="w-4 h-4 mr-2" />{isSubmitting ? "Criando..." : "Criar Ativo"}
                </button>
              )}
            </div>
        </div>
      </div>
    </main>
  );
}

