import React, { useState, useCallback, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signOut, 
  sendEmailVerification, 
  User,
  isSignInWithEmailLink,
  signInWithEmailLink
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  increment,
} from 'firebase/firestore';
import Sidebar from './components/Sidebar';
import GameCanvas from './components/GameCanvas';
import Login from './components/Login';
import VerifyEmail from './components/VerifyEmail';
import { Player } from './types';
import { auth, db, firebaseConfig } from './firebaseConfig';
import FirebaseNotConfigured from './components/FirebaseNotConfigured';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameKey, setGameKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if Firebase config is still using placeholder values
  if (firebaseConfig.apiKey.startsWith('AIzaSyA') && firebaseConfig.apiKey.includes('YOUR_API_KEY')) {
    return <FirebaseNotConfigured />;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in. Process their data.
        setFirebaseUser(user);
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setCurrentUser({
            id: user.uid,
            emailVerified: user.emailVerified,
            ...userSnap.data(),
          } as Player);
        } else {
          // New user
          const newUser: Player = {
            id: user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'Anonymous',
            score: 0,
            emailVerified: user.emailVerified,
          };
          await setDoc(userRef, { name: newUser.name, score: newUser.score });
          setCurrentUser(newUser);
          
          if (!user.emailVerified) {
            try {
              await sendEmailVerification(user);
            } catch (error) {
              console.error("Error sending verification email:", error);
            }
          }
        }
        setIsLoading(false);
      } else {
        // No user is signed in. Check if it's an email link sign-in attempt.
        if (isSignInWithEmailLink(auth, window.location.href)) {
          let email = window.localStorage.getItem('emailForSignIn');
          if (!email) {
            email = window.prompt('Please provide your email for confirmation');
          }
          if (email) {
            try {
              // This will sign the user in and trigger onAuthStateChanged again with a user object.
              // We don't set loading to false here; we wait for the next auth state change.
              await signInWithEmailLink(auth, email, window.location.href);
              window.localStorage.removeItem('emailForSignIn');
              window.history.replaceState({}, document.title, window.location.pathname);
            } catch (error) {
              console.error("Error signing in with email link:", error);
              window.localStorage.removeItem('emailForSignIn');
              // Sign-in failed. Set user to null and stop loading.
              setCurrentUser(null);
              setFirebaseUser(null);
              setIsLoading(false);
            }
          } else {
            // No email provided for link sign-in. We are not logged in. Stop loading.
            setCurrentUser(null);
            setFirebaseUser(null);
            setIsLoading(false);
          }
        } else {
          // Not an email sign-in link, and no user. We are not logged in. Stop loading.
          setCurrentUser(null);
          setFirebaseUser(null);
          setIsLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const usersCollectionRef = collection(db, 'users');
    const q = query(usersCollectionRef, orderBy('score', 'desc'), limit(10));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
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

    const userRef = doc(db, "users", currentUser.id);
    await updateDoc(userRef, {
      score: increment(score)
    });

    setCurrentUser(prevUser => prevUser ? { ...prevUser, score: prevUser.score + score } : null);
  }, [currentUser]);

  const handleNewGame = useCallback(() => {
    setGameKey(prevKey => prevKey + 1);
  }, []);
  
  const handleSignOut = async () => {
    try {
      await signOut(auth);
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