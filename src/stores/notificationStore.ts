import { defineStore } from 'pinia'
import { ref } from 'vue'
import { NotificationService } from '@/services/notificationService'

export const useNotificationStore = defineStore('notification', () => {
    const isSupported = ref(false)
    const permission = ref<NotificationPermission>('default')
    const fcmToken = ref<string | null>(null)
    const isEnabled = ref(false)

    // Kiểm tra hỗ trợ notification
    const checkSupport = (): boolean => {
        const supported = 'Notification' in window && 'serviceWorker' in navigator
        isSupported.value = supported
        return supported
    }

    // Kiểm tra permission hiện tại
    const checkPermission = (): NotificationPermission => {
        if (!isSupported.value) return 'denied'

        const currentPermission = Notification.permission
        permission.value = currentPermission
        return currentPermission
    }

    // Yêu cầu permission
    const requestPermission = async (): Promise<{ granted: boolean; reason?: string }> => {
        if (!isSupported.value) {
            console.warn('Notifications not supported')
            return { granted: false, reason: 'Notifications not supported' }
        }

        try {
            const result = await NotificationService.requestPermission()
            permission.value = Notification.permission
            return result
        } catch (error) {
            console.error('Error requesting notification permission:', error)
            return { granted: false, reason: 'Error requesting permission' }
        }
    }

    // Đăng ký FCM token
    const registerFCMToken = async (userId: string): Promise<boolean> => {
        try {
            const token = await NotificationService.getFCMToken()
            if (token) {
                fcmToken.value = token

                try {
                    await NotificationService.saveFCMToken(userId, token)
                    console.log('FCM token saved to Firestore')
                } catch (saveError) {
                    console.warn('Failed to save FCM token to Firestore, using localStorage fallback:', saveError)
                    // Sử dụng localStorage làm fallback
                    NotificationService.saveFCMTokenToLocalStorage(userId, token)
                }

                isEnabled.value = true
                return true
            }
            return false
        } catch (error) {
            console.error('Error registering FCM token:', error)
            return false
        }
    }

    // Hủy đăng ký FCM token
    const unregisterFCMToken = async (userId: string): Promise<void> => {
        try {
            await NotificationService.removeFCMToken(userId)
            fcmToken.value = null
            isEnabled.value = false
        } catch (error) {
            console.error('Error unregistering FCM token:', error)
        }
    }

    // Bắt đầu lên lịch kiểm tra sự kiện
    const startEventChecking = (userId: string): void => {
        if (isEnabled.value) {
            NotificationService.scheduleDailyCheck(userId)
        }
    }

    // Dừng lên lịch kiểm tra sự kiện
    const stopEventChecking = (): void => {
        // Có thể thêm logic để dừng scheduled checks
        console.log('Event checking stopped')
    }

    // Lắng nghe tin nhắn foreground
    const setupMessageListener = (): void => {
        if (!isEnabled.value) return

        NotificationService.onMessage((payload) => {
            console.log('Message received:', payload)

            const { notification } = payload
            if (notification) {
                NotificationService.showLocalNotification(
                    notification.title,
                    notification.body,
                    notification.icon
                )
            }
        })
    }

    // Khởi tạo notification system
    const initialize = async (userId: string): Promise<boolean> => {
        try {
            // Kiểm tra hỗ trợ
            if (!checkSupport()) {
                console.warn('Notifications not supported in this browser')
                return false
            }

            // Kiểm tra permission hiện tại
            const currentPermission = checkPermission()
            console.log('Current notification permission:', currentPermission)

            if (currentPermission === 'denied') {
                console.warn('Notification permission denied by user')
                return false
            }

            // Yêu cầu permission nếu chưa có
            if (currentPermission === 'default') {
                const granted = await requestPermission()
                if (!granted) {
                    return false
                }
            }

            // Đăng ký FCM token
            const registered = await registerFCMToken(userId)
            if (registered) {
                setupMessageListener()
                startEventChecking(userId)
                return true
            }

            return false
        } catch (error) {
            console.error('Error initializing notifications:', error)
            return false
        }
    }

    // Dọn dẹp khi đăng xuất
    const cleanup = async (userId: string): Promise<void> => {
        try {
            stopEventChecking()
            await unregisterFCMToken(userId)
        } catch (error) {
            console.error('Error cleaning up notifications:', error)
        }
    }

    return {
        // State
        isSupported,
        permission,
        fcmToken,
        isEnabled,

        // Actions
        checkSupport,
        checkPermission,
        requestPermission,
        registerFCMToken,
        unregisterFCMToken,
        startEventChecking,
        stopEventChecking,
        setupMessageListener,
        initialize,
        cleanup
    }
})
