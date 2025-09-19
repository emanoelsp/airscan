import { db } from "@/lib/firebase/firebaseconfig";
import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  updateDoc,
  deleteField,
  addDoc,
  serverTimestamp,
  DocumentData
} from "firebase/firestore";

// --- INTERFACES ---

export interface Network {
  id: string;
  clientId: string;
  name: string;
  // Adicione outros campos se necessário
}

export interface Asset {
  id: string;
  name: string;
  networkId: string;
  networkName: string;

  // Campos para limites de pressão (opcionais)
  limitLow?: number;
  limitNormal?: number;
  limitRisk?: number;
  limitCritical?: number;

  // Campos de contato de alerta (opcionais)
  contactName?: string;
  contactEmails?: string[];
  contactPhones?: string[];

  // Outros campos do ativo
  type?: "compressor" | "sensor" | "distributor" | string;
  model?: string;
}

// Tipo para atualização de dados do ativo
export type UpdateAssetData = Partial<Omit<Asset, 'id'>>;

// Tipo para criação de um novo ativo
export interface AssetCreationData {
  networkId: string;
  networkName: string;
  accountId: string; // ou clientId, dependendo do seu modelo
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


// --- LÓGICA INTERNA (SEPARADA PARA ROBUSTEZ) ---

async function getNetworksByAccountId(accountId: string): Promise<Network[]> {
  try {
    const networksRef = collection(db, "airscan_networks");
    const q = query(networksRef, where("clientId", "==", accountId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as DocumentData),
    })) as Network[];
  } catch (error) {
    console.error("Erro ao buscar redes da conta:", error);
    throw new Error("Não foi possível carregar as redes.");
  }
}

async function getAssetsByAccountId(accountId: string): Promise<Asset[]> {
  try {
    const clientNetworks = await getNetworksByAccountId(accountId);
    if (clientNetworks.length === 0) return [];

    const networkIds = clientNetworks.map(net => net.id);
    
    const assetsRef = collection(db, "airscan_assets");
    // Nota: a cláusula 'in' do Firestore é limitada a 30 itens.
    const q = query(assetsRef, where("networkId", "in", networkIds));
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
}

// --- OBJETO DO CONTROLLER ---

const assetsController = {
  // Funções de busca
  getNetworksByAccountId,
  getAssetsByAccountId,

  // Função para criar um novo ativo
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

  // Função genérica que atualiza qualquer campo do ativo (incluindo limites e contatos)
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

  // Função específica para excluir os limites de um ativo
  deleteAssetLimits: async (assetId: string): Promise<void> => {
    try {
      const assetRef = doc(db, "airscan_assets", assetId);
      await updateDoc(assetRef, {
        limitLow: deleteField(),
        limitNormal: deleteField(),
        limitRisk: deleteField(),
        limitCritical: deleteField(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erro ao excluir os limites do ativo:", error);
      throw new Error("Não foi possível excluir os limites do ativo.");
    }
  },

  // Função específica para excluir os contatos de um ativo
  deleteAssetContacts: async (assetId: string): Promise<void> => {
    try {
      const assetRef = doc(db, "airscan_assets", assetId);
      await updateDoc(assetRef, {
        contactName: deleteField(),
        contactEmails: deleteField(),
        contactPhones: deleteField(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erro ao excluir contatos do ativo:", error);
      throw new Error("Não foi possível excluir os contatos do ativo.");
    }
  },
};

export default assetsController;