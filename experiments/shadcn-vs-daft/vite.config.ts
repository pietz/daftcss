import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        host: path.resolve(import.meta.dirname, "index.html"),
        components: path.resolve(import.meta.dirname, "components.html"),
        shadcn: path.resolve(import.meta.dirname, "shadcn.html"),
        daft: path.resolve(import.meta.dirname, "daft.html"),
        daftOld: path.resolve(import.meta.dirname, "daft-old.html"),
        componentsShadcn: path.resolve(import.meta.dirname, "components-shadcn.html"),
        componentsDaft: path.resolve(import.meta.dirname, "components-daft.html"),
        componentsDaftOld: path.resolve(import.meta.dirname, "components-daft-old.html"),
      },
    },
  },
})
