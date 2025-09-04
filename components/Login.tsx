import React, { useEffect } from 'react';
import { GoogleAuthProvider, PhoneAuthProvider } from 'firebase/auth';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import { auth } from '../firebaseConfig';

const Login: React.FC = () => {
  useEffect(() => {
    const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);
    
    const uiConfig: firebaseui.auth.Config = {
      signInSuccessUrl: '/', // On success, redirect to the app root
      signInOptions: [
        GoogleAuthProvider.PROVIDER_ID,
        {
          provider: PhoneAuthProvider.PROVIDER_ID,
          recaptchaParameters: {
            type: 'image',
            size: 'invisible',
            badge: 'bottomright'
          },
          defaultCountry: 'US', // Optional, sets a default country code
        }
      ],
      // Do not show account chooser
      credentialHelper: firebaseui.auth.CredentialHelper.NONE,
      callbacks: {
        signInSuccessWithAuthResult: () => {
          // Prevents immediate redirect, allowing onAuthStateChanged to handle it
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