"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/model/firebase"
import { collection, getDocs, query, where } from "firebase/firestore"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface Network {
  id: string
  name: string
}

interface Asset {
  id: string
  name: string
  networkId: string
}

export default function ReportsPage() {
  const [networks, setNetworks] = useState<Network[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [selectedNetwork, setSelectedNetwork] = useState("")
  const [selectedAsset, setSelectedAsset] = useState("")
  const [selectedPeriod, setSelectedPeriod] = useState("7d")
  const [loading, setLoading] = useState(true)

  // Dados simulados para os gráficos
  const usageData = [
    { name: "Seg", fluxo: 65, pressao: 7.2, temperatura: 45 },
    { name: "Ter", fluxo: 72, pressao: 7.4, temperatura: 47 },
    { name: "Qua", fluxo: 68, pressao: 7.1, temperatura: 44 },
    { name: "Qui", fluxo: 75, pressao: 7.5, temperatura: 48 },
    { name: "Sex", fluxo: 70, pressao: 7.3, temperatura: 46 },
    { name: "Sab", fluxo: 45, pressao: 6.8, temperatura: 42 },
    { name: "Dom", fluxo: 35, pressao: 6.5, temperatura: 40 },
  ]

  const efficiencyData = [
    { name: "Eficiente", value: 75, color: "#10B981" },
    { name: "Moderado", value: 20, color: "#F59E0B" },
    { name: "Ineficiente", value: 5, color: "#EF4444" },
  ]

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedNetwork) {
      fetchAssets(selectedNetwork)
    }
  }, [selectedNetwork])

  const fetchData = async () => {
    try {
      const networksRef = collection(db, "networks")
      const snapshot = await getDocs(networksRef)
      const networksData = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      })) as Network[]
      setNetworks(networksData)
    } catch (error) {
      console.error("Erro ao buscar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAssets = async (networkId: string) => {
    try {
      const assetsRef = collection(db, "assets")
      const q = query(assetsRef, where("networkId", "==", networkId))
      const snapshot = await getDocs(q)
      const assetsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        networkId: doc.data().networkId,
      })) as Asset[]
      setAssets(assetsData)
    } catch (error) {
      console.error("Erro ao buscar ativos:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando relatórios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatórios</h1>
          <p className="text-gray-600">Análise detalhada do desempenho dos seus ativos</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rede</label>
              <select
                value={selectedNetwork}
                onChange={(e) => {
                  setSelectedNetwork(e.target.value)
                  setSelectedAsset("")
                }}
                className="input-field"
              >
                <option value="">Selecione uma rede</option>
                {networks.map((network) => (
                  <option key={network.id} value={network.id}>
                    {network.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ativo</label>
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="input-field"
                disabled={!selectedNetwork}
              >
                <option value="">Selecione um ativo</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="input-field"
              >
                <option value="24h">Últimas 24 horas</option>
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
              </select>
            </div>

            <div className="flex items-end">
              <button className="btn-primary w-full">Gerar Relatório</button>
            </div>
          </div>
        </div>

        {selectedNetwork && selectedAsset && (
          <div className="space-y-8">
            {/* Usage Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Fluxo por Período */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Fluxo por Período</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="fluxo" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pressão e Temperatura */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pressão e Temperatura</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="pressao" stroke="#10B981" strokeWidth={2} />
                    <Line type="monotone" dataKey="temperatura" stroke="#F59E0B" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Efficiency Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Distribuição de Eficiência */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição de Eficiência</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={efficiencyData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {efficiencyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Resumo Estatístico */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Estatístico</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Fluxo Médio</span>
                    <span className="font-semibold">62.3 m³/min</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Pressão Média</span>
                    <span className="font-semibold">7.1 bar</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Temperatura Média</span>
                    <span className="font-semibold">45°C</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Eficiência Geral</span>
                    <span className="font-semibold text-green-600">94.2%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Economia Energética</span>
                    <span className="font-semibold text-blue-600">15.7%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {(!selectedNetwork || !selectedAsset) && (
          <div className="bg-white rounded-xl p-12 shadow-sm border text-center">
            <p className="text-gray-500 text-lg">Selecione uma rede e um ativo para visualizar os relatórios</p>
          </div>
        )}
      </div>
    </div>
  )
}
