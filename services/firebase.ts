
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBF5rCH4x_KSlqohfJ4a8Y79nbYSvZdMLE",
  authDomain: "exam-prep-app-a10a0.firebaseapp.com",
  projectId: "exam-prep-app-a10a0",
  storageBucket: "exam-prep-app-a10a0.firebasestorage.app",
  messagingSenderId: "657453893320",
  appId: "1:657453893320:web:d4dcd50c4a88c0c9f147fd",
  measurementId: "G-S1XPDSX5RE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
