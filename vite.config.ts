import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [react(), tailwindcss(), nodePolyfills()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "refractor/lib/core": "refractor/core.js",
      "refractor/lib/all": "refractor/all.js",
      "refractor/lang": "refractor/lang",
    },
  },
  ssr: {
    noExternal: ["streamdown"],
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "antd-vendor": ["antd"],
          "radix-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-slot",
            "@radix-ui/react-label",
            "@radix-ui/react-select",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-collapsible",
            "@radix-ui/react-hover-card",
            "@radix-ui/react-popover",
            "@radix-ui/react-progress",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-separator",
            "@radix-ui/react-switch",
            "@radix-ui/react-tabs",
            "@radix-ui/react-tooltip",
          ],
          "motion-vendor": ["framer-motion", "motion"],
          "highlight-vendor": ["highlight.js"],
          "syntax-highlighter-vendor": ["react-syntax-highlighter"],
          "refractor-vendor": ["refractor"],
          "flow-vendor": ["@xyflow/react", "reactflow"],
          "icons-vendor": ["lucide-react", "react-icons"],
          "utils-vendor": ["date-fns", "dayjs", "zod", "axios"],
          "monaco-vendor": ["@monaco-editor/react"],
          "ai-vendor": ["ai"],
          "markdown-vendor": [
            "react-markdown",
            "rehype-highlight",
            "rehype-raw",
            "remark-breaks",
            "remark-gfm",
            "remark-rehype",
          ],
          "pdf-vendor": ["react-pdf"],
          "xlsx-vendor": ["xlsx"],
        },
      },
    },
  },
});
