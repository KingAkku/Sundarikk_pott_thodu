import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

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

// Initialize Firebase App Check to protect Firebase services from abuse.
// NOTE: App Check has been temporarily disabled to resolve startup errors.
// The placeholder 'YOUR_RECAPTCHA_SITE_KEY' must be replaced with a real
// site key from your Firebase project's App Check settings. Once you have the
// key, uncomment the code below and the import statement at the top of the file.
/*
initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider('YOUR_RECAPTCHA_SITE_KEY'),
  isTokenAutoRefreshEnabled: true,
});
*/

const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export { app, auth, db, provider, firebaseConfig };