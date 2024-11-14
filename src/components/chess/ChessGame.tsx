import { useGame } from "@/app/providers/GameProvider/GameContext";
import { ChessBoard } from "./components/ChessBoard";
import { Header } from "./components/Header";
import { MoveHistory } from "./components/MoveHistory";
import { GameControls } from "./components/GameControls";

const ChessGame: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Header />
          <div className="my-6">
            <ChessBoard />
          </div>
          <GameControls />
        </div>
        <aside className="space-y-6">
          <MoveHistory />
        </aside>
      </div>
    </div>
  );
};

export default ChessGame;