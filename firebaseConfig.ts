import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBL1Y0YIEOdsrAOT_Rr4Gz3eXtUerBy5SQ',
  authDomain: 'sundari-007.firebaseapp.com',
  projectId: 'sundari-007',
  storageBucket: 'sundari-007.appspot.com',
  messagingSenderId: '878871299880',
  appId: '1:878871299880:web:71bca3776be7300958721d',
  measurementId: 'G-53SQWMGJMX',
};

// IMPORTANT: For production applications, it's highly recommended to restrict your API key.
// You can do this in the Google Cloud Console by adding your web app's domain
// to the "Website restrictions" for this API key.
// This helps prevent unauthorized use of your Firebase project.

const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();
const auth = firebase.auth();
const db = firebase.firestore();

// Optional but recommended: choose your desired persistence
// import 'firebase/compat/auth';
// auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(console.error);

const provider = new firebase.auth.GoogleAuthProvider();
// Optional scope examples:
// provider.addScope('profile');
// provider.addScope('email');

export { app, auth, db, provider, firebaseConfig, firebase };