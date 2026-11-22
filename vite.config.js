
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  // We keep the root at '.' so it sees your main index.html
  root: ".",
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        auth: resolve(import.meta.dirname, "src/auth/index.html"),
        dashboard: resolve(import.meta.dirname, "src/dashboard/index.html"),
        payment: resolve(import.meta.dirname, "src/payment/index.html"),
      },
    },
  },
});

