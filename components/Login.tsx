import React, { useState } from 'react';
import { Player } from '../types';

interface LoginProps {
  onLogin: (user: Player) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<'google' | 'anonymous' | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading('google');
    setError('');
    // Simulate a network request
    setTimeout(() => {
      const mockGoogleUser: Player = {
        id: 'user_google_123',
        name: 'Jane Doe',
        score: 0,
        emailVerified: true,
        isAnonymous: false,
      };
      onLogin(mockGoogleUser);
      setLoading(null);
    }, 1000);
  };
  
  const handleAnonymousSignIn = async () => {
    setLoading('anonymous');
    setError('');
    // Simulate a network request
    setTimeout(() => {
      const mockGuestUser: Player = {
        id: 'user_guest_456',
        name: 'Guest Player',
        score: 0,
        emailVerified: false,
        isAnonymous: true,
      };
      onLogin(mockGuestUser);
      setLoading(null);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-gray-800">
      <div className="w-full max-w-xs text-center">
        <h1 className="text-3xl font-bold mb-8">🎯 Pin the Dot Game</h1>
  
        <div className="flex flex-col gap-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={!!loading}
            className="w-full flex items-center justify-center px-6 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed font-medium"
          >
            {loading === 'google' ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
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
            className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading === 'anonymous' ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>Entering...</span>
              </>
            ) : (
              'Play as Guest'
            )}
          </button>
        </div>
        
        {error && <p className="text-red-600 text-sm text-center mt-6">{error}</p>}
      </div>
    </div>
  );
};

export default Login;
