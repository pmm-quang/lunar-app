// Service để gửi FCM notification qua REST API
export class FCMRestService {
    private static readonly FCM_SERVER_KEY = import.meta.env.VITE_FIREBASE_SERVER_KEY || 'your_server_key_here'
    private static readonly FCM_URL = 'https://fcm.googleapis.com/fcm/send'

    // Gửi thông báo đến một token
    static async sendNotificationToToken(token: string, notification: {
        title: string
        body: string
        icon?: string
        data?: any
    }): Promise<boolean> {
        try {
            if (this.FCM_SERVER_KEY === 'your_server_key_here') {
                console.error('Firebase Server Key not configured')
                return false
            }

            const payload = {
                to: token,
                notification: {
                    title: notification.title,
                    body: notification.body,
                    icon: notification.icon || '/favicon.ico',
                    badge: '/favicon.ico',
                    tag: 'lunar-calendar-event',
                    requireInteraction: true
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

            const response = await fetch(this.FCM_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `key=${this.FCM_SERVER_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            if (response.ok) {
                const result = await response.json()
                console.log('FCM notification sent successfully:', result)
                return true
            } else {
                const error = await response.text()
                console.error('Failed to send FCM notification:', response.status, error)
                return false
            }
        } catch (error) {
            console.error('Error sending FCM notification:', error)
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

    // Test notification (gửi đến chính mình)
    static async testNotification(): Promise<boolean> {
        try {
            // Sử dụng Web Notifications API cho test
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

