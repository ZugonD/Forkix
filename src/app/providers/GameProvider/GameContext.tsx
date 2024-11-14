import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { GameState, MoveData } from "../../../components/chess/types";
import { INITIAL_GAME_STATE } from "../../../components/chess/constants";
import { SOCKET_EVENTS, STORAGE_KEYS } from "./constants";
import { GameContextType, Player, GameSession } from "./types";
import { boardUtils, moveValidator } from "../../../components/chess/utils/";

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const socketRef = useRef<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [player, setPlayer] = useState<Player | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.PLAYER);
    return stored ? JSON.parse(stored) : null;
  });
  const [opponent, setOpponent] = useState<Player | null>(null);
  const [gameSession, setGameSession] = useState<GameSession | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.PLAYER);
    return stored ? JSON.parse(stored) : null;
  });
  const [inQueue, setInQueue] = useState(false);

  // Store player and game session in localStorage when they change
  useEffect(() => {
    if (player) {
      localStorage.setItem(STORAGE_KEYS.PLAYER, JSON.stringify(player));
    }
  }, [player]);

  useEffect(() => {
    if (gameSession) {
      localStorage.setItem(STORAGE_KEYS.GAME_SESSION, JSON.stringify(gameSession));
    }
  }, [gameSession]);

  // Initialize socket connection once
  useEffect(() => {
    if (!socketRef.current) {
      const socketUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:6970";

      socketRef.current = io(socketUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        // Add auth data for reconnection
        auth: {
          playerId: player?.id,
          gameId: gameSession?.id
        }
      });

      // Queue events
      socketRef.current.on(SOCKET_EVENTS.QUEUE.JOINED, (data: { playerName: string }) => {
        const newPlayer: Player = {
          id: socketRef.current?.id || '',
          name: data.playerName,
          color: "white",
          isConnected: true
        };
        setPlayer(newPlayer);
        setInQueue(true);
      });

      socketRef.current.on(SOCKET_EVENTS.QUEUE.LEFT, () => {
        setInQueue(false);
      });

      // Add listener for opponent moves
      socketRef.current.on(SOCKET_EVENTS.GAME.MOVE_MADE, (moveData: Omit<MoveData, 'opponentId'>) => {
        console.log('Received move from opponent:', moveData);
        setGameState(prevState => {
          // Execute the move on a copy of the current board
          const newBoard = moveValidator.executeMove(moveData.from, moveData.to, prevState.board);
          
          // Create new move history entry
          const moveNotation = moveValidator.generateMoveNotation(
            moveData.piece,
            moveData.from,
            moveData.to,
            false, // We'll update these after checking
            false
          );
          
          // Determine the new current player
          const newCurrentPlayer = prevState.currentPlayer === "white" ? "black" : "white";
          
          // Find the king's position and check if it's in check/checkmate
          const kingPosition = boardUtils.findKingPosition(newBoard, newCurrentPlayer);
          const isCheck = moveValidator.isInCheck(kingPosition, newBoard, newCurrentPlayer);
          const isCheckmate = moveValidator.isCheckmate(kingPosition, newBoard, newCurrentPlayer);
          
          // Return the complete new state
          return {
            ...prevState,
            board: newBoard,
            currentPlayer: newCurrentPlayer,
            moveHistory: [...prevState.moveHistory, moveNotation],
            lastMove: {
              from: moveData.from,
              to: moveData.to,
              piece: moveData.piece
            },
            selectedSquare: null,
            possibleMoves: [],
            isCheck,
            isCheckmate,
            isGameOver: isCheckmate
          };
        });
      });

      socketRef.current.on(SOCKET_EVENTS.GAME.STARTED, (data: {
        gameId: string;
        color: "white" | "black";
        opponentId: string;
        opponentName: string;
      }) => {
        if (player) {
          const updatedPlayer = { ...player, color: data.color };
          const opponentPlayer: Player = {
            id: data.opponentId,
            name: data.opponentName,
            color: data.color === "white" ? "black" : "white",
            isConnected: true
          };
          
          setPlayer(updatedPlayer);
          setOpponent(opponentPlayer);
          setGameState(INITIAL_GAME_STATE);

          const newGameSession: GameSession = {
            id: data.gameId,
            players: {
              white: data.color === "white" ? updatedPlayer : opponentPlayer,
              black: data.color === "black" ? updatedPlayer : opponentPlayer
            },
            status: "active",
            startedAt: new Date()
          };
          setGameSession(newGameSession);
          navigate(`/game/${data.gameId}`);
        }
      });

      // Handle reconnection
      socketRef.current.on('connect', () => {
        console.log('Connected to server');
        if (gameSession?.id && player?.id) {
          socketRef.current?.emit('reconnectToGame', {
            gameId: gameSession.id,
            playerId: player.id,
            currentGameState: gameState // Send current game state for synchronization
          });
        }
      });

      // Handle opponent reconnection
      socketRef.current.on('opponentReconnected', (gameState: GameState) => {
        setGameState(gameState);
        if (opponent) {
          setOpponent({ ...opponent, isConnected: true });
        }
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from server');
        if (opponent) {
          setOpponent({ ...opponent, isConnected: false });
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);  // Remove gameState.board from dependencies


  // const resetGameState = () => {
  //   setGameState(INITIAL_GAME_STATE);
  //   setPlayerColor("white");
  //   setInQueue(false);
  //   setOpponentId(null);
  //   setGameId(null);
  //   setOpponentName(null);
  // };

  const makeMove = useCallback((moveData: MoveData) => {
    if (!socketRef.current || !opponent || !player) return;

    if (gameState.currentPlayer !== player.color) {
      console.error('Not your turn');
      return;
    }

    socketRef.current.emit(SOCKET_EVENTS.GAME.MOVE_MADE, {
      ...moveData,
      opponentId: opponent.id
    });

    // Optimistically update local state
    const newBoard = moveValidator.executeMove(moveData.from, moveData.to, gameState.board);
    setGameState(prev => ({
      ...prev,
      board: newBoard,
      currentPlayer: prev.currentPlayer === "white" ? "black" : "white",
      lastMove: {
        from: moveData.from,
        to: moveData.to,
        piece: moveData.piece
      }
    }));
  }, [opponent, player, gameState]);

  const resign = () => {
    // if (socket && opponentId) {
    //   socket.emit("resign", { opponentId });
    //   navigate("/");
    //   resetGameState();
    // }
    console.log("pussy")

  };

  const joinQueue = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit(SOCKET_EVENTS.QUEUE.JOIN);
    }
  }, []);

  const leaveQueue = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit(SOCKET_EVENTS.QUEUE.LEAVE);
      setInQueue(false);
    }
  }, []);

  const requestUndo = () => {
    // if (socket && opponentId) {
    //   socket.emit("undoRequest", { opponentId });
    // }
    console.log("req undo")
  };

  const answerUndo = (accepted: boolean) => {
    // if (socket && opponentId) {
    //   socket.emit(accepted ? "undoAccepted" : "undoRejected", { opponentId });
    // }
    console.log("asn undo")

  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        setGameState,
        socket: socketRef.current,
        player,
        opponent,
        gameSession,
        inQueue,
        makeMove,
        resign,
        joinQueue,
        leaveQueue,
        requestUndo,
        answerUndo,
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