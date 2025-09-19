// Service để gửi FCM notification qua HTTP v1 API với Service Account
export class FCMV1Service {
    private static readonly PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID
    private static readonly SERVICE_ACCOUNT_KEY = import.meta.env.VITE_FIREBASE_SERVICE_ACCOUNT_KEY
    private static readonly FCM_V1_URL = `https://fcm.googleapis.com/v1/projects/${this.PROJECT_ID}/messages:send`

    // Lấy access token từ Service Account Key
    private static async getAccessToken(): Promise<string> {
        try {
            if (!this.SERVICE_ACCOUNT_KEY || this.SERVICE_ACCOUNT_KEY === 'your_service_account_key_here') {
                throw new Error('Service Account Key not configured')
            }

            const serviceAccount = JSON.parse(this.SERVICE_ACCOUNT_KEY)

            // Tạo JWT token
            const header = {
                alg: 'RS256',
                typ: 'JWT'
            }

            const now = Math.floor(Date.now() / 1000)
            const payload = {
                iss: serviceAccount.client_email,
                scope: 'https://www.googleapis.com/auth/firebase.messaging',
                aud: 'https://oauth2.googleapis.com/token',
                iat: now,
                exp: now + 3600
            }

            // Tạo JWT (simplified - trong thực tế cần thư viện JWT)
            const jwt = this.createJWT(header, payload, serviceAccount.private_key)

            // Gọi OAuth 2.0 endpoint
            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
            })

            if (!response.ok) {
                throw new Error(`OAuth error: ${response.statusText}`)
            }

            const data = await response.json()
            return data.access_token
        } catch (error) {
            console.error('Error getting access token:', error)
            throw error
        }
    }

    // Tạo JWT token (simplified implementation)
    private static createJWT(header: any, payload: any, privateKey: string): string {
        // Trong thực tế, cần sử dụng thư viện JWT như 'jsonwebtoken'
        // Đây là implementation đơn giản cho demo
        const encodedHeader = btoa(JSON.stringify(header))
        const encodedPayload = btoa(JSON.stringify(payload))
        const signature = 'dummy_signature' // Cần implement RSA signing

        return `${encodedHeader}.${encodedPayload}.${signature}`
    }

    // Gửi thông báo đến một token
    static async sendNotificationToToken(token: string, notification: {
        title: string
        body: string
        icon?: string
        data?: any
    }): Promise<boolean> {
        try {
            const accessToken = await this.getAccessToken()

            const message = {
                message: {
                    token: token,
                    notification: {
                        title: notification.title,
                        body: notification.body
                    },
                    data: notification.data || {},
                    webpush: {
                        notification: {
                            icon: notification.icon || '/favicon.ico',
                            badge: '/favicon.ico',
                            tag: 'lunar-calendar-event',
                            requireInteraction: true
                        }
                    }
                }
            }

            const response = await fetch(this.FCM_V1_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(message)
            })

            if (response.ok) {
                const result = await response.json()
                console.log('FCM v1 notification sent successfully:', result)
                return true
            } else {
                const error = await response.text()
                console.error('Failed to send FCM v1 notification:', response.status, error)
                return false
            }
        } catch (error) {
            console.error('Error sending FCM v1 notification:', error)
            return false
        }
    }

    // Gửi thông báo đến nhiều tokens
    static async sendNotificationToTokens(tokens: string[], notification: {
        title: string
        body: string
        icon?: string
        data?: any
    }): Promise<{ successCount: number; totalCount: number; errors: string[] }> {
        let successCount = 0
        const errors: string[] = []

        for (const token of tokens) {
            try {
                const success = await this.sendNotificationToToken(token, notification)
                if (success) {
                    successCount++
                } else {
                    errors.push(`Failed to send to token: ${token.substring(0, 20)}...`)
                }
            } catch (error) {
                errors.push(`Error sending to token ${token.substring(0, 20)}...: ${error}`)
            }
        }

        return {
            successCount,
            totalCount: tokens.length,
            errors
        }
    }

    // Test notification (sử dụng Web Notifications API)
    static async testNotification(): Promise<boolean> {
        try {
            if ('Notification' in window) {
                if (Notification.permission === 'granted') {
                    const notif = new Notification('Test Notification', {
                        body: 'Đây là thông báo test từ hệ thống',
                        icon: '/favicon.ico',
                        badge: '/favicon.ico',
                        tag: 'lunar-calendar-event',
                        requireInteraction: true
                    })

                    notif.onclick = () => {
                        window.focus()
                        notif.close()
                    }

                    console.log('Test notification sent successfully')
                    return true
                } else if (Notification.permission === 'default') {
                    const permission = await Notification.requestPermission()
                    if (permission === 'granted') {
                        return await this.testNotification()
                    }
                }
            }

            console.error('Notification permission denied or not supported')
            return false
        } catch (error) {
            console.error('Error testing notification:', error)
            return false
        }
    }
}

