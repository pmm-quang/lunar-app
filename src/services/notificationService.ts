import { messaging, getToken, onMessage } from '@/config/firebase'
import { collection, addDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { FallbackNotification } from '@/utils/fallbackNotification'
import { BackgroundNotificationService } from './backgroundNotificationService'

const FCM_TOKENS_COLLECTION = 'fcm_tokens'
const NOTIFICATION_HISTORY_COLLECTION = 'notification_history'
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || 'BODsmEiK468gWjdPfPC2R8m0jN-_IxRicZ1F5WGHqhFoX0Ol2qdHGP1SNw2vhUodqSR13XBCCmlNgfCZysNI8Po'

// Debug VAPID key
console.log('VAPID Key from env:', import.meta.env.VITE_FIREBASE_VAPID_KEY)
console.log('Using VAPID Key:', VAPID_KEY)

export class NotificationService {
    // Đăng ký notification
    static async requestPermission(): Promise<{ granted: boolean; reason?: string }> {
        try {
            if (!messaging) {
                console.warn('Firebase Cloud Messaging not available')
                return { granted: false, reason: 'FCM not available' }
            }

            // Kiểm tra hỗ trợ notification
            if (!('Notification' in window)) {
                return { granted: false, reason: 'Browser không hỗ trợ thông báo' }
            }

            // Kiểm tra HTTPS (trừ localhost)
            if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
                return { granted: false, reason: 'Cần HTTPS cho thông báo. Vui lòng sử dụng HTTPS hoặc localhost' }
            }

            const permission = await Notification.requestPermission()
            if (permission === 'granted') {
                console.log('Notification permission granted')
                return { granted: true }
            } else if (permission === 'denied') {
                console.log('Notification permission denied')
                return { granted: false, reason: 'Bạn đã từ chối thông báo' }
            } else {
                console.log('Notification permission dismissed')
                return { granted: false, reason: 'Bạn đã hủy yêu cầu thông báo' }
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error)
            return { granted: false, reason: 'Lỗi khi yêu cầu quyền thông báo' }
        }
    }

    // Đăng ký service worker
    static async registerServiceWorker(): Promise<boolean> {
        try {
            if (!('serviceWorker' in navigator)) {
                console.warn('Service Worker not supported')
                return false
            }

            // Kiểm tra xem service worker đã được đăng ký chưa
            const existingRegistration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js')
            if (existingRegistration) {
                console.log('Service worker already registered')
                return true
            }

            // Đăng ký service worker mới
            console.log('Registering new service worker...')
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
                scope: '/'
            })

            console.log('Service worker registered successfully:', registration)

            // Đợi service worker active
            console.log('Waiting for service worker to activate...')
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Service worker activation timeout'))
                }, 5000)

                if (registration.installing) {
                    console.log('Service worker is installing...')
                    registration.installing.addEventListener('statechange', (e) => {
                        console.log('Service worker state changed:', e.target.state)
                        if (e.target.state === 'activated') {
                            clearTimeout(timeout)
                            console.log('✅ Service worker activated successfully')
                            resolve(true)
                        }
                    })
                } else if (registration.waiting) {
                    console.log('Service worker is waiting...')
                    registration.waiting.addEventListener('statechange', (e) => {
                        console.log('Service worker state changed:', e.target.state)
                        if (e.target.state === 'activated') {
                            clearTimeout(timeout)
                            console.log('✅ Service worker activated successfully')
                            resolve(true)
                        }
                    })
                } else if (registration.active) {
                    console.log('Service worker is already active')
                    clearTimeout(timeout)
                    resolve(true)
                }
            })

            return true
        } catch (error) {
            console.error('Failed to register service worker:', error)
            return false
        }
    }

    // Lấy FCM token
    static async getFCMToken(): Promise<string | null> {
        try {
            if (!messaging) {
                console.warn('Firebase Cloud Messaging not available')
                return null
            }

            // Đảm bảo service worker đã được đăng ký
            console.log('Registering service worker...')
            const swRegistered = await this.registerServiceWorker()
            if (!swRegistered) {
                console.error('❌ Service worker registration failed, cannot get FCM token')
                return null
            }
            console.log('✅ Service worker registered successfully')

            // Đợi một chút để đảm bảo service worker đã sẵn sàng
            await new Promise(resolve => setTimeout(resolve, 1000))

            console.log('Attempting to get FCM token with VAPID key:', VAPID_KEY)

            const token = await getToken(messaging, {
                vapidKey: VAPID_KEY
            })

            if (token) {
                console.log('✅ FCM Token obtained successfully:', token)
                return token
            } else {
                console.log('❌ No registration token available')
                return null
            }
        } catch (error) {
            console.error('Error getting FCM token:', error)

            // Xử lý lỗi cụ thể
            if (error instanceof Error) {
                if (error.message.includes('failed-service-worker-registration')) {
                    console.error('Service worker registration failed. Check if firebase-messaging-sw.js is accessible.')
                } else if (error.message.includes('messaging/unsupported-browser')) {
                    console.error('Browser does not support Firebase Cloud Messaging')
                } else if (error.message.includes('messaging/invalid-vapid-key')) {
                    console.error('Invalid VAPID key. Please check your VAPID key configuration.')
                } else if (error.message.includes('activation timeout')) {
                    console.error('Service worker activation timeout. Try refreshing the page.')
                }
            }

            return null
        }
    }

    // Lưu FCM token vào Firestore
    static async saveFCMToken(userId: string, token: string): Promise<void> {
        try {
            await addDoc(collection(db, FCM_TOKENS_COLLECTION), {
                userId,
                token,
                createdAt: new Date(),
                isActive: true,
                deviceInfo: {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    language: navigator.language
                }
            })
            console.log('FCM token saved to fcm_tokens collection')
        } catch (error) {
            console.error('Error saving FCM token:', error)

            // Xử lý lỗi cụ thể
            if (error instanceof Error) {
                if (error.message.includes('Missing or insufficient permissions')) {
                    console.error('Firestore permissions error. Please check Firestore Rules.')
                    throw new Error('Không có quyền lưu FCM token. Vui lòng kiểm tra Firestore Rules.')
                } else if (error.message.includes('permission-denied')) {
                    console.error('Permission denied. User may not be authenticated.')
                    throw new Error('Từ chối quyền truy cập. Vui lòng đăng nhập lại.')
                } else if (error.message.includes('unavailable')) {
                    console.error('Firestore unavailable. Using local storage fallback.')
                    // Lưu vào localStorage làm fallback
                    this.saveFCMTokenToLocalStorage(userId, token)
                    return
                }
            }

            throw error
        }
    }

    // Lưu FCM token vào localStorage làm fallback
    static saveFCMTokenToLocalStorage(userId: string, token: string): void {
        try {
            const tokens = JSON.parse(localStorage.getItem('fcm_tokens') || '{}')
            tokens[userId] = {
                token,
                createdAt: new Date().toISOString(),
                isActive: true
            }
            localStorage.setItem('fcm_tokens', JSON.stringify(tokens))
            console.log('FCM token saved to localStorage as fallback')
        } catch (error) {
            console.error('Error saving FCM token to localStorage:', error)
        }
    }

    // Lấy FCM token từ localStorage
    static getFCMTokenFromLocalStorage(userId: string): string | null {
        try {
            const tokens = JSON.parse(localStorage.getItem('fcm_tokens') || '{}')
            return tokens[userId]?.token || null
        } catch (error) {
            console.error('Error getting FCM token from localStorage:', error)
            return null
        }
    }

    // Lắng nghe tin nhắn foreground
    static onMessage(callback: (payload: any) => void): () => void {
        if (!messaging) {
            console.warn('Firebase Cloud Messaging not available')
            return () => { }
        }

        return onMessage(messaging, callback)
    }

    // Tạo thông báo local
    static showLocalNotification(title: string, body: string, icon?: string): void {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body,
                icon: icon || '/favicon.ico',
                badge: '/favicon.ico',
                tag: 'lunar-calendar-event',
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
        }
    }

    // Kiểm tra sự kiện hôm nay
    static async checkTodayEvents(userId: string): Promise<void> {
        try {
            const today = new Date()
            const year = today.getFullYear()
            const month = today.getMonth() + 1
            const day = today.getDate()

            // Lấy sự kiện hôm nay
            const eventsQuery = query(
                collection(db, 'events'),
                where('userId', '==', userId)
            )

            const eventsSnapshot = await getDocs(eventsQuery)
            const todayEvents: any[] = []

            eventsSnapshot.forEach((doc) => {
                const data = doc.data()
                if (data.date.year === year && data.date.month === month && data.date.day === day) {
                    todayEvents.push({ id: doc.id, ...data })
                }
            })

            // Hiển thị thông báo cho mỗi sự kiện
            todayEvents.forEach(event => {
                const title = `Sự kiện hôm nay: ${event.title}`
                const body = event.description || `Sự kiện ${event.title} diễn ra hôm nay`

                // Thử sử dụng local notification trước
                this.showLocalNotification(title, body)

                // Sử dụng fallback notification như backup
                if (FallbackNotification.canUseFallback()) {
                    FallbackNotification.showNotification(title, body)
                }
            })

            console.log(`Found ${todayEvents.length} events for today`)
        } catch (error) {
            console.error('Error checking today events:', error)
        }
    }

    // Lên lịch kiểm tra sự kiện hàng ngày
    static scheduleDailyCheck(userId: string): void {
        // Kiểm tra ngay lập tức
        this.checkTodayEvents(userId)

        // Lên lịch background notification
        BackgroundNotificationService.scheduleDailyCheck()

        // Kiểm tra mỗi ngày lúc 8:00 AM (client-side fallback)
        const now = new Date()
        const nextCheck = new Date()
        nextCheck.setHours(8, 0, 0, 0)

        if (nextCheck <= now) {
            nextCheck.setDate(nextCheck.getDate() + 1)
        }

        const timeUntilCheck = nextCheck.getTime() - now.getTime()

        setTimeout(() => {
            this.checkTodayEvents(userId)
            // Lên lịch cho ngày tiếp theo
            this.scheduleDailyCheck(userId)
        }, timeUntilCheck)

        console.log(`Next event check scheduled for: ${nextCheck.toLocaleString()}`)
    }

    // Xóa FCM token khi đăng xuất
    static async removeFCMToken(userId: string): Promise<void> {
        try {
            const tokensQuery = query(
                collection(db, FCM_TOKENS_COLLECTION),
                where('userId', '==', userId)
            )

            const tokensSnapshot = await getDocs(tokensQuery)
            const deletePromises = tokensSnapshot.docs.map(doc => deleteDoc(doc.ref))

            await Promise.all(deletePromises)
            console.log('FCM tokens removed from fcm_tokens collection')
        } catch (error) {
            console.error('Error removing FCM tokens:', error)
        }
    }

    // Xóa FCM token theo token string (khi đăng xuất)
    static async removeFCMTokenByToken(token: string): Promise<void> {
        try {
            const tokensQuery = query(
                collection(db, FCM_TOKENS_COLLECTION),
                where('token', '==', token),
                where('isActive', '==', true)
            )

            const tokensSnapshot = await getDocs(tokensQuery)
            const deletePromises = tokensSnapshot.docs.map(doc => deleteDoc(doc.ref))

            await Promise.all(deletePromises)
            console.log('FCM token removed by token string from fcm_tokens collection')
        } catch (error) {
            console.error('Error removing FCM token by token:', error)
        }
    }
}
