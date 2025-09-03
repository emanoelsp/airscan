import { db } from "../model/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";

// Interface completa para um documento de solicitação
export interface Solicitation {
  id: string;
  contactName: string;
  phone: string;
  email: string;
  companyName: string;
  address: string;
  compressorCount: number;
  networkDescription: string;
  leakImpact: string;
  shutdownImpact: string;
  status: "new" | "replied";
  createdAt: Timestamp;
}

// Tipo para dados de criação, antes de irem para o DB
export type SolicitationData = Omit<Solicitation, "id" | "status" | "createdAt">;

const SOLICITATIONS_COLLECTION = "airscan_solicitations";

const solicitationsController = {
  /**
   * Salva os dados de uma nova solicitação de orçamento no Firestore.
   */
  createSolicitation: async (data: SolicitationData): Promise<string> => {
    try {
      const collectionRef = collection(db, SOLICITATIONS_COLLECTION);
      const docRef = await addDoc(collectionRef, {
        ...data,
        status: "new",
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Erro ao salvar solicitação:", error);
      throw new Error("Não foi possível enviar sua solicitação.");
    }
  },

  /**
   * Busca todas as solicitações do Firestore, ordenadas pela mais recente.
   */
  getSolicitations: async (): Promise<Solicitation[]> => {
    try {
      const collectionRef = collection(db, SOLICITATIONS_COLLECTION);
      const q = query(collectionRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return [];
      }

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Solicitation[];
    } catch (error) {
      console.error("Erro ao buscar solicitações:", error);
      throw new Error("Não foi possível buscar as solicitações.");
    }
  },

  /**
   * Atualiza o status de uma solicitação para 'replied'.
   */
  markAsReplied: async (solicitationId: string): Promise<void> => {
    try {
      const docRef = doc(db, SOLICITATIONS_COLLECTION, solicitationId);
      await updateDoc(docRef, { status: "replied" });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      throw new Error("Não foi possível marcar como respondida.");
    }
  },
  
  /**
   * Exclui uma solicitação do Firestore.
   */
  deleteSolicitation: async (solicitationId: string): Promise<void> => {
    try {
      const docRef = doc(db, SOLICITATIONS_COLLECTION, solicitationId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Erro ao excluir solicitação:", error);
      throw new Error("Não foi possível excluir a solicitação.");
    }
  },
};

export default solicitationsController;

