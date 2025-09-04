// FIX: Using Firebase v8 compatible imports and initialization
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

// IMPORTANT: Replace the placeholder values below with your actual
// Firebase project configuration. You can find this in your
// Firebase project settings.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

export { app, auth, db, provider, firebaseConfig }; // Export firebaseConfig