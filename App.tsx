import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import GameCanvas from './components/GameCanvas';
import Login from './components/Login';
import VerifyEmail from './components/VerifyEmail';
import { Player } from './types';
import { auth, db, firebaseConfig } from './firebaseConfig'; // Import firebaseConfig
import FirebaseNotConfigured from './components/FirebaseNotConfigured'; // Import the new component
// FIX: Import firebase for v8 compatibility, specifically for FieldValue.
import firebase from 'firebase/app';


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameKey, setGameKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if Firebase config is using placeholder values
  if (firebaseConfig.apiKey === 'YOUR_API_KEY') {
    return <FirebaseNotConfigured />;
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // FIX: Use v8 namespaced API to get a document reference and fetch data.
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
          // FIX: Use v8 namespaced API to set document data.
          await userRef.set({ name: newUser.name, score: newUser.score });
          setCurrentUser(newUser);
          
          // Send verification email for new users
          if (!user.emailVerified) {
            try {
              await user.sendEmailVerification();
            } catch (error) {
              console.error("Error sending verification email:", error);
            }
          }
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // FIX: Use v8 namespaced API to query the collection and listen for snapshots.
    const usersCollection = db.collection('users');
    const q = usersCollection.orderBy('score', 'desc').limit(10);
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

    // FIX: Use v8 namespaced API to get a document reference.
    const userRef = db.collection("users").doc(currentUser.id);
    // FIX: Use v8 namespaced API to update the score using FieldValue.increment.
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
    return <VerifyEmail user={auth.currentUser} onSignOut={handleSignOut} />;
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