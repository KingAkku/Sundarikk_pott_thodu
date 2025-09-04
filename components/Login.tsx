import React, { useEffect } from 'react';
import firebase from 'firebase/compat/app';
import { auth } from '../firebaseConfig';

// By loading firebaseui via a script tag in index.html, it becomes available on the window object.
// We declare it here to let TypeScript know it exists globally.
declare const firebaseui: any;

const Login: React.FC = () => {
  useEffect(() => {
    // Use the globally available firebaseui
    const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);
    
    const uiConfig = {
      signInSuccessUrl: '/', // On success, onAuthStateChanged will handle the user state
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        {
          provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
          recaptchaParameters: {
            type: 'image',
            size: 'invisible',
            badge: 'bottomright'
          },
          defaultCountry: 'US',
        }
      ],
      credentialHelper: firebaseui.auth.CredentialHelper.NONE,
      callbacks: {
        signInSuccessWithAuthResult: () => {
          // Return false to prevent redirect, allowing onAuthStateChanged in App.tsx to handle it.
          return false; 
        }
      }
    };
    
    ui.start('#firebaseui-auth-container', uiConfig);

  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-2xl rounded-2xl p-8 transform hover:scale-105 transition-transform duration-300">
          <h1 className="text-3xl font-bold text-slate-800 text-center mb-2">Pin the Dot</h1>
          <p className="text-center text-slate-500 mb-8">A game of precision and fun!</p>
          
          {/* Container where FirebaseUI will render the login options */}
          <div id="firebaseui-auth-container"></div>
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">
          Sign in to save your score and join the leaderboard.
        </p>
      </div>
    </div>
  );
};

export default Login;