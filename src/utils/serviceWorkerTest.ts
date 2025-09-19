// Utility để test service worker
export class ServiceWorkerTest {
    // Kiểm tra service worker có được đăng ký không
    static async checkServiceWorkerRegistration(): Promise<{
        registered: boolean
        active: boolean
        error?: string
    }> {
        try {
            if (!('serviceWorker' in navigator)) {
                return {
                    registered: false,
                    active: false,
                    error: 'Service Worker not supported in this browser'
                }
            }

            const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js')

            if (!registration) {
                return {
                    registered: false,
                    active: false,
                    error: 'Service worker not registered'
                }
            }

            return {
                registered: true,
                active: !!registration.active,
                error: registration.active ? undefined : 'Service worker registered but not active'
            }
        } catch (error) {
            return {
                registered: false,
                active: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            }
        }
    }

    // Đăng ký service worker
    static async registerServiceWorker(): Promise<{
        success: boolean
        error?: string
    }> {
        try {
            if (!('serviceWorker' in navigator)) {
                return {
                    success: false,
                    error: 'Service Worker not supported in this browser'
                }
            }

            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')

            console.log('Service worker registered:', registration)

            return {
                success: true
            }
        } catch (error) {
            console.error('Service worker registration failed:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            }
        }
    }

    // Kiểm tra file service worker có accessible không
    static async checkServiceWorkerFile(): Promise<{
        accessible: boolean
        error?: string
    }> {
        try {
            const response = await fetch('/firebase-messaging-sw.js')

            if (response.ok) {
                return {
                    accessible: true
                }
            } else {
                return {
                    accessible: false,
                    error: `HTTP ${response.status}: ${response.statusText}`
                }
            }
        } catch (error) {
            return {
                accessible: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            }
        }
    }

    // Chạy tất cả test
    static async runAllTests(): Promise<{
        fileAccessible: { accessible: boolean; error?: string }
        registration: { registered: boolean; active: boolean; error?: string }
        registerAttempt: { success: boolean; error?: string }
    }> {
        console.log('🔧 Running service worker tests...')

        const fileAccessible = await this.checkServiceWorkerFile()
        console.log('File accessible:', fileAccessible)

        const registration = await this.checkServiceWorkerRegistration()
        console.log('Registration status:', registration)

        let registerAttempt = { success: false, error: 'Not attempted' }
        if (!registration.registered) {
            registerAttempt = await this.registerServiceWorker()
            console.log('Register attempt:', registerAttempt)
        }

        return {
            fileAccessible,
            registration,
            registerAttempt
        }
    }
}

// Export for console testing
if (typeof window !== 'undefined') {
    (window as any).ServiceWorkerTest = ServiceWorkerTest
}
