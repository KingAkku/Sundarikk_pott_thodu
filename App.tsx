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
import ConnectionError from './components/ConnectionError';
import { Player } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameKey, setGameKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  // Effect to catch unhandled promise rejections, which can cause the "circular structure" error.
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      // Prevent the browser's default handling of the rejection, which might
      // try to log the raw error object and crash on circular structures.
      event.preventDefault();

      const reason = event.reason;
      if (reason instanceof FirebaseError) {
        // Specifically look for codes that indicate a connection problem
        if (reason.code === 'unavailable' || reason.message.includes('Could not reach Cloud Firestore backend')) {
          console.error('Caught unhandled Firestore connection error:', { code: reason.code, message: reason.message });
          setError("Could not connect to the game services. Please check your internet connection and ensure your Firestore database is set up correctly.");
        }
      } else {
        // Handle other types of unhandled rejections to prevent crashes
        console.error('Caught unhandled generic rejection:', reason);
        setError("An unexpected error occurred. Please try refreshing the page.");
      }
    };
    
    window.addEventListener('unhandledrejection', handleRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  useEffect(() => {
    // Auth state listener refactored to explicitly create plain objects for state,
    // preventing circular reference errors while preserving all functionality.
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          let playerProfile: Player;

          if (userSnap.exists()) {
            // Existing user: create a plain object from Firestore data
            const data = userSnap.data();
            playerProfile = {
              id: user.uid,
              name: data.name ?? 'Guest',
              score: data.score ?? 0,
              emailVerified: user.emailVerified,
              isAnonymous: user.isAnonymous,
            };
          } else {
            // New user: determine name and create a new plain object
            const providerId = user.providerData?.[0]?.providerId ?? null;
            let name = 'Guest';

            if (providerId === 'google.com' && user.displayName) {
              name = user.displayName;
            } else if (user.isAnonymous) {
              name = 'Guest Player';
            } else if (user.email) {
              name = user.email.split('@')[0];
            }

            playerProfile = {
              id: user.uid,
              name,
              score: 0,
              emailVerified: user.emailVerified,
              isAnonymous: user.isAnonymous,
            };

            // Persist new user to Firestore using a plain object
            const newUserDocData = { name: playerProfile.name, score: playerProfile.score };
            await setDoc(userRef, newUserDocData);

            // Send verification email in the background without blocking UI
            if (!user.isAnonymous && user.email && !user.emailVerified) {
              sendEmailVerification(user).catch((error) => {
                 let code = 'unknown';
                 let message = 'Error sending verification email.';
                 if (error instanceof FirebaseError) {
                     code = error.code;
                     message = error.message;
                 }
                 console.error('Error sending verification email:', { code, message });
              });
            }
          }
          setCurrentUser(playerProfile);
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
          setError("Could not connect to the game services. Please check your internet connection or try again later.");
          setCurrentUser(null);
      }
      finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // If there's already an error, don't try to fetch the leaderboard.
    if (error) return;

    const usersCollectionRef = collection(db, 'users');
    const q = query(usersCollectionRef, orderBy('score', 'desc'), limit(10));

    // Leaderboard listener refactored to use .map for a more concise functional approach.
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const leaderboardPlayers: Player[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            emailVerified: false, // Not needed for leaderboard display
            name: data?.name ?? 'Guest',
            score: data?.score ?? 0,
            isAnonymous: data?.isAnonymous ?? false,
          };
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
        setError("Could not load the leaderboard due to a connection issue.");
      }
    );

    return () => unsubscribe();
  }, [error]);

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

  if (error) {
    return <ConnectionError message={error} />;
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