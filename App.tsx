import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import GameCanvas from './components/GameCanvas';
import Login from './components/Login';
import { Player } from './types';
import { auth, db } from './firebaseConfig';
// FIX: Use firebase v8 compat syntax. `onAuthStateChanged` is a method on the auth instance. `User` type will be inferred.
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameKey, setGameKey] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // FIX: Use v8 compat `auth.onAuthStateChanged` method.
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // FIX: Use v8 compat Firestore syntax.
        const userRef = db.collection("users").doc(user.uid);
        
        const docSnap = await userRef.get();
        // FIX: `exists` is a property in v8, not a function.
        if (!docSnap.exists) {
            // FIX: Use v8 compat `set` and `FieldValue.serverTimestamp`.
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
            // FIX: Use v8 compat `update` and `FieldValue.serverTimestamp`.
            await userRef.update({
                name: user.displayName,
                photoURL: user.photoURL,
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            });
        }

        // FIX: Use v8 compat `onSnapshot` method on the document reference.
        const unsubscribeUser = userRef.onSnapshot((doc) => {
          if (doc.exists) {
              setCurrentUser(doc.data() as Player);
          }
        });

        // FIX: Use v8 compat query syntax.
        const playersQuery = db.collection("users").orderBy("score", "desc").limit(10);
        // FIX: Use v8 compat `onSnapshot` method on the query.
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
    // FIX: Use v8 compat Firestore syntax.
    const userRef = db.collection("users").doc(currentUser.uid);
    // FIX: Use v8 compat `update` and `FieldValue.increment`.
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
