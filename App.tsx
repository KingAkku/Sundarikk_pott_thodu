import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import GameCanvas from './components/GameCanvas';
import Login from './components/Login';
import { Player } from './types';

const MOCK_LEADERBOARD: Player[] = [
  { id: '1', name: 'Alice', score: 150, isAnonymous: false, emailVerified: true },
  { id: '2', name: 'Bob', score: 125, isAnonymous: false, emailVerified: true },
  { id: '3', name: 'Charlie', score: 110, isAnonymous: false, emailVerified: true },
  { id: '4', name: 'Guest-12345', score: 95, isAnonymous: true, emailVerified: false },
  { id: '5', name: 'Diana', score: 80, isAnonymous: false, emailVerified: true },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [leaderboard, setLeaderboard] = useState<Player[]>(MOCK_LEADERBOARD);
  const [gameKey, setGameKey] = useState<number>(0);

  const handleLogin = (user: Player) => {
    setCurrentUser(user);
    // Add new user to leaderboard if not already present
    if (!leaderboard.some(p => p.id === user.id)) {
      setLeaderboard(prev => [...prev, user]);
    }
  };

  const handleScoreUpdate = useCallback((score: number) => {
    if (!currentUser) return;

    const newScore = (currentUser.score || 0) + score;
    
    // Update current user state
    const updatedUser = { ...currentUser, score: newScore };
    setCurrentUser(updatedUser);

    // Update leaderboard state
    setLeaderboard(prevLeaderboard => {
      const userIndex = prevLeaderboard.findIndex(p => p.id === currentUser.id);
      if (userIndex > -1) {
        const newLeaderboard = [...prevLeaderboard];
        newLeaderboard[userIndex] = updatedUser;
        return newLeaderboard;
      }
      return [...prevLeaderboard, updatedUser];
    });
  }, [currentUser]);

  const handleNewGame = useCallback(() => {
    setGameKey((prevKey) => prevKey + 1);
  }, []);

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-[#0D1B1E] text-white overflow-hidden">
      <Sidebar players={leaderboard} currentUser={currentUser} onNewGame={handleNewGame} />
      <main className="flex-1 bg-slate-100">
        <GameCanvas key={gameKey} onScoreUpdate={handleScoreUpdate} />
      </main>
    </div>
  );
};

export default App;