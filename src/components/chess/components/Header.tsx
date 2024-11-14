import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, Crown } from "lucide-react";
import { useGame } from "@/app/providers/GameProvider/GameContext";
import { useNavigate } from "react-router-dom";

export const Header: React.FC = () => {
  const { player, opponent, gameSession } = useGame();
  const navigate = useNavigate();

  const handleLeaveGame = () => {
    navigate('/');
  };

  if (!player || !opponent) return null;

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={handleLeaveGame}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Leave Game
        </Button>
        <div className="flex items-center gap-3">
          {gameSession?.status === "completed" && (
            <Crown className={`h-5 w-5 ${
              gameSession.endedAt ? "text-yellow-500" : 
              "text-gray-400"
            }`} />
          )}
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full ${
              opponent.color === "white" ? "bg-black" : "bg-white border-2 border-black"
            }`} />
            <span className="font-semibold">{opponent.name}</span>
            {/* Add rating if you implement it in the Player type */}
          </div>
        </div>
      </div>
    </Card>
  );
};