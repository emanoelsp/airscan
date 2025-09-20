import { db } from "@/lib/firebase/firebaseconfig";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp, 
  Timestamp,
  orderBy,
  runTransaction,
  doc
} from "firebase/firestore";

// --- INTERFACES ---

export interface TicketUpdate {
  comment: string;
  updatedBy: string; // Nome do admin ou "Cliente"
  timestamp: Timestamp;
}

export interface SupportTicket {
  id: string;
  ticketNumber: number;
  accountId: string;
  contactName: string;
  email: string;
  companyName: string;
  networkId: string;
  assetId: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  issueType: string;
  subject: string;
  description: string;
  errorCode?: string;
  operatorObservation?: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: Timestamp;
  updates?: TicketUpdate[];
}

// Tipo para dados de criação, antes de irem para o DB
export type TicketCreationData = Omit<SupportTicket, "id" | "ticketNumber" | "status" | "createdAt" | "updates">;

const TICKETS_COLLECTION = "airscan_support_tickets";

// --- LÓGICA DO CONTROLLER ---

const supportController = {

  /**
   * Cria um novo ticket de suporte, gerando um número sequencial.
   */
  createTicket: async (data: TicketCreationData): Promise<string> => {
    try {
      // Gera um número de ticket sequencial de forma segura (usando transação)
      const counterRef = doc(db, "airscan_counters", "supportTicketCounter");
      let newTicketNumber = 1;

      await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        if (counterDoc.exists()) {
          newTicketNumber = counterDoc.data().lastNumber + 1;
          transaction.update(counterRef, { lastNumber: newTicketNumber });
        } else {
          transaction.set(counterRef, { lastNumber: 1 });
        }
      });
      
      const ticketsRef = collection(db, TICKETS_COLLECTION);
      const docRef = await addDoc(ticketsRef, {
        ...data,
        ticketNumber: newTicketNumber,
        status: "open",
        createdAt: serverTimestamp(),
        updates: [],
      });
      return docRef.id;
    } catch (error) {
      console.error("Erro ao criar chamado:", error);
      throw new Error("Não foi possível registrar o chamado de suporte.");
    }
  },

  /**
   * Busca todos os tickets de suporte associados a uma conta de cliente.
   */
  getTicketsByAccountId: async (accountId: string): Promise<SupportTicket[]> => {
    try {
      const ticketsRef = collection(db, TICKETS_COLLECTION);
      const q = query(
        ticketsRef, 
        where("accountId", "==", accountId),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return [];
      }

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as SupportTicket[];
    } catch (error) {
      console.error("Erro ao buscar chamados da conta:", error);
      throw new Error("Não foi possível carregar o histórico de chamados.");
    }
  },
};

export default supportController;
