import React, { useState } from 'react';
// FIX: Using Firebase v8 compatible imports and types.
import firebase from 'firebase/app';
import 'firebase/auth';


interface VerifyEmailProps {
    // FIX: Using Firebase v8 user type.
    user: firebase.User | null;
    onSignOut: () => void;
}

const VerifyEmail: React.FC<VerifyEmailProps> = ({ user, onSignOut }) => {
    const [message, setMessage] = useState('');

    const handleResendVerification = async () => {
        if (user) {
            try {
                // FIX: Using Firebase v8 user.sendEmailVerification method.
                await user.sendEmailVerification();
                setMessage('A new verification email has been sent. Please check your inbox.');
            } catch (error: any) {
                console.error("Error resending verification email:", error);
                if (error.code === 'auth/too-many-requests') {
                    setMessage('Too many requests. Please wait a few minutes before trying again.');
                } else {
                    setMessage('Failed to send verification email. Please try again later.');
                }
            }
        }
    };

    const handleReload = () => {
        window.location.reload();
    }

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white shadow-2xl rounded-2xl p-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-800 mb-4">Verify Your Email</h1>
                    <p className="text-slate-600 mb-6">
                        A verification link has been sent to <strong>{user?.email}</strong>. Please click the link to continue.
                    </p>

                    <div className="space-y-4">
                        <button
                            onClick={handleReload}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline-indigo transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                            I've Verified - Continue
                        </button>
                        <button
                            onClick={handleResendVerification}
                            className="w-full bg-gray-200 hover:bg-gray-300 text-slate-700 font-bold py-2 px-4 rounded-lg focus:outline-none transition-colors duration-300"
                        >
                            Resend Verification Email
                        </button>
                    </div>

                    {message && <p className="text-sm text-green-600 mt-4">{message}</p>}
                    
                    <p className="text-center text-xs text-slate-400 mt-8">
                        Wrong account? <button onClick={onSignOut} className="font-semibold text-indigo-600 hover:underline">Sign Out</button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;