import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

export const UltraSecurity = {
  /**
   * สร้าง Master Key จาก Password ของผู้ใช้โดยใช้ PBKDF2 (Zero-Knowledge)
   * รหัสผ่านจะไม่ถูกส่งไปที่ Server โดยเด็ดขาด
   */
  async deriveMasterKey(password: string, salt: string) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    return await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: enc.encode(salt),
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  },

  /**
   * การเข้ารหัสข้อมูลระดับสูงสุด (End-to-End Encryption)
   * ข้อมูลจะถูกล็อคก่อนออกจากเครื่อง และปลดล็อคได้เฉพาะเจ้าของรหัสเท่านั้น
   */
  async secureEncrypt(data: string, masterKey: CryptoKey) {
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      masterKey,
      enc.encode(data)
    );

    return {
      iv: btoa(String.fromCharCode(...iv)),
      ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted)))
    };
  },

  /**
   * ถอดรหัสข้อมูล (เฉพาะผู้ที่มี Master Key เท่านั้น)
   */
  async secureDecrypt(encryptedObj: { iv: string, ciphertext: string }, masterKey: CryptoKey) {
    const iv = new Uint8Array(atob(encryptedObj.iv).split("").map(c => c.charCodeAt(0)));
    const ciphertext = new Uint8Array(atob(encryptedObj.ciphertext).split("").map(c => c.charCodeAt(0)));

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      masterKey,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  },

  /**
   * ระบบตรวจจับการพยายามแฮ็ก (Intrusion Detection)
   */
  async reportAttack(userId: string, attackType: string, details: any) {
    await setDoc(doc(db, "security_alerts", `${userId}_${Date.now()}`), {
      userId,
      attackType,
      details,
      timestamp: serverTimestamp(),
      severity: "critical"
    });
  }
};
