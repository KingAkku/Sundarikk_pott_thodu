// FIX: Use v8 compat imports
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/app-check";


// --- START: Environment Variable Validation ---
// This block ensures that all necessary Firebase environment variables are available.
// If any are missing, it throws an error to prevent the app from crashing with a cryptic message.
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
  // measurementId is optional, so we skip it
  if (key === 'measurementId') continue;

  if (!value) {
    const envVarName = `VITE_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`;
    throw new Error(
      `Firebase config is missing. Make sure "${envVarName}" is set in your .env.local file.`
    );
  }
}
// --- END: Environment Variable Validation ---


// Initialize Firebase
// FIX: Use v8 compat `firebase.initializeApp`
const app = firebase.initializeApp(firebaseConfig);

// Initialize Firebase App Check
// To enable App Check, you must:
// 1. Go to your Firebase Project Settings -> App Check.
// 2. Register your web app and choose the reCAPTCHA Enterprise provider.
// 3. Follow the instructions to get your reCAPTCHA site key.
// 4. Add the key to your `.env.local` file as `VITE_RECAPTCHA_SITE_KEY`.
// If you don't enable App Check, you may see authentication or database errors.
if (process.env.VITE_RECAPTCHA_SITE_KEY && process.env.VITE_RECAPTCHA_SITE_KEY !== 'your-recaptcha-enterprise-site-key-here') {
  try {
    // FIX: Use v8 compat syntax for App Check
    const appCheck = firebase.appCheck(app);
    appCheck.activate(process.env.VITE_RECAPTCHA_SITE_KEY, true);
  } catch(e) {
    console.error("Failed to initialize App Check", e);
  }
} else {
    console.warn("Firebase App Check is not configured. Please set VITE_RECAPTCHA_SITE_KEY in your .env.local file to protect your backend.");
}

// FIX: Use v8 compat syntax for Auth, Firestore, and Providers
const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

export { app, auth, db, provider, firebaseConfig };
