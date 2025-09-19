import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import express from 'express'
import { healthCheck, sendNotification, sendNotifications, sendDailyNotifications, testNotification } from './api/routes.js'

export default defineConfig({
    plugins: [
        vue(),
        {
            name: 'api-server',
            configureServer(server) {
                // Create Express app for API routes
                const app = express()
                app.use(express.json())

                // API routes
                app.get('/api/health', healthCheck)
                app.post('/api/v1/send-notification', sendNotification)
                app.post('/api/v1/send-notifications', sendNotifications)
                app.post('/api/send-daily-notifications', sendDailyNotifications)
                app.post('/api/v1/test-notification', testNotification)

                // Use Express app as middleware
                server.middlewares.use('/api', app)
            }
        }
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    server: {
        port: 5173, // Vite default port
        open: true,
        https: false, // Set to true for HTTPS in development
        host: true
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
        minify: 'terser'
    },
    // Remove hardcoded environment variables - let Vite handle .env files naturally
})
