import { db, auth } from "@/lib/firebase/firebaseconfig"; // Ajuste o caminho se necessário
import { createUserWithEmailAndPassword } from "firebase/auth";
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
import { FirebaseError } from "firebase/app";

// --- INTERFACES E TIPOS ---

export interface Account {
  id: string; // ID do documento do Firestore
  // 1. ADICIONADO: Campo para vincular o ID do Firebase Auth
  authUid: string; 
  contactName: string;
  phone: string;
  email: string;
  companyName: string;
  address: string;
  compressorCount: number;
  networkDescription: string;
  login: string;
  role: "cliente" | "admin";
  status: "active" | "inactive";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Omitimos 'authUid' da criação pois ele é gerado pelo Auth
export type NewAccountData = Omit<Account, "id" | "authUid" | "status" | "createdAt" | "updatedAt"> & { password?: string };
export type UpdateAccountData = Partial<Omit<Account, "id" | "authUid" | "createdAt" | "updatedAt">>;

const ACCOUNTS_COLLECTION = "airscan_accounts";

const accountsController = {
  /**
   * Cria um usuário no Firebase Auth e uma conta de cliente no Firestore.
   */
  createAccount: async (data: NewAccountData): Promise<string> => {
    if (!data.password || data.password.length < 6) {
      throw new Error("A senha é obrigatória e deve ter no mínimo 6 caracteres.");
    }
    
    try {
      // 2. CORRIGIDO: Removido o underscore, pois a variável será usada.
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      // Prepara os dados para o Firestore (removendo a senha)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...firestoreData } = data;

      // Salva os dados adicionais no Firestore
      const collectionRef = collection(db, ACCOUNTS_COLLECTION);
      const docRef = await addDoc(collectionRef, {
        ...firestoreData,
        // 3. CORRIGIDO: Salvando o UID do usuário de autenticação no documento.
        authUid: userCredential.user.uid,
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return docRef.id;

    } catch (error: unknown) {
      console.error("Erro ao criar conta:", error);
      if (error instanceof FirebaseError && error.code === 'auth/email-already-in-use') {
        throw new Error("Este email já está sendo utilizado por outra conta.");
      }
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
   * NOTA: Isso não exclui o usuário do Firebase Auth.
   */
  deleteAccount: async (accountId: string): Promise<void> => {
    try {
      const docRef = doc(db, ACCOUNTS_COLLECTION, accountId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      throw new Error("Não foi possível excluir o registro da conta.");
    }
  },
};

export default accountsController;
