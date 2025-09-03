import React from "react";
import Link from "next/link";
import { Plug, BrainCircuit, Gamepad2, ArrowRight } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      icon: Plug,
      title: "PLUG",
      step: "01",
      description: "Conecte nosso hardware IoT de forma simples e rápida. Em minutos, você já está coletando dados vitais dos seus compressores.",
      colors: {
        bg: "bg-blue-500",
        text: "text-blue-600",
        border: "border-blue-500",
      },
    },
    {
      icon: BrainCircuit,
      title: "TRAINING",
      step: "02",
      description: "Nossa Inteligência Artificial entra em ação, aprendendo os padrões únicos da sua operação para entregar a máxima precisão.",
      colors: {
        bg: "bg-teal-500",
        text: "text-teal-600",
        border: "border-teal-500",
      },
    },
    {
      icon: Gamepad2,
      title: "PLAY",
      step: "03",
      description: "Acesse seu dashboard, receba insights preditivos e comece a economizar. O controle total da sua rede de ar está em suas mãos.",
      colors: {
        bg: "bg-yellow-500",
        text: "text-yellow-600",
        border: "border-yellow-500",
      },
    },
  ];

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Simples de Começar,{" "}
            <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              Poderoso para Otimizar
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-700 max-w-3xl mx-auto">
            Nossa metodologia exclusiva transforma a complexidade do monitoramento industrial em um processo de três passos simples:
          </p>
        </div>

        {/* Container da Linha do Tempo Vertical */}
        <div className="relative max-w-3xl mx-auto">
          {/* A linha vertical que conecta tudo */}
          <div
            className="absolute left-8 top-8 h-[calc(100%-4rem)] w-1 bg-slate-200 rounded-full hidden md:block"
            aria-hidden="true"
          />

          <div className="space-y-16">
            {steps.map((step) => (
              <div key={step.title} className="relative flex items-start gap-8">
                {/* Coluna da Esquerda: Ícone e Número do Passo */}
                <div className="flex-shrink-0 hidden md:flex flex-col items-center justify-center mt-1">
                  <div className={`flex items-center justify-center w-16 h-16 rounded-full ${step.colors.bg} shadow-lg shadow-${step.colors.border.split('-')[1]}-500/30`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <span className={`mt-3 text-2xl font-bold ${step.colors.text}`}>
                    {step.step}
                  </span>
                </div>

                {/* Coluna da Direita: Card com Conteúdo */}
                <div className={`w-full bg-white border ${step.colors.border} border-l-4 rounded-xl p-8 shadow-lg transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]`}>
                  <div className="flex items-center md:hidden mb-4">
                     <div className={`flex items-center justify-center w-12 h-12 rounded-full mr-4 ${step.colors.bg}`}>
                        <step.icon className="w-6 h-6 text-white" />
                     </div>
                      <h3 className={`text-3xl font-bold ${step.colors.text}`}>{step.title}</h3>
                  </div>
                  <h3 className={`hidden md:block text-3xl font-bold mb-3 ${step.colors.text}`}>
                    {step.title}
                  </h3>
                  <p className="text-slate-700 text-lg">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}