import { join } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/CSmCG",
  build: {
    minify: false,
    target: "esnext",
    rollupOptions: {
      input: {
        main: join(import.meta.dirname, "index.html"),
        lab1: join(import.meta.dirname, "lab1/index.html"),
        lab2: join(import.meta.dirname, "lab2/index.html"),
        "lab2/cube": join(import.meta.dirname, "lab2/cube/index.html"),
        "lab2/polygon": join(import.meta.dirname, "lab2/polygon/index.html"),
        "lab2/square": join(import.meta.dirname, "lab2/square/index.html"),
        lab3: join(import.meta.dirname, "lab3/index.html"),
      },
    },
  },
});
