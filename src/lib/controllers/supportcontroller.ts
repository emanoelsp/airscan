import { db } from "@/lib/firebase/firebaseconfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Define a estrutura dos dados de um ticket de suporte
export interface SupportTicketData {
  name: string;
  email: string;
  company?: string;
  ticketType: string;
  message: string;
  status?: 'open' | 'in_progress' | 'closed';
  userId?: string; // Para vincular o ticket a um usuário autenticado
  createdAt?: undefined; // Será preenchido pelo servidor do Firestore
}

/**
 * Salva uma nova mensagem de ticket de suporte no Firestore.
 * @param ticketData - Os dados do ticket a serem salvos.
 * @returns Um objeto indicando sucesso ou falha.
 */
export const saveSupportTicket = async (ticketData: Omit<SupportTicketData, 'createdAt' | 'status'>): Promise<{ success: boolean; error?: string }> => {
  // Validação básica para garantir que os campos essenciais estão preenchidos
  if (!ticketData.name || !ticketData.email || !ticketData.ticketType || !ticketData.message) {
    return { success: false, error: "Por favor, preencha todos os campos obrigatórios." };
  }

  try {
    // Adiciona o documento à coleção 'airscan_support'
    await addDoc(collection(db, "airscan_support"), {
      ...ticketData,
      status: 'open', // Define o status inicial como 'aberto'
      createdAt: serverTimestamp(), // Adiciona um timestamp do lado do servidor
    });
    return { success: true };
  } catch (error) {
    console.error("Erro ao adicionar documento ao Firestore: ", error);
    // Retorna uma mensagem de erro genérica para o usuário
    return { success: false, error: "Não foi possível enviar o ticket de suporte. Tente novamente mais tarde." };
  }
};
