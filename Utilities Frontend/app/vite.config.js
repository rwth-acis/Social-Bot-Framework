import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: "src/static-app.js",
      formats: ["es"],
    },
    rollupOptions: {
      external: /^lit/,
    },
  },
  server: {
    port: 8082,
  },
});
