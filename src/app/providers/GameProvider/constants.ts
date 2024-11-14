
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
    }
} as const;

export const STORAGE_KEYS = {
    PLAYER: 'chess_player',
    GAME_SESSION: 'chess_game_session'
};