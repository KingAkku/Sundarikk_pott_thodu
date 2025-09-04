import React, { useState, useCallback, useEffect } from 'react';
import { Player } from './types';
import Sidebar from './components/Sidebar';
import GameCanvas from './components/GameCanvas';
import Login from './components/Login';

const MOCK_LEADERBOARD: Player[] = [
  { id: '1', name: 'Alice', score: 150, emailVerified: true, isAnonymous: false },
  { id: '2', name: 'Bob', score: 125, emailVerified: true, isAnonymous: false },
  { id: '3', name: 'Charlie', score: 110, emailVerified: true, isAnonymous: false },
  { id: '4', name: 'David', score: 95, emailVerified: true, isAnonymous: false },
  { id: '5', name: 'Eve', score: 80, emailVerified: true, isAnonymous: false },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>(MOCK_LEADERBOARD);
  const [gameKey, setGameKey] = useState<number>(0);

  const handleLogin = (user: Player) => {
    setCurrentUser(user);
    // Add the new user to the leaderboard if they aren't already there
    setPlayers(prevPlayers => {
      if (prevPlayers.some(p => p.id === user.id)) {
        return prevPlayers;
      }
      return [...prevPlayers, user];
    });
  };

  const handleScoreUpdate = useCallback((score: number) => {
    if (!currentUser) return;

    const updateUser = (userToUpdate: Player | null) => {
        if (!userToUpdate) return null;
        return { ...userToUpdate, score: (userToUpdate.score || 0) + score };
    };

    // Update current user state
    setCurrentUser(updateUser);

    // Update leaderboard state
    setPlayers(prevPlayers => 
        prevPlayers.map(p => p.id === currentUser.id ? updateUser(p) as Player : p)
    );
  }, [currentUser]);

  const handleNewGame = useCallback(() => {
    setGameKey(prevKey => prevKey + 1);
  }, []);

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
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