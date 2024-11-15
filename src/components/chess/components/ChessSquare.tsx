import { useGame } from "@/app/providers/GameProvider/GameContext.tsx";
import { ChessPiece, Position } from "notationix";
import { moveValidator, boardUtils } from "../utils/index.ts";

export const ChessSquare: React.FC<{
  piece: ChessPiece | null;
  position: Position;
}> = ({ piece, position }) => {
  const { 
    gameState, 
    setGameState, 
    player,
    opponent,
    makeMove 
  } = useGame();

  const { row, col } = position;

  // Check if it's the player's turn and they can move
  const canMove = player?.color === gameState.currentPlayer;

  const isSelected = gameState.selectedSquare?.row === row && gameState.selectedSquare?.col === col;
  const isPossibleMove = boardUtils.isPositionInPossibleMoves(position, gameState.possibleMoves);
  const isLastMove = boardUtils.isLastMoveSquare(position, gameState.lastMove);
  const isKingInCheck = piece?.type.match(/[♔♚]/) && 
    moveValidator.isInCheck(position, gameState.board, gameState.currentPlayer);
  const isPlayable = !!piece && piece.color === gameState.currentPlayer && canMove;

  const squareClasses = `
    aspect-square flex items-center justify-center font-mono text-3xl relative
    transition-all duration-200 select-none
    ${((row + col) % 2 === 0) ? 'bg-orange-100' : 'bg-orange-200'}
    ${isSelected ? 'ring-2 ring-blue-400 bg-blue-100' : ''}
    ${isPossibleMove && !piece ? 'after:absolute after:w-3 after:h-3 after:bg-green-400 after:rounded-full after:opacity-50' : ''}
    ${isPossibleMove && piece ? 'ring-2 ring-red-400' : ''}
    ${isLastMove ? 'ring-2 ring-yellow-400' : ''}
    ${isKingInCheck ? 'bg-red-200' : ''}
    ${isPlayable ? 'cursor-pointer hover:brightness-90' : 'cursor-default'}
    ${!player?.isConnected || !opponent?.isConnected ? 'opacity-50' : ''}
  `.trim();

  const handleClick = () => {
    if (!player?.isConnected || !opponent?.isConnected) return;

    console.log('Current game state:', gameState);
    console.log('Player:', player);
    console.log('Current player:', gameState.currentPlayer);
    
    const { selectedSquare, currentPlayer, board } = gameState;
  
    if (isPlayable) {
      const moves = moveValidator.getValidMoves(position, board, gameState);
      setGameState(prev => ({
        ...prev,
        selectedSquare: position,
        possibleMoves: moves,
      }));
    } else if (isPossibleMove && selectedSquare && opponent) {
      const from = selectedSquare;
      const to = position;
      const piece = board[from.row][from.col];
  
      if (!piece) return;

      // Use executeMove to handle both regular moves and castling
      const newBoard = moveValidator.executeMove(from, to, board);
      
      // Handle en passant capture
      if ((piece.type === "♙" || piece.type === "♟") && 
          gameState.lastMove && 
          moveValidator.isEnPassantCapture(from, to, gameState.lastMove, piece.color)) {
        newBoard[gameState.lastMove.to.row][gameState.lastMove.to.col] = null;
      }
      
      // Mark pieces as moved
      if (newBoard[to.row][to.col]) {
        const currentPiece = newBoard[to.row][to.col];
        if (currentPiece) { 
          newBoard[to.row][to.col] = {
            type: currentPiece.type,   
            color: currentPiece.color,   
            hasMoved: true                 
          };
        }
      }

      const opponentColor = currentPlayer === "white" ? "black" : "white";
      const opponentKingPosition = boardUtils.findKingPosition(newBoard, opponentColor);
      const isCheck = moveValidator.isInCheck(opponentKingPosition, newBoard, opponentColor);
      const isCheckmate = moveValidator.isCheckmate(opponentKingPosition, newBoard, opponentColor);

      // Create move notation
      let moveNotation = boardUtils.createMoveNotation(piece, to, isCheckmate, isCheck);
      
      if ((piece.type === "♔" || piece.type === "♚") && Math.abs(to.col - from.col) === 2) {
        moveNotation = to.col > from.col ? "O-O" : "O-O-O";
        if (isCheckmate) moveNotation += "#";
        else if (isCheck) moveNotation += "+";
      }

      // Emit move to server
      makeMove({
        from,
        to,
        piece,
        opponentId: opponent.id
      });

      // Update local game state
      setGameState(prev => ({
        ...prev,
        board: newBoard,
        moveHistory: [...prev.moveHistory, moveNotation],
        selectedSquare: null,
        possibleMoves: [],
        currentPlayer: opponentColor,
        lastMove: { from, to, piece },
        isCheck,
        isCheckmate
      }));
    }
  };
  
  return (
    <div className={squareClasses} onClick={handleClick}>
      {piece?.type || <span className="opacity-0">&nbsp;</span>}
    </div>
  );
};