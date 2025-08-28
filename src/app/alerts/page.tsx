"use client"

import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where, addDoc } from "firebase/firestore"
import { Gauge } from "lucide-react"
import { toast } from "react-hot-toast"

interface Network {
  id: string
  name: string
}

interface Asset {
  id: string
  name: string
  networkId: string
}

interface Alert {
  id: string
  assetId: string
  type: "fluxo" | "pressao" | "temperatura"
  minValue: number
  maxValue: number
  enabled: boolean
}

export default function AlertsPage() {
  const [networks, setNetworks] = useState<Network[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [selectedNetwork, setSelectedNetwork] = useState("")
  const [selectedAsset, setSelectedAsset] = useState("")
  const [loading, setLoading] = useState(true)

  // Dados em tempo real simulados
  const [realTimeData, setRealTimeData] = useState({
    fluxo: 65.2,
    pressao: 7.3,
    temperatura: 46,
  })

  const [newAlert, setNewAlert] = useState({
    type: "fluxo" as "fluxo" | "pressao" | "temperatura",
    minValue: 0,
    maxValue: 100,
    enabled: true,
  })

  useEffect(() => {
    fetchData()
    // Simular dados em tempo real
    const interval = setInterval(() => {
      setRealTimeData({
        fluxo: 60 + Math.random() * 20,
        pressao: 7 + Math.random() * 1,
        temperatura: 40 + Math.random() * 15,
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedNetwork) {
      fetchAssets(selectedNetwork)
    }
  }, [selectedNetwork])

  useEffect(() => {
    if (selectedAsset) {
      fetchAlerts(selectedAsset)
    }
  }, [selectedAsset])

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

  const fetchAlerts = async (assetId: string) => {
    try {
      const alertsRef = collection(db, "alerts")
      const q = query(alertsRef, where("assetId", "==", assetId))
      const snapshot = await getDocs(q)
      const alertsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Alert[]
      setAlerts(alertsData)
    } catch (error) {
      console.error("Erro ao buscar alertas:", error)
    }
  }

  const createAlert = async () => {
    if (!selectedAsset) return

    try {
      await addDoc(collection(db, "alerts"), {
        assetId: selectedAsset,
        ...newAlert,
        createdAt: new Date(),
      })

      fetchAlerts(selectedAsset)
      setNewAlert({
        type: "fluxo",
        minValue: 0,
        maxValue: 100,
        enabled: true,
      })
      toast.success("Alerta criado com sucesso!")
    } catch (error) {
      console.error("Erro ao criar alerta:", error)
      toast.error("Erro ao criar alerta. Tente novamente.")
    }
  }

  const getGaugeColor = (value: number, min: number, max: number) => {
    if (value < min || value > max) return "#EF4444" // Vermelho
    if (value < min + (max - min) * 0.2 || value > max - (max - min) * 0.2) return "#F59E0B" // Amarelo
    return "#10B981" // Verde
  }

  const GaugeChart = ({
    value,
    min,
    max,
    label,
    unit,
  }: { value: number; min: number; max: number; label: string; unit: string }) => {
    const percentage = ((value - min) / (max - min)) * 100
    const color = getGaugeColor(value, min, max)

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{label}</h3>
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#E5E7EB" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeDasharray={`${percentage * 3.14} 314`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color }}>
                {value.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">{unit}</div>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          Limite: {min} - {max} {unit}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando alertas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Alertas</h1>
          <p className="text-gray-600">Configure limites e monitore alertas em tempo real</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Selecionar Ativo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </div>

        {selectedAsset && (
          <div className="space-y-8">
            {/* Real-time Gauges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GaugeChart value={realTimeData.fluxo} min={50} max={80} label="Fluxo" unit="m³/min" />
              <GaugeChart value={realTimeData.pressao} min={6.5} max={8.0} label="Pressão" unit="bar" />
              <GaugeChart value={realTimeData.temperatura} min={35} max={55} label="Temperatura" unit="°C" />
            </div>

            {/* Create Alert */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Criar Novo Alerta</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                  <select
                    value={newAlert.type}
                    onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value as any })}
                    className="input-field"
                  >
                    <option value="fluxo">Fluxo</option>
                    <option value="pressao">Pressão</option>
                    <option value="temperatura">Temperatura</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valor Mínimo</label>
                  <input
                    type="number"
                    value={newAlert.minValue}
                    onChange={(e) => setNewAlert({ ...newAlert, minValue: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Valor Máximo</label>
                  <input
                    type="number"
                    value={newAlert.maxValue}
                    onChange={(e) => setNewAlert({ ...newAlert, maxValue: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>

                <div className="flex items-end">
                  <button onClick={createAlert} className="btn-primary w-full">
                    Criar Alerta
                  </button>
                </div>
              </div>
            </div>

            {/* Existing Alerts */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Alertas Configurados</h2>
              {alerts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum alerta configurado para este ativo</p>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900 capitalize">{alert.type}</h3>
                        <p className="text-sm text-gray-600">
                          Limite: {alert.minValue} - {alert.maxValue}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            alert.enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {alert.enabled ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {!selectedAsset && (
          <div className="bg-white rounded-xl p-12 shadow-sm border text-center">
            <Gauge className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Selecione uma rede e um ativo para configurar alertas</p>
          </div>
        )}
      </div>
    </div>
  )
}