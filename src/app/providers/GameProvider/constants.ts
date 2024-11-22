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

export const SOCKET_EVENTS = {
    QUEUE: {
        JOIN: 'joinQueue',
        LEAVE: 'leaveQueue',
        JOINED: 'queueJoined',
        LEFT: 'queueLeft'
    },
    GAME: {
        STARTED: 'gameStarted',
        MOVE_MADE: 'moveMade',
        OPPONENT_DISCONNECTED: 'opponentDisconnected',
        OPPONENT_RECONNECTED: 'opponentReconnected',
        RESIGN: 'resign',
        UNDO_REQUEST: 'undoRequest',
        UNDO_ACCEPTED: 'undoAccepted',
        UNDO_REJECTED: 'undoRejected',
        DRAW_OFFER: 'drawOffer',
        DRAW_ACCEPTED: 'drawAccepted',
        DRAW_REJECTED: 'drawRejected'
    },     
} as const;

export const STORAGE_KEYS = {
    PLAYER: 'chess_player',
    GAME_SESSION: 'chess_game_session'
};