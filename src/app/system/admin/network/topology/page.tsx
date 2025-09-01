"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Cpu, Activity, Zap, Gauge, Thermometer, Wifi } from "lucide-react"
import { db } from "@/lib/model/firebase"
import { collection, getDocs, DocumentData } from "firebase/firestore"

// --- CORREÇÃO 1: Definir interfaces para as estruturas de dados ---
interface Asset {
  id: string
  networkId: string
  name: string
  type: "compressor" | "sensor" | "distributor"
  status: "online" | "warning" | "offline"
  x: number
  y: number
  apiUrl?: string
  location?: string
  model?: string
  networkName?: string
}

interface Network {
  id: string
  name: string
  assets: Asset[]
}

interface RealTimeMetrics {
  pressure: number
  temperature: number
  flow: number
  power: number
  vibration: number
}

interface RealTimeData {
  [assetId: string]: RealTimeMetrics
}

export default function TopologyPage() {
  // --- CORREÇÃO 2: Usar as interfaces nos hooks de estado ---
  const [networks, setNetworks] = useState<Network[]>([])
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [realTimeData, setRealTimeData] = useState<RealTimeData>({})
  const [loading, setLoading] = useState(true)

  // Buscar redes e ativos do Firebase
  useEffect(() => {
    async function fetchNetworksAndAssets() {
      try {
        // Buscar redes
        const networksRef = collection(db, "networks")
        const networksSnapshot = await getDocs(networksRef)
        const networksList: Omit<Network, "assets">[] = networksSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          ...(doc.data() as DocumentData),
        }))

        // Buscar ativos
        const assetsRef = collection(db, "assets")
        const assetsSnapshot = await getDocs(assetsRef)
        const assetsList = assetsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as DocumentData),
        })) as Asset[] // <<< CORREÇÃO APLICADA AQUI

        // Agrupar ativos por rede
        const networksWithAssets: Network[] = networksList.map((network) => {
          const networkAssets = assetsList
            .filter((asset) => asset.networkId === network.id)
            .map((asset, index) => ({
              ...asset,
              x: 100 + (index % 3) * 120,
              y: 100 + Math.floor(index / 3) * 120,
            })) as Asset[]

          return {
            ...network,
            assets: networkAssets,
          }
        })

        setNetworks(networksWithAssets)

        if (networksWithAssets.length > 0) {
          setSelectedNetwork(networksWithAssets[0].id)
        }
      } catch (error) {
        console.error("Erro ao buscar redes e ativos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNetworksAndAssets()
  }, [])

  // Buscar dados em tempo real da API
  useEffect(() => {
    if (!selectedAsset || selectedAsset.type !== "compressor") return

    const fetchRealTimeData = async () => {
      try {
        const response = await fetch(selectedAsset.apiUrl || "https://api-cpsdata-ashy.vercel.app/api/cps-data")
        if (response.ok) {
          const data = await response.json()
          setRealTimeData((prev) => ({
            ...prev,
            [selectedAsset.id]: {
              pressure: data.pressure || 7.2,
              temperature: data.temperature || 45,
              flow: data.flow || 65,
              power: data.power || 85,
              vibration: data.vibration || 2.1,
            },
          }))
        }
      } catch (error) {
        console.error("Erro ao buscar dados em tempo real:", error)
        setRealTimeData((prev) => ({
          ...prev,
          [selectedAsset.id]: {
            pressure: 7.2,
            temperature: 45,
            flow: 65,
            power: 85,
            vibration: 2.1,
          },
        }))
      }
    }

    fetchRealTimeData()
    const interval = setInterval(fetchRealTimeData, 5000)
    return () => clearInterval(interval)
  }, [selectedAsset])

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "compressor": return Cpu
      case "sensor": return Activity
      case "distributor": return Zap
      default: return Activity
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "text-green-500"
      case "warning": return "text-yellow-500"
      case "offline": return "text-red-500"
      default: return "text-gray-500"
    }
  }

  const handleNetworkChange = (networkId: string) => {
    setSelectedNetwork(networkId)
    setSelectedAsset(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando topologia...</p>
        </div>
      </div>
    )
  }

  const currentNetwork = networks.find((network) => network.id === selectedNetwork) || networks[0]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/network" className="flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Rede de Monitoramento
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Topologia de Ativos</h1>
          <p className="text-gray-600">Visualize e monitore todos os ativos da sua rede em tempo real</p>
        </div>

        {/* Network Selector */}
        {networks.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Selecionar Rede</label>
            <select
              value={selectedNetwork || ""}
              onChange={(e) => handleNetworkChange(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {networks.map((network) => (
                <option key={network.id} value={network.id}>
                  {network.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {networks.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-sm border text-center">
            <p className="text-gray-500 mb-4">Nenhuma rede encontrada. Crie uma rede primeiro.</p>
            <Link
              href="/network/create"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Criar Nova Rede
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Topology View */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Mapa da Topologia</h2>

                {currentNetwork && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">{currentNetwork.name}</h3>
                    <div className="relative bg-gray-50 rounded-lg p-6 min-h-[400px]">
                      <svg className="w-full h-full absolute inset-0" style={{ minHeight: "400px" }}>
                        {/* Connections */}
                        {currentNetwork.assets &&
                          currentNetwork.assets.map((asset, index) => {
                            if (index < currentNetwork.assets.length - 1) {
                              const nextAsset = currentNetwork.assets[index + 1]
                              return (
                                <line
                                  key={`line-${asset.id}`}
                                  x1={asset.x + 20}
                                  y1={asset.y + 20}
                                  x2={nextAsset.x + 20}
                                  y2={nextAsset.y + 20}
                                  stroke="#e5e7eb"
                                  strokeWidth="2"
                                />
                              )
                            }
                            return null
                          })}
                      </svg>

                      {/* Assets */}
                      {currentNetwork.assets && currentNetwork.assets.length > 0 ? (
                        currentNetwork.assets.map((asset) => {
                          const Icon = getAssetIcon(asset.type)
                          return (
                            <div
                              key={asset.id}
                              className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform ${
                                selectedAsset?.id === asset.id ? "scale-110" : ""
                              }`}
                              style={{ left: asset.x, top: asset.y }}
                              onClick={() => setSelectedAsset(asset)}
                            >
                              <div
                                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center bg-white shadow-lg ${
                                  asset.status === "online"
                                    ? "border-green-500"
                                    : asset.status === "warning"
                                      ? "border-yellow-500"
                                      : "border-red-500"
                                }`}
                              >
                                <Icon className={`w-6 h-6 ${getStatusColor(asset.status)}`} />
                              </div>
                              <div className="text-xs text-center mt-1 font-medium text-gray-700 max-w-20 truncate">
                                {asset.name}
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-500">Nenhum ativo encontrado nesta rede</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Asset Details */}
            <div className="space-y-6">
              {/* Asset Info */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Detalhes do Ativo</h2>

                {selectedAsset ? (
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
                        <span className="font-medium">{currentNetwork.name}</span>
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
                    </div>

                    {selectedAsset.type === "compressor" && realTimeData[selectedAsset.id] && (
                      <div className="space-y-3 pt-4 border-t">
                        <h4 className="font-medium text-gray-900">Dados em Tempo Real</h4>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center space-x-2">
                            <Gauge className="w-4 h-4 text-blue-500" />
                            <div>
                              <p className="text-xs text-gray-600">Pressão</p>
                              <p className="font-semibold">{realTimeData[selectedAsset.id].pressure.toFixed(1)} bar</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Thermometer className="w-4 h-4 text-red-500" />
                            <div>
                              <p className="text-xs text-gray-600">Temperatura</p>
                              <p className="font-semibold">{realTimeData[selectedAsset.id].temperature.toFixed(0)}°C</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <div>
                              <p className="text-xs text-gray-600">Fluxo</p>
                              <p className="font-semibold">{realTimeData[selectedAsset.id].flow.toFixed(0)} m³/min</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Activity className="w-4 h-4 text-purple-500" />
                            <div>
                              <p className="text-xs text-gray-600">Potência</p>
                              <p className="font-semibold">{realTimeData[selectedAsset.id].power.toFixed(0)} kW</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Clique em um ativo no mapa para ver os detalhes</p>
                )}
              </div>

              {/* Network Status */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Status da Rede</h2>

                <div className="space-y-4">
                  {networks.map((network) => {
                    const onlineAssets = network.assets
                      ? network.assets.filter((a) => a.status === "online").length
                      : 0
                    const totalAssets = network.assets ? network.assets.length : 0

                    return (
                      <div key={network.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{network.name}</h3>
                          <div className="flex items-center space-x-1">
                            <Wifi className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600">
                              {onlineAssets}/{totalAssets}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: totalAssets > 0 ? `${(onlineAssets / totalAssets) * 100}%` : "0%" }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}