import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import GameCanvas from './components/GameCanvas';
import Login from './components/Login';
import VerifyEmail from './components/VerifyEmail';
import { Player } from './types';
import { auth, db, firebaseConfig } from './firebaseConfig';
import FirebaseNotConfigured from './components/FirebaseNotConfigured';
// FIX: Using Firebase v8 compatible imports for types and side-effects.
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

// FIX: Using Firebase v8 compatible type for User.
type User = firebase.User;


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameKey, setGameKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if Firebase config is using placeholder values
  if (firebaseConfig.apiKey === 'YOUR_API_KEY') {
    return <FirebaseNotConfigured />;
  }

  useEffect(() => {
    // FIX: Using Firebase v8 auth.onAuthStateChanged method.
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setFirebaseUser(user);
        // FIX: Using Firebase v8 firestore syntax.
        const userRef = db.collection('users').doc(user.uid);
        const userSnap = await userRef.get();

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
          // FIX: Using Firebase v8 firestore syntax.
          await userRef.set({ name: newUser.name, score: newUser.score });
          setCurrentUser(newUser);
          
          // Send verification email for new users
          if (!user.emailVerified) {
            try {
              // FIX: Using Firebase v8 user.sendEmailVerification method.
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
    // FIX: Using Firebase v8 firestore syntax.
    const usersCollectionRef = db.collection('users');
    const q = usersCollectionRef.orderBy('score', 'desc').limit(10);
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

    // FIX: Using Firebase v8 firestore syntax.
    const userRef = db.collection("users").doc(currentUser.id);
    await userRef.update({
      // FIX: Using Firebase v8 FieldValue.increment.
      score: firebase.firestore.FieldValue.increment(score)
    });

    setCurrentUser(prevUser => prevUser ? { ...prevUser, score: prevUser.score + score } : null);
  }, [currentUser]);

  const handleNewGame = useCallback(() => {
    setGameKey(prevKey => prevKey + 1);
  }, []);
  
  const handleSignOut = async () => {
    try {
      // FIX: Using Firebase v8 auth.signOut method.
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