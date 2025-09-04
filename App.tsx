import React, { useState, useCallback, useEffect } from 'react';
import { auth, db, firebaseConfig } from './firebaseConfig';
import { onAuthStateChanged, User, sendEmailVerification } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
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
import FirebaseNotConfigured from './components/FirebaseNotConfigured';
import { Player } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameKey, setGameKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper function to safely check for placeholder strings in config values
  // without using JSON.stringify, which can fail on circular structures.
  const hasPlaceholderValues = (config: object): boolean => {
    for (const value of Object.values(config)) {
      if (typeof value === 'string' && /YOUR_|REPLACE_ME|PROJECT_ID|YOUR_API_KEY/i.test(value)) {
        return true;
      }
    }
    return false;
  };

  // Enhanced check to be more robust against incomplete or placeholder configurations.
  const isFirebaseConfigInvalid =
    !firebaseConfig ||
    !firebaseConfig.apiKey ||
    !firebaseConfig.authDomain ||
    !firebaseConfig.projectId ||
    hasPlaceholderValues(firebaseConfig);

  if (isFirebaseConfigInvalid) {
    return <FirebaseNotConfigured />;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setCurrentUser({
              id: user.uid,
              emailVerified: user.emailVerified,
              name: data?.name ?? 'Guest',
              score: data?.score ?? 0,
              isAnonymous: user.isAnonymous,
            });
          } else {
            // New user
            const providerId = user.providerData?.[0]?.providerId ?? null;
            let name = 'Guest'; // Default name

            if (providerId === 'google.com' && user.displayName) {
              name = user.displayName;
            } else if (user.isAnonymous) {
              name = 'Guest Player';
            } else if (user.email) {
              name = user.email.split('@')[0];
            }

            const newUser: Player = {
              id: user.uid,
              name,
              score: 0,
              emailVerified: user.emailVerified,
              isAnonymous: user.isAnonymous,
            };

            await setDoc(userRef, { name: newUser.name, score: newUser.score });

            setCurrentUser(newUser);

            if (!user.isAnonymous && user.email && !user.emailVerified) {
              try {
                // We can still send the verification email in the background
                // but we won't block the user from playing.
                await sendEmailVerification(user);
              } catch (error) {
                let code = 'unknown';
                let message = 'Error sending verification email.';
                if (error instanceof FirebaseError) {
                    code = error.code;
                    message = error.message;
                }
                console.error('Error sending verification email:', { code, message });
              }
            }
          }
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
          let code = 'unknown';
          let message = 'An unexpected error occurred during auth state change.';
          if (error instanceof FirebaseError) {
              code = error.code;
              message = error.message;
          }
          console.error("Error during authentication state change:", { code, message });
          // Set user to null to prevent being stuck in a broken state
          setCurrentUser(null);
      }
      finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const usersCollectionRef = collection(db, 'users');
    const q = query(usersCollectionRef, orderBy('score', 'desc'), limit(10));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const leaderboardPlayers: Player[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          leaderboardPlayers.push({
            id: doc.id,
            emailVerified: false, // Not needed for leaderboard display
            name: data?.name ?? 'Guest',
            score: data?.score ?? 0,
            isAnonymous: data?.isAnonymous ?? false,
          });
        });
        setPlayers(leaderboardPlayers);
      },
      (err) => {
        let code = 'unknown';
        let message = 'An unexpected error occurred fetching the leaderboard.';
        if (err instanceof FirebaseError) {
            code = err.code;
            message = err.message;
        }
        console.error('Leaderboard snapshot error:', { code, message });
      }
    );

    return () => unsubscribe();
  }, []);

  const handleScoreUpdate = useCallback(
    async (score: number) => {
      if (!currentUser) return;

      // UI feedback
      setCurrentUser((prev) => (prev ? { ...prev, score: prev.score + score } : prev));

      // Only persist for non-anonymous users
      if (currentUser.isAnonymous) return;

      try {
        const userRef = doc(db, 'users', currentUser.id);
        await updateDoc(userRef, {
          score: increment(score),
        });
      } catch (error) {
        let code = 'unknown';
        let message = 'Failed to persist score.';
        if (error instanceof FirebaseError) {
            code = error.code;
            message = error.message;
        }
        console.error('Failed to persist score:', { code, message });
        // Optional: rollback local increment on failure
        setCurrentUser((prev) => (prev ? { ...prev, score: prev.score - score } : prev));
      }
    },
    [currentUser]
  );

  const handleNewGame = useCallback(() => {
    setGameKey((prevKey) => prevKey + 1);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen justify-center items-center bg-[#0D1B1E]">
        <p className="text-[#F5F1E9] text-xl">Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-[#0D1B1E] text-white overflow-hidden">
      <Sidebar players={players} currentUser={currentUser} onNewGame={handleNewGame} />
      <main className="flex-1 bg-slate-100">
        <GameCanvas key={gameKey} onScoreUpdate={handleScoreUpdate} />
      </main>
    </div>
  );
};

export default App;