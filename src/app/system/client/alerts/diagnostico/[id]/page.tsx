"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/controllers/authcontroller";
import assetsController from "@/lib/controllers/assetscontroller";
import {
  ArrowLeft,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  DollarSign,
  Droplets,
} from "lucide-react";

// Resposta da API de IA
interface AIApiResponse {
  timestamp?: string;
  pressao: number;
  is_anomaly: boolean;
  status_sistema: string;
  mse: number;
  uncertainty: number;
  drift: string;
  lpm_vazamento: number;
  gap: number;
  threshold: number;
  duracao_minutos: number;
  inicio_vazamento: string | null;
  severidade: string;
}

type AssetWithApi = Awaited<ReturnType<typeof assetsController.getAssetsByAccountId>>[number] & {
  apiUrl?: string;
  networkName?: string;
};

async function fetchAIData(apiUrl: string, timeoutMs = 8000): Promise<AIApiResponse | null> {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(apiUrl.trim(), {
      headers: { "ngrok-skip-browser-warning": "true" },
      signal: controller.signal,
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      pressao: Number(data.pressao),
      is_anomaly: Boolean(data.is_anomaly),
      status_sistema: data.status_sistema ?? "—",
      mse: Number(data.mse ?? 0),
      uncertainty: Number(data.uncertainty ?? 0),
      drift: (data.drift ?? "—").toString(),
      lpm_vazamento: Number(data.lpm_vazamento ?? 0),
      gap: Number(data.gap ?? 0),
      threshold: Number(data.threshold ?? 0),
      duracao_minutos: Number(data.duracao_minutos ?? 0),
      inicio_vazamento: data.inicio_vazamento ?? null,
      severidade: (data.severidade ?? "normal").toLowerCase(),
    };
  } catch {
    return null;
  }
}

// Custo aproximado: R$ 350/(m³/ano) -> por LPM vazamento, custo/hora aproximado
function custoHoraAproximado(lpmVazamento: number): number {
  return (lpmVazamento * 350) / (365 * 24);
}

