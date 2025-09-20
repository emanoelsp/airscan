'use client';

import React, { useState } from 'react'; // CORREÇÃO: Removido 'useEffect' que não era usado.
import Link from 'next/link'; // CORREÇÃO: Adicionada a importação do Link.
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/controllers/authcontroller';
import supportController, { TicketCreationData } from '@/lib/controllers/supportcontroller';
import { Send, CheckCircle, Loader2, LogIn } from 'lucide-react';

// Define a estrutura local do estado do formulário
interface SupportFormData {
  subject: string;
  message: string;
}

export default function SupportSection() {
  const { account, loading: authLoading } = useAuth(); // Hook para obter os dados da conta
  const router = useRouter();
  
  const [formData, setFormData] = useState<SupportFormData>({
    subject: '',
    message: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!account) {
      setError("Você precisa estar logado para enviar um ticket de suporte.");
      return;
    }

    setIsSubmitting(true);
    
    const ticketPayload: TicketCreationData = {
      accountId: account.id,
      contactName: account.contactName,
      email: account.email,
      companyName: account.companyName,
      subject: formData.subject,
      description: formData.message,
      networkId: 'N/A',
      assetId: 'N/A',
      priority: 'normal',
      issueType: 'general',
    };

    try {
      await supportController.createTicket(ticketPayload);
      setIsSubmitted(true);
      setFormData({ subject: '', message: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if(authLoading) {
      return (
          <div className="flex justify-center items-center py-40 bg-gray-50">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          </div>
      )
  }

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
                <p className="text-gray-600 mb-6">Recebemos sua solicitação. Você pode acompanhar seu chamado na sua Central de Suporte.</p>
                <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Abrir Novo Ticket
                    </button>
                    <Link href="/sistema/suporte/consultar-chamados" className="bg-gray-200 text-gray-800 font-semibold px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors">
                        Ver Meus Chamados
                    </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Abrir um Ticket de Suporte</h3>
                
                {!account && (
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
                                    {' '}para abrir um ticket. Seus dados serão preenchidos automaticamente.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seu Nome *</label>
                    <input name="name" type="text" value={account?.contactName || ''} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed" required disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seu Email *</label>
                    <input name="email" type="email" value={account?.email || ''} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed" required disabled />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assunto *</label>
                  <input name="subject" value={formData.subject} onChange={handleInputChange} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Ex: Dúvida sobre o relatório de consumo" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descreva sua solicitação *</label>
                  <textarea name="message" value={formData.message} onChange={handleInputChange} rows={6} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Por favor, forneça o máximo de detalhes possível..." required />
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button type="submit" disabled={isSubmitting || !account} className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-colors ${ isSubmitting || !account ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700" } text-white`}>
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

