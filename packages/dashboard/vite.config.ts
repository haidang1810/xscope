import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // Proxy WebSocket connections to CLI backend in dev
      "/ws": {
        target: "ws://localhost:5757",
        ws: true,
        rewriteWsOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
  },
});