export default function DiagnosticoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { account } = useAuth();
  const [asset, setAsset] = useState<AssetWithApi | null>(null);
  const [aiData, setAiData] = useState<AIApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!account?.id || !id) {
      setLoading(false);
      setError("Acesso inválido.");
      return;
    }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await assetsController.getAssetsByAccountId(account.id);
        const found = list.find((a) => a.id === id) as AssetWithApi | undefined;
        if (!found) {
          setAsset(null);
          setError("Equipamento não encontrado.");
          setLoading(false);
          return;
        }
        setAsset(found);
        const apiUrl = (found as { apiUrl?: string }).apiUrl?.trim();
        if (!apiUrl) {
          setAiData(null);
          setLoading(false);
          return;
        }
        const data = await fetchAIData(apiUrl);
        setAiData(data);
      } catch (e) {
        console.error(e);
        setError("Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    })();
  }, [account?.id, id]);

  // Polling a cada 15s
  useEffect(() => {
    if (!asset?.apiUrl?.trim() || !account?.id) return;
    const interval = setInterval(async () => {
      const data = await fetchAIData((asset as AssetWithApi).apiUrl!);
      setAiData(data);
    }, 15000);
    return () => clearInterval(interval);
  }, [asset?.id, asset?.apiUrl, account?.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
      </main>
    );
  }

  if (error || !asset) {
    return (
      <main className="min-h-screen bg-slate-900 text-white px-4 py-8">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-slate-300">{error ?? "Equipamento não encontrado."}</p>
          <Link
            href="/painel/alertas/painel"
            className="mt-4 inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao painel de alertas
          </Link>
        </div>
      </main>
    );
  }

  const custoHora = aiData ? custoHoraAproximado(aiData.lpm_vazamento) : 0;
  const severidadeNormal = aiData && aiData.severidade === "normal" && !aiData.is_anomaly;

  return (
    <main className="relative min-h-screen bg-slate-900 text-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-blue-600/20 rounded-full blur-3xl -z-0" aria-hidden="true" />
      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <Link
            href="/painel/alertas/painel"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Painel de alertas
          </Link>
          <div className="text-right">
            <h1 className="text-xl font-bold text-white">{asset.name}</h1>
            <p className="text-slate-400 text-sm">{(asset as AssetWithApi).networkName ?? "—"}</p>
          </div>
        </div>

        {!aiData ? (
          <div className="rounded-2xl border border-white/10 bg-slate-800/40 p-8 text-center text-slate-400">
            <p>Equipamento sem API configurada ou sem resposta no momento.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Monitoramento Ativo (estilo Node-RED) */}
            <section
              className={`rounded-2xl border-2 p-6 ${
                severidadeNormal
                  ? "bg-green-600/20 border-green-500/40"
                  : "bg-amber-600/20 border-amber-500/40"
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <Activity className="w-12 h-12 text-white/90 mb-3" />
                <p className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                  Monitoramento ativo
                </p>
                <p className="text-slate-200/80 text-sm mt-1">Pressão</p>
                <p className="text-4xl font-bold text-white mt-2">
                  {aiData.pressao.toFixed(2)} bar
                </p>
              </div>
            </section>

            {/* Status do sistema */}
            <section className="rounded-2xl border border-white/10 bg-slate-800/60 p-4 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                {severidadeNormal ? (
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-amber-400" />
                )}
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Status do sistema</p>
                  <p className="text-lg font-bold text-white">{aiData.status_sistema}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    severidadeNormal ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {aiData.severidade.toUpperCase()}
                </span>
              </div>
            </section>

            {/* Métricas do modelo */}
            <section className="rounded-2xl border border-white/10 bg-slate-800/40 p-5">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">
                Métricas do modelo
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-400">MSE</p>
                  <p className="text-lg font-mono font-semibold text-white">
                    {aiData.mse.toFixed(6)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Uncertainty</p>
                  <p className="text-lg font-mono font-semibold text-white">
                    {aiData.uncertainty.toFixed(6)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Drift status</p>
                  <p
                    className={`text-lg font-semibold ${
                      aiData.drift === "stable" ? "text-green-400" : "text-amber-400"
                    }`}
                  >
                    {aiData.drift.toUpperCase()}
                  </p>
                </div>
              </div>
            </section>

            {/* Dados de negócio */}
            <section className="rounded-2xl border border-white/10 bg-slate-800/40 p-5">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">
                Dados de negócio
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Gap confidence</p>
                  <p className="text-lg font-mono font-semibold text-white">
                    {aiData.gap.toFixed(4)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Threshold atual</p>
                  <p className="text-lg font-mono font-semibold text-white">
                    {aiData.threshold.toFixed(4)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Duração evento</p>
                  <p className="text-lg font-semibold text-white">
                    {aiData.duracao_minutos.toFixed(1)} min
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Severidade</p>
                  <p
                    className={`text-lg font-semibold ${
                      severidadeNormal ? "text-green-400" : "text-amber-400"
                    }`}
                  >
                    {aiData.severidade.toUpperCase()}
                  </p>
                </div>
              </div>
              {aiData.inicio_vazamento && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs text-slate-400">Início vazamento</p>
                  <p className="text-sm font-mono text-white">{aiData.inicio_vazamento}</p>
                </div>
              )}
            </section>

            {/* LPM vazamento e custo aproximado */}
            <section className="rounded-2xl border border-white/10 bg-slate-800/40 p-5">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">
                Vazamento e custo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50">
                  <Droplets className="w-10 h-10 text-cyan-400" />
                  <div>
                    <p className="text-xs text-slate-400">LPM vazamento</p>
                    <p className="text-2xl font-bold font-mono text-white">
                      {aiData.lpm_vazamento.toFixed(2)} LPM
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50">
                  <DollarSign className="w-10 h-10 text-amber-400" />
                  <div>
                    <p className="text-xs text-slate-400">Custo aproximado (hora)</p>
                    <p className="text-2xl font-bold text-white">
                      R$ {custoHora.toFixed(2)}/h
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Referência: R$ 350/(m³/ano) convertido por LPM
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
