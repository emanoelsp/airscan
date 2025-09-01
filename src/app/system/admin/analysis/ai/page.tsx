"use client"

import { useState, useMemo, ElementType } from "react" // Adicionado ElementType
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

type Timeframe = "minutes" | "hours" | "days"

interface AnalysisData {
  chartData: { time: string; pressure: number }[]
  variation: {
    min: number
    max: number
    avg: number
    amplitude: number
    diagnosis: "Baixa" | "Moderada" | "Alta"
  }
  trend: {
    start: number
    end: number
    change: number
    diagnosis: "Estável" | "Leve Aumento" | "Aumento" | "Leve Queda" | "Queda"
  }
}

// Função para gerar dados simulados (sem alterações)
const generateMockData = (timeframe: Timeframe): AnalysisData => {
  const dataPoints = { minutes: 60, hours: 24, days: 7 }[timeframe]
  const basePressure = 7.8
  let currentPressure = basePressure
  const chartData: { time: string; pressure: number }[] = []

  const overallTrend = (Math.random() - 0.5) * 0.05

  for (let i = 0; i < dataPoints; i++) {
    const noise = (Math.random() - 0.5) * 0.25
    currentPressure += noise
    currentPressure += overallTrend

    if (Math.random() < 0.1) {
      currentPressure += (Math.random() - 0.5) * 0.8
    }

    currentPressure = Math.max(6.0, Math.min(9.5, currentPressure))

    let timeLabel = ""
    switch (timeframe) {
      case "minutes":
        timeLabel = i === dataPoints - 1 ? "Agora" : `-${dataPoints - 1 - i} min`
        break
      case "hours":
        timeLabel = i === dataPoints - 1 ? "Agora" : `-${dataPoints - 1 - i}h`
        break
      case "days":
        const day = new Date()
        day.setDate(day.getDate() - (dataPoints - 1 - i))
        timeLabel = day.toLocaleDateString("pt-BR", { weekday: "short" })
        break
    }

    chartData.push({ time: timeLabel, pressure: parseFloat(currentPressure.toFixed(2)) })
  }

  const pressures = chartData.map((d) => d.pressure)
  const min = Math.min(...pressures)
  const max = Math.max(...pressures)
  const avg = pressures.reduce((a, b) => a + b, 0) / pressures.length
  const amplitude = max - min

  let variationDiagnosis: "Baixa" | "Moderada" | "Alta"
  if (amplitude < 0.5) variationDiagnosis = "Baixa"
  else if (amplitude < 1.2) variationDiagnosis = "Moderada"
  else variationDiagnosis = "Alta"

  const start = pressures[0]
  const end = pressures[pressures.length - 1]
  const change = end - start

  let trendDiagnosis: "Estável" | "Leve Aumento" | "Aumento" | "Leve Queda" | "Queda"
  if (Math.abs(change) < 0.2) trendDiagnosis = "Estável"
  else if (change > 0 && change <= 0.5) trendDiagnosis = "Leve Aumento"
  else if (change > 0.5) trendDiagnosis = "Aumento"
  else if (change < 0 && change >= -0.5) trendDiagnosis = "Leve Queda"
  else trendDiagnosis = "Queda"

  return {
    chartData,
    variation: { min, max, avg, amplitude, diagnosis: variationDiagnosis },
    trend: { start, end, change, diagnosis: trendDiagnosis },
  }
}

// --- CORREÇÃO 1: Definir uma interface para as props do AnalysisCard ---
interface AnalysisCardProps {
  title: string
  icon: ElementType // Tipo para componentes React, como os ícones
  data: { [key: string]: number }
  diagnosis: string
  recommendation: string
  diagnosisColor: string
}

