"use client";

import Link from "next/link";
import { type ElementType } from "react";
import { BarChart3, TrendingUp, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/controllers/authcontroller";

interface ActionCardProps {
  href: string;
  icon: ElementType;
  title: string;
  description: string;
  color: "blue" | "purple" | "cyan";
}

function ActionCard({ href, icon: Icon, title, description, color }: ActionCardProps) {
  const colorClasses = {
    blue: "bg-blue-500/10 group-hover:bg-blue-500/20 text-blue-400",
    purple: "bg-purple-500/10 group-hover:bg-purple-500/20 text-purple-400",
    cyan: "bg-cyan-500/10 group-hover:bg-cyan-500/20 text-cyan-400",
  };
  const arrowColorClasses = {
    blue: "text-blue-400 group-hover:text-blue-300",
    purple: "text-purple-400 group-hover:text-purple-300",
    cyan: "text-cyan-400 group-hover:text-cyan-300",
  };

  return (
    <Link
      href={href}
      className="group block bg-slate-800/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transition-all hover:border-white/20 hover:scale-[1.02] flex flex-col h-full"
    >
      <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-colors ${colorClasses[color]}`}>
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-semibold text-slate-100 mb-2">{title}</h3>
      <p className="text-slate-400 text-sm mb-4 flex-grow">{description}</p>
      <div className={`font-semibold flex items-center gap-2 transition-colors mt-auto ${arrowColorClasses[color]}`}>
        Acessar <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  );
}

export default function ClientAnalysisPage() {
  const { account } = useAuth();

  return (
    <main className="relative min-h-screen bg-slate-900 text-white px-4 py-16 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-blue-600/20 rounded-full blur-3xl -z-0" aria-hidden="true" />
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-100">Análises</h1>
          <p className="text-slate-300 mt-2 text-lg">
            {account?.companyName || "Sua empresa"} — Relatórios de consumo e diagnóstico de IA. Acesso rápido.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ActionCard
            href="/painel/analise/relatorios"
            icon={BarChart3}
            title="Relatório de Consumo"
            description="Visualize leituras da IA por período, rede e equipamento. Dados da sua rede."
            color="blue"
          />
          <ActionCard
            href="/painel/analise/inteligencia-artificial"
            icon={TrendingUp}
            title="Diagnóstico de IA"
            description="Falhas, vazamentos e custos dos seus equipamentos. Relatórios de defeitos."
            color="purple"
          />
        </div>
      </div>
    </main>
  );
}
