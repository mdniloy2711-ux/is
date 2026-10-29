import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// Every code file sits in this same folder — styles.css, main.tsx, App.tsx, sections.
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
});
