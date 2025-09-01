"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BarChartIcon as ChartBar, Brain, Search, Clock } from "lucide-react"
import { db } from "@/lib/model/firebase"
import { collection, getDocs } from "firebase/firestore"
import { toast } from "react-hot-toast"

// CORREÇÃO: Defina uma interface para o objeto 'network'
interface Network {
  id: string
  name: string
  description?: string // O '?' indica que a propriedade é opcional
  location?: string
}

export default function AnalysisPage() {
  // CORREÇÃO: Use a interface Network para tipar o estado
  const [networks, setNetworks] = useState<Network[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNetworks() {
      try {
        const networksRef = collection(db, "networks")
        const snapshot = await getDocs(networksRef)
        // Adiciona a anotação de tipo para garantir que a lista corresponda à interface
        const networksList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Network[]
        setNetworks(networksList)
      } catch (error) {
        console.error("Erro ao buscar redes:", error)
        toast.error("Erro ao carregar redes")
      } finally {
        setLoading(false)
      }
    }

    fetchNetworks()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Análise de Dados</h1>
          <p className="text-gray-600">Visualize e analise dados de seus sistemas de ar comprimido</p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Visualizar por Período */}
          <Link href="/analysis/reports" className="group">
            <div className="bg-white rounded-xl p-8 shadow-sm border hover:shadow-lg transition-all duration-200 group-hover:-translate-y-1">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
                <ChartBar className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Relatórios de Uso</h3>
              <p className="text-gray-600 mb-4">
                Visualize relatórios detalhados de uso, eficiência e desempenho dos seus sistemas
              </p>
              <div className="text-blue-600 font-medium group-hover:text-blue-700">Ver relatórios →</div>
            </div>
          </Link>

          {/* Análise com IA */}
          <Link href="/analysis/ai" className="group">
            <div className="bg-white rounded-xl p-8 shadow-sm border hover:shadow-lg transition-all duration-200 group-hover:-translate-y-1">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-200 transition-colors">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Análise com IA</h3>
              <p className="text-gray-600 mb-4">
                Obtenha insights avançados e recomendações técnicas com análise de inteligência artificial
              </p>
              <div className="text-purple-600 font-medium group-hover:text-purple-700">Analisar dados →</div>
            </div>
          </Link>

          {/* Histórico de Dados */}
          <Link href="/analysis/history" className="group">
            <div className="bg-white rounded-xl p-8 shadow-sm border hover:shadow-lg transition-all duration-200 group-hover:-translate-y-1">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Histórico de Dados</h3>
              <p className="text-gray-600 mb-4">
                Acesse o histórico completo de dados e métricas dos seus compressores e sensores
              </p>
              <div className="text-green-600 font-medium group-hover:text-green-700">Ver histórico →</div>
            </div>
          </Link>
        </div>

        {/* Redes para Análise */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Redes Disponíveis para Análise</h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm border animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : networks.length === 0 ? (
            <div className="bg-white rounded-xl p-12 shadow-sm border text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma rede encontrada</h3>
              <p className="text-gray-600 mb-6">Crie sua primeira rede de monitoramento para começar a análise</p>
              <Link
                href="/network/create"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Criar Primeira Rede
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {networks.map((network) => (
                <div
                  key={network.id}
                  className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{network.name}</h3>
                    <div className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Ativo</div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600">{network.description || "Sem descrição"}</p>
                    <p className="text-xs text-gray-500 mt-1">📍 {network.location || "Sem localização"}</p>
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <Link
                      href={`/analysis/reports?network=${network.id}`}
                      className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 px-4 rounded-lg font-medium transition-colors text-center text-sm"
                    >
                      Relatórios
                    </Link>
                    <Link
                      href={`/analysis/ai?network=${network.id}`}
                      className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-800 py-2 px-4 rounded-lg font-medium transition-colors text-center text-sm"
                    >
                      Análise IA
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}