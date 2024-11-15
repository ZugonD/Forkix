import { Position, ChessBoard, GameState, ChessPiece } from 'notationix';
import { boardUtils } from './boardUtils.ts';

export const moveValidator = {

  executeMove: (from: Position, to: Position, board: ChessBoard): ChessBoard => {
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[from.row][from.col];

    if ((piece?.type === "♔" || piece?.type === "♚") && Math.abs(to.col - from.col) === 2) {
      const rookMove = moveValidator.getRookCastlingMove(from, to);
      if (rookMove) {
        const rook = newBoard[rookMove.from.row][rookMove.from.col];
        newBoard[rookMove.to.row][rookMove.to.col] = rook;
        newBoard[rookMove.from.row][rookMove.from.col] = null;
      }
    }

    newBoard[to.row][to.col] = piece;
    newBoard[from.row][from.col] = null;

    return newBoard;
  },

  handleSquareClick: (
    position: Position,
    piece: ChessPiece | null,
    gameState: GameState,
    playerColor: "white" | "black",
    opponentId: string
  ): {
    newGameState: Partial<GameState>;
    moveToEmit?: {
      from: Position;
      to: Position;
      piece: ChessPiece;
      opponentId: string;
    };
  } => {
    const { selectedSquare, currentPlayer, board } = gameState;

    const isPlayable = !!piece && piece.color === currentPlayer && currentPlayer === playerColor;
    const isPossibleMove = boardUtils.isPositionInPossibleMoves(position, gameState.possibleMoves);

    if (isPlayable) {
      const moves = moveValidator.getValidMoves(position, board, gameState);
      return {
        newGameState: {
          selectedSquare: position,
          possibleMoves: moves,
        }
      };
    }

    if (isPossibleMove && selectedSquare) {
      const from = selectedSquare;
      const to = position;
      const movingPiece = board[from.row][from.col];
      
      if (!movingPiece) return { newGameState: {} };

      const newBoard = moveValidator.executeMove(from, to, board);
      
      if (gameState.lastMove && moveValidator.shouldHandleEnPassant(movingPiece, from, to, gameState.lastMove)) {
        newBoard[gameState.lastMove.to.row][gameState.lastMove.to.col] = null;
      }
      
      if (newBoard[to.row][to.col]) {
        moveValidator.markPieceAsMoved(newBoard, to);
      }

      const opponentColor = currentPlayer === "white" ? "black" : "white";
      const opponentKingPosition = boardUtils.findKingPosition(newBoard, opponentColor);
      const isCheck = moveValidator.isInCheck(opponentKingPosition, newBoard, opponentColor);
      const isCheckmate = moveValidator.isCheckmate(opponentKingPosition, newBoard, opponentColor);
      
      const moveNotation = moveValidator.generateMoveNotation(movingPiece, from, to, isCheck, isCheckmate);

      return {
        newGameState: {
          board: newBoard,
          moveHistory: [...gameState.moveHistory, moveNotation],
          selectedSquare: null,
          possibleMoves: [],
          currentPlayer: opponentColor,
          lastMove: { from, to, piece: movingPiece },
          isCheck,
          isCheckmate
        },
        moveToEmit: {
          from,
          to,
          piece: movingPiece,
          opponentId
        }
      };
    }

    return { newGameState: {} };
  },

  isValidMove: (from: Position, to: Position, board: ChessBoard, color: "white" | "black"): boolean => {
    const piece = board[from.row][from.col];
    if (!piece) return false;

    if ((piece.type === "♔" || piece.type === "♚") && Math.abs(to.col - from.col) === 2) {
      const rookCol = to.col > from.col ? 7 : 0;
      return moveValidator.canCastle(from, { row: from.row, col: rookCol }, board, color);
    }

    if (board[to.row][to.col]?.color === piece.color) return false;

    const attackMoves = moveValidator.getAttackMoves(from, board);
    return attackMoves.some(move => move.row === to.row && move.col === to.col);
  },

  getValidMoves: (position: Position, board: ChessBoard, gameState: GameState): Position[] => {
    const piece = board[position.row][position.col];
    if (!piece) return [];

    let moves = moveValidator.getAttackMoves(position, board, gameState);

    if ((piece.type === "♔" || piece.type === "♚") && !piece.hasMoved) {
      moves = [...moves, ...moveValidator.getCastlingMoves(position, board, piece.color)];
    }

    return moves.filter(move => {
      const newBoard = board.map(row => [...row]);

      if ((piece.type === "♔" || piece.type === "♚") &&
        Math.abs(move.col - position.col) === 2) {
        const rookMove = moveValidator.getRookCastlingMove(position, move);
        if (rookMove) {
          const rook = newBoard[rookMove.from.row][rookMove.from.col];
          newBoard[rookMove.to.row][rookMove.to.col] = rook;
          newBoard[rookMove.from.row][rookMove.from.col] = null;
        }
      }

      newBoard[move.row][move.col] = piece;
      newBoard[position.row][position.col] = null;

      const kingPosition = piece.type.match(/[♔♚]/)
        ? move
        : boardUtils.findKingPosition(newBoard, piece.color);

      return !moveValidator.isInCheck(kingPosition, newBoard, piece.color);
    });
  },

  getAttackMoves: (position: Position, board: ChessBoard, gameState?: GameState): Position[] => {
    const piece = board[position.row][position.col];
    if (!piece) return [];

    const moves: Position[] = [];

    const addLinearMoves = (directions: number[][], stopAtFirst: boolean = false) => {
      for (const [dr, dc] of directions) {
        let r = position.row + dr;
        let c = position.col + dc;

        while (boardUtils.isValidSquare(r, c)) {
          const targetPiece = board[r][c];
          if (targetPiece?.color === piece.color) break;
          moves.push({ row: r, col: c });
          if (targetPiece || stopAtFirst) break;
          r += dr;
          c += dc;
        }
      }
    };

    type PieceMovementConfig = {
      directions: number[][];
      stopAtFirst?: boolean;
    }

    const pieceMovements: Record<string, PieceMovementConfig> = {
      "♔♚": {
        directions: [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1], [0, 1],
          [1, -1], [1, 0], [1, 1]
        ],
        stopAtFirst: true
      },
      "♖♜": {
        directions: [[1, 0], [-1, 0], [0, 1], [0, -1]]
      },
      "♗♝": {
        directions: [[1, 1], [-1, -1], [1, -1], [-1, 1]]
      },
      "♕♛": {
        directions: [
          [1, 0], [-1, 0], [0, 1], [0, -1],
          [1, 1], [-1, -1], [1, -1], [-1, 1]
        ]
      }
    };

    // Handle piece movements based on type
    for (const [pieces, config] of Object.entries(pieceMovements)) {
      if (pieces.includes(piece.type)) {
        addLinearMoves(config.directions, config.stopAtFirst ?? false);
        return moves;
      }
    }

    // Knight moves
    if (piece.type === "♘" || piece.type === "♞") {
      [[-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]]
        .forEach(([dr, dc]) => {
          const r = position.row + dr;
          const c = position.col + dc;
          if (boardUtils.isValidSquare(r, c) && board[r][c]?.color !== piece.color) {
            moves.push({ row: r, col: c });
          }
        });
      return moves;
    }

    // Pawn moves
    if (piece.type === "♙" || piece.type === "♟") {
      const direction = piece.color === "white" ? -1 : 1;
      const startingRow = piece.color === "white" ? 6 : 1;

      // Forward moves
      const oneSquareAhead = position.row + direction;
      if (boardUtils.isValidSquare(oneSquareAhead, position.col) &&
        !board[oneSquareAhead][position.col]) {
        moves.push({ row: oneSquareAhead, col: position.col });

        // Two square advance from starting position
        const twoSquaresAhead = position.row + (2 * direction);
        if (position.row === startingRow &&
          boardUtils.isValidSquare(twoSquaresAhead, position.col) &&
          !board[twoSquaresAhead][position.col]) {
          moves.push({ row: twoSquaresAhead, col: position.col });
        }
      }

      // Diagonal captures including en passant
      [{ col: position.col - 1 }, { col: position.col + 1 }].forEach(({ col }) => {
        const captureRow = oneSquareAhead;
        if (boardUtils.isValidSquare(captureRow, col)) {
          const targetPiece = board[captureRow][col];
          if (targetPiece && targetPiece.color !== piece.color) {
            moves.push({ row: captureRow, col });
          } else if (gameState?.lastMove &&
            moveValidator.isEnPassantCapture(position, { row: captureRow, col },
              gameState.lastMove, piece.color)) {
            moves.push({ row: captureRow, col });
          }
        }
      });
    }

    return moves;
  },

  shouldHandleEnPassant: (
    piece: ChessPiece,
    from: Position,
    to: Position,
    lastMove: { from: Position; to: Position; piece: ChessPiece } | null
  ): boolean => {
    if (!piece) return false;

    return !!(lastMove && 
      (piece.type === "♙" || piece.type === "♟") &&
      moveValidator.isEnPassantCapture(from, to, lastMove, piece.color));
  },

  markPieceAsMoved: (board: ChessBoard, position: Position): void => {
    const piece = board[position.row][position.col];
    if (piece) {
      board[position.row][position.col] = {
        ...piece,
        hasMoved: true
      };
    }
  },

  isEnPassantCapture: (
    from: Position,
    to: Position,
    lastMove: { from: Position; to: Position; piece: ChessPiece },
    pieceColor: "white" | "black"
  ): boolean => {
    // Verify it's a pawn making the capture
    const direction = pieceColor === "white" ? -1 : 1;
    const expectedFromRow = pieceColor === "white" ? 3 : 4;

    // Check if the capturing pawn is in the correct row
    if (from.row !== expectedFromRow) return false;

    // Check if the last move was a two-square pawn advance
    const lastPiece = lastMove.piece;
    if (!lastPiece || !(lastPiece.type === "♙" || lastPiece.type === "♟")) return false;
    if (Math.abs(lastMove.to.row - lastMove.from.row) !== 2) return false;

    // Check if the captured pawn is adjacent
    if (lastMove.to.col !== to.col) return false;
    if (lastMove.to.row !== from.row) return false;
    if (Math.abs(from.col - lastMove.to.col) !== 1) return false;

    // Check if the capturing move is to the correct square
    return to.row === from.row + direction;
  },



  canCastle: (kingPosition: Position, rookPosition: Position, board: ChessBoard, color: "white" | "black"): boolean => {
    const king = board[kingPosition.row][kingPosition.col];
    const rook = board[rookPosition.row][rookPosition.col];

    // Check if king and rook exist and haven't moved
    if (!king || !rook || king.hasMoved || rook.hasMoved) return false;

    // Verify correct pieces
    if (!(king.type === "♔" || king.type === "♚") ||
      !(rook.type === "♖" || rook.type === "♜")) return false;

    // Check if path between king and rook is clear
    const row = kingPosition.row;
    const startCol = Math.min(kingPosition.col, rookPosition.col);
    const endCol = Math.max(kingPosition.col, rookPosition.col);

    for (let col = startCol + 1; col < endCol; col++) {
      if (board[row][col] !== null) return false;
    }

    // Check if king is in check
    if (moveValidator.isInCheck(kingPosition, board, color)) return false;

    // Check if squares king moves through are under attack
    const direction = rookPosition.col < kingPosition.col ? -1 : 1;
    for (let col = kingPosition.col; col !== rookPosition.col; col += direction) {
      const position = { row: kingPosition.row, col };
      const tempBoard = board.map(row => [...row]);
      tempBoard[kingPosition.row][kingPosition.col] = null;
      tempBoard[position.row][position.col] = king;

      if (moveValidator.isInCheck(position, tempBoard, color)) return false;
    }

    return true;
  },

  getCastlingMoves: (kingPosition: Position, board: ChessBoard, color: "white" | "black"): Position[] => {
    const moves: Position[] = [];
    const row = color === "white" ? 7 : 0;

    // Check kingside castling
    const kingsideRook = { row, col: 7 };
    if (moveValidator.canCastle(kingPosition, kingsideRook, board, color)) {
      moves.push({ row, col: kingPosition.col + 2 });
    }

    // Check queenside castling
    const queensideRook = { row, col: 0 };
    if (moveValidator.canCastle(kingPosition, queensideRook, board, color)) {
      moves.push({ row, col: kingPosition.col - 2 });
    }

    return moves;
  },

  // New helper function to get rook move for castling
  getRookCastlingMove: (kingFrom: Position, kingTo: Position): { from: Position, to: Position } | null => {
    if (Math.abs(kingTo.col - kingFrom.col) !== 2) return null;

    const row = kingFrom.row;
    const isKingside = kingTo.col > kingFrom.col;

    return {
      from: { row, col: isKingside ? 7 : 0 },
      to: { row, col: isKingside ? kingTo.col - 1 : kingTo.col + 1 }
    };
  },

  isInCheck: (kingPosition: Position, board: ChessBoard, color: "white" | "black"): boolean => {
    const opponentColor = color === "white" ? "black" : "white";

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece?.color === opponentColor) {
          const attackMoves = moveValidator.getAttackMoves({ row, col }, board);
          if (attackMoves.some(move =>
            move.row === kingPosition.row && move.col === kingPosition.col
          )) {
            return true;
          }
        }
      }
    }

    return false;
  },

  isCheckmate: (kingPosition: Position, board: ChessBoard, color: "white" | "black"): boolean => {
    if (!moveValidator.isInCheck(kingPosition, board, color)) {
      return false; // Not in check, cannot be checkmate
    }

    // Check if any possible move can resolve the check
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece?.color === color) {
          const moves = moveValidator.getAttackMoves({ row, col }, board);
          for (const move of moves) {
            // Simulate the move
            const newBoard = board.map(r => r.slice());
            newBoard[move.row][move.col] = piece;
            newBoard[row][col] = null;

            // Check if the king is still in check after the move
            const newKingPosition = boardUtils.findKingPosition(newBoard, color);
            if (!moveValidator.isInCheck(newKingPosition, newBoard, color)) {
              return false; // Found a valid move to escape check
            }
          }
        }
      }
    }

    return true;
  },

  getSquareState: (
    position: Position,
    piece: ChessPiece | null,
    gameState: GameState,
    playerColor: "white" | "black"
  ): {
    isSelected: boolean;
    isPossibleMove: boolean;
    isLastMove: boolean;
    isKingInCheck: boolean;
    isPlayable: boolean;
  } => {
    const { row, col } = position;
    
    return {
      isSelected: gameState.selectedSquare?.row === row && 
                 gameState.selectedSquare?.col === col,
      isPossibleMove: boardUtils.isPositionInPossibleMoves(position, gameState.possibleMoves),
      isLastMove: boardUtils.isLastMoveSquare(position, gameState.lastMove),
      isKingInCheck: !!piece?.type.match(/[♔♚]/) && 
                    moveValidator.isInCheck(position, gameState.board, gameState.currentPlayer),
      isPlayable: !!piece && 
                 piece.color === gameState.currentPlayer && 
                 gameState.currentPlayer === playerColor
    };
  },

  generateMoveNotation: (
    piece: ChessPiece | null,
    from: Position,
    to: Position,
    isCheck: boolean,
    isCheckmate: boolean
  ): string => {
    if (!piece) return '';

    if ((piece.type === "♔" || piece.type === "♚") && Math.abs(to.col - from.col) === 2) {
      const notation = to.col > from.col ? "O-O" : "O-O-O";
      return notation + (isCheckmate ? "#" : isCheck ? "+" : "");
    }
    
    return boardUtils.createMoveNotation(piece, to, isCheckmate, isCheck);
  },
};
