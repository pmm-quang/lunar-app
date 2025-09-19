// Service để gửi FCM notification qua API endpoint sử dụng Firebase Admin SDK
export class FCMApiV1Service {
    private static readonly API_URL = import.meta.env.VITE_FCM_API_URL || '/api'

    // Gửi thông báo đến một token
    static async sendNotificationToToken(token: string, notification: {
        title: string
        body: string
        icon?: string
        data?: any
    }): Promise<boolean> {
        try {
            const response = await fetch(`${this.API_URL}/send-notification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    notification: {
                        title: notification.title,
                        body: notification.body,
                        icon: notification.icon || '/favicon.ico'
                    },
                    data: notification.data || {}
                })
            })

            if (response.ok) {
                console.log('FCM notification sent successfully')
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
        try {
            const response = await fetch(`${this.API_URL}/send-notifications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tokens,
                    notification: {
                        title: notification.title,
                        body: notification.body,
                        icon: notification.icon || '/favicon.ico'
                    },
                    data: notification.data || {}
                })
            })

            if (response.ok) {
                const result = await response.json()
                return {
                    successCount: result.successCount || 0,
                    totalCount: result.totalCount || tokens.length,
                    errors: result.errors || []
                }
            } else {
                const error = await response.text()
                console.error('Failed to send FCM notifications:', response.status, error)
                return {
                    successCount: 0,
                    totalCount: tokens.length,
                    errors: [`API Error: ${response.status} - ${error}`]
                }
            }
        } catch (error) {
            console.error('Error sending FCM notifications:', error)
            return {
                successCount: 0,
                totalCount: tokens.length,
                errors: [`Network Error: ${error}`]
            }
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

    // Gửi thông báo hàng ngày
    static async sendDailyNotifications(): Promise<{ successCount: number; totalCount: number }> {
        try {
            const response = await fetch(`${this.API_URL}/send-daily-notifications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            if (response.ok) {
                const result = await response.json()
                return {
                    successCount: result.successCount || 0,
                    totalCount: result.totalCount || 0
                }
            } else {
                const error = await response.text()
                console.error('Failed to send daily notifications:', response.status, error)
                return {
                    successCount: 0,
                    totalCount: 0
                }
            }
        } catch (error) {
            console.error('Error sending daily notifications:', error)
            return {
                successCount: 0,
                totalCount: 0
            }
        }
    }
}

