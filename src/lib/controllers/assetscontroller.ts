import { db } from "../model/firebase";
import { collection, addDoc, getDocs, DocumentData, serverTimestamp } from "firebase/firestore";

// --- INTERFACES ---

// Interface for a network document fetched from Firestore
export interface Network {
  id: string;
  name: string;
  location?: string;
  description?: string;
  apiUrl?: string;
  apiKey?: string;
}

// Interface for the data collected from the asset creation form
export interface AssetCreationData {
  networkId: string;
  networkName: string;
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

const assetsController = {
  /**
   * Fetches all networks from the 'airscan_networks' collection.
   * @returns A promise that resolves to an array of Network objects.
   */
  getNetworks: async (): Promise<Network[]> => {
    try {
      const networksRef = collection(db, "airscan_networks");
      const snapshot = await getDocs(networksRef);

      if (snapshot.empty) {
        return [];
      }

      const networksList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as DocumentData),
      })) as Network[];
      
      return networksList;
    } catch (error) {
      console.error("Erro ao buscar redes:", error);
      throw new Error("Não foi possível carregar as redes.");
    }
  },

  /**
   * Creates a new asset in the 'airscan_assets' collection in Firestore.
   * @param data The data for the new asset.
   * @returns The ID of the newly created asset document.
   */
  createAsset: async (data: AssetCreationData): Promise<string> => {
    try {
      const assetsRef = collection(db, "airscan_assets");
      const docRef = await addDoc(assetsRef, {
        ...data,
        // Convert numeric fields from string to number before saving
        maxPressure: Number(data.maxPressure) || 0,
        powerRating: Number(data.powerRating) || 0,
        status: "online", // Default status for a new asset
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return docRef.id;
    } catch (error) {
      console.error("Erro ao criar ativo:", error);
      throw new Error("Não foi possível salvar o novo ativo.");
    }
  },
};

export default assetsController;
