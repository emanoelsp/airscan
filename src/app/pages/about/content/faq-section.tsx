// app/components/FaqSection.tsx

'use client'; 

import React, { useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';

type FaqType = {
  question: string;
  answer: string;
};

interface FaqItemProps {
  faq: FaqType;
}

const FaqItem = ({ faq }: FaqItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white bg-opacity-80 shadow-lg backdrop-blur-sm">
      <div
        className="flex cursor-pointer items-center justify-between p-5 transition-colors duration-300 hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-semibold text-gray-800">{faq.question}</h3>
        <ChevronDownIcon
          className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? 'max-h-screen' : 'max-h-0'
        }`}
      >
        <div className="p-5 pt-0">
          <p className="text-gray-600">{faq.answer}</p>
        </div>
      </div>
    </div>
  );
};


const FaqSection = () => {
  const faqs: FaqType[] = [
    {
      question: "Qual é o principal serviço que vocês oferecem?",
      answer: "Nosso principal serviço é o desenvolvimento de soluções de software personalizadas para atender às necessidades específicas de cada cliente."
    },
    {
      question: "Qual é o tempo médio para o desenvolvimento de um projeto?",
      answer: "O tempo de desenvolvimento varia de acordo com a complexidade do projeto. Após uma análise inicial, fornecemos um cronograma detalhado."
    },
    {
      question: "Como funciona a instalação do sensor?",
      answer:
        "A instalação é simples e não invasiva, podendo ser realizada por nossos técnicos especializados ou com nosso guia passo a passo. O sensor é acoplado ao seu compressor sem a necessidade de interromper sua produção.",
    },
    {
      question: "O sistema é compatível com qualquer tipo de compressor?",
      answer:
        "Sim, nossa solução foi projetada para ser universal. Ela é compatível com a grande maioria de marcas e modelos de compressores de ar comprimido disponíveis no mercado industrial.",
    },
    {
      question: "Os dados da minha empresa estão seguros na plataforma?",
      answer:
        "Absolutamente. A segurança é nossa prioridade. Utilizamos criptografia de ponta a ponta (TLS 1.3 em trânsito e AES-256 em repouso) e seguimos as melhores práticas de segurança do mercado para garantir a total confidencialidade e integridade dos seus dados.",
    },
    {
      question: "Como posso entrar em contato com o suporte?",
      answer: "Você pode entrar em contato com nosso suporte através do formulário de contato em nosso site, por e-mail ou pelo telefone listado na seção de contatos."
    },
    {
      question: "Como funciona o suporte técnico?",
      answer:
        "Oferecemos suporte técnico ágil e eficiente via e-mail e chat para o Plano Essencial. Clientes de planos personalizados contam com opções de suporte 24/7 e um gerente de contas dedicado para garantir o sucesso da sua operação.",
    },
  ];

  return (
    <section id="perguntas" className="bg-gray-50 pb-2 pt-12">
      <div className="bg-gradient-to-r from-blue-600 to-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6"> Perguntas Frequentes (FAQ) </h2>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
            Tudo o que você precisa saber sobre a solução AIRscan.
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-10">
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <FaqItem key={index} faq={faq} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;