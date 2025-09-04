import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import GameCanvas from './components/GameCanvas';
import Login from './components/Login';
import { Player } from './types';

// Mock data for the leaderboard
const MOCK_LEADERBOARD_PLAYERS: Player[] = [
  { id: 'player_1', name: 'Alice', score: 120, emailVerified: true, isAnonymous: false },
  { id: 'player_2', name: 'Bob', score: 110, emailVerified: true, isAnonymous: false },
  { id: 'player_3', name: 'Charlie', score: 95, emailVerified: true, isAnonymous: false },
  { id: 'player_4', name: 'Guest-A1B2', score: 80, emailVerified: false, isAnonymous: true },
  { id: 'player_5', name: 'Diana', score: 72, emailVerified: true, isAnonymous: false },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>(MOCK_LEADERBOARD_PLAYERS);
  const [gameKey, setGameKey] = useState<number>(0);

  const handleLogin = (user: Player) => {
    setCurrentUser(user);
    // Add the new user to the leaderboard if they aren't already on it
    setPlayers(prevPlayers => {
      if (prevPlayers.find(p => p.id === user.id)) {
        return prevPlayers;
      }
      return [...prevPlayers, user];
    });
  };

  const handleScoreUpdate = useCallback(
    (score: number) => {
      if (!currentUser) return;

      // Update the current user's score locally
      const updatedUser = { ...currentUser, score: currentUser.score + score };
      setCurrentUser(updatedUser);

      // Update the user's score in the leaderboard list
      setPlayers(prevPlayers => {
        const playerIndex = prevPlayers.findIndex(p => p.id === currentUser.id);
        if (playerIndex > -1) {
          const newPlayers = [...prevPlayers];
          newPlayers[playerIndex] = updatedUser;
          return newPlayers;
        }
        return [...prevPlayers, updatedUser];
      });
    },
    [currentUser]
  );

  const handleNewGame = useCallback(() => {
    setGameKey((prevKey) => prevKey + 1);
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
