// Service để gọi API gửi FCM notification
const FCM_API_URL = import.meta.env.VITE_FCM_API_URL || 'http://localhost:3001/api'

export class FCMApiService {
    // Gửi notification đến một token
    static async sendNotificationToToken(token: string, notification: any): Promise<boolean> {
        try {
            const response = await fetch(`${FCM_API_URL}/send-notification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    notification: {
                        title: notification.title,
                        body: notification.body,
                        icon: notification.icon || '/favicon.ico',
                        badge: '/favicon.ico',
                        tag: 'lunar-calendar-event',
                        requireInteraction: true
                    },
                    data: notification.data || {}
                })
            })

            if (response.ok) {
                console.log('FCM notification sent successfully')
                return true
            } else {
                console.error('Failed to send FCM notification:', response.statusText)
                return false
            }
        } catch (error) {
            console.error('Error sending FCM notification:', error)
            return false
        }
    }

    // Gửi notification đến nhiều tokens
    static async sendNotificationToTokens(tokens: string[], notification: any): Promise<number> {
        let successCount = 0

        for (const token of tokens) {
            const success = await this.sendNotificationToToken(token, notification)
            if (success) {
                successCount++
            }
        }

        return successCount
    }

    // Gửi notification đến tất cả user có sự kiện hôm nay
    static async sendDailyNotifications(): Promise<void> {
        try {
            const response = await fetch(`${FCM_API_URL}/send-daily-notifications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            if (response.ok) {
                const result = await response.json()
                console.log(`Daily notifications sent: ${result.successCount}/${result.totalUsers}`)
            } else {
                console.error('Failed to send daily notifications:', response.statusText)
            }
        } catch (error) {
            console.error('Error sending daily notifications:', error)
        }
    }

    // Test notification
    static async testNotification(): Promise<boolean> {
        try {
            const response = await fetch(`${FCM_API_URL}/test-notification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            return response.ok
        } catch (error) {
            console.error('Error testing notification:', error)
            return false
        }
    }
}

// Export for console testing
if (typeof window !== 'undefined') {
    (window as any).FCMApiService = FCMApiService
}
