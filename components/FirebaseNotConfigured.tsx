import React from 'react';

const FirebaseNotConfigured: React.FC = () => {
  return (
    <div className="min-h-screen bg-red-50 flex flex-col justify-center items-center p-4 text-center">
      <div className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl p-8 border-4 border-red-300">
        <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Firebase Not Configured</h1>
        <p className="text-slate-600 mb-6">
          It looks like the application is not connected to a Firebase project. You need to add your project's configuration to get started.
        </p>
        
        <div className="bg-slate-100 p-4 rounded-lg text-left">
          <p className="font-semibold text-slate-700">Action Required:</p>
          <ol className="list-decimal list-inside mt-2 text-slate-600 space-y-2">
            <li>Go to your Firebase project's settings page in the Firebase Console.</li>
            <li>Find your project's configuration credentials (apiKey, authDomain, etc.).</li>
            <li>Open the file <code className="bg-slate-200 text-red-600 px-1 py-0.5 rounded font-mono text-sm">firebaseConfig.ts</code> in your code editor.</li>
            <li>Replace the placeholder values with your actual Firebase credentials.</li>
          </ol>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Once you have configured the file, the application will reload and work correctly.
        </p>
      </div>
    </div>
  );
};

export default FirebaseNotConfigured;
