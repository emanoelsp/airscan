import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from  "@/lib/firebase/firebaseconfig";

export type ContactFormData = {
  name: string;
  email: string;
  company: string;
  phone: string;
  subject: string;
  message: string;
};

export const saveContactMessage = async (data: ContactFormData) => {
  try {
    const messagesCollection = collection(db, "airscan_contactmessages");

    await addDoc(messagesCollection, {
      ...data,
      createdAt: serverTimestamp(), // Adiciona a data/hora que o servidor recebeu a mensagem
      status: "new" // Um campo extra para ajudar no gerenciamento (ex: new, read, archived)
    });

    console.log("Mensagem salva com sucesso!");
    return { success: true };

  } catch (error) {
    console.error("Erro ao salvar mensagem no Firestore:", error);
    return { success: false, error: "Não foi possível enviar sua mensagem. Tente novamente mais tarde." };
  }
};

