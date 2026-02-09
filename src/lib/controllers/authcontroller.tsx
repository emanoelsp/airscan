"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase/firebaseconfig";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { Account } from "./accountscontroller";
import { FirebaseError } from "firebase/app"; // Importado para verificação de tipo

// Define a estrutura do valor do nosso contexto de autenticação
interface AuthContextType {
  currentUser: User | null;
  account: Account | null;
  loading: boolean;
  refreshAccount: () => Promise<void>;
}

// Cria o Contexto React
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAccountByEmail = useCallback(async (email: string | undefined) => {
    if (!email) {
      setAccount(null);
      return;
    }
    const accountsRef = collection(db, "airscan_accounts");
    const q = query(accountsRef, where("email", "==", email), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const accountDoc = querySnapshot.docs[0];
      setAccount({ id: accountDoc.id, ...accountDoc.data() } as Account);
    } else {
      setAccount(null);
    }
  }, []);

  const refreshAccount = useCallback(async () => {
    if (currentUser?.email) await fetchAccountByEmail(currentUser.email);
  }, [currentUser?.email, fetchAccountByEmail]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchAccountByEmail(user.email ?? undefined);
      } else {
        setAccount(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchAccountByEmail]);

  const value = { currentUser, account, loading, refreshAccount };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

export const authController = {
  /**
   * Realiza o login e retorna os dados da conta do Firestore.
   */
  signIn: async (email: string, password: string): Promise<Account> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const accountsRef = collection(db, "airscan_accounts");
      const q = query(accountsRef, where("email", "==", user.email), limit(1));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        await signOut(auth);
        throw new Error("Autenticação bem-sucedida, mas não encontramos seus dados de perfil.");
      }

      const accountDoc = querySnapshot.docs[0];
      const accountData = { id: accountDoc.id, ...accountDoc.data() } as Account;

      if (accountData.status === 'inactive') {
        await signOut(auth);
        throw new Error("Esta conta foi desativada. Entre em contato com o suporte.");
      }
      
      return accountData;

    } catch (error: unknown) { // CORREÇÃO: Trocado 'any' por 'unknown'
      // Primeiro, verifica se é um dos nossos erros customizados
      if (error instanceof Error && (error.message.startsWith("Autenticação") || error.message.startsWith("Esta conta"))) {
          throw error; // Re-lança o erro customizado
      }
      
      let friendlyMessage = "Ocorreu um erro ao tentar fazer login.";
      
      // Verifica se é um erro do Firebase para tratar códigos específicos
      if (error instanceof FirebaseError) {
          switch (error.code) {
              case 'auth/user-not-found':
              case 'auth/wrong-password':
              case 'auth/invalid-credential':
                  friendlyMessage = "Email ou senha inválidos.";
                  break;
              case 'auth/invalid-email':
                  friendlyMessage = "O formato do email é inválido.";
                  break;
          }
      }
      throw new Error(friendlyMessage);
    }
  },

  signOut: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      throw new Error("Não foi possível sair da conta.");
    }
  },
};

