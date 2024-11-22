import { Socket } from 'socket.io-client';
import { ChessPiece, Position, GameState, MoveData } from 'notationix';

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
  promotionState: {
    isPromoting: boolean;
    position?: Position;
    piece?: ChessPiece;
  };
}

export interface GameContextType extends GameContextState {
  makeMove: (moveData: MoveData) => void;
  handlePromotion: (piece: string) => void;
  joinQueue: () => void;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>; 
}