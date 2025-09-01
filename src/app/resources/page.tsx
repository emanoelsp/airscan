"use client"

import type React from "react"
import { useState } from "react"
import { Book, LifeBuoy, Search, Send, CheckCircle, Rocket, Wrench, Code, Video } from "lucide-react"

export default function ResourcesPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    ticketType: "",
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
        ticketType: "",
        message: "",
      })
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Central de <label className="text-yellow-500">Recursos</label>
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
            Encontre guias, documentação técnica e o suporte necessário para extrair o máximo da sua solução AIRscan.
          </p>
        </div>
      </section>

      {/* Help Center Section */}
      <section id="help" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <LifeBuoy className="w-16 h-16 text-blue-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Central de Ajuda</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Tem alguma dúvida? Pesquise em nossa base de conhecimento ou explore os tópicos mais comuns.
          </p>
          <div className="relative max-w-2xl mx-auto mb-12">
            <input
              type="search"
              placeholder="Ex: Como interpretar o gráfico de consumo?"
              className="w-full px-5 py-4 pl-12 bg-white border border-gray-300 rounded-full focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-5 top-1/2 -translate-y-1/2" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-500">
              <h3 className="font-semibold text-gray-900 mb-2">Primeiros Passos</h3>
              <p className="text-sm text-gray-600">Guias para configurar sua conta e sensores.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-green-500">
              <h3 className="font-semibold text-gray-900 mb-2">Dashboard</h3>
              <p className="text-sm text-gray-600">Entendendo métricas e relatórios.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-purple-500">
              <h3 className="font-semibold text-gray-900 mb-2">Solução de Problemas</h3>
              <p className="text-sm text-gray-600">Resolvendo questões comuns rapidamente.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Learning / Documentation Section */}
      <section id="learning" className="bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-slate-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Book className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Documentação e Aprendizado</h2>
            <p className="text-lg text-white/90 max-w-3xl mx-auto">
              Aprofunde seus conhecimentos com nossos guias técnicos, tutoriais e referências de API.
            </p>
          </div>
        </div>
        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <Rocket className="w-10 h-10 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Guia de Início Rápido</h3>
                <p className="text-gray-600 text-sm">Configure e comece a monitorar em minutos.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <Wrench className="w-10 h-10 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Manuais de Instalação</h3>
                <p className="text-gray-600 text-sm">Instruções detalhadas para cada tipo de sensor.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <Code className="w-10 h-10 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Referência da API</h3>
                <p className="text-gray-600 text-sm">Integre os dados da AIRscan com seus sistemas.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <Video className="w-10 h-10 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Tutoriais em Vídeo</h3>
                <p className="text-gray-600 text-sm">Aprenda visualmente com nossos guias práticos.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section id="support" className="bg-gray-50 pt-20">
        <div className="bg-gradient-to-r from-blue-600 to-slate-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Fale com o Suporte</h2>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
              Nossa equipe de especialistas está pronta para ajudar com qualquer questão técnica que você tenha.
            </p>
          </div>
        </div>
        <div className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-50 rounded-xl p-8 shadow-lg">
              {isSubmitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Ticket de Suporte Enviado!</h3>
                  <p className="text-gray-600 mb-6">Recebemos sua solicitação. Nossa equipe técnica entrará em contato em breve.</p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Abrir Novo Ticket
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Abrir um Ticket de Suporte</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Seu Nome *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Seu Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Solicitação *</label>
                      <select
                        value={formData.ticketType}
                        onChange={(e) => handleInputChange("ticketType", e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Selecione o tipo</option>
                        <option value="technical_issue">Problema Técnico</option>
                        <option value="data_question">Dúvida sobre Dados</option>
                        <option value="feature_request">Sugestão de Melhoria</option>
                        <option value="other">Outro</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descreva sua solicitação *</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      rows={6}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Por favor, forneça o máximo de detalhes possível, incluindo o ID do compressor, se aplicável..."
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
                        Enviar Ticket
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

