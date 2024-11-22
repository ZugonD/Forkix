import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx';

const PROMOTION_PIECES = {
  white: ['♕', '♖', '♗', '♘'],
  black: ['♛', '♜', '♝', '♞']
};

const PromotionDialog: React.FC<{
  isOpen: boolean;
  playerColor: "white" | "black";
  onPieceSelect: (piece: string) => void;
}> = ({ isOpen, playerColor, onPieceSelect }) => {
  const pieces = PROMOTION_PIECES[playerColor];
  
  return (
    <Dialog open={isOpen}>
      <DialogContent className="w-64">
        <DialogHeader>
          <DialogTitle>Choose promotion piece</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-2">
          {pieces.map((piece, index) => (
            <button
              key={index}
              onClick={() => onPieceSelect(piece)}
              className="aspect-square flex items-center justify-center text-4xl hover:bg-orange-100 rounded-md transition-colors"
            >
              {piece}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromotionDialog;