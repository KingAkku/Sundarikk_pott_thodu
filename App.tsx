// FIX: Import firebase and use v8 syntax for auth and firestore to match dependency version.
import React, { useState, useCallback, useEffect } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import Sidebar from './components/Sidebar';
import GameCanvas from './components/GameCanvas';
import Login from './components/Login';
import VerifyEmail from './components/VerifyEmail';
import { Player } from './types';
import { auth, db, firebaseConfig } from './firebaseConfig';
import FirebaseNotConfigured from './components/FirebaseNotConfigured';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  // FIX: User type is now firebase.User.
  const [firebaseUser, setFirebaseUser] = useState<firebase.User | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameKey, setGameKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if Firebase config is still using placeholder values
  if (firebaseConfig.apiKey.startsWith('AIzaSyA') && firebaseConfig.apiKey.includes('YOUR_API_KEY')) {
    return <FirebaseNotConfigured />;
  }

  useEffect(() => {
    // FIX: Use auth.onAuthStateChanged for v8 compatibility.
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setFirebaseUser(user);
        // FIX: Use v8 firestore syntax.
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
          // FIX: Use v8 firestore syntax.
          await userRef.set({ name: newUser.name, score: newUser.score });
          setCurrentUser(newUser);
          
          // Send verification email for new users
          if (!user.emailVerified) {
            try {
              // FIX: Use user.sendEmailVerification for v8 compatibility.
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
    // FIX: Use v8 firestore query syntax.
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

    // FIX: Use v8 firestore syntax.
    const userRef = db.collection("users").doc(currentUser.id);
    await userRef.update({
      // FIX: Use firebase.firestore.FieldValue.increment for v8 compatibility.
      score: firebase.firestore.FieldValue.increment(score)
    });

    setCurrentUser(prevUser => prevUser ? { ...prevUser, score: prevUser.score + score } : null);
  }, [currentUser]);

  const handleNewGame = useCallback(() => {
    setGameKey(prevKey => prevKey + 1);
  }, []);
  
  const handleSignOut = async () => {
    try {
      // FIX: Use auth.signOut for v8 compatibility.
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
