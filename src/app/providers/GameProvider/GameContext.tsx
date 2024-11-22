import React, { createContext, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SocketService } from './services/SocketService.ts';
import { useGameState } from './hooks/useGameState.ts';
import { useMatchmaking } from './hooks/useMatchmaking.ts';
import { SOCKET_EVENTS } from './constants.ts';
import { GameContextType, GameSession, Player } from './types.ts';
import { MoveData } from "notationix";

const GameContext = createContext<GameContextType | null>(null);
const socketService = new SocketService();

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const {
    gameState,
    setGameState,
    promotionState,
    handleMove,
    handlePromotion
  } = useGameState();

  const {
    player,
    opponent,
    gameSession,
    inQueue,
    setInQueue,
    setOpponent,
    updatePlayer,
    updateGameSession
  } = useMatchmaking();

  useEffect(() => {
    socketService.connect(player?.id, gameSession?.id);
    setupSocketListeners();

    return () => socketService.disconnect();
  }, []);

  const setupSocketListeners = () => {
    // Queue events
    socketService.on(SOCKET_EVENTS.QUEUE.JOINED, handleQueueJoined);
    socketService.on(SOCKET_EVENTS.QUEUE.LEFT, () => setInQueue(false));
    
    // Game events
    socketService.on(SOCKET_EVENTS.GAME.MOVE_MADE, handleMove);
    socketService.on(SOCKET_EVENTS.GAME.STARTED, handleGameStarted);
  };

  const handleQueueJoined = (data: { playerName: string }) => {
    const newPlayer: Player = {
      id: socketService.getSocket()?.id || '',
      name: data.playerName,
      color: "white",
      isConnected: true
    };
    updatePlayer(newPlayer);
    setInQueue(true);
  };

  const handleGameStarted = (data: {
    gameId: string;
    color: "white" | "black";
    opponentId: string;
    opponentName: string;
  }) => {
    if (!player) return;

    const updatedPlayer = { ...player, color: data.color };
    const opponentPlayer: Player = {
      id: data.opponentId,
      name: data.opponentName,
      color: data.color === "white" ? "black" : "white",
      isConnected: true
    };

    updatePlayer(updatedPlayer);
    setOpponent(opponentPlayer);

    const newGameSession: GameSession = {
      id: data.gameId,
      players: {
        white: data.color === "white" ? updatedPlayer : opponentPlayer,
        black: data.color === "black" ? updatedPlayer : opponentPlayer
      },
      status: "active",
      startedAt: new Date()
    };

    updateGameSession(newGameSession);
    navigate(`/game/${data.gameId}`);
  };

  const makeMove = (moveData: MoveData) => {
    if (!opponent || !player) return;
    if (gameState.currentPlayer !== player.color) {
      console.error('Not your turn');
      return;
    }

    socketService.emit(SOCKET_EVENTS.GAME.MOVE_MADE, {
      ...moveData,
      opponentId: opponent.id
    });

    handleMove(moveData);
  };

  const joinQueue = () => {
    socketService.emit(SOCKET_EVENTS.QUEUE.JOIN);
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        setGameState,
        socket: socketService.getSocket(),
        promotionState,
        player,
        opponent,
        gameSession,
        inQueue,
        makeMove,
        handlePromotion,
        joinQueue,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};