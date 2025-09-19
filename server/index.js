const express = require('express')
const cors = require('cors')
const admin = require('firebase-admin')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Initialize Firebase Admin SDK
const serviceAccount = require('../serviceAccountKey.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || 'your-project-id'
})

// Routes
app.post('/api/send-notification', async (req, res) => {
    try {
        const { token, notification, data } = req.body

        if (!token) {
            return res.status(400).json({ error: 'Token is required' })
        }

        const message = {
            token: token,
            notification: {
                title: notification.title,
                body: notification.body,
                icon: notification.icon || '/favicon.ico'
            },
            data: data || {},
            webpush: {
                notification: {
                    icon: notification.icon || '/favicon.ico',
                    badge: '/favicon.ico',
                    tag: 'lunar-calendar-event',
                    requireInteraction: true
                }
            }
        }

        const response = await admin.messaging().send(message)
        console.log('Successfully sent message:', response)

        res.json({ success: true, messageId: response })
    } catch (error) {
        console.error('Error sending message:', error)
        res.status(500).json({ error: error.message })
    }
})

app.post('/api/send-notifications', async (req, res) => {
    try {
        const { tokens, notification, data } = req.body

        if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
            return res.status(400).json({ error: 'Tokens array is required' })
        }

        const message = {
            tokens: tokens,
            notification: {
                title: notification.title,
                body: notification.body,
                icon: notification.icon || '/favicon.ico'
            },
            data: data || {},
            webpush: {
                notification: {
                    icon: notification.icon || '/favicon.ico',
                    badge: '/favicon.ico',
                    tag: 'lunar-calendar-event',
                    requireInteraction: true
                }
            }
        }

        const response = await admin.messaging().sendMulticast(message)
        console.log('Successfully sent messages:', response)

        res.json({
            success: true,
            successCount: response.successCount,
            totalCount: response.failureCount + response.successCount,
            errors: response.responses
                .filter(r => !r.success)
                .map(r => r.error?.message || 'Unknown error')
        })
    } catch (error) {
        console.error('Error sending messages:', error)
        res.status(500).json({ error: error.message })
    }
})

app.post('/api/send-daily-notifications', async (req, res) => {
    try {
        // Lấy tất cả FCM tokens từ Firestore
        const db = admin.firestore()
        const tokensSnapshot = await db.collection('fcm_tokens')
            .where('isActive', '==', true)
            .get()

        const tokens = tokensSnapshot.docs.map(doc => doc.data().token)
        console.log(`Found ${tokens.length} FCM tokens for daily notifications from fcm_tokens collection`)

        if (tokens.length === 0) {
            return res.json({
                success: true,
                successCount: 0,
                totalCount: 0
            })
        }

        const message = {
            tokens: tokens,
            notification: {
                title: 'Thông báo hàng ngày',
                body: 'Hãy kiểm tra sự kiện hôm nay trong lịch âm của bạn!',
                icon: '/favicon.ico'
            },
            webpush: {
                notification: {
                    icon: '/favicon.ico',
                    badge: '/favicon.ico',
                    tag: 'lunar-calendar-event',
                    requireInteraction: true
                }
            }
        }

        const response = await admin.messaging().sendMulticast(message)
        console.log('Successfully sent daily notifications:', response)

        res.json({
            success: true,
            successCount: response.successCount,
            totalCount: response.failureCount + response.successCount
        })
    } catch (error) {
        console.error('Error sending daily notifications:', error)
        res.status(500).json({ error: error.message })
    }
})

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
    console.log(`FCM API Server running on port ${PORT}`)
})

