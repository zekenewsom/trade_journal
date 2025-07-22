import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Ensure the server runs on a known port for Electron to connect to
  server: {
    port: 5173, // Default Vite port, ensure it matches main.js
    strictPort: true, // Exit if port is already in use
  },
  // Adjust build output directory if necessary for Electron packaging later.
  // For now, default 'dist' is fine.
  // build: {
  //   outDir: 'dist'
  // }
})