import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0', // Bind to all available IPs
    port: 5173 // Optional: Ensure the port remains 5173
  },
  plugins: [react()],
})
