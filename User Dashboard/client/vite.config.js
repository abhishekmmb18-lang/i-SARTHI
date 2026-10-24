import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/fish-api': {
                target: 'https://api.fish.audio',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/fish-api/, ''),
                headers: {
                    'Origin': 'https://api.fish.audio'
                }
            }
        }
    }
})
