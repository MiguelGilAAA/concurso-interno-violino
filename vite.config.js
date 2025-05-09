// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Crucial import

export default defineConfig({
  base: '/concurso-interno-violino/', // Nome do repositório
  plugins: [react()]
})
