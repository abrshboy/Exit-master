
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC2oJCWF1f5PGmkfH0bJPRczHeCGvXXQLY",
  authDomain: "exit-413c8.firebaseapp.com",
  projectId: "exit-413c8",
  storageBucket: "exit-413c8.firebasestorage.app",
  messagingSenderId: "773387303945",
  appId: "1:773387303945:web:5090ef7e38bd0e91600cd8",
  measurementId: "G-NBFKDLNGFQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
