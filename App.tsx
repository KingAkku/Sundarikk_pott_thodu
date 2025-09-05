
import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import GameCanvas from './components/GameCanvas';
import Login from './components/Login';
import { Player } from './types';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, onSnapshot, collection, query, orderBy, limit, serverTimestamp, updateDoc, increment, getDoc } from 'firebase/firestore';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameKey, setGameKey] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists()) {
            await setDoc(userRef, {
                uid: user.uid,
                name: user.displayName || 'Anonymous',
                email: user.email,
                photoURL: user.photoURL,
                score: 0,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
            });
        } else {
            await updateDoc(userRef, {
                name: user.displayName,
                photoURL: user.photoURL,
                lastLogin: serverTimestamp(),
            });
        }

        const unsubscribeUser = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
              setCurrentUser(doc.data() as Player);
          }
        });

        const playersQuery = query(collection(db, "users"), orderBy("score", "desc"), limit(10));
        const unsubscribePlayers = onSnapshot(playersQuery, (snapshot) => {
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
    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, {
        score: increment(score)
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
