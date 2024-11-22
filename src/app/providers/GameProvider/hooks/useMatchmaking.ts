import { useState, useCallback } from 'react';
import { Player, GameSession } from '../types.ts';
import { STORAGE_KEYS } from '../constants.ts';

export function useMatchmaking() {
  const [player, setPlayer] = useState<Player | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.PLAYER);
    return stored ? JSON.parse(stored) : null;
  });

  const [opponent, setOpponent] = useState<Player | null>(null);
  const [gameSession, setGameSession] = useState<GameSession | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.GAME_SESSION);
    return stored ? JSON.parse(stored) : null;
  });
  const [inQueue, setInQueue] = useState(false);

  const updatePlayer = useCallback((newPlayer: Player) => {
    setPlayer(newPlayer);
    localStorage.setItem(STORAGE_KEYS.PLAYER, JSON.stringify(newPlayer));
  }, []);

  const updateGameSession = useCallback((newSession: GameSession) => {
    setGameSession(newSession);
    localStorage.setItem(STORAGE_KEYS.GAME_SESSION, JSON.stringify(newSession));
  }, []);

  return {
    player,
    opponent,
    gameSession,
    inQueue,
    setInQueue,
    setOpponent,
    updatePlayer,
    updateGameSession
  };
}