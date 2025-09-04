import React, { useState, useCallback, useEffect } from 'react';
import type firebaseCompat from 'firebase/compat/app';
import { auth, db, firebaseConfig, firebase } from './firebaseConfig';
import Sidebar from './components/Sidebar';
import GameCanvas from './components/GameCanvas';
import Login from './components/Login';
import VerifyEmail from './components/VerifyEmail';
import FirebaseNotConfigured from './components/FirebaseNotConfigured';
import { Player } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<firebaseCompat.User | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameKey, setGameKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // If you really want a guard here, make it robust to avoid false positives.
  const looksLikePlaceholder =
    !firebaseConfig?.apiKey ||
    /YOUR_|REPLACE_ME|PROJECT_ID|YOUR_API_KEY/.test(JSON.stringify(firebaseConfig));

  if (looksLikePlaceholder) {
    return <FirebaseNotConfigured />;
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          setFirebaseUser(user);
          const userRef = db.collection('users').doc(user.uid);
          const userSnap = await userRef.get();

          if (userSnap.exists) {
            const data = userSnap.data() || {};
            setCurrentUser({
              id: user.uid,
              emailVerified: user.emailVerified,
              ...(data as Omit<Player, 'id' | 'emailVerified'>),
            });
          } else {
            // New user
            const providerId = user.providerData?.[0]?.providerId ?? null;
            let name = 'Guest';

            if (user.isAnonymous && user.displayName) {
              name = user.displayName;
            } else if (providerId === 'google.com' && user.displayName) {
              name = user.displayName;
            } else if (user.email) {
              name = user.email.split('@')[0];
            }

            const newUser: Player = {
              id: user.uid,
              name,
              score: 0,
              emailVerified: user.emailVerified,
            };

            await userRef.set({ name: newUser.name, score: newUser.score });

            setCurrentUser(newUser);

            if (!user.isAnonymous && user.email && !user.emailVerified) {
              try {
                await user.sendEmailVerification();
              } catch (error) {
                console.error('Error sending verification email:', error);
              }
            }
          }
        } else {
          setCurrentUser(null);
          setFirebaseUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const usersCollectionRef = db.collection('users');
    const q = usersCollectionRef.orderBy('score', 'desc').limit(10);

    const unsubscribe = q.onSnapshot(
      (querySnapshot) => {
        const leaderboardPlayers: Player[] = [];
        querySnapshot.forEach((doc) => {
          leaderboardPlayers.push({
            id: doc.id,
            emailVerified: false,
            ...(doc.data() as Omit<Player, 'id' | 'emailVerified'>),
          });
        });
        setPlayers(leaderboardPlayers);
      },
      (err) => {
        console.error('Leaderboard snapshot error:', err);
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
      const isAnonymous = firebaseUser?.isAnonymous === true;
      if (isAnonymous) return;

      try {
        const userRef = db.collection('users').doc(currentUser.id);
        await userRef.update({
          score: firebase.firestore.FieldValue.increment(score),
        });
      } catch (e) {
        console.error('Failed to persist score:', e);
        // Optional: rollback local increment on failure
        setCurrentUser((prev) => (prev ? { ...prev, score: prev.score - score } : prev));
      }
    },
    [currentUser, firebaseUser]
  );

  const handleNewGame = useCallback(() => {
    setGameKey((prevKey) => prevKey + 1);
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setCurrentUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isAnonymousUser = firebaseUser?.isAnonymous === true;
  const isEmailVerifiedUser = firebaseUser?.emailVerified === true;

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

  if (!isAnonymousUser && !isEmailVerifiedUser) {
    return <VerifyEmail user={firebaseUser} onSignOut={handleSignOut} />;
  }

  return (
    <div className="flex h-screen w-screen bg-slate-900 text-white overflow-hidden">
      <Sidebar players={players} currentUser={currentUser} onNewGame={handleNewGame} />
      <main className="flex-1 bg-slate-100">
        <GameCanvas key={gameKey} onScoreUpdate={handleScoreUpdate} />
      </main>
    </div>
  );
};

export default App;
