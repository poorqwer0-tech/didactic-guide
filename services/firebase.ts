import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA-atOnWfnTHU0AX6YL5ZI1GBHKdudFbb4",
  authDomain: "coffee-spark-ai-barista-497e8.firebaseapp.com",
  projectId: "coffee-spark-ai-barista-497e8",
  storageBucket: "coffee-spark-ai-barista-497e8.firebasestorage.app",
  messagingSenderId: "269710374374",
  appId: "1:269710374374:web:60b0333c1175f80d369227"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
