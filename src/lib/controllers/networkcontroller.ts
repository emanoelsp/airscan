import { db } from "@/lib/firebase/firebaseconfig";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

async function isApiOnline(apiUrl: string, timeoutMs = 5000): Promise<boolean> {
  const url = apiUrl.trim();
  if (!url) return false;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: { "ngrok-skip-browser-warning": "true" },
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

export interface Asset {
  id: string;
  networkId: string;
  name: string;
  type: "compressor" | "sensor" | "distributor";
  status: "online" | "warning" | "offline";
  apiUrl?: string;
  model?: string;
  x?: number;
  y?: number;
}

export interface Network {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  clientCompanyName: string;
  clientId: string;
}

export interface NetworkSummary extends Network {
  clientContactName: string;
  activeAssets: number;
  inactiveAssets: number;
  totalAssets: number;
}

export interface NetworkTopology extends Network {
  clientContactName: string;
  assets: Asset[];
}

export interface NetworkCreationData {
  name: string;
  description: string;
  location: string;
  compressorType: string;
  compressorModel: string;
  maxPressure: string;
  powerRating: string;
  apiUrl: string;
  apiKey: string;
  clientId: string;
  clientCompanyName: string;
}

const networkController = {
  /**
   * Cria uma nova rede no Firestore e, em seguida, o ativo principal (compressor) associado.
   */
  createNetworkAndAsset: async (data: NetworkCreationData): Promise<string> => {
    try {
      const networksRef = collection(db, "airscan_networks");
      const networkDocRef = await addDoc(networksRef, {
        name: data.name,
        description: data.description,
        location: data.location,
        apiUrl: data.apiUrl,
        apiKey: data.apiKey,
        clientId: data.clientId,
        clientCompanyName: data.clientCompanyName,
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const newNetworkId = networkDocRef.id;

      const assetsRef = collection(db, "airscan_assets");
      await addDoc(assetsRef, {
        networkId: newNetworkId,
        networkName: data.name,
        name: `Compressor Principal - ${data.name}`,
        type: "compressor",
        model: data.compressorModel,
        compressorType: data.compressorType,
        maxPressure: Number(data.maxPressure),
        powerRating: Number(data.powerRating),
        status: "online",
        apiUrl: data.apiUrl,
        apiKey: data.apiKey,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return newNetworkId;
    } catch (error) {
      console.error("Erro detalhado ao criar rede e ativo:", error);
      throw new Error("Não foi possível criar a rede. Tente novamente.");
    }
  },

  /**
   * Busca e combina dados para criar uma lista de resumo das redes.
   */
  async getNetworkSummaries(): Promise<NetworkSummary[]> {
    const networksPromise = getDocs(collection(db, "airscan_networks"));
    const assetsPromise = getDocs(collection(db, "airscan_assets"));
    const accountsPromise = getDocs(collection(db, "airscan_accounts"));

    const [networksSnapshot, assetsSnapshot, accountsSnapshot] = await Promise.all([
      networksPromise,
      assetsPromise,
      accountsPromise,
    ]);

    const assets = assetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Asset[];
    const accountsMap = new Map(accountsSnapshot.docs.map(doc => [doc.id, doc.data()]));
    const networks = networksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Network[];

    // Para exibir online/offline corretamente, validamos via API (quando existir apiUrl)
    const assetsWithApi = assets.filter(
      (a) => typeof a.apiUrl === "string" && a.apiUrl.trim().length > 0
    );
    const onlineAssetIds = new Set<string>();
    await Promise.all(
      assetsWithApi.map(async (asset) => {
        const ok = await isApiOnline(asset.apiUrl as string);
        if (ok) onlineAssetIds.add(asset.id);
      })
    );

    const summaries: NetworkSummary[] = networks.map(network => {
      const networkAssets = assets.filter(asset => asset.networkId === network.id);
      const activeAssets = networkAssets.filter((a) =>
        a.apiUrl ? onlineAssetIds.has(a.id) : a.status === "online"
      ).length;
      const clientAccount = accountsMap.get(network.clientId);

      return {
        ...network,
        clientContactName: clientAccount?.contactName || 'Contato não encontrado',
        activeAssets,
        inactiveAssets: networkAssets.length - activeAssets,
        totalAssets: networkAssets.length,
      };
    });

    return summaries;
  },

  /**
   * Busca informações detalhadas para a visualização de topologia de uma única rede.
   */
  async getNetworkTopology(networkId: string): Promise<NetworkTopology | null> {
    const networkRef = doc(db, "airscan_networks", networkId);
    const networkSnap = await getDoc(networkRef);

    if (!networkSnap.exists()) {
      console.error("Rede não encontrada");
      return null;
    }
    const networkData = { id: networkSnap.id, ...networkSnap.data() } as Network;

    let clientContactName = 'Contato não encontrado';
    if (networkData.clientId) {
      const clientRef = doc(db, "airscan_accounts", networkData.clientId);
      const clientSnap = await getDoc(clientRef);
      if (clientSnap.exists()) {
        clientContactName = clientSnap.data().contactName;
      }
    }

    const assetsQuery = query(collection(db, "airscan_assets"), where("networkId", "==", networkId));
    const assetsSnapshot = await getDocs(assetsQuery);
    const assets = assetsSnapshot.docs.map((doc, index) => ({
      id: doc.id,
      ...doc.data(),
      x: doc.data().x || 100 + (index % 3) * 150,
      y: doc.data().y || 100 + Math.floor(index / 3) * 120,
    })) as Asset[];

    return {
      ...networkData,
      clientContactName,
      assets,
    };
  }
};

export default networkController;

