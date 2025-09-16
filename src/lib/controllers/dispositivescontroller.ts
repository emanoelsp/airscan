import { db } from "@/lib/firebase/firebaseconfig";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";

// --- INTERFACES ---

export interface AlertDevice {
  id: string;
  accountId: string;
  name: string;
  phoneNumbers: string[];
  emails: string[];
}

export interface AlertDeviceCreationData {
  accountId: string;
  name: string;
  phoneNumbers: string[];
  emails: string[];
}

export type AlertDeviceUpdateData = Partial<Omit<AlertDevice, 'id' | 'accountId'>>;


// --- CONTROLLER ---

const dispositivesController = {
  /**
   * Busca todos os grupos de dispositivos de um determinado cliente.
   */
  getDevicesByAccountId: async (accountId: string): Promise<AlertDevice[]> => {
    try {
      const devicesRef = collection(db, "airscan_dispositives");
      const q = query(devicesRef, where("accountId", "==", accountId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AlertDevice[];
    } catch (error) {
      console.error("Erro ao buscar dispositivos:", error);
      throw new Error("Não foi possível carregar os dispositivos de alerta.");
    }
  },

  /**
   * Cria um novo grupo de dispositivos de alerta.
   */
  createDevice: async (data: AlertDeviceCreationData): Promise<string> => {
    try {
      const devicesRef = collection(db, "airscan_dispositives");
      const docRef = await addDoc(devicesRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Erro ao criar dispositivo:", error);
      throw new Error("Não foi possível salvar o novo grupo de dispositivos.");
    }
  },

  /**
   * Atualiza um grupo de dispositivos de alerta.
   */
  updateDevice: async (deviceId: string, data: AlertDeviceUpdateData): Promise<void> => {
    try {
      const deviceRef = doc(db, "airscan_dispositives", deviceId);
      await updateDoc(deviceRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Erro ao atualizar dispositivo:", error);
      throw new Error("Não foi possível salvar as alterações.");
    }
  },

  /**
   * Deleta um grupo de dispositivos de alerta.
   */
  deleteDevice: async (deviceId: string): Promise<void> => {
    try {
      const deviceRef = doc(db, "airscan_dispositives", deviceId);
      await deleteDoc(deviceRef);
    } catch (error) {
      console.error("Erro ao deletar dispositivo:", error);
      throw new Error("Não foi possível remover o grupo de dispositivos.");
    }
  }
};

export default dispositivesController;