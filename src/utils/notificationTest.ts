// Utility functions để test notification system
import { NotificationService } from '@/services/notificationService'
import { ServiceWorkerTest } from './serviceWorkerTest'

export class NotificationTest {
    // Test basic notification support
    static testBasicSupport(): { supported: boolean; details: string } {
        const details: string[] = []

        // Check Notification API
        if ('Notification' in window) {
            details.push('✅ Notification API supported')
        } else {
            details.push('❌ Notification API not supported')
        }

        // Check Service Worker
        if ('serviceWorker' in navigator) {
            details.push('✅ Service Worker supported')
        } else {
            details.push('❌ Service Worker not supported')
        }

        // Check HTTPS
        if (location.protocol === 'https:' || location.hostname === 'localhost') {
            details.push('✅ HTTPS or localhost')
        } else {
            details.push('❌ Need HTTPS (current: ' + location.protocol + ')')
        }

        // Check permission
        const permission = Notification.permission
        switch (permission) {
            case 'granted':
                details.push('✅ Permission granted')
                break
            case 'denied':
                details.push('❌ Permission denied')
                break
            case 'default':
                details.push('⚠️ Permission not requested yet')
                break
        }

        const supported = 'Notification' in window && 'serviceWorker' in navigator &&
            (location.protocol === 'https:' || location.hostname === 'localhost')

        return {
            supported,
            details: details.join('\n')
        }
    }

    // Test FCM token generation
    static async testFCMToken(): Promise<{ success: boolean; token?: string; error?: string }> {
        try {
            const token = await NotificationService.getFCMToken()
            if (token) {
                return { success: true, token }
            } else {
                return { success: false, error: 'No token generated' }
            }
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
        }
    }

    // Test local notification
    static testLocalNotification(): { success: boolean; error?: string } {
        try {
            if (Notification.permission === 'granted') {
                NotificationService.showLocalNotification(
                    'Test Notification',
                    'This is a test notification from Lunar Calendar',
                    '/favicon.ico'
                )
                return { success: true }
            } else {
                return { success: false, error: 'Permission not granted' }
            }
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
        }
    }

    // Test permission request
    static async testPermissionRequest(): Promise<{ granted: boolean; reason?: string }> {
        try {
            const result = await NotificationService.requestPermission()
            return result
        } catch (error) {
            return {
                granted: false,
                reason: error instanceof Error ? error.message : 'Unknown error'
            }
        }
    }

    // Run all tests
    static async runAllTests(): Promise<{
        basicSupport: { supported: boolean; details: string }
        serviceWorker: { fileAccessible: { accessible: boolean; error?: string }; registration: { registered: boolean; active: boolean; error?: string }; registerAttempt: { success: boolean; error?: string } }
        permission: { granted: boolean; reason?: string }
        fcmToken: { success: boolean; token?: string; error?: string }
        localNotification: { success: boolean; error?: string }
    }> {
        console.log('🧪 Running notification tests...')

        const basicSupport = this.testBasicSupport()
        console.log('Basic Support:', basicSupport)

        const serviceWorker = await ServiceWorkerTest.runAllTests()
        console.log('Service Worker:', serviceWorker)

        const permission = await this.testPermissionRequest()
        console.log('Permission:', permission)

        const fcmToken = await this.testFCMToken()
        console.log('FCM Token:', fcmToken)

        const localNotification = this.testLocalNotification()
        console.log('Local Notification:', localNotification)

        return {
            basicSupport,
            serviceWorker,
            permission,
            fcmToken,
            localNotification
        }
    }
}

// Export for console testing
if (typeof window !== 'undefined') {
    (window as any).NotificationTest = NotificationTest
}
