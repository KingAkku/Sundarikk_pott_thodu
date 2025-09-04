import React, { useState } from 'react';
import { auth, provider } from '../firebaseConfig';
import { signInWithPopup, signInWithRedirect, signInAnonymously } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

const Login: React.FC = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<'google' | 'anonymous' | null>(null);

  const errorMessageFromCode = (code?: string) => {
    switch (code) {
      case 'auth/popup-closed-by-user': return 'Popup closed before completing sign in.';
      case 'auth/cancelled-popup-request': return 'Another sign-in attempt was in progress.';
      case 'auth/popup-blocked': return 'Popup blocked. Retrying with redirect…';
      case 'auth/operation-not-allowed': return 'This sign-in method is disabled in your Firebase project.';
      case 'auth/network-request-failed': return 'Network error. Check your connection and try again.';
      default: return 'An unexpected error occurred. Please try again.';
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading('google');
    setError('');
    try {
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error) {
      let code = 'unknown';
      if (error instanceof FirebaseError) {
        code = error.code;
      }

      if (code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, provider);
          return; // Redirect will handle the rest
        } catch (redirErr) {
          let redirCode = 'unknown';
          let redirMessage = 'Sign-in via redirect failed.';
          if (redirErr instanceof FirebaseError) {
            redirCode = redirErr.code;
            redirMessage = redirErr.message;
          }
          console.error('Redirect sign-in failed:', { code: redirCode, message: redirMessage });
          setError(errorMessageFromCode(redirCode));
        }
      } else {
        setError(errorMessageFromCode(code));
      }
    } finally {
      setLoading(null);
    }
  };
  
  const handleAnonymousSignIn = async () => {
    setLoading('anonymous');
    setError('');
    try {
      await signInAnonymously(auth);
    } catch (error) {
      let code = 'unknown';
      let message = 'Failed to sign in as guest.';
       if (error instanceof FirebaseError) {
        code = error.code;
        message = error.message;
      }
      console.error('Error signing in anonymously:', { code, message });
      setError(code === 'auth/operation-not-allowed'
        ? 'Anonymous sign-in is disabled for this Firebase project.'
        : 'Failed to sign in as guest. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1B1E] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-[#1A2B2E] rounded-2xl shadow-2xl p-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tighter text-[#F5F1E9]">Pin the Dot</h1>
        <p className="text-[#F5F1E9] opacity-70 mt-2 mb-10">Sign in to join the leaderboard</p>

        <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={!!loading}
              className="w-full flex items-center justify-center bg-[#B55B3E] hover:bg-[#a14f34] text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1A2B2E] focus:ring-[#B55B3E] transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading === 'google' ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.82l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
                  <span>Sign in with Google</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleAnonymousSignIn}
              disabled={!!loading}
              className="w-full flex items-center justify-center border border-[#2A4747] text-[#F5F1E9] font-medium py-2.5 px-4 rounded-lg hover:bg-[#2A4747] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1A2B2E] focus:ring-[#F5F1E9] transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading === 'anonymous' ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Entering...</span>
                </>
              ) : (
                'Play as Guest'
              )}
            </button>
        </div>
        {error && <p className="text-red-400 text-sm text-center mt-6">{error}</p>}
      </div>
    </div>
  );
};

export default Login;