import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Sur GitHub Pages, l'app est servie sous /elections-us/ ; en local, à la racine.
const base = process.env.GITHUB_ACTIONS ? '/elections-us/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
})
