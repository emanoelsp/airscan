"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Search, Filter, Cpu, Activity, Zap, Gauge, Thermometer } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, getDocs, DocumentData } from "firebase/firestore"

// --- CORREÇÃO 1: Definir interfaces para as estruturas de dados ---
interface Asset {
  id: string
  name: string
  networkId: string
  networkName: string
  type: "compressor" | "sensor" | "distributor"
  status: "online" | "warning" | "offline"
  description?: string
  location?: string
  model?: string
  apiUrl?: string
}

interface RealTimeData {
  pressure?: number
  temperature?: number
  flow?: number
  power?: number
  vibration?: number
}

export default function SearchAssetsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  // --- CORREÇÃO 2: Aplicar os tipos aos hooks de estado ---
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [allAssets, setAllAssets] = useState<Asset[]>([])
  const [realTimeData, setRealTimeData] = useState<RealTimeData>({})
  const [loading, setLoading] = useState(true)

  // Buscar ativos do Firebase
  useEffect(() => {
    async function fetchAssets() {
      try {
        // Buscar redes para obter os nomes
        const networksRef = collection(db, "networks")
        const networksSnapshot = await getDocs(networksRef)
        const networksMap = new Map()
        networksSnapshot.docs.forEach((doc) => {
          networksMap.set(doc.id, doc.data().name)
        })

        // Buscar ativos
        const assetsRef = collection(db, "assets")
        const assetsSnapshot = await getDocs(assetsRef)
        // --- CORREÇÃO 3: Adicionar a anotação de tipo ao criar a lista ---
        const assetsList = assetsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as DocumentData), // Manter flexibilidade para dados do Firebase
          networkName: networksMap.get(doc.data().networkId) || "Rede não encontrada",
        })) as Asset[]

        setAllAssets(assetsList)
      } catch (error) {
        console.error("Erro ao buscar ativos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAssets()
  }, [])

  // Buscar dados em tempo real quando um ativo é selecionado
  useEffect(() => {
    if (!selectedAsset || selectedAsset.type !== "compressor") return

    const fetchRealTimeData = async () => {
      try {
        const response = await fetch(selectedAsset.apiUrl || "https://api-cpsdata-ashy.vercel.app/api/cps-data")
        if (response.ok) {
          const data = await response.json()
          setRealTimeData({
            pressure: data.pressure || 7.2,
            temperature: data.temperature || 45,
            flow: data.flow || 65,
            power: data.power || 85,
            vibration: data.vibration || 2.1,
          })
        }
      } catch (error) {
        console.error("Erro ao buscar dados em tempo real:", error)
        // Dados de fallback
        setRealTimeData({
          pressure: 7.2,
          temperature: 45,
          flow: 65,
          power: 85,
          vibration: 2.1,
        })
      }
    }

    fetchRealTimeData()

    // Atualizar a cada 5 segundos
    const interval = setInterval(fetchRealTimeData, 5000)
    return () => clearInterval(interval)
  }, [selectedAsset])

  // Filtrar ativos (Nenhuma mudança necessária aqui, o tipo será inferido)
  const filteredAssets = allAssets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.description && asset.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      asset.networkName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || asset.type === selectedType
    return matchesSearch && matchesType
  })

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "compressor":
        return Cpu
      case "sensor":
        return Activity
      case "distributor":
        return Zap
      default:
        return Activity
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-500"
      case "warning":
        return "text-yellow-500"
      case "offline":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "offline":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando ativos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/network" className="flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Rede de Monitoramento
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Procurar Ativos</h1>
          <p className="text-gray-600">Encontre e monitore ativos específicos em tempo real</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search and Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Controls */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por nome, descrição ou rede..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="all">Todos os tipos</option>
                    <option value="compressor">Compressores</option>
                    <option value="sensor">Sensores</option>
                    <option value="distributor">Distribuidores</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Resultados ({filteredAssets.length})</h2>
              </div>

              <div className="space-y-4">
                {filteredAssets.map((asset) => {
                  const Icon = getAssetIcon(asset.type)
                  return (
                    <div
                      key={asset.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedAsset?.id === asset.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                      }`}
                      onClick={() => setSelectedAsset(asset)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Icon className={`w-6 h-6 ${getStatusColor(asset.status)}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{asset.name}</h3>
                            <p className="text-sm text-gray-600">{asset.description || "Sem descrição"}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-xs text-gray-500">{asset.networkName}</span>
                              {asset.location && (
                                <>
                                  <span className="text-xs text-gray-400">•</span>
                                  <span className="text-xs text-gray-500">{asset.location}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(asset.status)}`}
                          >
                            {asset.status === "online" ? "Online" : asset.status === "warning" ? "Atenção" : "Offline"}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">{asset.type}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {filteredAssets.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum ativo encontrado com os critérios de busca</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Asset Details */}
          <div className="space-y-6">
            {selectedAsset ? (
              <>
                {/* Asset Info */}
                <div className="bg-white rounded-xl p-6 shadow-sm border">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Detalhes do Ativo</h2>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          selectedAsset.status === "online"
                            ? "bg-green-500"
                            : selectedAsset.status === "warning"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                      ></div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedAsset.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{selectedAsset.type}</p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rede:</span>
                        <span className="font-medium">{selectedAsset.networkName}</span>
                      </div>
                      {selectedAsset.location && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Localização:</span>
                          <span className="font-medium">{selectedAsset.location}</span>
                        </div>
                      )}
                      {selectedAsset.model && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Modelo:</span>
                          <span className="font-medium">{selectedAsset.model}</span>
                        </div>
                      )}
                      {selectedAsset.description && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Descrição:</span>
                          <span className="font-medium text-right max-w-40">{selectedAsset.description}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Real-time Data */}
                {selectedAsset.type === "compressor" && realTimeData.pressure && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Dados em Tempo Real</h2>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Gauge className="w-5 h-5 text-blue-500" />
                            <span className="text-gray-700">Pressão</span>
                          </div>
                          <span className="font-semibold">{realTimeData.pressure?.toFixed(1)} bar</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Thermometer className="w-5 h-5 text-red-500" />
                            <span className="text-gray-700">Temperatura</span>
                          </div>
                          <span className="font-semibold">{realTimeData.temperature?.toFixed(0)}°C</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            <span className="text-gray-700">Fluxo</span>
                          </div>
                          <span className="font-semibold">{realTimeData.flow?.toFixed(0)} m³/min</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Activity className="w-5 h-5 text-purple-500" />
                            <span className="text-gray-700">Potência</span>
                          </div>
                          <span className="font-semibold">{realTimeData.power?.toFixed(0)} kW</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Selecione um Ativo</h2>
                <p className="text-gray-500 text-center py-8">
                  Clique em um ativo da lista para ver os detalhes e dados em tempo real
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}