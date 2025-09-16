'use client'; // Necessário para hooks como useState em Next.js App Router

import React, { useState } from 'react';
import { LifeBuoy, Rocket, LayoutDashboard, Cpu, ChevronDown } from 'lucide-react';

// --- Interface para definir a estrutura dos tópicos de ajuda ---
interface HelpContent {
  question: string;
  answer: string;
}

interface HelpTopic {
  title: string;
  icon: React.ElementType;
  color: string;
  content: HelpContent[];
}

// --- Dados da Central de Ajuda, extraídos do site ---
const helpTopics: HelpTopic[] = [
  {
    title: 'Primeiros Passos',
    icon: Rocket,
    color: 'blue',
    content: [
      {
        question: 'Como funciona a instalação do sensor?',
        answer: 'A instalação é simples, rápida e não invasiva. Nossos sensores são acoplados ao seu compressor sem a necessidade de parar sua produção, começando a coletar dados imediatamente.'
      },
      {
        question: 'Como acesso a plataforma pela primeira vez?',
        answer: 'Após a ativação do seu plano, você receberá um e-mail de boas-vindas com um link para criar sua senha e acessar o dashboard do AIRscan. Guarde suas credenciais em um local seguro.'
      }
    ]
  },
  {
    title: 'Entendendo o Dashboard',
    icon: LayoutDashboard,
    color: 'green',
    content: [
      {
        question: 'Quais informações eu encontro no dashboard?',
        answer: 'O dashboard oferece uma visão completa da saúde dos seus compressores, incluindo consumo de energia em tempo real, horas de funcionamento, análises de vibração, temperatura e alertas de manutenção preditiva.'
      },
      {
        question: 'Como os alertas de manutenção preditiva funcionam?',
        answer: 'Nossa Inteligência Artificial analisa os dados dos sensores 24/7. Ao detectar um padrão anômalo que indique uma falha futura, a plataforma envia um alerta detalhado para você, permitindo uma ação proativa.'
      },
      {
        question: 'Posso exportar relatórios?',
        answer: 'Sim. A plataforma permite gerar e exportar relatórios personalizados em PDF ou CSV, facilitando a análise de desempenho, o compartilhamento com sua equipe e a tomada de decisões estratégicas.'
      }
    ]
  },
  {
    title: 'Nossa Tecnologia',
    icon: Cpu,
    color: 'purple',
    content: [
      {
        question: 'Como os dados são transmitidos e estão seguros?',
        answer: 'Utilizamos a tecnologia LoRaWAN para comunicação de longo alcance e baixo consumo de energia. A segurança é nossa prioridade, com criptografia de ponta a ponta (TLS 1.3 e AES-256) para garantir a total confidencialidade dos seus dados.'
      },
      {
        question: 'O sensor é compatível com meu compressor?',
        answer: 'Sim. Nossa solução foi projetada para ser universal, sendo compatível com a grande maioria de marcas e modelos de compressores de ar comprimido disponíveis no mercado industrial.'
      }
    ]
  }
];

// --- Subcomponente para cada Tópico de Ajuda expansível ---
const HelpTopicItem = ({ topic }: { topic: HelpTopic }) => {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = topic.icon;
  const borderColor = `border-${topic.color}-500`;

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden border-t-4 ${borderColor}`}>
      <div
        className="flex items-center justify-between p-6 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-4">
          <Icon className={`w-8 h-8 text-${topic.color}-500`} />
          <h3 className="font-semibold text-lg text-gray-900">{topic.title}</h3>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>
      <div
        className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}
      >
        <div className="px-6 pb-6 pt-2 space-y-4">
          {topic.content.map((item, index) => (
            <div key={index} className="border-t pt-4">
              <h4 className="font-semibold text-gray-800">{item.question}</h4>
              <p className="text-sm text-gray-600 mt-1">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Componente Principal da Seção de Ajuda ---
export default function HelpSection() {
  return (
    <section id="ajuda" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <LifeBuoy className="w-16 h-16 text-blue-600 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Central de Ajuda</h2>
        <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
          Tem alguma dúvida? Explore os tópicos abaixo para encontrar respostas e guias sobre nossa plataforma.
        </p>
        <div className="space-y-6 text-left">
          {helpTopics.map((topic, index) => (
            <HelpTopicItem key={index} topic={topic} />
          ))}
        </div>
      </div>
    </section>
  );
}
