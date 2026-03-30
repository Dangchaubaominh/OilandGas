import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: "jsdom", // Cực kỳ quan trọng để test React components
    setupFiles: "./src/setupTests.js", // File setup chạy trước mỗi bài test
  },
});
