// Fallback notification system khi FCM không hoạt động
export class FallbackNotification {
    // Kiểm tra xem có thể sử dụng fallback không
    static canUseFallback(): boolean {
        return 'Notification' in window && Notification.permission === 'granted'
    }

    // Hiển thị thông báo fallback
    static showNotification(title: string, body: string, icon?: string): void {
        if (!this.canUseFallback()) {
            console.warn('Fallback notification not available')
            return
        }

        try {
            const notification = new Notification(title, {
                body,
                icon: icon || '/favicon.ico',
                badge: '/favicon.ico',
                tag: 'lunar-calendar-event-fallback',
                requireInteraction: true
            })

            notification.onclick = () => {
                window.focus()
                notification.close()
            }

            // Auto close after 10 seconds
            setTimeout(() => {
                notification.close()
            }, 10000)

            console.log('Fallback notification shown:', title)
        } catch (error) {
            console.error('Error showing fallback notification:', error)
        }
    }

    // Lên lịch kiểm tra sự kiện với fallback
    static scheduleEventCheck(userId: string, checkEvents: () => Promise<void>): void {
        // Kiểm tra ngay lập tức
        checkEvents()

        // Kiểm tra mỗi ngày lúc 8:00 AM
        const now = new Date()
        const nextCheck = new Date()
        nextCheck.setHours(8, 0, 0, 0)

        if (nextCheck <= now) {
            nextCheck.setDate(nextCheck.getDate() + 1)
        }

        const timeUntilCheck = nextCheck.getTime() - now.getTime()

        setTimeout(() => {
            checkEvents()
            // Lên lịch cho ngày tiếp theo
            this.scheduleEventCheck(userId, checkEvents)
        }, timeUntilCheck)

        console.log(`Fallback event check scheduled for: ${nextCheck.toLocaleString()}`)
    }

    // Test fallback notification
    static testFallback(): boolean {
        if (!this.canUseFallback()) {
            console.warn('Fallback notification not available')
            return false
        }

        this.showNotification(
            'Test Fallback Notification',
            'This is a fallback notification test',
            '/favicon.ico'
        )

        return true
    }
}

// Export for console testing
if (typeof window !== 'undefined') {
    (window as any).FallbackNotification = FallbackNotification
}
