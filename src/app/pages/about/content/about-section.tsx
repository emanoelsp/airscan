// app/components/AboutSection.tsx

import { CheckCircle } from 'lucide-react';
import React from 'react';

const AboutSection = () => {
  return (
      <section id="sobrenos">
        <div className="bg-gradient-to-r from-blue-600 to-slate-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Sobre a <label className="text-yellow-500"> AIRscan </label>
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
              Revolucionando o monitoramento de ar comprimido com tecnologia IoT avançada e inteligência artificial para a
              indústria brasileira.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Nossa Missão</h2>
              <p className="text-lg text-gray-600 mb-6">
                A AIRscan nasceu da necessidade de transformar a gestão de sistemas de ar comprimido na indústria
                brasileira. Nosso objetivo é fornecer soluções tecnológicas avançadas que permitam às empresas otimizar
                seus processos, reduzir custos energéticos e aumentar a eficiência operacional.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Com uma equipe especializada em IoT, inteligência artificial e sistemas industriais, desenvolvemos o
                sistema SaaS mais completo do mercado para monitoramento em tempo real de compressores de ar comprimido.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-xl">
                  <p className="text-blue-700"> Monitoramento de Compressores </p>
                </div>
                <div className="bg-green-50 p-6 rounded-xl">
                  <p className="text-green-700"> Detecção de Vazamentos </p>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl">
                  <p className="text-purple-700">Economia de Energia</p>
                </div>
                <div className="bg-orange-50 p-6 rounded-xl">
                  <p className="text-orange-700"> Dados em Tempo Real</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Nossos Valores</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Inovação Contínua</h4>
                    <p className="text-gray-600">Sempre buscando as melhores tecnologias para nossos clientes.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Sustentabilidade</h4>
                    <p className="text-gray-600">
                      Contribuindo para um futuro mais sustentável através da eficiência energética.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Excelência no Atendimento</h4>
                    <p className="text-gray-600">Suporte especializado e personalizado para cada cliente.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Transparência</h4>
                    <p className="text-gray-600">Dados claros e relatórios detalhados para tomada de decisão.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
};

export default AboutSection;