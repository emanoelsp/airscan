"use client"

import { useState } from "react"
import { ArrowLeft, ArrowRight, Check, Wifi, WifiOff } from "lucide-react"
import Link from "next/link"
import { db } from "@/lib/model/firebase"
import { collection, addDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"

export default function CreateNetworkPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [networkData, setNetworkData] = useState({
    name: "",
    description: "",
    location: "",
    compressorType: "",
    compressorModel: "",
    maxPressure: "",
    powerRating: "",
    apiUrl: "https://api-cpsdata-ashy.vercel.app/api/cps-data",
    apiKey: "",
  })
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const steps = [
    { number: 1, title: "Configurar Rede", description: "Informações básicas da rede" },
    { number: 2, title: "Ativo Principal", description: "Dados do compressor principal" },
    { number: 3, title: "Conexão API", description: "Configurar fonte de dados" },
  ]

  const handleInputChange = (field: string, value: string) => {
    setNetworkData((prev) => ({ ...prev, [field]: value }))
  }

  const testApiConnection = async () => {
    setIsTestingConnection(true)
    setConnectionStatus("idle")

    try {
      // Testar conexão com a API real
      const response = await fetch(networkData.apiUrl)
      if (response.ok) {
        setConnectionStatus("success")
      } else {
        setConnectionStatus("error")
      }
    } catch (error) {
      console.error("Erro ao testar conexão:", error)
      setConnectionStatus("error")
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      // Salvar rede no Firebase
      const networksRef = collection(db, "networks")
      const docRef = await addDoc(networksRef, {
        ...networkData,
        createdAt: new Date(),
        status: "active",
      })

      console.log("Rede criada com ID:", docRef.id)

      // Criar ativo principal automaticamente
      const assetsRef = collection(db, "assets")
      await addDoc(assetsRef, {
        networkId: docRef.id,
        networkName: networkData.name,
        name: `Compressor Principal - ${networkData.name}`,
        type: "compressor",
        model: networkData.compressorModel,
        maxPressure: networkData.maxPressure,
        powerRating: networkData.powerRating,
        status: "online",
        apiUrl: networkData.apiUrl,
        apiKey: networkData.apiKey,
        createdAt: new Date(),
      })

      alert("Rede e ativo principal criados com sucesso!")
      router.push("/network")
    } catch (error) {
      console.error("Erro ao salvar rede:", error)
      alert("Erro ao criar rede. Verifique o console para mais detalhes.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/network" className="flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Rede de Monitoramento
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Nova Rede de Monitoramento</h1>
          <p className="text-gray-600">Configure uma nova rede para monitorar seus compressores de ar comprimido</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.number
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300 text-gray-400"
                  }`}
                >
                  {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
                </div>
                <div className="ml-3">
                  <p
                    className={`text-sm font-medium ${currentStep >= step.number ? "text-blue-600" : "text-gray-400"}`}
                  >
                    {step.title}
                  </p>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Configurar Rede</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Rede *</label>
                  <input
                    type="text"
                    value={networkData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Ex: Fábrica Principal"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Localização</label>
                  <input
                    type="text"
                    value={networkData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Ex: Blumenau, SC"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição da Rede</label>
                <textarea
                  value={networkData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Descreva o propósito e características desta rede de monitoramento"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Ativo Principal (Compressor)</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo do Compressor *</label>
                  <select
                    value={networkData.compressorType}
                    onChange={(e) => handleInputChange("compressorType", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="parafuso">Parafuso</option>
                    <option value="pistao">Pistão</option>
                    <option value="centrifugo">Centrífugo</option>
                    <option value="scroll">Scroll</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Modelo/Marca</label>
                  <input
                    type="text"
                    value={networkData.compressorModel}
                    onChange={(e) => handleInputChange("compressorModel", e.target.value)}
                    placeholder="Ex: Atlas Copco GA30"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pressão Máxima (bar) *</label>
                  <input
                    type="number"
                    value={networkData.maxPressure}
                    onChange={(e) => handleInputChange("maxPressure", e.target.value)}
                    placeholder="Ex: 8"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Potência (kW) *</label>
                  <input
                    type="number"
                    value={networkData.powerRating}
                    onChange={(e) => handleInputChange("powerRating", e.target.value)}
                    placeholder="Ex: 30"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Conexão com API</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL da API *</label>
                  <input
                    type="url"
                    value={networkData.apiUrl}
                    onChange={(e) => handleInputChange("apiUrl", e.target.value)}
                    placeholder="https://api-cpsdata-ashy.vercel.app/api/cps-data"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    URL do endpoint que fornece os dados do sensor em tempo real
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chave da API (opcional)</label>
                  <input
                    type="password"
                    value={networkData.apiKey}
                    onChange={(e) => handleInputChange("apiKey", e.target.value)}
                    placeholder="Chave de autenticação da API"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Test Connection */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Testar Conexão</h3>
                    <button
                      onClick={testApiConnection}
                      disabled={!networkData.apiUrl || isTestingConnection}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        !networkData.apiUrl || isTestingConnection
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {isTestingConnection ? "Testando..." : "Testar Conexão"}
                    </button>
                  </div>

                  {connectionStatus !== "idle" && (
                    <div
                      className={`flex items-center space-x-2 p-3 rounded-lg ${
                        connectionStatus === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {connectionStatus === "success" ? (
                        <>
                          <Wifi className="w-5 h-5" />
                          <span>Conexão estabelecida com sucesso!</span>
                        </>
                      ) : (
                        <>
                          <WifiOff className="w-5 h-5" />
                          <span>Falha na conexão. Verifique a URL e tente novamente.</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </button>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="flex items-center px-6 py-3 rounded-lg font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
              >
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={connectionStatus !== "success" || isSubmitting}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                  connectionStatus !== "success" || isSubmitting
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                <Check className="w-4 h-4 mr-2" />
                {isSubmitting ? "Criando..." : "Criar Rede"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
