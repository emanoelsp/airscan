'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/controllers/authcontroller';
import { saveSupportTicket } from '@/lib/controllers/supportcontroller';
import { Send, CheckCircle, Loader2, LogIn } from 'lucide-react';

// Define a estrutura local do estado do formulário
interface SupportFormData {
  name: string;
  email: string;
  company: string;
  ticketType: string;
  message: string;
}

export default function SupportSection() {
  const { currentUser } = useAuth(); // Hook para obter o estado de autenticação
  const router = useRouter();
  
  const [formData, setFormData] = useState<SupportFormData>({
    name: '',
    email: '',
    company: '',
    ticketType: '',
    message: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Efeito para preencher o formulário com dados do usuário quando ele faz login
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.displayName || '',
        email: currentUser.email || '',
      }));
    }
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Passo 1: Verifica se o usuário está logado antes de continuar
    if (!currentUser) {
      setError("Você precisa estar logado para enviar um ticket de suporte.");
      return;
    }

    setIsSubmitting(true);
    
    // Envia os dados para o controller, incluindo o ID do usuário
    const result = await saveSupportTicket({
        ...formData,
        userId: currentUser.uid,
    });

    setIsSubmitting(false);

    if (result.success) {
      setIsSubmitted(true);
      // Limpa os campos do formulário, mantendo os dados do usuário
      setFormData(prev => ({
          ...prev,
          company: '',
          ticketType: '',
          message: '',
      }));
    } else {
      setError(result.error || 'Ocorreu um erro desconhecido.');
    }
  };

  return (
    <section id="suporte" className="bg-gray-50 pt-20">
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
                
                {/* Alerta para usuários não logados */}
                {!currentUser && (
                    <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-r-lg">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <LogIn className="h-5 w-5 text-yellow-500" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    Por favor,{' '}
                                    <button type="button" onClick={() => router.push('/login')} className="font-bold underline hover:text-yellow-800">
                                        faça login
                                    </button>
                                    {' '}para abrir um ticket.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seu Nome *</label>
                    <input name="name" type="text" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed" required disabled={!!currentUser} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seu Email *</label>
                    <input name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed" required disabled={!!currentUser} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Empresa</label>
                    <input name="company" type="text" value={formData.company} onChange={handleInputChange} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Solicitação *</label>
                    <select name="ticketType" value={formData.ticketType} onChange={handleInputChange} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required>
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
                  <textarea name="message" value={formData.message} onChange={handleInputChange} rows={6} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Por favor, forneça o máximo de detalhes possível, incluindo o ID do compressor, se aplicável..." required />
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button type="submit" disabled={isSubmitting || !currentUser} className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-colors ${ isSubmitting || !currentUser ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700" } text-white`}>
                  {isSubmitting ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Enviando...</>) : (<><Send className="w-5 h-5 mr-2" />Enviar Ticket</>)}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
