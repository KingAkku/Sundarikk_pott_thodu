import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import GameCanvas from './components/GameCanvas';
import Login from './components/Login';
import { Player } from './types';
import { auth, db } from './firebaseConfig';
// FIX: Use Firebase v8 compat imports to resolve module errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameKey, setGameKey] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // FIX: Use Firebase v8 compat syntax for onAuthStateChanged
    const unsubscribeAuth = auth.onAuthStateChanged(async (user: firebase.User | null) => {
      if (user) {
        // FIX: Use Firebase v8 compat syntax for Firestore document reference
        const userRef = db.collection("users").doc(user.uid);
        
        // FIX: Use Firebase v8 compat syntax for getDoc
        const docSnap = await userRef.get();

        if (!docSnap.exists) {
            // FIX: Use Firebase v8 compat syntax for setDoc and serverTimestamp
            await userRef.set({
                uid: user.uid,
                name: user.displayName || 'Anonymous',
                email: user.email,
                photoURL: user.photoURL,
                score: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            });
        } else {
            // FIX: Use Firebase v8 compat syntax for updateDoc and serverTimestamp
            await userRef.update({
                name: user.displayName,
                photoURL: user.photoURL,
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            });
        }

        // FIX: Use Firebase v8 compat syntax for onSnapshot
        const unsubscribeUser = userRef.onSnapshot((doc) => {
          if (doc.exists) {
              setCurrentUser(doc.data() as Player);
          }
        });

        // FIX: Use Firebase v8 compat syntax for queries
        const playersQuery = db.collection("users").orderBy("score", "desc").limit(10);
        const unsubscribePlayers = playersQuery.onSnapshot((snapshot) => {
            setPlayers(snapshot.docs.map(doc => doc.data() as Player));
        });
        
        setLoading(false);

        return () => {
            unsubscribeUser();
            unsubscribePlayers();
        };
      } else {
        setCurrentUser(null);
        setPlayers([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleScoreUpdate = useCallback(async (score: number) => {
    if (!currentUser) return;
    // FIX: Use Firebase v8 compat syntax for document reference and updateDoc
    const userRef = db.collection("users").doc(currentUser.uid);
    // FIX: Use Firebase v8 compat syntax for increment
    await userRef.update({
        score: firebase.firestore.FieldValue.increment(score)
    });
  }, [currentUser]);

  const handleNewGame = useCallback(() => {
    setGameKey(prevKey => prevKey + 1);
  }, []);
  
  if (loading) {
    return (
        <div className="flex h-screen w-screen bg-slate-900 text-white justify-center items-center">
            <p className="text-xl animate-pulse">Loading...</p>
        </div>
    );
  }

  if (!currentUser) {
    return <Login />;
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
