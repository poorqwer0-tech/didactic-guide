import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

export const SecurityService = {
  /**
   * ตรวจสอบและบันทึกการเข้าถึงระบบ (Hardware Fingerprint Tracking)
   */
  async verifyDeviceAccess(deviceId: string, deviceSpecs: any) {
    const deviceRef = doc(db, "security_logs", deviceId);
    const deviceSnap = await getDoc(deviceRef);

    if (!deviceSnap.exists()) {
      // บันทึกอุปกรณ์ใหม่ที่เข้าใช้งาน
      await setDoc(deviceRef, {
        fingerprint: deviceSpecs.fingerprint,
        firstAccess: serverTimestamp(),
        lastAccess: serverTimestamp(),
        trusted: true,
        platform: deviceSpecs.platform,
        status: "active"
      });
      return { status: "new_device", trusted: true };
    }

    const data = deviceSnap.data();
    if (data?.fingerprint !== deviceSpecs.fingerprint) {
      // แจ้งเตือนหากลายนิ้วมืออุปกรณ์เปลี่ยนไป (ป้องกันการสวมรอย)
      return { status: "untrusted_device", trusted: false };
    }

    await updateDoc(deviceRef, { lastAccess: serverTimestamp() });
    return { status: "verified", trusted: true };
  },

  /**
   * ระบบเข้ารหัสข้อมูลสำคัญก่อนบันทึกลง Cloud (Client-Side Encryption)
   */
  async encryptData(data: string, key: string) {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    
    // ใช้ Web Crypto API สำหรับความปลอดภัยระดับสูง
    const cryptoKey = await crypto.subtle.importKey(
      "raw", 
      encoder.encode(key.padEnd(32, '0').substring(0, 32)), 
      "AES-GCM", 
      false, 
      ["encrypt", "decrypt"]
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv }, 
      cryptoKey, 
      encodedData
    );

    return {
      iv: btoa(String.fromCharCode(...iv)),
      data: btoa(String.fromCharCode(...new Uint8Array(encrypted)))
    };
  }
};
