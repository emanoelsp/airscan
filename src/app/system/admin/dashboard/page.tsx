"use client"

import { useState, useEffect } from "react"
import { Activity, Network as NetworkIcon, Cpu, Database, TrendingUp, CheckCircle, Wifi } from "lucide-react" // Renomeado Network para evitar conflito
import { db } from "@/lib/model/firebase"
import { collection, getDocs, query, orderBy, limit, DocumentData, Timestamp } from "firebase/firestore"

// --- CORREÇÃO 1: Definir interfaces para as estruturas de dados ---
interface RecentAlert {
  id: string
  type: "error" | "warning" | "success" | string
  message: string
  time: string
  network: string
}

interface TopNetwork {
  id: string
  name: string
  devices: number
  efficiency: number
  status: "online" | "warning" | "offline"
}

// Interface para os dados completos de uma rede
interface Network {
  id: string
  name: string
}

// Interface para os dados de um ativo (asset)
interface Asset {
  id: string
  status: "online" | "warning" | "offline"
  networkId: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    networks: 0,
    equipment: 0,
    sensors: 0,
    dataPoints: 0,
    onlineDevices: 0,
    alerts: 0,
    efficiency: 0,
    energySaved: 0,
  })
  const [recentAlerts, setRecentAlerts] = useState<RecentAlert[]>([])
  const [topNetworks, setTopNetworks] = useState<TopNetwork[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Buscar redes
        const networksRef = collection(db, "networks")
        const networksSnapshot = await getDocs(networksRef)
        const networksCount = networksSnapshot.size
        // --- CORREÇÃO 2: Aplicar o tipo Network[] ao buscar os dados ---
        const networksList = networksSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as DocumentData),
        })) as Network[]

        // Buscar ativos
        const assetsRef = collection(db, "assets")
        const assetsSnapshot = await getDocs(assetsRef)
        const assetsCount = assetsSnapshot.size
        // --- CORREÇÃO 3: Aplicar o tipo Asset[] ao buscar os dados ---
        const assetsList = assetsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as DocumentData),
        })) as Asset[]

        // Buscar alertas
        const alertsRef = collection(db, "alerts")
        const alertsQuery = query(alertsRef, orderBy("createdAt", "desc"), limit(3))
        const alertsSnapshot = await getDocs(alertsQuery)
        
        const alertsList: RecentAlert[] = alertsSnapshot.docs.map((doc) => {
          const data = doc.data()
          const createdAt = (data.createdAt as Timestamp)?.toDate() || new Date()
          return {
            id: doc.id,
            type: data.type || "warning",
            message: data.message || "Alerta sem mensagem.",
            network: data.network || "Rede não identificada",
            time: createdAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          }
        })

        // Calcular estatísticas (Agora o 'asset.status' será reconhecido)
        const onlineDevices = assetsList.filter((asset) => asset.status === "online").length

        // Preparar dados para as redes principais
        const networksWithStats: TopNetwork[] = networksList
          .map((network) => {
            const networkAssets = assetsList.filter((asset) => asset.networkId === network.id)
            const onlineNetworkAssets = networkAssets.filter((asset) => asset.status === "online").length
            const efficiency =
              networkAssets.length > 0 ? Math.round((onlineNetworkAssets / networkAssets.length) * 100) : 0
            
            // --- CÓDIGO CORRIGIDO ---
            // Define o 'status' com o tipo explícito para corresponder à interface TopNetwork.
            const status: TopNetwork['status'] =
              efficiency > 90 ? "online" : efficiency > 70 ? "warning" : "offline"

            return {
              id: network.id,
              name: network.name,
              devices: networkAssets.length,
              efficiency,
              status: status, // Agora o tipo está correto
            }
          })
          .sort((a, b) => b.efficiency - a.efficiency)
          .slice(0, 4)

        // Atualizar estados
        setStats({
          networks: networksCount,
          equipment: assetsCount,
          sensors: assetsCount * 3,
          dataPoints: assetsCount * 50000,
          onlineDevices,
          alerts: alertsList.length,
          efficiency: 92.5,
          energySaved: 12.8,
        })

        setRecentAlerts(
          alertsList.length > 0
            ? alertsList
            : [
                {
                  id: "default-1",
                  type: "warning",
                  message: "Sem alertas recentes",
                  time: "Agora",
                  network: "Sistema",
                },
              ],
        )

        setTopNetworks(
          networksWithStats.length > 0
            ? networksWithStats
            : [
                {
                  id: "default-1",
                  name: "Sem redes cadastradas",
                  devices: 0,
                  efficiency: 0,
                  status: "offline",
                },
              ],
        )
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const statCards = [
    {
      title: "Redes Monitoradas",
      value: stats.networks,
      icon: NetworkIcon, // Usando o ícone renomeado
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: `${stats.networks} ativas`,
    },
    {
      title: "Equipamentos",
      value: stats.equipment,
      icon: Cpu,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: `${stats.onlineDevices} online`,
    },
    {
      title: "Sensores Ativos",
      value: stats.sensors,
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      change: `Monitorando dados`,
    },
    {
      title: "Dados Coletados",
      value: stats.dataPoints.toLocaleString(),
      icon: Database,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      change: "Pontos de dados",
    },
    {
      title: "Eficiência Média",
      value: `${stats.efficiency.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      change: "Desempenho do sistema",
    },
    {
      title: "Economia Energética",
      value: `${stats.energySaved.toFixed(1)}%`,
      icon: CheckCircle,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
      change: "Estimativa de economia",
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard de Monitoramento</h1>
          <p className="text-gray-600">Visão geral do sistema de monitoramento de ar comprimido</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">{stat.change}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Alerts */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Alertas Recentes</h2>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">{stats.alerts} ativos</span>
              </div>
            </div>
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      alert.type === "error"
                        ? "bg-red-500"
                        : alert.type === "warning"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                  ></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">{alert.network}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{alert.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Networks */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Redes Principais</h2>
            <div className="space-y-4">
              {topNetworks.map((network) => (
                <div key={network.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        network.status === "online"
                          ? "bg-green-500"
                          : network.status === "warning"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    ></div>
                    <div>
                      <p className="font-medium text-gray-900">{network.name}</p>
                      <p className="text-sm text-gray-500">{network.devices} dispositivos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{network.efficiency}%</p>
                    <p className="text-sm text-gray-500">eficiência</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time Activity */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Atividade em Tempo Real</h2>
            <div className="flex items-center space-x-2">
              <Wifi className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600">Conectado</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.dataPoints.toLocaleString()}</div>
              <p className="text-sm text-gray-600">Pontos de dados coletados</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.onlineDevices}</div>
              <p className="text-sm text-gray-600">Dispositivos online</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{stats.efficiency.toFixed(1)}%</div>
              <p className="text-sm text-gray-600">Eficiência atual</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{stats.energySaved.toFixed(1)}%</div>
              <p className="text-sm text-gray-600">Economia energética</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}