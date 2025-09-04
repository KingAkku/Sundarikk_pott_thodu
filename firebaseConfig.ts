// FIX: Use Firebase v8 compatible imports and initialization to resolve module errors.
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

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

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();
const app = firebase.app();

export { app, auth, db, provider, firebaseConfig };
