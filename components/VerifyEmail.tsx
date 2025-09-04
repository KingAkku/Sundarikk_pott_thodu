// filename: src/components/VerifyEmail.tsx
import React, { useState } from 'react';
import firebase from 'firebase/compat/app';

interface VerifyEmailProps {
  user: firebase.User | null;
  onSignOut: () => void;
}

const VerifyEmail: React.FC<VerifyEmailProps> = ({ user, onSignOut }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResendVerification = async () => {
    if (!user) return;
    try {
      await user.sendEmailVerification();
      setMessage('A new verification email has been sent. Please check your inbox.');
    } catch (error: any) {
      console.error('Error resending verification email:', error);
      if (error.code === 'auth/too-many-requests') {
        setMessage('Too many requests. Please wait a few minutes before trying again.');
      } else {
        setMessage('Failed to send verification email. Please try again later.');
      }
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-2xl rounded-2xl p-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Verify Your Email</h1>
          <p className="text-slate-600 mb-6">
            A verification link has been sent to <strong>{user?.email ?? 'your email'}</strong>. Please click the link to continue.
          </p>

          <div className="space-y-4">
            <button
              onClick={handleReload}
              disabled={isLoading}
              className="w-full flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline-indigo transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Checking...
                </>
              ) : (
                "I've Verified - Continue"
              )}
            </button>
            <button
              onClick={handleResendVerification}
              disabled={isLoading}
              className="w-full bg-gray-200 hover:bg-gray-300 text-slate-700 font-bold py-2 px-4 rounded-lg focus:outline-none transition-colors duration-300 disabled:opacity-75"
            >
              Resend Verification Email
            </button>
          </div>

          {message && <p className="text-sm text-green-600 mt-4">{message}</p>}

          <p className="text-center text-xs text-slate-400 mt-8">
            Wrong account?{' '}
            <button onClick={onSignOut} className="font-semibold text-indigo-600 hover:underline">
              Sign Out
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
