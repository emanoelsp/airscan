import { db } from "@/lib/model/firebase";
import { 
  doc, 
  updateDoc, 
  serverTimestamp, 
  collection, 
  addDoc, 
  getDocs, 
  DocumentData 
} from "firebase/firestore";

// --- INTERFACES ---

// Interface para um ativo, combinando as definições
export interface Asset {
  id: string;
  name: string;
  type: "compressor" | "sensor" | "distributor" | string; // Permitindo outros tipos
  status: 'online' | 'offline' | 'maintenance';
  networkId: string;
  networkName: string;
  location: string;
  model: string;
  apiKey: string;
  apiUrl: string;
  description: string;
  maxPressure: number;
  powerRating: number;
}

// Interface para uma rede
export interface Network {
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
  name: string;
  type: "compressor" | "sensor" | "distributor";
  model: string;
  description: string;
  location: string;
  maxPressure: string; // Vem como string do formulário
  powerRating: string; // Vem como string do formulário
  apiUrl: string;
  apiKey: string;
}

// Interface para os dados que podem ser atualizados
export type UpdateAssetData = Partial<Omit<Asset, 'id' | 'networkId' | 'networkName'>>;

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
   * Cria um novo ativo na coleção 'airscan_assets'.
   */
  createAsset: async (data: AssetCreationData): Promise<string> => {
    try {
      const assetsRef = collection(db, "airscan_assets");
      const docRef = await addDoc(assetsRef, {
        ...data,
        maxPressure: Number(data.maxPressure) || 0,
        powerRating: Number(data.powerRating) || 0,
        status: "online", // Status padrão
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

