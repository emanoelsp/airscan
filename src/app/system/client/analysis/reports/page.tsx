"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Download, Clock, Loader2, BarChart3, TrendingUp, ArrowLeft } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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

export default function ClientReportsPage() {
  const { account } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [selectedNetworkId, setSelectedNetworkId] = useState("all");
  const [selectedAssetId, setSelectedAssetId] = useState("all");
  const [networks, setNetworks] = useState<Network[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const periods = [
    { value: "day", label: "Último dia" },
    { value: "week", label: "Última semana" },
    { value: "month", label: "Último mês" },
  ];

  useEffect(() => {
    if (!account?.id) return;
    (async () => {
      try {
        const netSnap = await getDocs(query(collection(db, "airscan_networks"), where("clientId", "==", account.id)));
        const nets = netSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Network));
        setNetworks(nets);
        if (nets.length === 0) {
          setAssets([]);
          return;
        }
        const assetSnap = await getDocs(collection(db, "airscan_assets"));
        const allAssets = assetSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Asset));
        const networkIds = new Set(nets.map((n) => n.id));
        setAssets(allAssets.filter((a) => networkIds.has(a.networkId)));
      } catch (e) {
        console.error(e);
      }
    })();
  }, [account?.id]);

  useEffect(() => {
    if (!account?.id) return;
    setLoading(true);
    setError(null);
    const days = selectedPeriod === "day" ? 1 : selectedPeriod === "week" ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startTimestamp = Timestamp.fromDate(startDate);

    const constraints = [where("timestamp", ">=", startTimestamp)];
    if (selectedNetworkId !== "all") constraints.push(where("networkId", "==", selectedNetworkId));
    if (selectedAssetId !== "all") constraints.push(where("assetId", "==", selectedAssetId));

    getDocs(query(collection(db, "airscan_dados_ia"), ...constraints))
      .then((snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Record<string, unknown>));
        const clientNetworkIds = new Set(networks.length ? networks.map((n) => n.id) : []);
        const filtered = clientNetworkIds.size ? rows.filter((r) => clientNetworkIds.has(String(r.networkId))) : rows;
        filtered.sort((a, b) => {
          const ta = a.timestamp as Timestamp | undefined;
          const tb = b.timestamp as Timestamp | undefined;
          if (!ta || !tb) return 0;
          return tb.toMillis() - ta.toMillis();
        });
        setData(filtered);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erro ao carregar"))
      .finally(() => setLoading(false));
  }, [account?.id, selectedPeriod, selectedNetworkId, selectedAssetId, networks]);

  const filteredAssets = selectedNetworkId === "all" ? assets : assets.filter((a) => a.networkId === selectedNetworkId);

  const chartData = data
    .filter((r) => typeof r.pressao === "number" && (r.timestamp != null || r.pressao != null))
    .map((r) => {
      const t = r.timestamp;
      const date = t && typeof (t as { toMillis?: () => number }).toMillis === "function"
        ? new Date((t as { toMillis: () => number }).toMillis())
        : t ? new Date(t as string) : new Date();
      return {
        time: date.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }),
        pressao: Number(r.pressao),
      };
    })
    .slice(-100);

  const avgPressao = chartData.length ? chartData.reduce((a, b) => a + b.pressao, 0) / chartData.length : 0;
  const totalLeituras = data.length;

  const exportReportJson = () => {
    const reportData = { period: selectedPeriod, generatedAt: new Date().toISOString(), totalLeituras, data };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-analise-ia-${selectedPeriod}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    doc.setFontSize(16);
    doc.text("Relatório de Consumo (Análise IA)", 14, 20);
    doc.setFontSize(10);
    doc.text("Visão do cliente — suas redes e equipamentos", 14, 26);
    doc.text(`Período: ${periods.find((p) => p.value === selectedPeriod)?.label ?? selectedPeriod}`, 14, 34);
    doc.text(`Rede: ${selectedNetworkId === "all" ? "Todas" : networks.find((n) => n.id === selectedNetworkId)?.name ?? selectedNetworkId}`, 14, 40);
    doc.text(`Equipamento: ${selectedAssetId === "all" ? "Todos" : assets.find((a) => a.id === selectedAssetId)?.name ?? selectedAssetId}`, 14, 46);
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 52);
    doc.text(`Total de leituras: ${totalLeituras}  |  Pressão média: ${avgPressao.toFixed(2)} bar`, 14, 60);
    const tableData = data.slice(0, 50).map((row) => {
      const t = row.timestamp;
      const date = t && typeof (t as { toMillis?: () => number }).toMillis === "function"
        ? new Date((t as { toMillis: () => number }).toMillis())
        : t ? new Date(t as string) : null;
      return [
        date ? date.toLocaleString("pt-BR") : "—",
        String(row.assetName || row.assetId || "—"),
        row.pressao != null ? Number(row.pressao).toFixed(2) : "—",
        row.is_anomaly ? "Sim" : "Não",
        String(row.status_sistema || "—"),
      ];
    });
    autoTable(doc, {
      startY: 66,
      head: [["Data/Hora", "Equipamento", "Pressão (bar)", "Anomalia", "Status"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [51, 65, 85] },
      styles: { fontSize: 8 },
      margin: { left: 14 },
    });
    doc.save(`relatorio-consumo-${selectedPeriod}-${Date.now()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/painel/analise" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-4">
            <ArrowLeft className="w-4 h-4" /> Voltar para Análises
          </Link>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Relatório de Consumo (Análise IA)</h1>
          <p className="text-slate-400">Dados da sua rede — por período, rede e equipamento</p>
        </div>

        <div className="bg-slate-800/40 border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Período</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-slate-700 text-white border border-slate-600 rounded-lg px-4 py-2"
              >
                {periods.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Rede</label>
              <select
                value={selectedNetworkId}
                onChange={(e) => { setSelectedNetworkId(e.target.value); setSelectedAssetId("all"); }}
                className="bg-slate-700 text-white border border-slate-600 rounded-lg px-4 py-2"
              >
                <option value="all">Todas</option>
                {networks.map((n) => (
                  <option key={n.id} value={n.id}>{n.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Equipamento</label>
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="bg-slate-700 text-white border border-slate-600 rounded-lg px-4 py-2"
              >
                <option value="all">Todos</option>
                {filteredAssets.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={exportPdf}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-medium"
            >
              <Download className="w-4 h-4" /> Exportar PDF
            </button>
            <button
              onClick={exportReportJson}
              className="flex items-center gap-2 bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg font-medium"
            >
              <Download className="w-4 h-4" /> JSON
            </button>
          </div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-800/40 border border-white/10 rounded-xl p-6 flex items-center gap-4">
                <Clock className="w-10 h-10 text-cyan-400" />
                <div>
                  <p className="text-slate-400 text-sm">Total de leituras</p>
                  <p className="text-2xl font-bold text-white">{totalLeituras}</p>
                </div>
              </div>
              <div className="bg-slate-800/40 border border-white/10 rounded-xl p-6 flex items-center gap-4">
                <BarChart3 className="w-10 h-10 text-green-400" />
                <div>
                  <p className="text-slate-400 text-sm">Pressão média (bar)</p>
                  <p className="text-2xl font-bold text-white">{avgPressao.toFixed(2)}</p>
                </div>
              </div>
              <div className="bg-slate-800/40 border border-white/10 rounded-xl p-6 flex items-center gap-4">
                <TrendingUp className="w-10 h-10 text-purple-400" />
                <div>
                  <p className="text-slate-400 text-sm">Período</p>
                  <p className="text-xl font-bold text-white">{periods.find((p) => p.value === selectedPeriod)?.label}</p>
                </div>
              </div>
            </div>

            {chartData.length > 0 && (
              <div className="bg-slate-800/40 border border-white/10 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-slate-200 mb-4">Tendência de pressão</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} />
                    <Line type="monotone" dataKey="pressao" name="Pressão (bar)" stroke="#22d3ee" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="bg-slate-800/40 border border-white/10 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-slate-200">Últimas leituras (amostra)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Data/Hora</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Equipamento</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Pressão</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Anomalia</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {data.slice(0, 50).map((row, idx) => {
                      const t = row.timestamp;
                      const date = t && typeof (t as { toMillis?: () => number }).toMillis === "function"
                        ? new Date((t as { toMillis: () => number }).toMillis())
                        : t ? new Date(t as string) : null;
                      return (
                        <tr key={typeof row.id === "string" ? row.id : `report-${idx}`} className="hover:bg-slate-700/30">
                          <td className="px-6 py-3 text-sm text-slate-300">{date ? date.toLocaleString("pt-BR") : "—"}</td>
                          <td className="px-6 py-3 text-sm text-slate-200">{String(row.assetName || row.assetId || "—")}</td>
                          <td className="px-6 py-3 text-sm font-mono text-cyan-300">
                            {row.pressao != null ? Number(row.pressao).toFixed(2) : "—"} bar
                          </td>
                          <td className="px-6 py-3">
                            <span className={row.is_anomaly ? "text-amber-400" : "text-slate-400"}>
                              {row.is_anomaly ? "Sim" : "Não"}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm text-slate-400">{String(row.status_sistema || "—")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {data.length === 0 && !loading && (
                <div className="px-6 py-12 text-center text-slate-500">Nenhuma leitura no período.</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
