import { db } from "@/lib/firebase/firebaseconfig";
import { collection, addDoc, Timestamp, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

// Interfaces de Dados
export interface LeakEventData {
  assetId: string;
  assetName: string;
  networkId: string;
  currentLpm: number;
  currentPressure: number;
  startTime: number; // Timestamp JS (Date.now())
  currentDbId: string | null; // ID se já estiver salvo
}

export interface LeakResult {
  dbId: string | null;
  action: 'created' | 'updated' | 'none';
  severity: 'moderate' | 'critical' | 'severe' | 'normal';
}

const leakController = {
  // --- LÓGICA DE NEGÓCIO CENTRAL ---
  async syncLeakEvent(data: LeakEventData): Promise<LeakResult> {
    const now = Date.now();
    const durationMs = now - data.startTime;
    const durationMin = durationMs / 60000;

    // 1. Regra de Classificação (5/10/15 min)
    let severity: 'moderate' | 'critical' | 'severe' | 'normal' = 'normal';
    
    if (durationMin >= 15) severity = 'severe';
    else if (durationMin >= 10) severity = 'critical';
    else if (durationMin >= 5) severity = 'moderate';
    else return { dbId: null, action: 'none', severity: 'normal' }; // < 5 min não grava

    // 2. Cálculos Financeiros
    // Custo Estimado Hora = LPM * R$350 (anual) / (365*24)
    const custoHora = (data.currentLpm * 350 / 8760).toFixed(2); 

    try {
      // A. CRIAÇÃO (Se passou de 5 min e não tem ID ainda)
      if (!data.currentDbId) {
        // Double-check para não duplicar se a internet oscilar
        const q = query(
            collection(db, "airscan_leaks"), 
            where("assetId", "==", data.assetId), 
            where("status", "==", "active")
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
             // Já existia, recupera o ID
             return { dbId: snapshot.docs[0].id, action: 'updated', severity };
        }

        const docRef = await addDoc(collection(db, "airscan_leaks"), {
          assetId: data.assetId,
          assetName: data.assetName,
          networkId: data.networkId,
          startTime: Timestamp.fromMillis(data.startTime),
          lpm: data.currentLpm,
          custo_hora: custoHora,
          status: 'active',
          severity: severity,
          createdAt: Timestamp.now(),
          lastUpdate: Timestamp.now()
        });

        return { dbId: docRef.id, action: 'created', severity };
      } 
      
      // B. ATUALIZAÇÃO (Heartbeat - Atualiza duração e severidade)
      else {
        const leakRef = doc(db, "airscan_leaks", data.currentDbId);
        await updateDoc(leakRef, {
            durationMinutes: durationMin,
            currentPressure: data.currentPressure,
            severity: severity,
            lpm: data.currentLpm, // Atualiza se o vazamento piorar
            custo_hora: custoHora,
            lastUpdate: Timestamp.now()
        });
        return { dbId: data.currentDbId, action: 'updated', severity };
      }

    } catch (error) {
      console.error("Erro no controller de vazamento:", error);
      throw error; // Repassa erro para UI tratar visualmente se necessário
    }
  },

  // --- FINALIZAÇÃO ---
  async resolveLeak(dbId: string) {
    if (!dbId) return;
    try {
        const leakRef = doc(db, "airscan_leaks", dbId);
        await updateDoc(leakRef, {
            status: 'resolved',
            endTime: Timestamp.now()
        });
        console.log(`Vazamento ${dbId} finalizado.`);
    } catch (error) {
        console.error("Erro ao resolver vazamento:", error);
    }
  }
};

export default leakController;