import { CheckCircle, Cpu, Wifi, BarChart3, ArrowRight, Siren } from "lucide-react";

// Componente para os cards de tecnologia, para manter o código limpo
import { LucideIcon } from "lucide-react";

type TechCardProps = {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
};

function TechCard({ icon: Icon, title, desc, color }: TechCardProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 transform transition-all duration-300 hover:bg-slate-700/60 hover:-translate-y-1">
      <Icon className={`w-10 h-10 mb-4 ${color}`} />
      <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
      <p className="text-slate-300 text-sm">{desc}</p>
    </div>
  );
}

export function ProductSection() {
  const techFeatures = [
    {
      icon: Cpu,
      title: "Sensores IoT de Ponta",
      desc: "Hardware de alta precisão para monitorar pressão, temperatura, vibração e consumo energético.",
      color: "text-blue-400",
    },
    {
      icon: Wifi,
      title: "Conectividade Robusta",
      desc: "Transmissão de dados segura via WiFi, 4G/5G ou Ethernet, garantindo que você nunca perca uma leitura.",
      color: "text-teal-300",
    },
    {
      icon: BarChart3,
      title: "Analytics com IA",
      desc: "Nossa IA analisa os dados para prever falhas, otimizar o uso e gerar insights valiosos.",
      color: "text-yellow-300",
    },
    {
      icon: CheckCircle,
      title: "Certificação e Conformidade",
      desc: "Equipamentos certificados e em total conformidade com as normas industriais.",
      color: "text-green-400",
    },
  ];

  return (
    <section className="bg-slate-900 text-white py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho da Seção */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-block bg-blue-500/10 text-blue-300 px-4 py-2 rounded-full text-2xl font-semibold mb-4">
            Plataforma Completa
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Conheça o{" "}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
              AIRscan
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
            A solução definitiva para o monitoramento inteligente de ar comprimido, combinando hardware robusto com um software poderoso.
          </p>
        </div>

        {/* Grid Principal: Mockup Visual + Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Coluna Esquerda: Mockup do Dashboard e Alerta */}
          <div className="space-y-8">
            {/* Mockup do Dashboard (Existente) */}
            <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4 shadow-2xl shadow-blue-900/20">
              {/* "Barra do Navegador" */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              {/* Conteúdo do Mockup */}
              <div className="bg-slate-900 p-6 rounded-lg">
                <div className="flex justify-between items-baseline mb-4">
                  <h3 className="font-bold text-xl text-white">Dashboard Principal</h3>
                  <span className="flex items-center text-sm text-green-400">
                    <span className="relative flex h-3 w-3 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    Em Tempo Real
                  </span>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Pressão (PSY)</p>
                    <div className="flex items-end h-24 space-x-2">
                      <div className="w-full bg-blue-500 rounded-t-sm" style={{ height: '60%' }}></div>
                      <div className="w-full bg-blue-500 rounded-t-sm" style={{ height: '75%' }}></div>
                      <div className="w-full bg-blue-500 rounded-t-sm" style={{ height: '50%' }}></div>
                      <div className="w-full bg-teal-400 rounded-t-sm" style={{ height: '85%' }}></div>
                      <div className="w-full bg-blue-500 rounded-t-sm" style={{ height: '65%' }}></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-800 p-4 rounded-lg">
                          <p className="text-sm text-slate-400">Pressão Média</p>
                          <p className="text-2xl font-bold text-white">112 <span className="text-base font-normal text-slate-300">PSI</span></p>
                      </div>
                      <div className="bg-slate-800 p-4 rounded-lg">
                          <p className="text-sm text-slate-400">Alertas Hoje</p>
                          <p className="text-2xl font-bold text-yellow-300">3</p>
                      </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* NOVO: Simulação de Alerta no Celular */}
            <div className="bg-slate-800/70 border-4 border-slate-700 rounded-3xl p-2 shadow-2xl shadow-red-900/20 max-w-sm mx-auto">
                <div className="bg-slate-900 rounded-2xl p-4">
                  <p className="text-center font-semibold text-lg text-slate-300 mb-4">16:31</p>
                  <div className="bg-slate-800/80 rounded-lg p-4 flex gap-4 items-start">
                    <Siren className="w-8 h-8 text-red-500 flex-shrink-0 animate-pulse" />
                    <div className="flex-1">
                      <p className="font-bold text-white">AIRscan Alerta Urgente</p>
                      <p className="text-slate-200 text-sm">Vazamento significativo detectado no <span className="font-semibold text-red-400">Compressor C-102</span>. Ação imediata recomendada.</p>
                      <p className="text-xs text-slate-400 mt-2">agora mesmo</p>
                    </div>
                  </div>
                </div>
            </div>

          </div>

          {/* Coluna Direita: Features e CTA */}
          <div>
            <h3 className="text-3xl font-bold text-white mb-6">
              Uma Plataforma Completa e Conectada
            </h3>
            <p className="text-slate-300 mb-8">
              Nossa solução integra hardware de ponta e um software intuitivo para oferecer controle total, previsibilidade e eficiência para sua operação.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
              {techFeatures.map((feature) => (
                <TechCard
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  desc={feature.desc}
                  color={feature.color}
                />
              ))}
            </div>
            <button className="bg-gradient-to-r from-blue-500 to-teal-400 text-white px-12 py-7 rounded-lg font-bold text-lg transform transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 flex items-center">
              Solicitar Demonstração
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}