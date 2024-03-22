import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

dotenv.config()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5000, 
    host: '0.0.0.0',
    https: {
      key: process.env.PRIV_KEY,
      cert: process.env.CERT
    }
  }
})
