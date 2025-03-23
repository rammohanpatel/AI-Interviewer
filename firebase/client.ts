import { initializeApp,getApps,getApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyA2FcQWXIQTGsJT3oJI48hmpeHHkbUTLZA",
  authDomain: "ai-interviewer-3c9bc.firebaseapp.com",
  projectId: "ai-interviewer-3c9bc",
  storageBucket: "ai-interviewer-3c9bc.firebasestorage.app",
  messagingSenderId: "56469835427",
  appId: "1:56469835427:web:acdd8d60cc58a7435af916",
  measurementId: "G-FHB8PV277M"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig):getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);