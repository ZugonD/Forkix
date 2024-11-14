// vite.config.ts
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Include extensions for module resolution if needed
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  server: {
    host: "0.0.0.0",
    port: 6969,
  },
});
