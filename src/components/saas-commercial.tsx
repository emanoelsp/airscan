import Link from "next/link";
import { Check, ArrowRight, HardDrive, HelpCircle } from "lucide-react";

export function SaasCommercial() {
  const features = [
    "Dashboard completo e interativo",
    "Coleta de dados em tempo real",
    "Alertas multi-canal (WhatsApp/Email)",
    "Relatórios automáticos e em tempo real",
    "Monitoramento de múltiplos ativos de rede",
    "IA avançada para análise preditiva",
    "Integração facilitada (ERP/MES)",
    "API completa, responsiva e modular",
    "Histórico completo de dados",
    "Suporte técnico especializado 24/7",
  ];

  return (
    <section className="bg-slate-50 py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho da Seção */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Planos SaaS
          </h2>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
            Escolha o plano ideal para sua empresa. Sem taxa de instalação, sem fidelidade.
          </p>
        </div>

        {/* Grid Principal: Features à esquerda, Card de Preço à direita */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          
          {/* Coluna da Esquerda: Lista de Recursos e Tira-dúvidas */}
          <div className="lg:col-span-3">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              Uma Plataforma, Todos os Recursos Essenciais
            </h3>
            <p className="text-slate-600 mb-8">
              Nosso plano foi desenhado para ser completo, oferecendo todas as ferramentas que sua indústria precisa para decolar na era da Indústria 4.0.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {features.map((feature) => (
                <div key={feature} className="flex items-start">
                  <Check className="w-5 h-5 text-teal-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-slate-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* NOVO: Seção Interativa "Tira-dúvidas" */}
            <div className="mt-10 pt-8 border-t border-slate-200">
                <div className="flex items-start gap-4">
                    <div>
                        <HelpCircle className="w-8 h-8 text-slate-500 flex-shrink-0" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800">Ainda tem dúvidas sobre os recursos?</h4>
                        <p className="text-slate-600 text-sm mt-1 mb-3">
                          Nossa equipe está pronta para mostrar como nossa plataforma pode se adaptar perfeitamente às necessidades da sua operação.
                        </p>
                        <a href="#" className="text-blue-600 font-semibold text-sm inline-flex items-center group">
                          Fale com um especialista
                          <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </a>
                    </div>
                </div>
            </div>

          </div>

          {/* Coluna da Direita: Card de Contratação */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-2xl p-8 sticky top-8">
             <div className="border-t-4 border-blue-600 absolute top-0 left-0 right-0 rounded-t-lg"></div>
             <h3 className="text-2xl font-bold text-slate-900">Sistema SaaS</h3>
             <p className="text-slate-600 mt-1 mb-6">Ideal para todas as empresas.</p>
             
             <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-bold text-slate-900">R$49</span>
                <span className="text-2xl font-bold text-slate-900">,90</span>
                <span className="text-slate-500">/mês por rede monitorada</span>
             </div>

             <Link href="/startnow" className="w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white px-6 py-4 rounded-lg font-bold text-lg transform transition-all
              hover:scale-105 flex items-center justify-center">
                CONTRATE AGORA
                <ArrowRight className="ml-2 w-5 h-5" />
             </Link>

             <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="flex items-start gap-4">
                    <div>
                        <HardDrive className="w-8 h-8 text-slate-500 flex-shrink-0" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800">Aquisição do Dispositivo IoT</h4>
                        <p className="text-slate-600 text-sm mt-1">
                          Para iniciar o monitoramento, é necessária a compra do nosso dispositivo de hardware por <span className="font-bold text-slate-900">R$ 600,00</span> (pagamento único).
                        </p>
                    </div>
                </div>
             </div>
             
             <div className="mt-6 space-y-2">
                <div className="flex items-center text-sm text-slate-600">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Sem taxa de instalação
                </div>
                <div className="flex items-center text-sm text-slate-600">
                    <Check className="w-4 h-4 text-green-500 mr-2" />
                    Sem contrato de fidelidade
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}