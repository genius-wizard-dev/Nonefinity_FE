import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "refractor/lib/core": "refractor/core.js",
      "refractor/lib/all": "refractor/all.js",
      "refractor/lang": "refractor/lang",
    },
  },
});
