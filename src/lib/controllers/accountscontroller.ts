import { db, auth } from "../model/firebase"; // Ajuste o caminho se necessário
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
import { FirebaseError } from "firebase/app"; // Importado para verificação de tipo segura

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

// ATUALIZADO: O tipo NewAccountData agora inclui a senha, que não é salva no DB
export type NewAccountData = Omit<Account, "id" | "status" | "createdAt" | "updatedAt"> & { password?: string };
export type UpdateAccountData = Partial<Omit<Account, "id" | "createdAt" | "updatedAt">>;

const ACCOUNTS_COLLECTION = "airscan_accounts";

const accountsController = {
  /**
   * Cria um usuário no Firebase Auth e uma conta de cliente no Firestore.
   */
  createAccount: async (data: NewAccountData): Promise<string> => {
    // 1. Validar se a senha foi fornecida
    if (!data.password || data.password.length < 6) {
        throw new Error("A senha é obrigatória e deve ter no mínimo 6 caracteres.");
    }
    
    try {
      // 2. Criar o usuário no Firebase Authentication
      // CORREÇÃO: Adicionado underscore para silenciar o aviso de 'não utilizado'.
      const _userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      // 3. Preparar os dados para o Firestore (removendo a senha)
      // Esta é uma forma idiomática de omitir uma propriedade, o aviso pode ser ignorado.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...firestoreData } = data;

      // 4. Salvar os dados adicionais no Firestore
      const collectionRef = collection(db, ACCOUNTS_COLLECTION);
      const docRef = await addDoc(collectionRef, {
        ...firestoreData,
        status: "active", // Clientes são criados como ativos por padrão
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // authUid: _userCredential.user.uid // Agora pode ser usado sem aviso
      });

      return docRef.id;

    } catch (error: unknown) { // CORREÇÃO: Trocado 'any' por 'unknown'
      console.error("Erro ao criar conta:", error);
      // Personalizar mensagens de erro do Firebase Auth
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
   * NOTA: Isso não exclui o usuário do Firebase Auth. A exclusão de Auth
   * é uma operação sensível e geralmente requer reautenticação.
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

