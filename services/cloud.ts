import { getFirestore, collection, addDoc, query, where, getDocs, serverTimestamp, limit } from "firebase/firestore";
import { auth, db } from "./firebase";

export const CloudService = {
  /**
   * ระบบบันทึกประวัติการแชทขึ้น Cloud (Cloud Sync)
   */
  async syncChatMessage(userId: string, sessionId: string, message: any) {
    try {
      await addDoc(collection(db, "cloud_chats"), {
        userId,
        sessionId,
        text: message.text,
        role: message.role,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Cloud Sync Error:", error);
    }
  },

  /**
   * ดึงข้อมูลประวัติการแชทจาก Cloud กลับมาที่เครื่อง
   */
  async fetchCloudHistory(userId: string, sessionId: string) {
    const q = query(
      collection(db, "cloud_chats"),
      where("userId", "==", userId),
      where("sessionId", "==", sessionId),
      limit(100)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  /**
   * ระบบ Backup ข้อมูลการตั้งค่า (Cloud Backup)
   */
  async backupSettings(userId: string, settings: any) {
    try {
      const settingsRef = collection(db, "user_settings");
      // ใช้ userId เป็น ID ของเอกสารเพื่อความง่ายในการเรียกคืน
      await addDoc(settingsRef, {
        userId,
        settings,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Backup Error:", error);
    }
  }
};
