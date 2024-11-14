import { ChessBoard, Position, ChessPiece } from "../types";

export const boardUtils = {

    transformCoordinates: (row: number, col: number, playerColor: "white" | "black" = "white"): [number, number] => {
        return playerColor === "black" ? [7 - row, 7 - col] : [row, col];
    },

    getDisplayBoard: (board: ChessBoard, playerColor: "white" | "black" = "white"): ChessBoard => {
        return playerColor === "black" ?
            board.slice().reverse().map((row: ChessPiece[]) => row.slice().reverse()) :
            board;
    },

    findKingPosition: (board: ChessBoard, color: "white" | "black"): Position => {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board[row][col];
                if (piece?.color === color && (piece.type === "♔" || piece.type === "♚")) {
                    return { row, col };
                }
            }
        }
        throw new Error(`${color} king not found`);
    },

    isValidSquare: (row: number, col: number): boolean =>
        row >= 0 && row < 8 && col >= 0 && col < 8,

    createMoveNotation: (
        piece: ChessPiece,
        to: Position,
        isCheckmate: boolean,
        isCheck: boolean
    ): string => {
        const files = "abcdefgh";
        const ranks = "87654321";
        let notation = `${piece?.type}${files[to.col]}${ranks[to.row]}`;
        return notation + (isCheckmate ? "#" : isCheck ? "+" : "");
    },

    isPositionInPossibleMoves: (position: Position, possibleMoves: Position[]): boolean => {
        return possibleMoves.some(move => move.row === position.row && move.col === position.col);
    },

    isLastMoveSquare: (position: Position, lastMove: { from: Position, to: Position } | null): boolean => {
        if (!lastMove) return false;
        return (lastMove.from.row === position.row && lastMove.from.col === position.col) ||
            (lastMove.to.row === position.row && lastMove.to.col === position.col);
    },
};
