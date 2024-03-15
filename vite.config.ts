import { join } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/CSmCG",
  build: {
    rollupOptions: {
      input: {
        main: join(import.meta.dirname, "index.html"),
        lab1: join(import.meta.dirname, "lab1/index.html"),
      },
    },
  },
});
