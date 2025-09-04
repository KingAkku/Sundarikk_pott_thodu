// Fix: Use Firebase v8 compat imports to resolve module export errors.
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

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
// Fix: Use v8 compat initialization style.
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const app = firebase.app();
const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

export { app, auth, db, provider, firebaseConfig };