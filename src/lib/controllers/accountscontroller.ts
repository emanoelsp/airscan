// /src/lib/controllers/accountsController.ts

import { db } from "../model/firebase"; // Ajuste o caminho se necessário
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  query,
  orderBy,
} from "firebase/firestore";

// Interface para os dados da conta, otimizada para o Firestore
export interface Account {
  id: string; // ID do documento do Firestore
  contactName: string;
  phone: string;
  email: string;
  companyName: string;
  address: string;
  compressorCount: number;
  networkDescription: string;
  login: string;
  role: "cliente" | "admin";
  status: "active" | "inactive"; // Para desativar clientes
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Tipo para criação, onde alguns campos são gerados automaticamente
export type NewAccountData = Omit<Account, "id" | "status" | "createdAt" | "updatedAt">;
export type UpdateAccountData = Partial<Omit<Account, "id" | "createdAt" | "updatedAt">>;

const ACCOUNTS_COLLECTION = "airscan_accounts";

const accountsController = {
  /**
   * Cria uma nova conta de cliente no Firestore.
   */
  createAccount: async (data: NewAccountData): Promise<string> => {
    try {
      const collectionRef = collection(db, ACCOUNTS_COLLECTION);
      const docRef = await addDoc(collectionRef, {
        ...data,
        status: "active", // Clientes são criados como ativos por padrão
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Erro ao criar conta:", error);
      throw new Error("Não foi possível criar a conta.");
    }
  },

  /**
   * Busca todas as contas do Firestore.
   */
  getAccounts: async (): Promise<Account[]> => {
    try {
      const collectionRef = collection(db, ACCOUNTS_COLLECTION);
      const q = query(collectionRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return [];
      }

      // Mapeia os documentos para o tipo Account, incluindo o ID do documento
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Account[];
    } catch (error) {
      console.error("Erro ao buscar contas:", error);
      throw new Error("Não foi possível buscar as contas.");
    }
  },

  /**
   * Atualiza os dados de uma conta existente.
   */
  updateAccount: async (accountId: string, data: UpdateAccountData): Promise<void> => {
    try {
      const docRef = doc(db, ACCOUNTS_COLLECTION, accountId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erro ao atualizar conta:", error);
      throw new Error("Não foi possível atualizar a conta.");
    }
  },

  /**
   * Exclui uma conta do Firestore.
   */
  deleteAccount: async (accountId: string): Promise<void> => {
    try {
      const docRef = doc(db, ACCOUNTS_COLLECTION, accountId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      throw new Error("Não foi possível excluir a conta.");
    }
  },
};

export default accountsController;