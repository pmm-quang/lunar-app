import { getMessaging, getToken } from 'firebase/messaging'
import { messaging } from '@/config/firebase'

export class DirectFCMService {
    // Gửi thông báo trực tiếp qua FCM (chỉ hoạt động trong browser)
    static async sendNotificationToToken(token: string, notification: {
        title: string
        body: string
        icon?: string
        data?: any
    }): Promise<boolean> {
        try {
            // Sử dụng Web Notifications API để hiển thị thông báo
            if ('Notification' in window) {
                if (Notification.permission === 'granted') {
                    const notif = new Notification(notification.title, {
                        body: notification.body,
                        icon: notification.icon || '/favicon.ico',
                        badge: '/favicon.ico',
                        tag: 'lunar-calendar-event',
                        requireInteraction: true,
                        data: notification.data || {}
                    })

                    notif.onclick = () => {
                        window.focus()
                        notif.close()
                    }

                    console.log('Notification sent successfully')
                    return true
                } else if (Notification.permission === 'default') {
                    const permission = await Notification.requestPermission()
                    if (permission === 'granted') {
                        return await this.sendNotificationToToken(token, notification)
                    }
                }
            }

            console.error('Notification permission denied or not supported')
            return false
        } catch (error) {
            console.error('Error sending notification:', error)
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
            // Kiểm tra permission trước
            if ('Notification' in window) {
                if (Notification.permission === 'granted') {
                    return await this.sendNotificationToToken('test-token', {
                        title: 'Test Notification',
                        body: 'Đây là thông báo test từ hệ thống',
                        icon: '/favicon.ico'
                    })
                } else if (Notification.permission === 'default') {
                    const permission = await Notification.requestPermission()
                    if (permission === 'granted') {
                        return await this.sendNotificationToToken('test-token', {
                            title: 'Test Notification',
                            body: 'Đây là thông báo test từ hệ thống',
                            icon: '/favicon.ico'
                        })
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
