import React from "react";

export function UsageGuide() {
  const steps = [
    { step: "01", title: "Cadastro e Configuração", description: "Crie sua conta, configure sua empresa e defina os parâmetros dos seus ativos." },
    { step: "02", title: "Instalação dos Sensores", description: "Nossa equipe instala os sensores IoT (ou você mesmo, com nosso guia prático)." },
    { step: "03", title: "Conexão e Calibração", description: "Conecte os sensores à rede e calibre os parâmetros iniciais através do dashboard." },
    { step: "04", title: "Monitoramento Ativo", description: "Acompanhe em tempo real todos os dados e receba alertas automáticos para ações proativas." },
  ];

  return (
    <section className="bg-gradient-to-r from-blue-700 to-slate-900 text-white py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho da Seção */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-block bg-blue-500/10 text-blue-300 px-4 py-2 rounded-full text-lg font-semibold mb-4">
            Guia de Uso
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Como Usar o AIRscan
          </h2>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
            Implementação simples e rápida. Do cadastro ao monitoramento completo em poucos dias.
          </p>
        </div>

        {/* Seção de Passos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map((s) => (
            <div key={s.step} className="relative bg-slate-300/30 border border-white/10 rounded-xl p-8 overflow-hidden">
              <span className="absolute -top-4 -right-4 text-8xl font-bold text-slate-700/50 opacity-50">{s.step}</span>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-3">{s.title}</h3>
                <p className="text-slate-300">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}