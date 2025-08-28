"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { TrendingUp, Activity, AlertTriangle, Brain, Download, RefreshCw, ChevronDown } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where } from "firebase/firestore"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

interface ApiData {
  [key: string]: any
}

export default function AIAnalysisPage() {
  const searchParams = useSearchParams()
  const networkId = searchParams.get("network")

  const [networks, setNetworks] = useState<any[]>([])
  const [assets, setAssets] = useState<any[]>([])
  const [selectedNetwork, setSelectedNetwork] = useState(networkId || "")
  const [selectedAsset, setSelectedAsset] = useState("")
  const [selectedEndpoint, setSelectedEndpoint] = useState("metricasBasicas")
  const [selectedPeriod, setSelectedPeriod] = useState("dia")
  const [apiData, setApiData] = useState<ApiData | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingAssets, setLoadingAssets] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMoreData, setHasMoreData] = useState(true)

  const showNotification = (type: "success" | "error" | "info", message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 4000)
  }

  // Função para converter markdown para HTML
  const markdownToHtml = (markdown: string): string => {
    let html = markdown

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3">$1</h3>')
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-gray-900 mt-8 mb-4">$1</h2>')
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h1>')

    // Bold text
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')

    // Lists
    html = html.replace(/^- (.*$)/gim, '<li class="ml-4 mb-1">• $1</li>')
    html = html.replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4 mb-1">$1. $2</li>')

    // Emojis and special markers
    html = html.replace(/⚠️/g, '<span class="text-yellow-600">⚠️</span>')
    html = html.replace(/✅/g, '<span class="text-green-600">✅</span>')
    html = html.replace(/❌/g, '<span class="text-red-600">❌</span>')
    html = html.replace(/💡/g, '<span class="text-blue-600">💡</span>')
    html = html.replace(/🔧/g, '<span class="text-gray-600">🔧</span>')
    html = html.replace(/📈/g, '<span class="text-green-600">📈</span>')
    html = html.replace(/📊/g, '<span class="text-blue-600">📊</span>')
    html = html.replace(/🎯/g, '<span class="text-purple-600">🎯</span>')
    html = html.replace(/🔍/g, '<span class="text-indigo-600">🔍</span>')

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p class="mb-3">')
    html = html.replace(/\n/g, "<br>")

    // Wrap in paragraphs
    html = '<p class="mb-3">' + html + "</p>"

    return html
  }

  const endpoints = [
    { value: "metricasBasicas", label: "Métricas Básicas", icon: Activity },
    { value: "metricasCompleta", label: "Métricas Completas", icon: TrendingUp },
    { value: "tendencia", label: "Análise de Tendência", icon: TrendingUp },
    { value: "qualidadeDados", label: "Qualidade dos Dados", icon: AlertTriangle },
    { value: "dadosBrutos", label: "Dados Brutos", icon: Activity },
  ]

  const periods = [
    { value: "dia", label: "Hoje" },
    { value: "semana", label: "Última Semana" },
    { value: "mes", label: "Mês Atual" },
    { value: "mespassado", label: "Mês Passado" },
    { value: "tudo", label: "Todos os Dados" },
  ]

  useEffect(() => {
    fetchNetworks()
  }, [])

  useEffect(() => {
    if (selectedNetwork) {
      fetchAssets(selectedNetwork)
    }
  }, [selectedNetwork])

  useEffect(() => {
    // Reset pagination when endpoint changes
    setCurrentPage(0)
    setHasMoreData(true)
    setApiData(null)
    setAiAnalysis("")
  }, [selectedEndpoint])

  const fetchNetworks = async () => {
    try {
      const networksRef = collection(db, "networks")
      const snapshot = await getDocs(networksRef)
      const networksList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setNetworks(networksList)

      if (networkId && networksList.some((n) => n.id === networkId)) {
        setSelectedNetwork(networkId)
      }
    } catch (error) {
      console.error("Erro ao buscar redes:", error)
      showNotification("error", "Erro ao carregar redes")
    } finally {
      setLoading(false)
    }
  }

  const fetchAssets = async (networkId: string) => {
    setLoadingAssets(true)
    try {
      const assetsRef = collection(db, "assets")
      const q = query(assetsRef, where("networkId", "==", networkId))
      const snapshot = await getDocs(q)
      const assetsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setAssets(assetsList)

      if (assetsList.length > 0) {
        setSelectedAsset(assetsList[0].id)
      }
    } catch (error) {
      console.error("Erro ao buscar ativos:", error)
      showNotification("error", "Erro ao carregar ativos")
    } finally {
      setLoadingAssets(false)
    }
  }

  const buildApiUrl = (page = 0) => {
    const baseUrl = "https://18.212.36.236:8080"

    if (selectedEndpoint === "metricasBasicas") {
      return `${baseUrl}/metricasBasicas/${selectedPeriod}`
    }

    if (selectedEndpoint === "metricasCompleta") {
      return `${baseUrl}/metricasCompleta/${selectedPeriod}`
    }

    if (selectedEndpoint === "tendencia") {
      return `${baseUrl}/tendencia/${selectedPeriod}`
    }

    if (selectedEndpoint === "qualidadeDados") {
      return `${baseUrl}/qualidadeDados/tudo`
    }

    if (selectedEndpoint === "dadosBrutos") {
      const limit = 20
      const offset = page * limit

      let url = `${baseUrl}/dadosBrutos?limit=${limit}&offset=${offset}`

      if (startDate && endDate) {
        url += `&data_inicio=${startDate}&data_fim=${endDate}`
      }

      return url
    }

    return `${baseUrl}/${selectedEndpoint}`
  }

  const fetchApiData = async (isLoadMore = false) => {
    if (!selectedAsset) {
      showNotification("error", "Selecione um ativo primeiro")
      return
    }

    if (isLoadMore) {
      setLoadingMore(true)
    } else {
      setLoadingData(true)
      setCurrentPage(0)
      setHasMoreData(true)
      setApiData(null)
    }

    try {
      const pageToFetch = isLoadMore ? currentPage + 1 : 0
      const apiUrl = buildApiUrl(pageToFetch)
      console.log("Fetching data from:", apiUrl)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Erro ao buscar dados da API: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()

      if (selectedEndpoint === "dadosBrutos") {
        // Validar se os dados são um array
        if (!Array.isArray(data)) {
          throw new Error("Dados brutos devem ser um array")
        }

        // Limitar a 20 registros para evitar crash
        const limitedData = data.slice(0, 20)

        if (isLoadMore) {
          // Append new data to existing data
          if (limitedData.length > 0) {
            setApiData((prevData) => {
              if (Array.isArray(prevData)) {
                return [...prevData, ...limitedData]
              }
              return limitedData
            })
            setCurrentPage(pageToFetch)

            // Check if we got less than 20 items, meaning no more data
            if (limitedData.length < 20) {
              setHasMoreData(false)
            }
          } else {
            setHasMoreData(false)
            showNotification("info", "Não há mais dados para carregar")
          }
        } else {
          // First load
          setApiData(limitedData)
          setCurrentPage(0)

          // Check if we got less than 20 items
          if (limitedData.length < 20) {
            setHasMoreData(false)
          }
        }
      } else {
        // For other endpoints, just set the data normally
        setApiData(data)
      }

      if (!isLoadMore) {
        showNotification("success", "Dados carregados com sucesso!")
      } else {
        showNotification("success", `Carregados mais ${Array.isArray(data) ? Math.min(data.length, 20) : 0} registros`)
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error)

      if (error instanceof Error && error.name === "AbortError") {
        showNotification("error", "Timeout na requisição - tente novamente")
      } else {
        showNotification(
          "error",
          `Erro ao carregar dados da API: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        )
      }

      // Reset states on error
      if (isLoadMore) {
        // Don't reset data on load more error
      } else {
        setApiData(null)
        setCurrentPage(0)
        setHasMoreData(true)
      }
    } finally {
      if (isLoadMore) {
        setLoadingMore(false)
      } else {
        setLoadingData(false)
      }
    }
  }

  const loadMoreData = () => {
    if (!loadingMore && hasMoreData) {
      fetchApiData(true)
    }
  }

  const analyzeWithAI = async () => {
    if (!apiData) {
      showNotification("error", "Carregue os dados primeiro!")
      return
    }

    setAnalyzing(true)
    try {
      // Simular análise de IA baseada nos dados reais
      await new Promise((resolve) => setTimeout(resolve, 2000))

      let analysis = "## 📊 Análise Técnica dos Dados\n\n"

      if (selectedEndpoint === "metricasBasicas" || selectedEndpoint === "metricasCompleta") {
        analysis += `### Comportamento Geral do Sistema\n`
        analysis += `Com base nos dados coletados (${apiData["número de leituras"] || "N/A"} leituras), o sistema apresenta:\n\n`

        if (apiData["valor mínimo"] !== undefined && apiData["valor máximo"] !== undefined) {
          analysis += `**Faixa Operacional:** ${apiData["valor mínimo"]?.toFixed(2) || "N/A"} - ${apiData["valor máximo"]?.toFixed(2) || "N/A"} bar\n`
        }

        if (apiData["média"] !== undefined) {
          analysis += `**Pressão Média:** ${apiData["média"]?.toFixed(2) || "N/A"} bar\n`
        }

        if (apiData["desvio padrão"] !== undefined) {
          analysis += `**Desvio Padrão:** ${apiData["desvio padrão"]?.toFixed(2) || "N/A"} bar\n\n`

          analysis += `### 🔍 Diagnóstico\n`
          const desvio = apiData["desvio padrão"]
          const variabilidade = desvio > 1.5 ? "alta" : desvio > 0.8 ? "moderada" : "baixa"
          analysis += `O desvio padrão de ${desvio?.toFixed(2)} bar indica uma **variabilidade ${variabilidade}** no sistema.\n\n`

          if (variabilidade === "alta") {
            analysis += `⚠️ **ATENÇÃO**: Variabilidade alta pode indicar:\n`
            analysis += `- Problemas no sistema de controle\n`
            analysis += `- Vazamentos significativos\n`
            analysis += `- Necessidade de manutenção urgente\n\n`
          } else if (variabilidade === "moderada") {
            analysis += `Esta oscilação pode estar relacionada a:\n`
            analysis += `- Ciclos normais de carga/descarga do compressor\n`
            analysis += `- Variações na demanda de ar comprimido\n`
            analysis += `- Possível necessidade de ajuste fino no controlador\n\n`
          } else {
            analysis += `✅ **EXCELENTE**: Sistema operando com estabilidade adequada.\n\n`
          }
        }

        if (selectedEndpoint === "metricasCompleta") {
          if (apiData["MAD (desvio absoluto médio)"] !== undefined) {
            analysis += `**MAD (Desvio Absoluto Médio):** ${apiData["MAD (desvio absoluto médio)"]?.toFixed(2)} bar\n`
          }
          if (apiData["taxa de variação (rate of change)"] !== undefined) {
            analysis += `**Taxa de Variação:** ${apiData["taxa de variação (rate of change)"]?.toFixed(6)}\n`
          }
          if (apiData["z-score médio"] !== undefined) {
            analysis += `**Z-Score Médio:** ${apiData["z-score médio"]?.toFixed(2)}\n\n`
          }
        }

        analysis += `### ⚠️ Pontos de Atenção\n`
        if (apiData["valor máximo"] !== undefined && apiData["valor mínimo"] !== undefined) {
          const amplitude = apiData["valor máximo"] - apiData["valor mínimo"]
          analysis += `1. **Amplitude de Variação:** ${amplitude.toFixed(2)} bar - ${amplitude > 3 ? "⚠️ Amplitude elevada" : "✅ Amplitude normal"}\n`
        }
        analysis += `2. **Estabilidade:** Monitorar continuamente a variação dos parâmetros\n`
      }

      if (selectedEndpoint === "tendencia") {
        analysis += `### 📈 Análise de Tendência\n`
        if (apiData["inclinação (slope)"] !== undefined) {
          const slope = apiData["inclinação (slope)"]
          analysis += `**Inclinação:** ${slope?.toFixed(4)}\n`
          analysis += `**Tendência:** ${apiData["tendência"] || (slope > 0 ? "Crescente" : slope < 0 ? "Decrescente" : "Estável")}\n`

          if (Math.abs(slope) > 0.01) {
            analysis += `⚠️ **ATENÇÃO**: Tendência significativa detectada - monitoramento necessário\n`
          } else {
            analysis += `✅ Sistema com tendência estável\n`
          }
        }

        if (apiData["aceleração média"] !== undefined) {
          analysis += `**Aceleração Média:** ${apiData["aceleração média"]?.toFixed(4)}\n\n`
        }
      }

      if (selectedEndpoint === "qualidadeDados") {
        analysis += `### 🔍 Qualidade dos Dados\n`
        if (apiData["leituras idênticas consecutivas"] !== undefined) {
          const leituras = apiData["leituras idênticas consecutivas"]
          analysis += `**Leituras Idênticas Consecutivas:** ${leituras}\n`
          if (leituras > 100) {
            analysis += `⚠️ **ATENÇÃO**: Muitas leituras idênticas podem indicar sensor travado\n`
          }
        }

        if (apiData["variação relativa média"] !== undefined) {
          analysis += `**Variação Relativa Média:** ${apiData["variação relativa média"]?.toFixed(3)}\n`
        }

        if (apiData["qualidade geral"]) {
          const qualidade = apiData["qualidade geral"]
          analysis += `**Qualidade Geral:** ${qualidade}\n`
          if (qualidade === "boa") {
            analysis += `✅ Dados confiáveis para análise\n`
          } else if (qualidade === "regular") {
            analysis += `⚠️ Dados necessitam atenção\n`
          } else {
            analysis += `❌ Dados com problemas - verificar sensores\n`
          }
        }
        analysis += `\n`
      }

      if (selectedEndpoint === "dadosBrutos") {
        if (Array.isArray(apiData) && apiData.length > 0) {
          // Limitar análise para evitar crash - usar apenas uma amostra dos dados
          const sampleSize = Math.min(apiData.length, 100) // Máximo 100 registros para análise
          const sampleData = apiData.slice(0, sampleSize)

          const valores = sampleData.map((item) => item.valor).filter((v) => v !== undefined && v !== null && !isNaN(v))

          if (valores.length > 0) {
            const min = Math.min(...valores)
            const max = Math.max(...valores)
            const media = valores.reduce((a, b) => a + b, 0) / valores.length

            analysis += `### 📊 Análise dos Dados Brutos\n`
            analysis += `**Total de Leituras Carregadas:** ${apiData.length}\n`
            analysis += `**Amostra Analisada:** ${valores.length} registros\n`
            analysis += `**Valor Mínimo:** ${min.toFixed(2)} bar\n`
            analysis += `**Valor Máximo:** ${max.toFixed(2)} bar\n`
            analysis += `**Média:** ${media.toFixed(2)} bar\n`
            analysis += `**Amplitude:** ${(max - min).toFixed(2)} bar\n\n`

            // Análise de estabilidade (limitada para evitar crash)
            let variacoes = 0
            for (let i = 1; i < Math.min(valores.length, 50); i++) {
              // Máximo 50 comparações
              if (Math.abs(valores[i] - valores[i - 1]) > 0.1) {
                variacoes++
              }
            }
            const percentualVariacao = (variacoes / Math.min(valores.length, 50)) * 100

            analysis += `**Variações Significativas:** ${percentualVariacao.toFixed(1)}% das leituras analisadas\n`
            if (percentualVariacao > 30) {
              analysis += `⚠️ Sistema com alta instabilidade\n`
            } else if (percentualVariacao > 15) {
              analysis += `⚠️ Sistema com instabilidade moderada\n`
            } else {
              analysis += `✅ Sistema estável\n`
            }

            if (hasMoreData) {
              analysis += `\n💡 **Dica:** Carregue mais dados para uma análise mais completa\n`
            }
          } else {
            analysis += `### 📊 Análise dos Dados Brutos\n`
            analysis += `❌ **ERRO**: Não foi possível analisar os dados - valores inválidos ou ausentes\n`
          }
        } else {
          analysis += `### 📊 Análise dos Dados Brutos\n`
          analysis += `❌ **ERRO**: Nenhum dado válido encontrado para análise\n`
        }
        analysis += `\n`
      }

      analysis += `### 🔧 Recomendações de Manutenção\n`
      analysis += `1. **Verificar filtros de ar** - Filtros sujos podem causar oscilações\n`
      analysis += `2. **Inspeção das válvulas** - Verificar válvulas de alívio e regulagem\n`
      analysis += `3. **Calibração de sensores** - Validar precisão dos sensores\n`
      analysis += `4. **Análise de vazamentos** - Investigar possíveis vazamentos\n\n`

      analysis += `### 📈 Otimizações Sugeridas\n`
      analysis += `- Implementar controle preditivo para reduzir oscilações\n`
      analysis += `- Considerar ajuste dos setpoints de pressão\n`
      analysis += `- Avaliar necessidade de reservatório adicional\n\n`

      analysis += `### 🎯 Próximos Passos\n`
      analysis += `1. Monitorar tendência por mais 7 dias\n`
      analysis += `2. Comparar com dados históricos\n`
      analysis += `3. Agendar manutenção preventiva se necessário\n`

      setAiAnalysis(analysis)
      showNotification("success", "Análise de IA concluída!")
    } catch (error) {
      console.error("Erro na análise:", error)
      showNotification("error", "Erro ao processar análise de IA")
    } finally {
      setAnalyzing(false)
    }
  }

  const exportAnalysis = () => {
    const networkName = networks.find((n) => n.id === selectedNetwork)?.name || "N/A"
    const assetName = assets.find((a) => a.id === selectedAsset)?.name || "N/A"

    const content = `RELATÓRIO DE ANÁLISE - AIRscan Capivaras
Data: ${new Date().toLocaleDateString("pt-BR")}
Rede: ${networkName}
Ativo: ${assetName}
Endpoint: ${selectedEndpoint}
Período: ${selectedPeriod}
URL da API: ${buildApiUrl()}

DADOS COLETADOS:
${JSON.stringify(apiData, null, 2)}

ANÁLISE DE IA:
${aiAnalysis}
    `

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analise-ia-${selectedEndpoint}-${selectedPeriod}-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    showNotification("success", "Relatório exportado!")
  }

  const renderDataVisualization = () => {
    if (!apiData) return null

    if (selectedEndpoint === "dadosBrutos" && Array.isArray(apiData)) {
      // Limitar dados para visualização para evitar crash
      const maxDataPoints = 100
      const chartData = apiData.slice(0, maxDataPoints).map((item, index) => ({
        ...item,
        time: item.timestamp ? new Date(item.timestamp * 1000).toLocaleTimeString() : `Ponto ${index + 1}`,
        valor: typeof item.valor === "number" ? item.valor : 0,
      }))

      return (
        <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Visualização de Dados Brutos</h3>
            <div className="text-sm text-gray-600">
              {apiData.length} leituras carregadas
              {apiData.length > maxDataPoints && ` (mostrando ${maxDataPoints})`}
              {hasMoreData && " (mais dados disponíveis)"}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="valor" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>

          {hasMoreData && (
            <div className="mt-4 text-center">
              <button
                onClick={loadMoreData}
                disabled={loadingMore}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors disabled:opacity-50 flex items-center mx-auto"
              >
                {loadingMore ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ChevronDown className="w-4 h-4 mr-2" />
                )}
                {loadingMore ? "Carregando..." : "Carregar Mais 20 Registros"}
              </button>
            </div>
          )}
        </div>
      )
    }

    if (selectedEndpoint === "tendencia" && apiData["inclinação (slope)"]) {
      const trendData = Array.from({ length: 10 }, (_, i) => ({
        dia: `Dia ${i + 1}`,
        valor: 7.5 + i * apiData["inclinação (slope)"] * 10,
      }))

      return (
        <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Visualização de Tendência</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="valor" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )
    }

    if (selectedEndpoint === "metricasBasicas" || selectedEndpoint === "metricasCompleta") {
      const metricsData = [
        { name: "Mínimo", valor: apiData["valor mínimo"] || 0 },
        { name: "Média", valor: apiData["média"] || 0 },
        { name: "Máximo", valor: apiData["valor máximo"] || 0 },
        { name: "Mediana", valor: apiData["mediana"] || 0 },
      ]

      return (
        <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Visualização de Métricas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metricsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="valor" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )
    }

    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando redes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : notification.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Análises com IA</h1>
          <p className="text-gray-600">Análise inteligente de dados de pressão com recomendações técnicas</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuração da Análise</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rede</label>
              <select
                value={selectedNetwork}
                onChange={(e) => setSelectedNetwork(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                disabled={!selectedNetwork || loadingAssets}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Análise</label>
              <select
                value={selectedEndpoint}
                onChange={(e) => setSelectedEndpoint(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {endpoints.map((endpoint) => (
                  <option key={endpoint.value} value={endpoint.value}>
                    {endpoint.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {selectedEndpoint === "qualidadeDados" ? "Período (Fixo)" : "Período"}
              </label>
              <select
                value={selectedEndpoint === "qualidadeDados" ? "tudo" : selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                disabled={selectedEndpoint === "qualidadeDados"}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {periods.map((period) => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => fetchApiData(false)}
                disabled={loadingData || !selectedAsset}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {loadingData ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Carregar Dados
              </button>
            </div>
          </div>

          {selectedEndpoint === "dadosBrutos" && (
            <div className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data Início (Opcional)</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data Fim (Opcional)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <strong>💡 Dados Brutos:</strong> Carrega automaticamente 20 registros por vez para otimizar
                performance. Use "Carregar Mais" para adicionar mais 20 registros.
              </div>
            </div>
          )}

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>URL da API:</strong> {buildApiUrl(currentPage)}
            </p>
          </div>
        </div>

        {apiData && (
          <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Dados da API</h3>
              <button
                onClick={analyzeWithAI}
                disabled={analyzing}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 flex items-center"
              >
                {analyzing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
                Analisar com IA
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-6 max-h-96">
              <pre>{JSON.stringify(apiData, null, 2)}</pre>
            </div>
          </div>
        )}

        {renderDataVisualization()}

        {aiAnalysis && (
          <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-blue-600" />
                Análise de IA
              </h3>
              <button
                onClick={exportAnalysis}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </button>
            </div>

            <div className="prose max-w-none">
              <div
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(aiAnalysis) }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {endpoints.map((endpoint) => {
            const Icon = endpoint.icon
            return (
              <div
                key={endpoint.value}
                className={`bg-white rounded-xl p-6 shadow-sm border cursor-pointer transition-all hover:shadow-lg ${
                  selectedEndpoint === endpoint.value ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setSelectedEndpoint(endpoint.value)}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{endpoint.label}</h3>
                <p className="text-sm text-gray-600">
                  {endpoint.value === "metricasBasicas" && "Métricas descritivas fundamentais"}
                  {endpoint.value === "metricasCompleta" && "Análise estatística aprofundada"}
                  {endpoint.value === "tendencia" && "Análise de tendências temporais"}
                  {endpoint.value === "qualidadeDados" && "Avaliação da consistência dos dados"}
                  {endpoint.value === "dadosBrutos" && "Dados brutos de pressão (paginado)"}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
