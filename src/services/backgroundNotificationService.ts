// Service để gửi background notification
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db } from '@/config/firebase'

export class BackgroundNotificationService {
    // Gửi notification cho tất cả user có sự kiện hôm nay
    static async sendDailyNotifications(): Promise<void> {
        try {
            console.log('Starting daily notification check...')

            const today = new Date()
            const year = today.getFullYear()
            const month = today.getMonth() + 1
            const day = today.getDate()

            // Lấy tất cả user có sự kiện hôm nay
            const eventsQuery = query(
                collection(db, 'events'),
                where('date.year', '==', year),
                where('date.month', '==', month),
                where('date.day', '==', day)
            )

            const eventsSnapshot = await getDocs(eventsQuery)
            const userEvents: { [userId: string]: any[] } = {}

            // Nhóm sự kiện theo user
            eventsSnapshot.forEach((doc) => {
                const data = doc.data()
                const userId = data.userId

                if (!userEvents[userId]) {
                    userEvents[userId] = []
                }

                userEvents[userId].push({ id: doc.id, ...data })
            })

            // Gửi notification cho mỗi user
            for (const [userId, events] of Object.entries(userEvents)) {
                await this.sendNotificationToUser(userId, events)
            }

            console.log(`Sent notifications to ${Object.keys(userEvents).length} users`)
        } catch (error) {
            console.error('Error sending daily notifications:', error)
        }
    }

    // Gửi notification cho một user cụ thể
    static async sendNotificationToUser(userId: string, events: any[]): Promise<void> {
        try {
            // Lấy FCM tokens của user
            const tokensQuery = query(
                collection(db, 'fcm_tokens'),
                where('userId', '==', userId),
                where('isActive', '==', true)
            )

            const tokensSnapshot = await getDocs(tokensQuery)

            if (tokensSnapshot.empty) {
                console.log(`No FCM tokens found for user ${userId}`)
                return
            }

            // Tạo notification message
            const notification = this.createNotificationMessage(events)

            // Gửi notification đến tất cả tokens của user
            for (const tokenDoc of tokensSnapshot.docs) {
                const tokenData = tokenDoc.data()
                const token = tokenData.token

                await this.sendFCMNotification(token, notification)
            }
        } catch (error) {
            console.error(`Error sending notification to user ${userId}:`, error)
        }
    }

    // Tạo notification message
    static createNotificationMessage(events: any[]): any {
        if (events.length === 1) {
            const event = events[0]
            return {
                title: `Sự kiện hôm nay: ${event.title}`,
                body: event.description || `Sự kiện ${event.title} diễn ra hôm nay`,
                icon: '/favicon.ico',
                data: {
                    eventId: event.id,
                    type: 'event_reminder'
                }
            }
        } else {
            return {
                title: `Bạn có ${events.length} sự kiện hôm nay`,
                body: `Có ${events.length} sự kiện đang chờ bạn: ${events.map(e => e.title).join(', ')}`,
                icon: '/favicon.ico',
                data: {
                    type: 'multiple_events',
                    eventCount: events.length
                }
            }
        }
    }

    // Gửi FCM notification (cần server-side implementation)
    static async sendFCMNotification(token: string, notification: any): Promise<void> {
        // Đây là client-side, không thể gửi FCM trực tiếp
        // Cần server-side API để gửi FCM
        console.log('Would send FCM notification:', { token, notification })

        // Trong thực tế, bạn cần gọi API server để gửi FCM
        // Ví dụ: await fetch('/api/send-notification', { ... })
    }

    // Lên lịch kiểm tra hàng ngày (client-side)
    static scheduleDailyCheck(): void {
        // Kiểm tra ngay lập tức
        this.sendDailyNotifications()

        // Kiểm tra mỗi ngày lúc 8:00 AM
        const now = new Date()
        const nextCheck = new Date()
        nextCheck.setHours(8, 0, 0, 0)

        if (nextCheck <= now) {
            nextCheck.setDate(nextCheck.getDate() + 1)
        }

        const timeUntilCheck = nextCheck.getTime() - now.getTime()

        setTimeout(() => {
            this.sendDailyNotifications()
            // Lên lịch cho ngày tiếp theo
            this.scheduleDailyCheck()
        }, timeUntilCheck)

        console.log(`Next notification check scheduled for: ${nextCheck.toLocaleString()}`)
    }

    // Test notification (chỉ hoạt động khi app đang mở)
    static async testNotification(): Promise<void> {
        try {
            const testEvent = {
                id: 'test',
                title: 'Test Event',
                description: 'This is a test notification',
                date: {
                    year: new Date().getFullYear(),
                    month: new Date().getMonth() + 1,
                    day: new Date().getDate()
                }
            }

            const notification = this.createNotificationMessage([testEvent])

            // Hiển thị local notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(notification.title, {
                    body: notification.body,
                    icon: notification.icon,
                    badge: '/favicon.ico',
                    tag: 'lunar-calendar-test',
                    requireInteraction: true
                })
            }
        } catch (error) {
            console.error('Error testing notification:', error)
        }
    }
}

// Export for console testing
if (typeof window !== 'undefined') {
    (window as any).BackgroundNotificationService = BackgroundNotificationService
}
