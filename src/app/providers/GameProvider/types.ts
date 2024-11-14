import { Socket } from 'socket.io-client';
import { GameState, MoveData } from '../../../components/chess/types.js';

export interface Player {
  id: string;
  name: string;
  color: "white" | "black";
  isConnected: boolean;
  timeRemaining?: number;
}

export interface GameSession {
  id: string;
  players: {
    white: Player;
    black: Player;
  };
  status: "waiting" | "active" | "completed" | "abandoned";
  startedAt?: Date;
  endedAt?: Date;
}

export interface GameContextState {
  gameState: GameState;
  socket: Socket | null;
  player: Player | null;
  opponent: Player | null;
  gameSession: GameSession | null;
  inQueue: boolean;
}

export interface GameContextType extends GameContextState {
  makeMove: (moveData: MoveData) => void;
  resign: () => void;
  joinQueue: () => void;
  leaveQueue: () => void;
  requestUndo: () => void;
  answerUndo: (accepted: boolean) => void;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>; 
}