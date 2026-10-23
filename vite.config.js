import { defineConfig } from "vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: ".",
  publicDir: "public",
  server: {
    port: 5173,
    open: true,
    host: true
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        beginning: resolve(__dirname, "beginning.html"),
        timeline: resolve(__dirname, "timeline.html"),
        gallery: resolve(__dirname, "gallery.html"),
        letters: resolve(__dirname, "letters.html"),
        ourTime: resolve(__dirname, "our-time.html"),
        surprise: resolve(__dirname, "surprise.html"),
        forever: resolve(__dirname, "forever.html")
      }
    }
  }
});