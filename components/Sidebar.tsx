import React from 'react';
import { Player } from '../types';
import { auth } from '../firebaseConfig';
// FIX: The signOut function is not needed from firebase/auth when using the compat library.

interface SidebarProps {
  players: Player[];
  currentUser: Player;
  onNewGame: () => void;
}

const TrophyIcon: React.FC<{ rank: number }> = ({ rank }) => {
    const colors = ['text-amber-400', 'text-slate-300', 'text-yellow-700'];
    if (rank > 2) return <span className="w-6 text-center text-slate-400 font-medium">{rank + 1}</span>;
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${colors[rank]}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.25 2.25a.75.75 0 00-1.5 0v1.163c-.173.023-.342.05-.514.082-1.217.228-2.32.74-3.235 1.488C5.08 5.64 4.5 6.758 4.5 8.25c0 1.29.544 2.445 1.408 3.233.15.132.308.255.47.368v4.4a.75.75 0 001.5 0v-2.25c.173-.023.342-.05.514-.082 1.217-.228 2.32-.74 3.235-1.488C12.92 11.86 13.5 10.742 13.5 9.25c0-1.29-.544-2.445-1.408-3.233a5.55 5.55 0 00-.47-.368V2.25zM15 9.25a.75.75 0 000 1.5h.044a5.018 5.018 0 01-1.16 2.022.75.75 0 101.173.942 6.518 6.518 0 001.443-2.714H15zM2.25 10.75a.75.75 0 000-1.5H2.206a5.018 5.018 0 011.16-2.022.75.75 0 10-1.173-.942A6.518 6.518 0 00.75 9.25H.75a.75.75 0 000 1.5H2.25z" clipRule="evenodd" />
        </svg>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ players, currentUser, onNewGame }) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const handleSignOut = () => {
    // FIX: Use Firebase v8 compat syntax for signOut
    auth.signOut().catch(error => console.error("Sign out error", error));
  };

  return (
    <aside className="w-80 bg-[#1E1B3A] p-6 flex flex-col shadow-2xl h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Pin the Dot</h1>
        <p className="text-[#9E78CF] font-medium">Leaderboard</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {sortedPlayers.map((player, index) => {
          const isCurrentUser = player.uid === currentUser.uid;
          return (
            <div
              key={player.uid}
              className={`flex items-center p-3 rounded-lg transition-all duration-300 ${
                isCurrentUser
                  ? 'bg-[#7F5AF0] shadow-lg scale-105'
                  : 'bg-[#403C64] hover:bg-[#534F82]'
              }`}
            >
              <div className="w-8 flex-shrink-0 flex justify-center items-center">
                <TrophyIcon rank={index} />
              </div>
              <img 
                src={player.photoURL || `https://api.dicebear.com/8.x/initials/svg?seed=${player.name}`} 
                alt={player.name} 
                className="w-8 h-8 rounded-full ml-3"
                referrerPolicy="no-referrer"
              />
              <p className="flex-1 font-semibold text-white truncate ml-3">{player.name}</p>
              <p className="font-bold text-lg text-gray-200">{player.score}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-8">
        <button
          onClick={onNewGame}
          className="w-full bg-[#2CB67D] hover:bg-[#259c6b] text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1E1B3A] focus:ring-[#2CB67D] transition-all duration-300 transform hover:scale-105 shadow-xl mb-4"
        >
          New Game
        </button>
        <button
          onClick={handleSignOut}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1E1B3A] focus:ring-red-500 transition-all duration-300 transform hover:scale-105 shadow-xl"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
