import { useState, useCallback } from 'react';
import { GameState, MoveData, Position, ChessPiece } from 'notationix';
import { moveValidator, boardUtils } from '@/components/chess/utils/index.ts';
import { INITIAL_GAME_STATE } from '../constants.ts';

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [promotionState, setPromotionState] = useState<{
    isPromoting: boolean;
    position?: Position;
    piece?: ChessPiece;
  }>({ isPromoting: false });

  const handleMove = useCallback((moveData: MoveData) => {
    const newBoard = moveValidator.executeMove(moveData.from, moveData.to, gameState.board);
    const newCurrentPlayer = gameState.currentPlayer === "white" ? "black" : "white";
    
    const kingPosition = boardUtils.findKingPosition(newBoard, newCurrentPlayer);
    const isCheck = moveValidator.isInCheck(kingPosition, newBoard, newCurrentPlayer);
    const isCheckmate = moveValidator.isCheckmate(kingPosition, newBoard, newCurrentPlayer);
    
    const moveNotation = moveValidator.generateMoveNotation(
      moveData.piece,
      moveData.from,
      moveData.to,
      isCheck,
      isCheckmate
    );

    setGameState(prev => ({
      ...prev,
      board: newBoard,
      currentPlayer: newCurrentPlayer,
      moveHistory: [...prev.moveHistory, moveNotation],
      lastMove: moveData,
      selectedSquare: null,
      possibleMoves: [],
      isCheck,
      isCheckmate,
      isGameOver: isCheckmate
    }));
  }, [gameState.board, gameState.currentPlayer]);

  const handlePromotion = useCallback((selectedPiece: string) => {
    if (!promotionState.position || !promotionState.piece) return;

    const { position, piece } = promotionState;
    const newBoard = [...gameState.board];
    
    const promotedPiece: ChessPiece = {
      type: selectedPiece,
      color: piece.color,
      hasMoved: true
    };
    
    newBoard[position.row][position.col] = promotedPiece;

    const opponentColor = piece.color === "white" ? "black" : "white";
    const opponentKingPosition = boardUtils.findKingPosition(newBoard, opponentColor);
    const isCheck = moveValidator.isInCheck(opponentKingPosition, newBoard, opponentColor);
    const isCheckmate = moveValidator.isCheckmate(opponentKingPosition, newBoard, opponentColor);

    const moveNotation = boardUtils.createMoveNotation(promotedPiece, position, isCheckmate, isCheck) + "=" + selectedPiece;

    setGameState(prev => ({
      ...prev,
      board: newBoard,
      moveHistory: [...prev.moveHistory, moveNotation],
      currentPlayer: opponentColor,
      isCheck,
      isCheckmate
    }));

    setPromotionState({ isPromoting: false });
  }, [promotionState, gameState.board]);

  return {
    gameState,
    setGameState,
    promotionState,
    setPromotionState,
    handleMove,
    handlePromotion
  };
}