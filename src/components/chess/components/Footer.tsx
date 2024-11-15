import { useGame } from "@/app/providers/GameProvider/GameContext.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { RotateCcw, Flag } from "lucide-react";

export const Footer: React.FC = () => {
  const { resign, requestUndo } = useGame();

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-white border-2 border-black rounded-full" />
          <span className="font-semibold">You</span>
          <Badge variant="secondary">1450</Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={requestUndo}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={resign}>
            <Flag className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};