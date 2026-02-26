import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'  // Keep this if you're using Tailwind v4

export default defineConfig({
  base: '/Rim-and-Tire-Swap/',  // Correct for GitHub Pages at https://realisimhq.github.io/rim-and-tire-swap/
  plugins: [
    react(),
    tailwindcss(),  // Enables Tailwind v4 properly (remove comment if you have it)
  ],
  server: {
    host: true,  // Good for Codespaces previews
  },
})
