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
  const hasPlaceholderValues = (config: object): boolean => {
    for (const value of Object.values(config)) {
      if (typeof value === 'string' && /YOUR_|REPLACE_ME|PROJECT_ID|YOUR_API_KEY/i.test(value)) {
        return true;
      }
    }
    return false;
  };

  const isFirebaseConfigInvalid =
    !firebaseConfig ||
    !firebaseConfig.apiKey ||
    !firebaseConfig.authDomain ||
    !firebaseConfig.projectId ||
    hasPlaceholderValues(firebaseConfig);

  if (isFirebaseConfigInvalid) {
    return <FirebaseNotConfigured />;
  }

  /**
   * Fetches an existing player profile from Firestore or creates a new one for a new user.
   * @param user The Firebase authenticated user object.
   * @returns A promise that resolves to a Player profile object.
   */
  const getPlayerProfile = async (user: User): Promise<Player> => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        id: user.uid,
        name: data.name ?? 'Guest',
        score: data.score ?? 0,
        emailVerified: user.emailVerified,
        isAnonymous: user.isAnonymous,
      };
    } else {
      const providerId = user.providerData?.[0]?.providerId ?? null;
      let name = 'Guest';
      if (providerId === 'google.com' && user.displayName) {
        name = user.displayName;
      } else if (user.isAnonymous) {
        name = 'Guest Player';
      } else if (user.email) {
        name = user.email.split('@')[0];
      }

      const newPlayerProfile: Player = {
        id: user.uid,
        name,
        score: 0,
        emailVerified: user.emailVerified,
        isAnonymous: user.isAnonymous,
      };
      
      // Don't save guest user profiles to the database
      if (!newPlayerProfile.isAnonymous) {
        await setDoc(userRef, { name: newPlayerProfile.name, score: newPlayerProfile.score, isAnonymous: false });

        if (user.email && !user.emailVerified) {
          sendEmailVerification(user).catch((err) => {
            console.error("Failed to send verification email.", err instanceof FirebaseError ? { code: err.code, message: err.message } : err);
          });
        }
      }
      return newPlayerProfile;
    }
  };
  
  // Global error handler to catch unhandled promise rejections
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      // Prevent the browser's default handler which can crash the app
      event.preventDefault();

      let code = 'unknown';
      let message = 'An unexpected error occurred.';

      if (event.reason instanceof FirebaseError) {
        code = event.reason.code;
        message = event.reason.message;
      } else if (event.reason instanceof Error) {
        message = event.reason.message;
      }

      console.error('Unhandled Promise Rejection:', { code, message });
      setError("Could not connect to services. Please check your connection and that Firestore is enabled.");
    };

    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const profile = await getPlayerProfile(user);
          setCurrentUser(profile);
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
    if (error || !currentUser) return; // Don't fetch leaderboard if there's an error or no user

    const usersCollectionRef = collection(db, 'users');
    const q = query(usersCollectionRef, orderBy('score', 'desc'), limit(10));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const leaderboardPlayers: Player[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            emailVerified: false, 
            name: data?.name ?? 'Guest',
            score: data?.score ?? 0,
            isAnonymous: data?.isAnonymous ?? false, // Ensure consistency
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
  }, [error, currentUser]);

  const handleScoreUpdate = useCallback(
    async (score: number) => {
      if (!currentUser) return;

      setCurrentUser((prev) => (prev ? { ...prev, score: prev.score + score } : prev));

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
        // Revert local score update on failure
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