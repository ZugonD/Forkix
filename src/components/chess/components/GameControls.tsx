import React, { useState } from 'react';
import { Flag, RotateCcw, Timer, Handshake } from 'lucide-react';

import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Card } from '@/components/ui/card.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { useGame } from '@/app/providers/GameProvider/GameContext.tsx';
import { SOCKET_EVENTS } from '@/app/providers/GameProvider/constants.ts';

export const GameControls: React.FC = () => {
  const {
    gameState,
    player,
    socket,
    opponent,
    resign,
    requestUndo,
    answerUndo,
  } = useGame();

  const [isResignDialogOpen, setIsResignDialogOpen] = useState(false);
  const [isUndoDialogOpen, setIsUndoDialogOpen] = useState(false);
  const [isDrawDialogOpen, setIsDrawDialogOpen] = useState(false);
  const [pendingUndoRequest, setPendingUndoRequest] = useState(false);

  const playerColor = player?.color;
  const opponentId = opponent?.id;

  const isPlayerTurn = gameState.currentPlayer === playerColor;

  const handleResign = () => {
    resign();
    setIsResignDialogOpen(false);
  };

  const handleUndoRequest = () => {
    requestUndo();
    setIsUndoDialogOpen(false);
    setPendingUndoRequest(true);
  };

  const handleDrawOffer = () => {
    if (socket && opponentId) {
      socket.emit(SOCKET_EVENTS.GAME.DRAW_OFFER, { opponentId });
      setIsDrawDialogOpen(false);
    }
  };

  const handleUndoResponse = (accepted: boolean) => {
    answerUndo(accepted);
    setPendingUndoRequest(false);
  };

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full ${playerColor === 'white' ? 'bg-white border-2 border-black' : 'bg-black'}`} />
          <span className="font-semibold">You</span>
          <Badge variant="secondary">1500</Badge>
          {/* {gameState.timeControl && (
            <Badge variant="outline" className="ml-2 font-mono">
              <Timer className="w-4 h-4 mr-1.5" />
              {formatTime(gameState.timeControl[playerColor])}
            </Badge>
          )} */}
        </div>

        <div className="flex gap-2">
          <AlertDialog open={isUndoDialogOpen} onOpenChange={setIsUndoDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline"
                size="sm"
                disabled={!isPlayerTurn || pendingUndoRequest}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Request to Undo Last Move</AlertDialogTitle>
                <AlertDialogDescription>
                  Your opponent must accept the request to undo the last move.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleUndoRequest}>Request Undo</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={isDrawDialogOpen} onOpenChange={setIsDrawDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Handshake className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Offer a Draw</AlertDialogTitle>
                <AlertDialogDescription>
                  Your opponent can accept or decline the draw offer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDrawOffer}>Offer Draw</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={isResignDialogOpen} onOpenChange={setIsResignDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Flag className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to resign?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. Your opponent will win the game.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResign}>Resign</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <AlertDialog 
        open={pendingUndoRequest} 
        onOpenChange={(open) => !open && setPendingUndoRequest(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Undo Move Request</AlertDialogTitle>
            <AlertDialogDescription>
              Your opponent has requested to undo their last move.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleUndoResponse(false)}>
              Decline
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleUndoResponse(true)}>
              Accept
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default GameControls;