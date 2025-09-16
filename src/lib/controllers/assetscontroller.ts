import { db } from "@/lib/firebase/firebaseconfig";
import { 
  doc, 
  updateDoc, 
  serverTimestamp, 
  collection, 
  addDoc, 
  getDocs, 
  query,
  where,
  DocumentData 
} from "firebase/firestore";

// --- INTERFACES ---

// Interface para um ativo, agora com os campos de limite
export interface Asset {
  id: string;
  name: string;
  type: "compressor" | "sensor" | "distributor" | string;
  status: 'online' | 'offline' | 'maintenance';
  networkId: string;
  networkName: string;
  accountId: string; // Adicionado para vincular o ativo à conta do cliente
  location: string;
  model: string;
  apiKey: string;
  apiUrl: string;
  description: string;
  maxPressure: number;
  powerRating: number;
  // Novos campos para limites de alerta
  limitLow?: number;
  limitNormal?: number;
  limitRisk?: number;
  limitCritical?: number;
}

// Interface para uma rede
export interface Network {
  accountId: string;
  id: string;
  name: string;
  location?: string;
  description?: string;
  apiUrl?: string;
  apiKey?: string;
}

// Interface para criação de um novo ativo
export interface AssetCreationData {
  networkId: string;
  networkName: string;
  accountId: string; // Garantir que o ID da conta seja salvo na criação
  name: string;
  type: "compressor" | "sensor" | "distributor";
  model: string;
  description: string;
  location: string;
  maxPressure: string;
  powerRating: string;
  apiUrl: string;
  apiKey: string;
}

// Interface para os dados que podem ser atualizados
export type UpdateAssetData = Partial<Omit<Asset, 'id' | 'networkId' | 'networkName' | 'accountId'>>;

// --- CONTROLLER ---

const assetsController = {
  /**
   * Busca todas as redes da coleção 'airscan_networks'.
   */
  getNetworks: async (): Promise<Network[]> => {
    try {
      const networksRef = collection(db, "airscan_networks");
      const snapshot = await getDocs(networksRef);
      if (snapshot.empty) return [];

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as DocumentData),
      })) as Network[];
    } catch (error) {
      console.error("Erro ao buscar redes:", error);
      throw new Error("Não foi possível carregar as redes.");
    }
  },
  
  /**
   * NOVA FUNÇÃO: Busca todos os ativos associados a um ID de conta de cliente.
   */
  getAssetsByAccountId: async (accountId: string): Promise<Asset[]> => {
    try {
      const assetsRef = collection(db, "airscan_assets");
      const q = query(assetsRef, where("accountId", "==", accountId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return [];

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as DocumentData),
      })) as Asset[];
    } catch (error) {
      console.error("Erro ao buscar ativos da conta:", error);
      throw new Error("Não foi possível carregar os equipamentos.");
    }
  },

  /**
   * Cria um novo ativo na coleção 'airscan_assets'.
   */
  createAsset: async (data: AssetCreationData): Promise<string> => {
    try {
      const assetsRef = collection(db, "airscan_assets");
      const docRef = await addDoc(assetsRef, {
        ...data,
        maxPressure: Number(data.maxPressure) || 0,
        powerRating: Number(data.powerRating) || 0,
        status: "online",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Erro ao criar ativo:", error);
      throw new Error("Não foi possível salvar o novo ativo.");
    }
  },

  /**
   * Atualiza os dados de um ativo específico no Firestore.
   */
  updateAsset: async (assetId: string, data: UpdateAssetData): Promise<void> => {
    try {
      const assetRef = doc(db, "airscan_assets", assetId);
      await updateDoc(assetRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erro ao atualizar o ativo:", error);
      throw new Error("Não foi possível salvar as alterações do ativo.");
    }
  },
};

export default assetsController;
