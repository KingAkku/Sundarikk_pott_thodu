
import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import GameCanvas from './components/GameCanvas';
import Login from './components/Login';
import { Player } from './types';

const initialPlayers: Player[] = [
  { id: 'player-1', name: 'AI-Player-1', score: 150 },
  { id: 'player-2', name: 'AI-Player-2', score: 125 },
  { id: 'player-3', name: 'AI-Player-3', score: 90 },
  { id: 'player-4', name: 'AI-Player-4', score: 50 },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [gameKey, setGameKey] = useState<number>(0);

  const handleLogin = useCallback((name: string) => {
    const newUser: Player = {
      id: `user-${Date.now()}`,
      name: name,
      score: 0,
    };
    setCurrentUser(newUser);
    setPlayers(prevPlayers => [...prevPlayers, newUser]);
  }, []);

  const handleScoreUpdate = useCallback((score: number) => {
    if (!currentUser) return;

    setPlayers(prevPlayers =>
      prevPlayers.map(p =>
        p.id === currentUser.id ? { ...p, score: p.score + score } : p
      )
    );
    
    setCurrentUser(prevUser => prevUser ? {...prevUser, score: prevUser.score + score} : null);

  }, [currentUser]);

  const handleNewGame = useCallback(() => {
    setGameKey(prevKey => prevKey + 1);
  }, []);
  
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
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