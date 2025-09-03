"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, ArrowRight, Check, Wifi, WifiOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Import controllers and authentication hooks
import { useAuth } from "@/lib/controllers/authcontroller"
import assetsController, { Network, AssetCreationData } from "@/lib/controllers/assetscontroller"
import * as AccountAlerts from "@/components/allerts/accountsallert"

export default function CreateAssetPage() {
  const router = useRouter()
  const { account, loading: authLoading } = useAuth()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [networks, setNetworks] = useState<Network[]>([])
  const [loading, setLoading] = useState(true)
  const [assetData, setAssetData] = useState<AssetCreationData>({
    networkId: "",
    networkName: "",
    name: "",
    type: "compressor",
    model: "",
    description: "",
    location: "",
    maxPressure: "",
    powerRating: "",
    apiUrl: "https://api-cpsdata-ashy.vercel.app/api/cps-data",
    apiKey: "",
  })
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Route Protection: Redirect if not admin
  useEffect(() => {
    if (!authLoading && account?.role !== 'admin') {
      router.push('/login');
    }
  }, [account, authLoading, router]);

  // Fetch networks from controller
  useEffect(() => {
    async function fetchNetworks() {
      // CORREÇÃO 1: Removida a variável 'error' não utilizada.
      try {
        const networksList = await assetsController.getNetworks();
        setNetworks(networksList)
      } catch {
        AccountAlerts.showError("Falha ao buscar redes.");
      } finally {
        setLoading(false)
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
  ]

  const handleInputChange = (field: keyof AssetCreationData, value: string) => {
    setAssetData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNetworkChange = (networkId: string) => {
    const selectedNetwork = networks.find((network) => network.id === networkId)
    if (selectedNetwork) {
      setAssetData((prev) => ({
        ...prev,
        networkId,
        networkName: selectedNetwork.name,
        apiUrl: selectedNetwork.apiUrl || "https://api-cpsdata-ashy.vercel.app/api/cps-data",
        apiKey: selectedNetwork.apiKey || "",
      }))
    }
  }

  const testApiConnection = async () => {
    setIsTestingConnection(true)
    setConnectionStatus("idle")
    try {
      const response = await fetch(assetData.apiUrl)
      if (response.ok) {
        setConnectionStatus("success")
        AccountAlerts.showSuccess("Conexão estabelecida com sucesso!");
      } else {
        setConnectionStatus("error")
        AccountAlerts.showError("Falha na conexão com a API.");
      }
    } catch (error) {
      console.error("Erro ao testar conexão:", error)
      setConnectionStatus("error")
      AccountAlerts.showError("Erro ao testar a URL da API.");
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await assetsController.createAsset(assetData)
      await AccountAlerts.confirmAction({
          title: "Sucesso!",
          text: "O novo ativo foi criado e associado à rede.",
          icon: 'info',
          confirmButtonText: "OK"
      });
      router.push("/system/admin/network") // Redirect to network list
    } catch (error: unknown) { // CORREÇÃO 2: Trocado 'any' por 'unknown'
      console.error("Erro ao salvar ativo:", error)
      if (error instanceof Error) {
        AccountAlerts.showError(error.message || "Erro ao criar ativo.")
      } else {
        AccountAlerts.showError("Ocorreu um erro desconhecido ao criar o ativo.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/system/admin/network" className="flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Redes
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Novo Ativo</h1>
          <p className="text-gray-600">Adicione um novo equipamento a uma rede de monitoramento existente.</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${ currentStep >= step.number ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 text-gray-400" }`}>
                  {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${currentStep >= step.number ? "text-blue-600" : "text-gray-400"}`}>{step.title}</p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${currentStep > step.number ? "bg-blue-600" : "bg-gray-300"}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl p-8 shadow-sm border">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Selecionar Rede</h2>
              {networks.length > 0 ? (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rede de Monitoramento *</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {networks.map((network) => (
                      <div key={network.id} className={`border rounded-lg p-4 cursor-pointer transition-all ${ assetData.networkId === network.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300" }`} onClick={() => handleNetworkChange(network.id)}>
                        <h3 className="font-medium text-gray-900">{network.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{network.location || "Sem localização"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Nenhuma rede encontrada. Crie uma rede primeiro.</p>
                  <Link href="/system/admin/network/create-network" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Criar Nova Rede
                  </Link>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Detalhes do Ativo</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Ativo *</label>
                  <input type="text" value={assetData.name} onChange={(e) => handleInputChange("name", e.target.value)} placeholder="Ex: Compressor A1" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo do Ativo *</label>
                  <select value={assetData.type} onChange={(e) => handleInputChange("type", e.target.value as AssetCreationData['type'])} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required >
                    <option value="compressor">Compressor</option>
                    <option value="sensor">Sensor</option>
                    <option value="distributor">Distribuidor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Modelo/Marca</label>
                  <input type="text" value={assetData.model} onChange={(e) => handleInputChange("model", e.target.value)} placeholder="Ex: Atlas Copco GA30" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Localização</label>
                  <input type="text" value={assetData.location} onChange={(e) => handleInputChange("location", e.target.value)} placeholder="Ex: Setor A - Linha 1" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                {assetData.type === "compressor" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pressão Máxima (bar)</label>
                      <input type="number" value={assetData.maxPressure} onChange={(e) => handleInputChange("maxPressure", e.target.value)} placeholder="Ex: 8" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Potência (kW)</label>
                      <input type="number" value={assetData.powerRating} onChange={(e) => handleInputChange("powerRating", e.target.value)} placeholder="Ex: 30" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Conexão com API</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL da API *</label>
                  <input type="url" value={assetData.apiUrl} onChange={(e) => handleInputChange("apiUrl", e.target.value)} placeholder="https://api-cpsdata-ashy.vercel.app/api/cps-data" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Testar Conexão</h3>
                    <button onClick={testApiConnection} disabled={!assetData.apiUrl || isTestingConnection} className={`px-4 py-2 rounded-lg font-medium transition-colors ${ !assetData.apiUrl || isTestingConnection ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white" }`}>
                      {isTestingConnection ? "Testando..." : "Testar Conexão"}
                    </button>
                  </div>
                  {connectionStatus !== "idle" && (
                    <div className={`flex items-center space-x-2 p-3 rounded-lg ${ connectionStatus === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800" }`}>
                      {connectionStatus === "success" ? ( <><Wifi className="w-5 h-5" /><span>Conexão bem-sucedida!</span></> ) : ( <><WifiOff className="w-5 h-5" /><span>Falha na conexão.</span></> )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button onClick={handlePrevious} disabled={currentStep === 1} className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${ currentStep === 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300 text-gray-800" }`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </button>
            {currentStep < 3 ? (
              <button onClick={handleNext} disabled={currentStep === 1 && !assetData.networkId} className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${ currentStep === 1 && !assetData.networkId ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white" }`}>
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={isSubmitting || !assetData.name} className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${ isSubmitting || !assetData.name ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white" }`}>
                <Check className="w-4 h-4 mr-2" />
                {isSubmitting ? "Criando..." : "Criar Ativo"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
