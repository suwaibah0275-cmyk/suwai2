import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD6AG4yyuUsc7h9p9uRvr1Ix3mKVm_AiqA",
  authDomain: "suwaimoney.firebaseapp.com",
  projectId: "suwaimoney",
  storageBucket: "suwaimoney.firebasestorage.app",
  messagingSenderId: "643886003604",
  appId: "1:643886003604:web:c8a6b85d7c9dbbcfe20b81",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
