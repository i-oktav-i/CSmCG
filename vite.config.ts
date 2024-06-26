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
        "lab3/v1": join(import.meta.dirname, "lab3/v1/index.html"),
        lab4: join(import.meta.dirname, "lab4/index.html"),
        lab5: join(import.meta.dirname, "lab5/index.html"),
        lab6: join(import.meta.dirname, "lab6/index.html"),
        lab8: join(import.meta.dirname, "lab8/index.html"),
        "lab8/sparkler": join(import.meta.dirname, "lab8/sparkler/index.html"),
        "lab8/fireworks/": join(
          import.meta.dirname,
          "lab8/fireworks/index.html"
        ),
        "lab8/smoke": join(import.meta.dirname, "lab8/smoke/index.html"),
        "lab8/sandglass": join(
          import.meta.dirname,
          "lab8/sandglass/index.html"
        ),
      },
    },
  },
});
