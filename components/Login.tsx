import React from 'react';
// FIX: Import signInWithPopup for Firebase v9.
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebaseConfig';

const GoogleIcon: React.FC = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C41.38,36.148,44,30.638,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);


const Login: React.FC = () => {

  const handleGoogleSignIn = async () => {
    try {
      // FIX: Use Firebase v9 modular API for signInWithPopup.
      await signInWithPopup(auth, provider);
      // Auth state change will be handled by the listener in App.tsx
    } catch (error) {
      console.error("Error signing in with Google: ", error);
      alert("Failed to sign in. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-2xl rounded-2xl p-8 transform hover:scale-105 transition-transform duration-300">
          <h1 className="text-3xl font-bold text-slate-800 text-center mb-2">Pin the Dot</h1>
          <p className="text-center text-slate-500 mb-8">A game of precision and fun!</p>
          
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline-indigo transition-all duration-300 transform hover:translate-y-[-2px] flex items-center justify-center shadow-lg"
          >
            <GoogleIcon />
            Sign in with Google
          </button>
          <p className="text-center text-xs text-slate-400 mt-6">
            Sign in to save your score and join the leaderboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;