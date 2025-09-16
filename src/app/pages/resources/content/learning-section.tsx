'use client'; // Necessário para hooks como useState em Next.js App Router

import React, { useState } from 'react';
import { Book, Rocket, Wrench, Code, Video } from 'lucide-react';

// --- Interface para definir a estrutura dos tópicos de aprendizado ---
interface LearningContent {
  title: string;
  description: string;
}

interface LearningTopic {
  title: string;
  icon: React.ElementType;
  color: string;
  shortDescription: string;
  content: LearningContent[];
}

// --- Dados da Seção de Aprendizado, baseados no AIRscan ---
const learningTopics: LearningTopic[] = [
  {
    title: 'Guia de Início Rápido',
    icon: Rocket,
    color: 'blue',
    shortDescription: 'Configure e comece a monitorar em minutos.',
    content: [
      {
        title: 'Passo 1: Instalação do Hardware',
        description: 'Acompanhe o manual para acoplar o sensor AIRscan ao seu compressor. O processo é não invasivo e leva, em média, 15 minutos. Não é necessário desligar o equipamento.'
      },
      {
        title: 'Passo 2: Ativação da Plataforma',
        description: 'Após a instalação, acesse a plataforma web com as credenciais enviadas para o seu e-mail. O sensor se conectará automaticamente à nossa rede LoRaWAN e começará a enviar dados.'
      },
      {
        title: 'Passo 3: Explore seu Dashboard',
        description: 'Navegue pelo dashboard para visualizar os primeiros dados de consumo de energia, vibração e temperatura. Configure seus primeiros alertas de manutenção preditiva.'
      }
    ]
  },
  {
    title: 'Manuais de Instalação',
    icon: Wrench,
    color: 'orange',
    shortDescription: 'Instruções detalhadas para cada tipo de sensor.',
    content: [
      {
        title: 'Sensor de Vibração e Temperatura',
        description: 'Este manual detalha o posicionamento magnético ideal no corpo do compressor para obter as leituras mais precisas de vibração triaxial e temperatura de superfície.'
      },
      {
        title: 'Sensor de Consumo de Energia',
        description: 'Guia passo a passo para a instalação do nosso medidor de energia não invasivo no painel de alimentação do compressor, garantindo segurança e precisão nos dados de kWh.'
      }
    ]
  },
  {
    title: 'Referência da API',
    icon: Code,
    color: 'purple',
    shortDescription: 'Integre os dados da AIRscan com seus sistemas.',
    content: [
      {
        title: 'O que é a API REST?',
        description: 'Nossa API permite que você acesse os dados brutos e processados dos seus sensores para integrar com seus próprios sistemas de BI, ERPs ou outras plataformas de gerenciamento.'
      },
      {
        title: 'Autenticação e Endpoints',
        description: 'O acesso é protegido por chaves de API que podem ser geradas no seu painel de controle. A documentação cobre todos os endpoints disponíveis, como dados históricos, métricas em tempo real e status dos alertas.'
      }
    ]
  },
  {
    title: 'Tutoriais em Vídeo',
    icon: Video,
    color: 'red',
    shortDescription: 'Aprenda visualmente com nossos guias práticos.',
    content: [
      {
        title: 'Walkthrough do Dashboard',
        description: 'Um tour completo de 5 minutos por todas as funcionalidades do dashboard, desde a visualização de gráficos em tempo real até a configuração de alertas personalizados.'
      },
      {
        title: 'Gerando Relatórios de Eficiência',
        description: 'Aprenda a criar e exportar relatórios em PDF que comparam o consumo de energia versus as horas de funcionamento, ajudando a identificar oportunidades de economia.'
      }
    ]
  }
];


// --- Componente Principal da Seção de Aprendizado ---
export default function LearningSection() {
  const [activeTopic, setActiveTopic] = useState<LearningTopic>(learningTopics[0]);

  const ActiveIcon = activeTopic.icon;

  return (
    <section id="aprendizagem" className="bg-gray-50 pb-20">
      {/* Header da Seção */}
      <div className="bg-gradient-to-r from-blue-600 to-slate-900 text-white py-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Book className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Documentação e Aprendizado</h2>
            <p className="text-lg text-white/90 max-w-3xl mx-auto">
              Aprofunde seus conhecimentos com nossos guias técnicos, tutoriais e referências de API.
            </p>
        </div>
      </div>

      {/* Container do Conteúdo Interativo */}
      <div className='max-w-6xl mx-auto mt-4 px-4 sm:px-6 lg:px-8 -mt-16'>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Coluna da Esquerda: Navegação */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-4 space-y-1 sticky top-24">
              {learningTopics.map((topic) => {
                const Icon = topic.icon;
                const isActive = activeTopic.title === topic.title;
                const activeClasses = 'bg-blue-50 text-blue-700 font-semibold';
                const inactiveClasses = 'hover:bg-gray-100 text-gray-600';
                
                return (
                  <button
                    key={topic.title}
                    onClick={() => setActiveTopic(topic)}
                    className={`w-full text-left flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span>{topic.title}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Coluna da Direita: Conteúdo */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[20rem]">
              <div className="flex items-center space-x-4 mb-6 pb-4 border-b">
                <ActiveIcon className={`w-10 h-10 text-${activeTopic.color}-500`} />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{activeTopic.title}</h3>
                  <p className="text-gray-500">{activeTopic.shortDescription}</p>
                </div>
              </div>
              <div className="space-y-6">
                {activeTopic.content.map((item) => (
                  <div key={item.title}>
                    <h4 className="font-semibold text-gray-800 text-lg">{item.title}</h4>
                    <p className="text-gray-600 mt-1">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

