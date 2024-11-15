import React from 'react';
import { useGame } from '@/app/providers/GameProvider/GameContext.tsx';

const Matchmaking: React.FC = () => {
  const { inQueue, joinQueue, leaveQueue } = useGame();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-center mb-6">Chess Matchmaking</h1>

        {inQueue ? (
          <div className="text-center">
            <div className="mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-600">Searching for opponent...</p>
            </div>
            <button
              onClick={leaveQueue}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={joinQueue}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md transition-colors text-lg font-semibold"
          >
            Find Match
          </button>
        )}
      </div>
    </div>
  );
};

export default Matchmaking;