"use client"

import type React from "react"
import { BarChart3, Activity, FileText, Cpu, ShieldCheck, Lock, DatabaseZap, BellRing, AlertTriangle } from "lucide-react"

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Nossa Solução: <label className="text-yellow-500">Inteligência para seu Ar Comprimido</label>
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
            Transforme dados brutos em economia real. Monitore, analise e otimize seus compressores com a plataforma
            SaaS da AIRscan.
          </p>
        </div>
      </section>

      {/* Produto Section */}
      <section id="produto" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">O Produto AIRscan</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Nossa solução combina hardware de ponta com um software poderoso para oferecer uma visão completa e
              inteligente do seu sistema de ar comprimido.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <Cpu className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sensor IoT Dedicado</h3>
              <p className="text-gray-600">Hardware robusto e de fácil instalação que coleta dados vitais do seu compressor.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <Activity className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Monitoramento em Tempo Real</h3>
              <p className="text-gray-600">Acompanhe pressão, temperatura, consumo de energia e horas de operação ao vivo.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <DatabaseZap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Análise com Inteligência Artificial</h3>
              <p className="text-gray-600">Nossa IA analisa padrões, prevê falhas e identifica oportunidades de economia.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <BellRing className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Alarmes e Notificações</h3>
              <p className="text-gray-600">Seja notificado sobre anomalias, manutenções preventivas e metas de consumo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Section */}
      <section id="dashboard" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Dashboards Intuitivos e Poderosos</h2>
              <p className="text-lg text-gray-600 mb-6">
                Visualize todas as informações importantes em um só lugar. Nossos dashboards são projetados para
                oferecer clareza e facilitar a tomada de decisão.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Dashboard Geral:</strong> Visão panorâmica de todos os compressores, com status e KPIs
                    principais.
                  </p>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Análise por Compressor:</strong> Detalhes aprofundados de cada equipamento, incluindo
                    histórico de dados e gráficos de desempenho.
                  </p>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">
                    <strong>Dashboard de Energia:</strong> Acompanhamento focado no consumo energético, custos e
                    eficiência.
                  </p>
                </li>
              </ul>
            </div>
            <div className="bg-slate-800 p-6 rounded-2xl shadow-2xl text-white">
                {/* Header do Mockup */}
                <div className="flex justify-between items-center mb-6">
                    <h4 className="text-xl font-bold text-white">Dashboard: Compressor C-101</h4>
                    <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span>Online</span>
                    </span>
                </div>

                {/* Alerta */}
                <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-300 px-4 py-3 rounded-lg flex items-center space-x-3 mb-6">
                    <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                    <div>
                        <p className="font-bold">Alerta: Manutenção Preventiva</p>
                        <p className="text-sm">Próxima manutenção recomendada em 48 horas de operação.</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Medidor (Gauge) Mock */}
                    <div className="bg-slate-700/50 p-4 rounded-lg text-center flex flex-col justify-center items-center">
                        <h5 className="text-sm font-semibold text-slate-300 mb-2">Eficiência</h5>
                        <div className="relative">
                            <svg className="w-24 h-24" viewBox="0 0 36 36">
                                <path
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#475569"
                                    strokeWidth="3.5"
                                />
                                <path
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="3.5"
                                    strokeDasharray="92, 100"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-white">92%</p>
                        </div>
                    </div>

                    {/* KPIs */}
                    <div className="bg-slate-700/50 p-4 rounded-lg flex flex-col justify-center space-y-3">
                        <div>
                            <p className="text-sm text-slate-300">Pressão Atual</p>
                            <p className="text-2xl font-bold">8.1 <span className="text-base font-normal text-slate-400">bar</span></p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-300">Temperatura</p>
                            <p className="text-2xl font-bold">75 <span className="text-base font-normal text-slate-400">°C</span></p>
                        </div>
                    </div>
                </div>

                {/* Gráfico de Linha Mock */}
                <div className="bg-slate-700/50 p-4 rounded-lg">
                    <h5 className="text-sm font-semibold text-slate-300 mb-3">Consumo de Energia (Últimas 24h)</h5>
                    <div className="w-full h-32 relative">
                        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 300 100">
                            <defs>
                                <linearGradient id="lineChartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <path d="M0 100 L 0 70 L 25 60 L 50 65 L 75 50 L 100 40 L 125 45 L 150 30 L 175 35 L 200 20 L 225 30 L 250 40 L 275 50 L 300 45 L 300 100 Z" fill="url(#lineChartGradient)" />
                            <path d="M 0 70 L 25 60 L 50 65 L 75 50 L 100 40 L 125 45 L 150 30 L 175 35 L 200 20 L 225 30 L 250 40 L 275 50 L 300 45" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="absolute -bottom-4 left-0 w-full flex justify-between text-xs text-slate-400 px-1">
                            <span>-24h</span>
                            <span>-12h</span>
                            <span>Agora</span>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recursos Section */}
      <section id="recursos" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Recursos Essenciais para Sua Operação</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Ferramentas completas para otimizar a gestão do seu sistema de ar comprimido.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-blue-500">
              <Activity className="w-10 h-10 text-blue-500 mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Monitoramento Contínuo</h3>
              <p className="text-gray-600">
                Acesso 24/7 aos dados dos seus compressores de qualquer lugar, a qualquer hora, através da nossa
                plataforma web e mobile.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-green-500">
              <BarChart3 className="w-10 h-10 text-green-500 mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Análise Preditiva</h3>
              <p className="text-gray-600">
                Utilize a IA para prever falhas, agendar manutenções de forma mais eficiente e evitar paradas não
                planejadas na produção.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-purple-500">
              <FileText className="w-10 h-10 text-purple-500 mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">Relatórios Detalhados</h3>
              <p className="text-gray-600">
                Gere relatórios customizáveis de consumo, eficiência e custos. Exporte dados em PDF ou CSV para análises
                internas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Planos Section */}
      <section id="planos" className="py-20 bg-gradient-to-r from-blue-600 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Planos e Preços</h2>
            <p className="text-lg opacity-90 max-w-3xl mx-auto">
              Comece a economizar com um plano simples e transparente. Sem surpresas.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="bg-white text-gray-900 p-8 rounded-2xl shadow-2xl max-w-md w-full">
              <h3 className="text-2xl font-bold text-center mb-2">Plano Essencial</h3>
              <p className="text-center text-gray-600 mb-6">Ideal para pequenas e médias indústrias.</p>
              <div className="text-center mb-6">
                <p className="text-gray-500">Hardware (pagamento único)</p>
                <p className="text-5xl font-bold">R$ 600,00</p>
                <p className="text-gray-500">por sensor</p>
              </div>
              <div className="text-center mb-8">
                <p className="text-gray-500">Assinatura Mensal (SaaS)</p>
                <p className="text-5xl font-bold">
                  R$ 49<span className="text-3xl">,90</span>
                </p>
                <p className="text-gray-500">por sensor</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Monitoramento de até 5 compressores</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Dashboard completo</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Relatórios mensais</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Suporte via e-mail e chat</span>
                </li>
              </ul>
              <p className="text-center text-gray-600 text-sm">
                Possui mais de 5 compressores ou necessidades específicas?{" "}
                <a href="#contato" className="text-blue-600 font-semibold hover:underline">
                  Consulte-nos para um plano personalizado.
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Segurança Section */}
      <section id="seguranca" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Segurança em Primeiro Lugar</h2>
          <p className="text-lg text-gray-600 mb-12">
            Seus dados operacionais são críticos. Por isso, tratamos a segurança como nossa maior prioridade em cada
            etapa da nossa solução.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-lg mb-1">Autenticação Segura</h4>
                <p className="text-gray-600">Acesso à plataforma protegido por autenticação baseada em token JWT, garantindo que apenas usuários autorizados acessem as informações.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-lg mb-1">Criptografia de Ponta-a-Ponta</h4>
                <p className="text-gray-600">Todos os dados, tanto em trânsito (TLS 1.3) quanto em repouso (AES-256), são completamente criptografados para prevenir acessos indevidos.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Definição do componente CheckCircle para evitar erros, caso não esteja definido globalmente.
const CheckCircle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)
