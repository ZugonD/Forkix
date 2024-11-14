import { Card } from "@/components/ui/card";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Separator } from "@radix-ui/react-separator";
import { useEffect, useRef } from "react";
import { useGame } from "@/app/providers/GameProvider/GameContext";

export const MoveHistory: React.FC = () => {
  const { gameState, player } = useGame();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const formatMoveNumber = (index: number) => {
    if (!player?.color) return "";
    const moveNumber = Math.floor(index / 2) + 1;
    return `${moveNumber}${player.color === "black" ? "..." : "."}`;
  };

  // Create a formatted array of moves
  const formattedMoves = gameState.moveHistory.reduce<string[]>((acc, move, index) => {
    const moveNumber = formatMoveNumber(index);
    if (index % 2 === 0) {
      // For white's move
      acc.push(`${moveNumber} ${move}`);
    } else {
      // For black's move
      acc[acc.length - 1] += ` ${move}`;
    }
    return acc;
  }, []);

  // Scroll to the bottom when new move is added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [gameState.moveHistory]);

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-2">Move History</h3>
      <Separator className="mb-4" />
      <ScrollArea className="flex-1 overflow-auto" ref={scrollAreaRef}>
        {gameState.moveHistory.length === 0 ? (
          <p className="text-sm text-gray-500 italic text-center">No moves yet</p>
        ) : (
          <div className="grid gap-2">
            {formattedMoves.map((move, index) => (
              <div
                key={index}
                className={`text-sm ${
                  index % 2 === (player?.color === "white" ? 0 : 1)
                    ? "font-medium"
                    : "text-gray-600"
                }`}
              >
                {move}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};