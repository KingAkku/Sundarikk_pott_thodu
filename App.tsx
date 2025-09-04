import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import GameCanvas from './components/GameCanvas';
import Login from './components/Login';
import VerifyEmail from './components/VerifyEmail';
import { Player } from './types';
import { auth, db, firebaseConfig } from './firebaseConfig';
import FirebaseNotConfigured from './components/FirebaseNotConfigured';

// Fix: The modular v9 imports are failing. Switched to v8-compat API style.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
// Fix: Define User type from the firebase object.
type User = firebase.User;


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameKey, setGameKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if Firebase config is still using placeholder values
  if (firebaseConfig.apiKey === 'YOUR_API_KEY') {
    return <FirebaseNotConfigured />;
  }

  useEffect(() => {
    // Fix: Use v8 compat API for onAuthStateChanged
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setFirebaseUser(user);
        // Fix: Use v8 compat API for Firestore document reference
        const userRef = db.collection('users').doc(user.uid);
        // Fix: Use v8 compat API to get document
        const userSnap = await userRef.get();

        // Fix: use .exists property instead of .exists() method
        if (userSnap.exists) {
          setCurrentUser({
            id: user.uid,
            emailVerified: user.emailVerified,
            ...userSnap.data(),
          } as Player);
        } else {
          // New user
          const newUser: Player = {
            id: user.uid,
            name: user.displayName || 'Anonymous',
            score: 0,
            emailVerified: user.emailVerified,
          };
          // Fix: Use v8 compat API to set document
          await userRef.set({ name: newUser.name, score: newUser.score });
          setCurrentUser(newUser);
          
          // Send verification email for new users
          if (!user.emailVerified) {
            try {
              // Fix: Use v8 compat API to send verification email
              await user.sendEmailVerification();
            } catch (error) {
              console.error("Error sending verification email:", error);
            }
          }
        }
      } else {
        setCurrentUser(null);
        setFirebaseUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Fix: Use v8 compat API for collection and query
    const usersCollectionRef = db.collection('users');
    const q = usersCollectionRef.orderBy('score', 'desc').limit(10);
    
    // Fix: Use v8 compat API for onSnapshot
    const unsubscribe = q.onSnapshot((querySnapshot) => {
      const leaderboardPlayers: Player[] = [];
      querySnapshot.forEach((doc) => {
        leaderboardPlayers.push({ id: doc.id, emailVerified: false, ...doc.data() } as Player);
      });
      setPlayers(leaderboardPlayers);
    });

    return () => unsubscribe();
  }, []);

  const handleScoreUpdate = useCallback(async (score: number) => {
    if (!currentUser) return;

    // Fix: Use v8 compat API for document reference
    const userRef = db.collection("users").doc(currentUser.id);
    // Fix: Use v8 compat API for update and increment
    await userRef.update({
      score: firebase.firestore.FieldValue.increment(score)
    });

    setCurrentUser(prevUser => prevUser ? { ...prevUser, score: prevUser.score + score } : null);
  }, [currentUser]);

  const handleNewGame = useCallback(() => {
    setGameKey(prevKey => prevKey + 1);
  }, []);
  
  const handleSignOut = async () => {
    try {
      // Fix: Use v8 compat API for signOut
      await auth.signOut();
      setCurrentUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen justify-center items-center bg-slate-900">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }
  
  if (!currentUser.emailVerified) {
    return <VerifyEmail user={firebaseUser} onSignOut={handleSignOut} />;
  }

  return (
    <div className="flex h-screen w-screen bg-slate-900 text-white overflow-hidden">
      <Sidebar 
        players={players} 
        currentUser={currentUser} 
        onNewGame={handleNewGame} 
      />
      <main className="flex-1 bg-slate-100">
        <GameCanvas 
          key={gameKey} 
          onScoreUpdate={handleScoreUpdate} 
        />
      </main>
    </div>
  );
};

export default App;