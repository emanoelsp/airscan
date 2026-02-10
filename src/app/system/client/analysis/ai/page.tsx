"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Activity,
  Loader2,
  Siren,
  ArrowLeft,
  Download,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getLogoDataUrl } from "@/lib/pdfLogo";
import { db } from "@/lib/firebase/firebaseconfig";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { useAuth } from "@/lib/controllers/authcontroller";

interface Network {
  id: string;
  name: string;
}

interface Asset {
  id: string;
  name: string;
  networkId: string;
}

interface DiagnosticoRow {
  assetId?: string;
  assetName?: string;
  networkId?: string;
  dataInicio?: string;
  dataFim?: string;
  lpm?: number;
  severidade?: string;
  pressao?: number;
  custo_estimado?: number;
  duracao_minutos?: number;
}

export default function ClientDiagnosticoIAPage() {
  const { account } = useAuth();
  const [period, setPeriod] = useState("month");
  const [networkId, setNetworkId] = useState("all");
  const [assetId, setAssetId] = useState("all");
  const [severidade, setSeveridade] = useState("all");
  const [networks, setNetworks] = useState<Network[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const filteredAssets = networkId === "all" ? assets : assets.filter((a) => a.networkId === networkId);
  const [data, setData] = useState<DiagnosticoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!account?.id) return;
    getDocs(query(collection(db, "airscan_networks"), where("clientId", "==", account.id))).then((snap) => {
      const nets = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Network));
      setNetworks(nets);
      const nids = new Set(nets.map((n) => n.id));
      getDocs(collection(db, "airscan_assets")).then((asnap) => {
        const all = asnap.docs.map((d) => ({ id: d.id, ...d.data() } as Asset));
        setAssets(all.filter((a) => nids.has(a.networkId)));
      });
    });
  }, [account?.id]);

  useEffect(() => {
    if (!account?.id) return;
    setLoading(true);
    setError(null);
    const days = period === "day" ? 1 : period === "week" ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startTimestamp = Timestamp.fromDate(startDate);

    const constraints = [where("timestamp", ">=", startTimestamp)];
    if (assetId !== "all") constraints.push(where("assetId", "==", assetId));
    if (severidade !== "all") constraints.push(where("severidade", "==", severidade));

    getDocs(query(collection(db, "airscan_diagnostico_ia"), ...constraints))
      .then((snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() } as DiagnosticoRow & { id: string }));
        const assetIdsInScope = networkId === "all" ? assets.map((a) => a.id) : assets.filter((a) => a.networkId === networkId).map((a) => a.id);
        const clientAssetIds = new Set(assetIdsInScope);
        const filtered = clientAssetIds.size ? rows.filter((r) => r.assetId && clientAssetIds.has(r.assetId)) : [];
        filtered.sort((a, b) => {
          const da = a.dataFim ? new Date(a.dataFim).getTime() : 0;
          const db2 = b.dataFim ? new Date(b.dataFim).getTime() : 0;
          return db2 - da;
        });
        setData(filtered);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar"))
      .finally(() => setLoading(false));
  }, [account?.id, period, networkId, assetId, severidade, assets]);

  const totalEventos = data.length;
  const custoTotal = data.reduce((s, r) => s + (Number(r.custo_estimado) || 0), 0);
  const topLpm = data.length ? data.reduce((a, b) => ((b.lpm ?? 0) > (a.lpm ?? 0) ? b : a), data[0]) : null;
  const porSeveridade = data.reduce(
    (acc, r) => {
      const s = String(r.severidade || "outro");
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const exportPdf = async () => {
    const logoData = await getLogoDataUrl().catch(() => null);
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    let y = 14;
    if (logoData) {
      doc.addImage(logoData, "PNG", 14, 8, 45, 12);
      y = 26;
    }
    doc.setFontSize(16);
    doc.text("Diagnóstico de IA", 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Período: ${period === "day" ? "Último dia" : period === "week" ? "Última semana" : "Último mês"}`, 14, y);
    y += 6;
    doc.text(`Rede: ${networkId === "all" ? "Todas" : networks.find((n) => n.id === networkId)?.name ?? networkId}`, 14, y);
    y += 6;
    doc.text(`Equipamento: ${assetId === "all" ? "Todos" : assets.find((a) => a.id === assetId)?.name ?? assetId}`, 14, y);
    y += 6;
    doc.text(`Severidade: ${severidade === "all" ? "Todas" : severidade}`, 14, y);
    y += 6;
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, y);
    y += 6;
    doc.text(`Total de eventos: ${totalEventos}  |  Custo total: R$ ${custoTotal.toFixed(2)}`, 14, y);
    y += 8;
    const tableData = data.map((row) => [
      row.dataInicio ? new Date(row.dataInicio).toLocaleString("pt-BR") : "—",
      row.dataFim ? new Date(row.dataFim).toLocaleString("pt-BR") : "—",
      row.assetName ?? row.assetId ?? "—",
      row.lpm != null ? Number(row.lpm).toFixed(2) : "—",
      row.severidade ?? "—",
      row.duracao_minutos != null ? String(Number(row.duracao_minutos).toFixed(1)) : "—",
      row.custo_estimado != null ? `R$ ${Number(row.custo_estimado).toFixed(2)}` : "—",
    ]);
    autoTable(doc, {
      startY: y,
      head: [["Início", "Fim", "Equipamento", "LPM", "Severidade", "Duração (min)", "Custo est."]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [51, 65, 85] },
      styles: { fontSize: 8 },
      margin: { left: 14 },
    });
    doc.save(`diagnostico-ia-${period}-${Date.now()}.pdf`);
  };

  return (
    <main className="relative min-h-screen bg-slate-900 text-white p-4 sm:p-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/painel/analise" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-4">
            <ArrowLeft className="w-4 h-4" /> Voltar para Análises
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100">Diagnóstico de IA</h1>
          <p className="mt-2 text-lg text-slate-400">Falhas, vazamentos e custos dos seus equipamentos</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-8">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-slate-700 text-white border border-slate-600 rounded-lg px-4 py-2"
          >
            <option value="day">Último dia</option>
            <option value="week">Última semana</option>
            <option value="month">Último mês</option>
          </select>
          <select
            value={networkId}
            onChange={(e) => { setNetworkId(e.target.value); setAssetId("all"); }}
            className="bg-slate-700 text-white border border-slate-600 rounded-lg px-4 py-2"
          >
            <option value="all">Todas as redes</option>
            {networks.map((n) => (
              <option key={n.id} value={n.id}>{n.name}</option>
            ))}
          </select>
          <select
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            className="bg-slate-700 text-white border border-slate-600 rounded-lg px-4 py-2"
          >
            <option value="all">Todos os equipamentos</option>
            {filteredAssets.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <select
            value={severidade}
            onChange={(e) => setSeveridade(e.target.value)}
            className="bg-slate-700 text-white border border-slate-600 rounded-lg px-4 py-2"
          >
            <option value="all">Todas severidades</option>
            <option value="moderate">Moderado</option>
            <option value="critical">Crítico</option>
            <option value="severe">Grave</option>
          </select>
          <button
            onClick={exportPdf}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium"
          >
            <Download className="w-4 h-4" /> Exportar PDF
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300 mb-6">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                <Siren className="w-10 h-10 text-amber-400" />
                <div>
                  <p className="text-slate-400 text-sm">Total de eventos</p>
                  <p className="text-2xl font-bold text-white">{totalEventos}</p>
                </div>
              </div>
              <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                <DollarSign className="w-10 h-10 text-green-400" />
                <div>
                  <p className="text-slate-400 text-sm">Custo total estimado</p>
                  <p className="text-2xl font-bold text-white">R$ {custoTotal.toFixed(2)}</p>
                </div>
              </div>
              <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                <Activity className="w-10 h-10 text-cyan-400" />
                <div>
                  <p className="text-slate-400 text-sm">Top LPM (vazamento)</p>
                  <p className="text-xl font-bold text-white">
                    {topLpm ? `${Number(topLpm.lpm).toFixed(2)} LPM` : "—"}
                  </p>
                  {topLpm?.assetName && (
                    <p className="text-xs text-slate-500 truncate">{topLpm.assetName}</p>
                  )}
                </div>
              </div>
              <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  <span className="text-slate-300 font-semibold">Por severidade</span>
                </div>
                <div className="space-y-1 text-sm">
                  {Object.entries(porSeveridade).map(([sev, count]) => (
                    <div key={sev} className="flex justify-between">
                      <span className="text-slate-400 capitalize">{sev}</span>
                      <span className="font-mono text-white">{count}</span>
                    </div>
                  ))}
                  {Object.keys(porSeveridade).length === 0 && (
                    <p className="text-slate-500">Nenhum evento no período</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-slate-200">Histórico de diagnósticos (falhas / vazamentos)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Início</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Fim</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Equipamento</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">LPM</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Severidade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Duração (min)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Custo est.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {[...data].reverse().map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-700/30">
                        <td className="px-6 py-3 text-sm text-slate-300">
                          {row.dataInicio ? new Date(row.dataInicio).toLocaleString("pt-BR") : "—"}
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-300">
                          {row.dataFim ? new Date(row.dataFim).toLocaleString("pt-BR") : "—"}
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-200">{row.assetName ?? row.assetId ?? "—"}</td>
                        <td className="px-6 py-3 text-sm font-mono text-cyan-300">
                          {row.lpm != null ? Number(row.lpm).toFixed(2) : "—"} LPM
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              row.severidade === "severe"
                                ? "bg-red-500/20 text-red-400"
                                : row.severidade === "critical"
                                  ? "bg-orange-500/20 text-orange-400"
                                  : "bg-amber-500/20 text-amber-400"
                            }`}
                          >
                            {row.severidade ?? "—"}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-slate-400">
                          {row.duracao_minutos != null ? Number(row.duracao_minutos).toFixed(1) : "—"}
                        </td>
                        <td className="px-6 py-3 text-sm text-green-400">
                          {row.custo_estimado != null ? `R$ ${Number(row.custo_estimado).toFixed(2)}` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.length === 0 && !loading && (
                <div className="px-6 py-12 text-center text-slate-500">
                  Nenhum diagnóstico de falha/vazamento no período.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
