"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/controllers/authcontroller";
import assetsController, { type Asset } from "@/lib/controllers/assetscontroller";
import {
  LayoutDashboard,
  Bell,
  Server,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Eye,
  ChevronRight,
} from "lucide-react";

// Resposta da API de IA (conforme exemplo do usuário)
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

interface AssetWithStatus extends Omit<Asset, "networkName"> {
  networkName?: string;
  apiUrl?: string;
  status?: "online" | "offline" | "maintenance";
  online?: boolean;
  aiData?: AIApiResponse | null;
  hasAlert?: boolean;
}

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
      drift: data.drift ?? "—",
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

function SummaryCard({
  icon: Icon,
  title,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  sub?: string;
  color: "blue" | "green" | "red" | "amber";
}) {
  const classes = {
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    green: "border-green-500/30 bg-green-500/10 text-green-400",
    red: "border-red-500/30 bg-red-500/10 text-red-400",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  };
  return (
    <div className={`rounded-2xl border p-5 flex flex-col ${classes[color]}`}>
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-slate-300">{title}</span>
        <Icon className="w-6 h-6 flex-shrink-0" />
      </div>
      <p className="text-2xl md:text-3xl font-bold text-white mt-2">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function AlertsPanelPage() {
  const { account } = useAuth();
  const [assets, setAssets] = useState<AssetWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!account?.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await assetsController.getAssetsByAccountId(account.id);
        const results: AssetWithStatus[] = await Promise.all(
          list.map(async (a) => {
            const extended = a as Asset & { apiUrl?: string; networkName?: string };
            const apiUrl = extended.apiUrl?.trim();
            if (!apiUrl) {
              return {
                ...a,
                networkName: extended.networkName,
                apiUrl,
                online: false,
                aiData: null,
                hasAlert: false,
              } as AssetWithStatus;
            }
            const aiData = await fetchAIData(apiUrl);
            const online = aiData !== null;
            const hasAlert =
              online &&
              (aiData!.is_anomaly || (aiData!.severidade && aiData!.severidade !== "normal"));
            return {
              ...a,
              networkName: extended.networkName,
              apiUrl,
              online,
              aiData,
              hasAlert,
            } as AssetWithStatus;
          })
        );
        if (!cancelled) setAssets(results);
      } catch (e) {
        console.error(e);
        if (!cancelled) setAssets([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [account?.id]);

  const total = assets.length;
  const online = assets.filter((a) => a.online).length;
  const offline = total - online;
  const alertCount = assets.filter((a) => a.hasAlert).length;
  const allNormal = !loading && total > 0 && alertCount === 0 && online > 0;

  return (
    <main className="relative flex-1 min-h-screen min-h-[100dvh] flex flex-col bg-slate-900 text-white">
      <div className="absolute inset-0 top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-blue-600/20 rounded-full blur-3xl -z-0 pointer-events-none" aria-hidden="true" />
      <div className="relative z-10 flex-1 flex flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto w-full flex flex-col flex-1">
          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8 flex-shrink-0" />
              Painel de Alertas
            </h1>
            <p className="text-slate-300 mt-1 text-sm md:text-base max-w-2xl">
              Visão geral da sua rede de ar comprimido: equipamentos online/offline e quantidade de alertas.
              Use &quot;Ver diagnóstico&quot; para LPM de vazamento, custo aproximado e métricas da IA.
            </p>
          </header>

          {loading ? (
            <div className="flex-1 flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
            </div>
          ) : (
            <div className="space-y-8 flex-1">
              {/* Resumo da rede — destaque quando há alertas */}
              <section>
                <h2 className="text-base font-semibold text-slate-200 mb-3 flex items-center gap-2">
                  Resumo da rede
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <SummaryCard
                    icon={Server}
                    title="Equipamentos"
                    value={total}
                    sub="Total na rede"
                    color="blue"
                  />
                  <SummaryCard
                    icon={Wifi}
                    title="Online"
                    value={online}
                    sub="Respondendo à API"
                    color="green"
                  />
                  <SummaryCard
                    icon={WifiOff}
                    title="Offline"
                    value={offline}
                    sub="Sem resposta ou sem API"
                    color="red"
                  />
                  <SummaryCard
                    icon={Bell}
                    title="Alertas"
                    value={alertCount}
                    sub={alertCount > 0 ? "Requerem atenção" : "Nenhum ativo"}
                    color="amber"
                  />
                </div>
                {allNormal && (
                  <p className="mt-4 text-sm text-green-400/90 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
                    Todos os equipamentos monitorados estão operando normalmente.
                  </p>
                )}
              </section>

              {/* Lista de equipamentos */}
              <section className="flex-1 min-h-0">
                <h2 className="text-base font-semibold text-slate-200 mb-3">Equipamentos monitorados</h2>
                <div className="bg-slate-800/40 border border-white/10 rounded-2xl overflow-hidden">
                  {assets.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                      Nenhum equipamento encontrado na sua rede.
                    </div>
                  ) : (
                    <ul className="divide-y divide-white/10">
                      {assets.map((asset) => (
                        <li
                          key={asset.id}
                          className={`flex flex-wrap items-center justify-between gap-4 p-4 transition-colors ${
                            asset.hasAlert ? "bg-amber-500/5 hover:bg-amber-500/10" : "hover:bg-slate-800/50"
                          }`}
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div
                              className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                asset.online ? "bg-green-400" : "bg-red-400"
                              }`}
                              title={asset.online ? "Online" : "Offline"}
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-white truncate">{asset.name}</p>
                              <p className="text-sm text-slate-400 truncate">
                                {asset.networkName ?? "—"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                asset.online
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-slate-600/50 text-slate-400"
                              }`}
                            >
                              {asset.online ? (
                                <><Wifi className="w-3.5 h-3.5" /> Online</>
                              ) : (
                                <><WifiOff className="w-3.5 h-3.5" /> Offline</>
                              )}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                asset.hasAlert
                                  ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-400/30"
                                  : "bg-slate-600/50 text-slate-400"
                              }`}
                            >
                              {asset.hasAlert ? (
                                <><AlertTriangle className="w-3.5 h-3.5" /> Alerta</>
                              ) : (
                                <><CheckCircle2 className="w-3.5 h-3.5" /> Normal</>
                              )}
                            </span>
                            {asset.apiUrl && (
                              <Link
                                href={`/painel/alertas/diagnostico/${asset.id}`}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600/20 px-3 py-2 text-sm font-medium text-cyan-400 hover:bg-cyan-600/30 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                Ver diagnóstico
                                <ChevronRight className="w-4 h-4" />
                              </Link>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
