import { useGame } from "@/app/providers/GameProvider/GameContext.tsx";
import { Card } from "@/components/ui/card.tsx";
import { boardUtils } from "../utils/index.ts";
import { ChessSquare } from "./ChessSquare.tsx";
import PromotionDialog from "./PromotionDialog.tsx";

export const ChessBoard = () => {
  const { gameState, player, promotionState, handlePromotion } = useGame();
  const boardToRender = boardUtils.getDisplayBoard(gameState.board, player?.color);

  return (
    <>
      <Card className="p-1 bg-orange-50 shadow-lg">
        <div className="grid grid-cols-8 gap-0 aspect-square border border-orange-300 rounded-sm overflow-hidden">
          {boardToRender.map((row, rowIndex) =>
            row.map((piece, colIndex) => {
              const [actualRow, actualCol] = boardUtils.transformCoordinates(
                rowIndex,
                colIndex,
                player?.color
              );

              return (
                <ChessSquare
                  key={`${rowIndex}-${colIndex}`}
                  piece={piece}
                  position={{ row: actualRow, col: actualCol }}
                />
              );
            })
          )}
        </div>
      </Card>
      
      <PromotionDialog
        isOpen={promotionState.isPromoting}
        playerColor={player?.color ?? "white"}
        onPieceSelect={handlePromotion}
      />
    </>
  );
};