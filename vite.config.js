import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Lokaal: stuur /api calls door naar de Vercel dev server op poort 3001
      // Of gebruik: vercel dev (start beide tegelijk)
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
