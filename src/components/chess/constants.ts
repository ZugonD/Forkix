import { GameState, ChessBoard } from "notationix";

export const INITIAL_BOARD: ChessBoard = [
    [
        { type: "♜", color: "black", hasMoved: false },
        { type: "♞", color: "black" },
        { type: "♝", color: "black" },
        { type: "♛", color: "black" },
        { type: "♚", color: "black", hasMoved: false },
        { type: "♝", color: "black" },
        { type: "♞", color: "black" },
        { type: "♜", color: "black", hasMoved: false },
    ],
    [
        { type: "♟", color: "black", hasMoved: false },
        { type: "♟", color: "black", hasMoved: false },
        { type: "♟", color: "black", hasMoved: false },
        { type: "♟", color: "black", hasMoved: false },
        { type: "♟", color: "black", hasMoved: false },
        { type: "♟", color: "black", hasMoved: false },
        { type: "♟", color: "black", hasMoved: false },
        { type: "♟", color: "black", hasMoved: false },
    ],
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    [
        { type: "♙", color: "white", hasMoved: false },
        { type: "♙", color: "white", hasMoved: false },
        { type: "♙", color: "white", hasMoved: false },
        { type: "♙", color: "white", hasMoved: false },
        { type: "♙", color: "white", hasMoved: false },
        { type: "♙", color: "white", hasMoved: false },
        { type: "♙", color: "white", hasMoved: false },
        { type: "♙", color: "white", hasMoved: false },
    ],
    [
        { type: "♖", color: "white", hasMoved: false },
        { type: "♘", color: "white" },
        { type: "♗", color: "white" },
        { type: "♕", color: "white" },
        { type: "♔", color: "white", hasMoved: false },
        { type: "♗", color: "white" },
        { type: "♘", color: "white" },
        { type: "♖", color: "white", hasMoved: false },
    ],
];


export const INITIAL_GAME_STATE: GameState = {
    board: INITIAL_BOARD,
    moveHistory: [],
    currentPlayer: "white",
    selectedSquare: null,
    possibleMoves: [],
    lastMove: null,
    boardHistory: [INITIAL_BOARD],
};