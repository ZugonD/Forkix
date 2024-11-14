import App from "./App";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { GameProvider } from "@/app/providers/GameProvider/GameContext";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
        <GameProvider>
          <App />
        </GameProvider>
    </Router>
  </StrictMode>
);
