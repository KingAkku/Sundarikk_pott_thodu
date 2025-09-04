// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBL1Y0YIEOdsrAOT_Rr4Gz3eXtUerBy5SQ",
  authDomain: "sundari-007.firebaseapp.com",
  projectId: "sundari-007",
  storageBucket: "sundari-007.appspot.com",
  messagingSenderId: "878871299880",
  appId: "1:878871299880:web:442f4e1e6c5d479b58721d",
  measurementId: "G-DBE34T1H27"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export { app, auth, db, provider, firebaseConfig };