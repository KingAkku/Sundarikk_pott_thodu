import React, { useState } from 'react';
import { auth, provider } from '../firebaseConfig';

const Login: React.FC = () => {
  const [guestName, setGuestName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState<'google' | 'anonymous' | 'email' | null>(null);

  const errorMessageFromCode = (code?: string) => {
    switch (code) {
      case 'auth/popup-closed-by-user': return 'Popup closed before completing sign in.';
      case 'auth/cancelled-popup-request': return 'Another sign-in attempt was in progress.';
      case 'auth/popup-blocked': return 'Popup blocked. Retrying with redirect…';
      case 'auth/operation-not-allowed': return 'This sign-in method is disabled in your Firebase project.';
      case 'auth/network-request-failed': return 'Network error. Check your connection and try again.';
      case 'auth/invalid-email': return 'The email address is not valid.';
      case 'auth/unauthorized-continue-uri': return 'This domain is not authorized for email sign-in. Please check your Firebase console settings.';
      default: return 'An unexpected error occurred. Please try again.';
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading('google');
    setError('');
    setSuccessMessage('');
    try {
      provider.setCustomParameters({ prompt: 'select_account' });
      await auth.signInWithPopup(provider);
    } catch (err: any) {
      const code = err?.code as string | undefined;
      if (code === 'auth/popup-blocked') {
        try {
          await auth.signInWithRedirect(provider);
          return;
        } catch (redirErr) {
          console.error('Redirect sign-in failed:', redirErr);
          setError(errorMessageFromCode((redirErr as any)?.code));
        }
      } else {
        setError(errorMessageFromCode(code));
      }
    } finally {
      setLoading(null);
    }
  };
  
  const handleEmailLinkSignIn = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      setSuccessMessage('');
      return;
    }
    setLoading('email');
    setError('');
    setSuccessMessage('');
    try {
      const actionCodeSettings = {
        url: window.location.href,
        handleCodeInApp: true,
      };
      await auth.sendSignInLinkToEmail(email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setSuccessMessage('A sign-in link has been sent! Please check your inbox.');
    } catch (err: any) {
      console.error('Error sending email link:', err);
      setError(errorMessageFromCode(err?.code));
    } finally {
      setLoading(null);
    }
  };

  const handleAnonymousSignIn = async () => {
    const name = guestName.trim();
    if (name === '') {
      setError('Please enter a name to play as a guest.');
      setSuccessMessage('');
      return;
    }
    setLoading('anonymous');
    setError('');
    setSuccessMessage('');
    try {
      const userCredential = await auth.signInAnonymously();
      const user = userCredential.user;
      if (user) {
        await user.updateProfile({ displayName: name }).catch((e) => {
          console.warn('Failed to set displayName for anonymous user:', e);
        });
      }
    } catch (err: any) {
      console.error('Error signing in anonymously:', err);
      setError(err?.code === 'auth/operation-not-allowed'
        ? 'Anonymous sign-in is disabled for this Firebase project.'
        : 'Failed to sign in as guest. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E9] flex justify-center items-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-[#0D1B1E] p-10 md:p-12 flex flex-col justify-center text-[#F5F1E9] relative">
            <div className="absolute inset-0 opacity-10">
                 <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="a" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="scale(2) rotate(45)"><rect x="0" y="0" width="100%" height="100%" fill="none"/><path d="M1-5l-2 10m6 4l2-10m-8 2l-2 10m6 4l2-10M-3 5l-2 10m6 4l2-10m-8 2l-2 10m6 4l2-10" stroke-width="1" stroke="#2A4747" fill="none"/></pattern></defs><rect width="800%" height="800%" transform="translate(0,0)" fill="url(#a)"/></svg>
            </div>
          <h1 className="text-5xl font-extrabold tracking-tighter mb-4 z-10">Pin the Dot</h1>
          <p className="text-lg text-[#F5F1E9] opacity-80 z-10">A game of speed, precision, and fun. Sign in to save your score and hit the leaderboard.</p>
        </div>
        
        <div className="bg-white p-10">
          <h2 className="text-2xl font-bold text-[#0D1B1E] mb-6">Get Started</h2>
          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={!!loading}
              className="w-full flex items-center justify-center bg-white border border-gray-300 text-[#0D1B1E] font-semibold py-3 px-4 rounded-lg focus:outline-none hover:bg-gray-50 transition-colors duration-300 shadow-sm disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading === 'google' ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-[#0D1B1E]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.82l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
                  Sign in with Google
                </>
              )}
            </button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
              <div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-gray-500">or</span></div>
            </div>

            <div className="space-y-3">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" disabled={!!loading} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B55B3E] disabled:bg-slate-50 text-[#0D1B1E]"/>
              <button onClick={handleEmailLinkSignIn} disabled={!!loading} className="w-full flex items-center justify-center bg-[#2A4747] hover:bg-[#1f3535] text-white font-bold py-3 px-4 rounded-lg focus:outline-none transition-all duration-300 shadow-md disabled:opacity-75 disabled:cursor-not-allowed">
                {loading === 'email' ? (<><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Sending Link...</>) : ('Continue with Email')}
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Enter your name" disabled={!!loading} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B55B3E] disabled:bg-slate-50 text-[#0D1B1E]"/>
              <button onClick={handleAnonymousSignIn} disabled={!!loading} className="w-full flex items-center justify-center bg-[#B55B3E] hover:bg-[#a14f34] text-white font-bold py-3 px-4 rounded-lg focus:outline-none transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-75 disabled:cursor-not-allowed">
                {loading === 'anonymous' ? (<><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Entering...</>) : ('Play as Guest')}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
          {successMessage && <p className="text-green-600 text-sm text-center mt-4">{successMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default Login;