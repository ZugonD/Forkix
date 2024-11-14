import { Routes, Route, Navigate } from 'react-router-dom';
import ChessGame from '@/components/chess/ChessGame';
import Matchmaking from '@/components/matchmaking/components/Matchmaking';

function App() {
  return (
    <Routes>
      <Route path="/lobby" element={<Matchmaking />} />
      <Route path="/game/:gameId" element={<ChessGame />} />
      <Route path="*" element={<Navigate to="/lobby" replace />} />
    </Routes>
  );
}

export default App;