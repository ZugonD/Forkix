import { useGame } from "../../../app/providers/GameProvider/GameContext";
import { Card } from "../../../components/ui/card";
import { boardUtils } from "../utils";
import { ChessSquare } from "./ChessSquare"
// ChessBoard Component
export const ChessBoard = () => {
  const { gameState, player } = useGame();
  const boardToRender = boardUtils.getDisplayBoard(gameState.board, player?.color);

  return (
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
  );
};