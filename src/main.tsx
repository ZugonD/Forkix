import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";

import App from "./App.tsx";
import "./index.css";

import { GameProvider } from "@/app/providers/GameProvider/GameContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
        <GameProvider>
          <App />
        </GameProvider>
    </Router>
  </StrictMode>
);
