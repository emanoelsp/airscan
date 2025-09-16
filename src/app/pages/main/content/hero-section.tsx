import Link from "next/link";

import {
  Activity,
  Gauge,
  Shield,
  Zap,
} from "lucide-react";

type FeatureCardProps = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  desc: string;
};

function FeatureCard({ icon: Icon, title, desc }: FeatureCardProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center transform transition-all duration-300 hover:bg-white/10 hover:-translate-y-1">
      <Icon className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
      <h3 className="font-semibold text-lg mb-2 text-white">{title}</h3>
      <p className="text-sm text-slate-300">{desc}</p>
    </div>
  );
}

export function HeroSection() {
  const features = [
    {
      icon: Activity,
      title: "Tempo Real",
      desc: "Dados atualizados instantaneamente",
    },
    { icon: Gauge, title: "Eficiência", desc: "Otimize o consumo energético" },
    { icon: Shield, title: "Prevenção", desc: "Manutenção preditiva avançada" },
    {
      icon: Zap,
      title: "IoT Integrado",
      desc: "Sensores inteligentes conectados",
    },
  ];

  return (
    // Seção principal com fundo escuro e posicionamento relativo para o efeito de fundo
    <section className="relative bg-slate-900 text-white py-20 md:py-20 md:min-h-[47rem] overflow-hidden">
      {/* Efeito de iluminação "Aurora" no fundo */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-blue-600/30 rounded-full blur-3xl -z-0"
        aria-hidden="true"
      />

      {/* Conteúdo principal */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Monitoramento Inteligente de
            {/* Título com texto em gradiente para destaque */}
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent mt-2">
              Ar Comprimido
            </span>
          </h1>
          <p className="text-lg md:text-xl mb-12 max-w-3xl mx-auto text-slate-300">
            Transforme sua operação com o{" "}
            <span className="font-semibold text-yellow-400">AIRscan</span>. A
            plataforma SaaS completa para monitorar em tempo real seus
            compressores de ar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Botão primário com mais destaque e micro-interação */}
            <Link href="/product" className="bg-yellow-400 text-slate-900 px-10 py-5 rounded-lg font-bold text-lg transform transition-all hover:scale-105 hover:bg-yellow-500 shadow-lg shadow-yellow-400/20 flex items-center justify-center">
              <span className="bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">
                Conheça o AIRscan
              </span>
            </Link>
          </div>
        </div>

        {/* Grid de features com espaçamento maior */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-10 md:mt-10">
          {features.map((item, index) => (
            <FeatureCard
              key={index}
              icon={item.icon}
              title={item.title}
              desc={item.desc}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