// Componente do Card de Análise
// --- CORREÇÃO 2: Aplicar a interface ao componente, substituindo ': any' ---
const AnalysisCard = ({
  title,
  icon: Icon,
  data,
  diagnosis,
  recommendation,
  diagnosisColor,
}: AnalysisCardProps) => (
  <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6">
    <div className="flex items-center gap-3 mb-4">
      <Icon className="w-6 h-6 text-blue-400" />
      <h3 className="text-xl font-semibold text-white">{title}</h3>
    </div>
    <div className="space-y-2 text-sm">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex justify-between items-center">
          <span className="text-slate-400 capitalize">{key.replace("_", " ")}</span>
          <span className="font-mono text-white">
            {value.toFixed(2)} bar
          </span>
        </div>
      ))}
    </div>
    <div className="mt-6 pt-4 border-t border-white/10">
      <h4 className="text-sm font-semibold text-slate-300 mb-2">Diagnóstico</h4>
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${diagnosisColor}`}
      >
        {diagnosis}
      </span>
      <p className="text-sm text-slate-400 mt-3">{recommendation}</p>
    </div>
  </div>
)

export default function MockPressureAnalysisPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>("hours")

  const analysisData = useMemo(() => generateMockData(timeframe), [timeframe])

  const timeframeOptions: { id: Timeframe; label: string }[] = [
    { id: "minutes", label: "Últimos 60 Minutos" },
    { id: "hours", label: "Últimas 24 Horas" },
    { id: "days", label: "Últimos 7 Dias" },
  ]

  const getTrendIcon = () => {
    const { diagnosis } = analysisData.trend
    if (diagnosis.includes("Aumento")) return TrendingUp
    if (diagnosis.includes("Queda")) return TrendingDown
    return Minus
  }

  return (
    <main className="relative min-h-screen bg-slate-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Análise de Pressão (Simulação)</h1>
          <p className="mt-2 text-lg text-slate-300">
            Visualização de dados de pressão simulados para análise de variação e tendência.
          </p>
        </div>

        {/* Controles de Período */}
        <div className="mb-8 flex flex-wrap gap-2">
          {timeframeOptions.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTimeframe(id)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                timeframe === id
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Conteúdo Principal: Gráfico e Análise */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna do Gráfico */}
          <div className="lg:col-span-2 bg-slate-800/50 border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Histórico de Pressão</h3>
            <div style={{ width: "100%", height: 400 }}>
              <ResponsiveContainer>
                <LineChart
                  data={analysisData.chartData}
                  margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} domain={["dataMin - 0.2", "dataMax + 0.2"]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      borderColor: "#4b5563",
                    }}
                    labelStyle={{ color: "#f3f4f6" }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="pressure" name="Pressão (bar)" stroke="#38bdf8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Coluna da Análise */}
          <div className="lg:col-span-1 space-y-8">
            <AnalysisCard
              title="Variação da Pressão"
              icon={Activity}
              data={{
                Mínima: analysisData.variation.min,
                Máxima: analysisData.variation.max,
                Média: analysisData.variation.avg,
                Amplitude: analysisData.variation.amplitude,
              }}
              diagnosis={analysisData.variation.diagnosis}
              recommendation={
                analysisData.variation.diagnosis === "Alta"
                  ? "Variação elevada sugere picos de demanda ou vazamentos. Investigar a causa."
                  : "Sistema operando com variação dentro do esperado."
              }
              diagnosisColor={
                analysisData.variation.diagnosis === "Alta"
                  ? "bg-orange-500/20 text-orange-400"
                  : "bg-green-500/20 text-green-400"
              }
            />

            <AnalysisCard
              title="Tendência de Pressão"
              icon={getTrendIcon()}
              data={{
                Inicial: analysisData.trend.start,
                Final: analysisData.trend.end,
                Variação: analysisData.trend.change,
              }}
              diagnosis={analysisData.trend.diagnosis}
              recommendation={
                analysisData.trend.diagnosis.includes("Queda")
                  ? "Tendência de queda pode indicar um novo vazamento ou aumento de consumo."
                  : "A pressão geral do sistema permanece estável no período."
              }
              diagnosisColor={
                analysisData.trend.diagnosis.includes("Queda") ||
                analysisData.trend.diagnosis.includes("Aumento")
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-green-500/20 text-green-400"
              }
            />
          </div>
        </div>
      </div>
    </main>
  )
}