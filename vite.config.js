import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Triggering restart for tailwind
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
