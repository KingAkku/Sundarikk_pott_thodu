import React from 'react';

interface ConnectionErrorProps {
    message: string;
}

const ConnectionError: React.FC<ConnectionErrorProps> = ({ message }) => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4 text-center">
      <div className="w-full max-w-md bg-gray-800 shadow-2xl rounded-2xl p-8 border border-red-500/50">
        <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728m-12.728 0a9 9 0 010-12.728m12.728 0L5.636 18.364m12.728 0L5.636 5.636"></path></svg>
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Connection Error</h1>
        <p className="text-gray-400 mb-6">
          {message}
        </p>
        <p className="text-xs text-gray-500">
          Please ensure you have created a Firestore database in your Firebase project.
        </p>
      </div>
    </div>
  );
};

export default ConnectionError;