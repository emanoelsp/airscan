'use client'; // Necessário para hooks como useState em Next.js App Router

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Loader2 } from "lucide-react";
// Importando a função do controller e o tipo de dados
import { saveContactMessage, ContactFormData } from '@/lib/controllers/contactscontroller';

const ContactSection = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    company: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Chama a função do controller para salvar os dados
    const result = await saveContactMessage(formData);

    setIsSubmitting(false);

    if (result.success) {
      setIsSubmitted(true);
      // Limpa o formulário após o sucesso
      setFormData({
        name: "", email: "", company: "", phone: "", subject: "", message: "",
      });
    } else {
      // Exibe uma mensagem de erro se a submissão falhar
      setError(result.error || "Ocorreu um erro desconhecido.");
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setError(null);
  };

  return (
    <section id="contato" className="bg-gray-50 pt-20">
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
            {/* Informações de Contato */}
            <div className="space-y-8">
              {/* ... (código das informações de contato não foi alterado) ... */}
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

            {/* Formulário de Contato */}
            <div className="bg-gray-50 rounded-xl p-8">
              {isSubmitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Mensagem Enviada!</h3>
                  <p className="text-gray-600 mb-6">Obrigado pelo seu contato. Nossa equipe retornará em breve.</p>
                  <button
                    onClick={resetForm}
                    className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Enviar Nova Mensagem
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* ... (inputs do formulário, agora com o atributo 'name') ... */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                        <input name="name" type="text" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                        <input name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Empresa</label>
                        <input name="company" type="text" value={formData.company} onChange={handleInputChange} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                        <input name="phone" type="tel" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assunto *</label>
                      <select name="subject" value={formData.subject} onChange={handleInputChange} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required>
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
                      <textarea name="message" value={formData.message} onChange={handleInputChange} rows={6} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Descreva como podemos ajudar você..." required />
                    </div>
                  
                  {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                  <button type="submit" disabled={isSubmitting} className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-colors ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} text-white`}>
                    {isSubmitting ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Enviando...</>
                    ) : (
                      <><Send className="w-5 h-5 mr-2" /> Enviar Mensagem</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
