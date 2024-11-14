export type ChessPiece = {
    type: string;
    color: "white" | "black";
    hasMoved?: boolean;
} | null;

export type Position = {
    row: number;
    col: number;
};

export type ChessBoard = ChessPiece[][];
export type MoveHistory = string[];
export type BoardHistory = ChessBoard[];

export interface TimeControl {
    white: number;
    black: number;
    increment: number;
}

export interface GameState {
    board: ChessBoard;
    moveHistory: MoveHistory;
    currentPlayer: "white" | "black";
    selectedSquare: Position | null;
    possibleMoves: Position[];
    lastMove: { from: Position; to: Position; piece: ChessPiece } | null;
    boardHistory: BoardHistory;
    isGameOver?: boolean;
    timeControl?: TimeControl;
    isCheck?: boolean;
    isCheckmate?: boolean;
}


export interface MoveData {
    from: Position;
    to: Position;
    piece: ChessPiece;
    opponentId?: string | null;
}
