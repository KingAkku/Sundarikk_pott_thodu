
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBL1Y0YIEOdsrAOT_Rr4Gz3eXtUerBy5SQ",
  authDomain: "sundari-007.firebaseapp.com",
  projectId: "sundari-007",
  storageBucket: "sundari-007.firebasestorage.app",
  messagingSenderId: "878871299880",
  appId: "1:878871299880:web:71bca3776be7300958721d",
  measurementId: "G-53SQWMGJMX"
};

// Initialize Firebase for SSR and SSG, prevent reinitialization on client
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export { app, auth, db, provider, firebaseConfig };
