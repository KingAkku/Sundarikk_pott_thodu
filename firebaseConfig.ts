// FIX: Use Firebase v8 compat imports to resolve module errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/app-check';

// --- START: Environment Variable Validation ---
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

for (const [key, value] of Object.entries(firebaseConfig)) {
  if (key === 'measurementId') continue; // measurementId is optional

  if (!value) {
    const envVarName = `VITE_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`;
    throw new Error(
      `Firebase config is missing. Make sure "${envVarName}" is set in your .env.local file.`
    );
  }
}
// --- END: Environment Variable Validation ---

// Initialize Firebase
// FIX: Use Firebase v8 compat syntax for initialization
const app = firebase.initializeApp(firebaseConfig);

// Initialize Firebase App Check
if (process.env.VITE_RECAPTCHA_SITE_KEY && process.env.VITE_RECAPTCHA_SITE_KEY !== 'your-recaptcha-enterprise-site-key-here') {
  try {
    // Make sure you have the App Check SDK script in your index.html
    // Or install it via npm: `npm install firebase@10.12.2` (already done)
    // FIX: Use Firebase v8 compat syntax for App Check
    const appCheck = firebase.appCheck();
    appCheck.activate(
      process.env.VITE_RECAPTCHA_SITE_KEY,
      true
    );
  } catch (e) {
    console.error("Failed to initialize App Check", e);
  }
} else {
  console.warn("Firebase App Check is not configured. Please set VITE_RECAPTCHA_SITE_KEY in your .env.local file to protect your backend.");
}

// Get Firebase services
// FIX: Use Firebase v8 compat syntax to get services
const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

export { app, auth, db, provider, firebaseConfig };
