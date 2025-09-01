"use client"

import type React from "react"
import { useState } from "react"
import { Mail, Phone, MapPin, Send, CheckCircle, HelpCircle } from "lucide-react"

export default function AboutPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simular envio do formulário
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setFormData({
        name: "",
        email: "",
        company: "",
        phone: "",
        subject: "",
        message: "",
      })
    }, 2000)
  }

  const faqItems = [
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
      question: "Como funciona o suporte técnico?",
      answer:
        "Oferecemos suporte técnico ágil e eficiente via e-mail e chat para o Plano Essencial. Clientes de planos personalizados contam com opções de suporte 24/7 e um gerente de contas dedicado para garantir o sucesso da sua operação.",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Sobre a <label className="text-yellow-500"> AIRscan </label>
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
            Revolucionando o monitoramento de ar comprimido com tecnologia IoT avançada e inteligência artificial para a
            indústria brasileira.
          </p>
        </div>
      </section>

      {/* Company Info Section (Sobre Nós) */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">500+</h3>
                  <p className="text-blue-700">Compressores Monitorados</p>
                </div>
                <div className="bg-green-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-green-900 mb-2">150+</h3>
                  <p className="text-green-700">Empresas Atendidas</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-purple-900 mb-2">25%</h3>
                  <p className="text-purple-700">Economia Média de Energia</p>
                </div>
                <div className="bg-orange-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-orange-900 mb-2">99.9%</h3>
                  <p className="text-orange-700">Uptime do Sistema</p>
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

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="bg-gradient-to-r from-blue-600 to-slate-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Perguntas Frequentes</h2>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
              Tudo o que você precisa saber sobre a solução AIRscan.
            </p>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-start space-x-3">
                  <HelpCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>{item.question}</span>
                </h3>
                <p className="text-gray-600 mt-3 pl-9">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-gray-50 pt-20">
        <div className="bg-gradient-to-r from-blue-600 to-slate-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Entre em Contato</h2>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
              Tem alguma dúvida ou quer saber mais sobre nossas soluções? Nossa equipe está pronta para ajudar você.
            </p>
          </div>
        </div>
        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Contact Info */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Informações de Contato</h3>
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Email</h4>
                        <p className="text-gray-600">contato@airscan.com.br</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Phone className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Telefone</h4>
                        <p className="text-gray-600">+55 (47) 9999-9999</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Endereço</h4>
                        <p className="text-gray-600">Blumenau, SC - Brasil</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Horário de Atendimento</h4>
                  <div className="space-y-2 text-gray-600">
                    <p>Segunda a Sexta: 8h às 18h</p>
                    <p>Sábado: 8h às 12h</p>
                    <p>Domingo: Fechado</p>
                    <p className="text-sm text-blue-600 mt-4">* Suporte técnico 24/7 para clientes Enterprise</p>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-gray-50 rounded-xl p-8">
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Mensagem Enviada!</h3>
                    <p className="text-gray-600 mb-6">Obrigado pelo seu contato. Nossa equipe retornará em breve.</p>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Enviar Nova Mensagem
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Empresa</label>
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => handleInputChange("company", e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assunto *</label>
                      <select
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Selecione um assunto</option>
                        <option value="demo">Solicitar Demonstração</option>
                        <option value="pricing">Informações sobre Preços</option>
                        <option value="technical">Suporte Técnico</option>
                        <option value="partnership">Parcerias</option>
                        <option value="other">Outros</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem *</label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        rows={6}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Descreva como podemos ajudar você..."
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors ${
                        isSubmitting
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      } text-white`}
                    >
                      {isSubmitting ? (
                        "Enviando..."
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Enviar Mensagem
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
