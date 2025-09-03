import React from "react";
import { Plug, BrainCircuit, Gamepad2, type LucideProps } from "lucide-react";

// 1. Define a type for a single step to ensure data consistency and get autocompletion.
type Step = {
  icon: React.FC<LucideProps>; // A more specific type for icon components.
  title: string;
  step: string;
  description: string;
  colors: {
    bg: string;
    text: string;
    border: string;
    shadow: string; // Added a property for the complete shadow class.
  };
};

// 2. Moved the data array outside the component.
// This prevents it from being recreated on every render.
const steps: Step[] = [
  {
    icon: Plug,
    title: "PLUG",
    step: "01",
    description: "Conecte nosso hardware IoT de forma simples e rápida. Em minutos, você já está coletando dados vitais dos seus compressores.",
    colors: {
      bg: "bg-blue-500",
      text: "text-blue-600",
      border: "border-blue-500",
      shadow: "shadow-blue-500/30", // The full class name.
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
      shadow: "shadow-teal-500/30", // The full class name.
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
      shadow: "shadow-yellow-500/30", // The full class name.
    },
  },
];

export function HowItWorksSection() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center md:mb-20">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Simples de Começar,{" "}
            <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              Poderoso para Otimizar
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-slate-700 md:text-xl">
            Nossa metodologia exclusiva transforma a complexidade do monitoramento industrial em um processo de três passos simples:
          </p>
        </div>

        <div className="relative mx-auto max-w-3xl">
          <div
            className="absolute left-8 top-8 hidden h-[calc(100%-4rem)] w-1 rounded-full bg-slate-200 md:block"
            aria-hidden="true"
          />

          <div className="space-y-16">
            {steps.map((step) => (
              <div key={step.title} className="relative flex items-start gap-8">
                <div className="mt-1 hidden flex-shrink-0 flex-col items-center justify-center md:flex">
                  {/* 3. Use the full shadow class directly from the data object. */}
                  <div className={`flex h-16 w-16 items-center justify-center rounded-full shadow-lg ${step.colors.bg} ${step.colors.shadow}`}>
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <span className={`mt-3 text-2xl font-bold ${step.colors.text}`}>
                    {step.step}
                  </span>
                </div>

                <div className={`w-full transform rounded-xl border border-l-4 bg-white p-8 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${step.colors.border}`}>
                  <div className="mb-4 flex items-center md:hidden">
                    <div className={`mr-4 flex h-12 w-12 items-center justify-center rounded-full ${step.colors.bg}`}>
                      <step.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className={`text-3xl font-bold ${step.colors.text}`}>{step.title}</h3>
                  </div>
                  <h3 className={`hidden text-3xl font-bold md:block ${step.colors.text}`}>
                    {step.title}
                  </h3>
                  <p className="mt-3 text-lg text-slate-700">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}