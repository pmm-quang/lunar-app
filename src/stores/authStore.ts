import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AuthService } from '@/services/authService'
import { NotificationService } from '@/services/notificationService'
import type { User } from 'firebase/auth'
import type { UserProfile, UserRole, RolePermissions } from '@/types/user'
import { ROLE_PERMISSIONS } from '@/types/user'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)
    const userProfile = ref<UserProfile | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    // Computed
    const isAuthenticated = computed(() => !!user.value)
    const userId = computed(() => user.value?.uid || null)
    const userRole = computed(() => userProfile.value?.role || 'user')
    const permissions = computed((): RolePermissions => ROLE_PERMISSIONS[userRole.value])
    const isAdmin = computed(() => userRole.value === 'admin')
    const isModerator = computed(() => userRole.value === 'moderator' || userRole.value === 'admin')

    // Actions
    const setUser = (newUser: User | null): void => {
        user.value = newUser
    }

    const setUserProfile = (profile: UserProfile | null): void => {
        userProfile.value = profile
    }

    const setLoading = (loading: boolean): void => {
        isLoading.value = loading
    }

    const setError = (newError: string | null): void => {
        error.value = newError
    }

    // Đăng nhập ẩn danh
    const signInAnonymously = async (): Promise<void> => {
        try {
            setLoading(true)
            setError(null)
            const user = await AuthService.signInAnonymously()
            setUser(user)
        } catch (err: any) {
            setError(err.message || 'Đăng nhập thất bại')
            throw err
        } finally {
            setLoading(false)
        }
    }

    // Đăng nhập với email/password
    const signInWithEmail = async (email: string, password: string): Promise<void> => {
        try {
            setLoading(true)
            setError(null)
            const user = await AuthService.signInWithEmail(email, password)
            setUser(user)
        } catch (err: any) {
            setError(err.message || 'Đăng nhập thất bại')
            throw err
        } finally {
            setLoading(false)
        }
    }

    // Đăng ký với email/password
    const signUpWithEmail = async (email: string, password: string): Promise<void> => {
        try {
            setLoading(true)
            setError(null)
            const user = await AuthService.signUpWithEmail(email, password)
            setUser(user)

            // Load user profile after registration
            const profile = await AuthService.getUserProfile(user.uid)
            setUserProfile(profile)
        } catch (err: any) {
            setError(err.message || 'Đăng ký thất bại')
            throw err
        } finally {
            setLoading(false)
        }
    }

    // Đăng xuất
    const signOut = async (): Promise<void> => {
        try {
            setLoading(true)
            setError(null)
            await AuthService.signOut()
            setUser(null)
        } catch (err: any) {
            setError(err.message || 'Đăng xuất thất bại')
            throw err
        } finally {
            setLoading(false)
        }
    }

    // Khởi tạo auth state listener
    const initAuth = (): void => {
        AuthService.onAuthStateChanged(async (user) => {
            setUser(user)
            if (user) {
                // Load user profile when user signs in
                const profile = await AuthService.getUserProfile(user.uid)
                setUserProfile(profile)

                // Đăng ký FCM token khi user đăng nhập
                await registerFCMTokenForUser(user.uid)
            } else {
                setUserProfile(null)

                // Xóa FCM token khi user đăng xuất
                await unregisterFCMTokenForUser()
            }
        })
    }

    // Load user profile
    const loadUserProfile = async (): Promise<void> => {
        if (user.value) {
            const profile = await AuthService.getUserProfile(user.value.uid)
            setUserProfile(profile)
        }
    }

    // Update user role
    const updateUserRole = async (uid: string, role: UserRole): Promise<void> => {
        try {
            setLoading(true)
            setError(null)
            await AuthService.updateUserRole(uid, role)

            // Reload user profile if it's the current user
            if (uid === user.value?.uid) {
                await loadUserProfile()
            }
        } catch (err: any) {
            setError(err.message || 'Cập nhật role thất bại')
            throw err
        } finally {
            setLoading(false)
        }
    }

    // Đăng ký FCM token cho user (khi đăng nhập)
    const registerFCMTokenForUser = async (userId: string): Promise<void> => {
        try {
            console.log('Registering FCM token for user:', userId)

            // Lấy FCM token
            const token = await NotificationService.getFCMToken()
            if (token) {
                // Lưu FCM token với userId
                await NotificationService.saveFCMToken(userId, token)
                console.log('✅ FCM token registered successfully for user:', userId)
            } else {
                console.log('❌ Failed to get FCM token for user:', userId)
            }
        } catch (error) {
            console.error('Error registering FCM token for user:', error)
        }
    }

    // Hủy đăng ký FCM token cho user (khi đăng xuất)
    const unregisterFCMTokenForUser = async (): Promise<void> => {
        try {
            console.log('Unregistering FCM token for current device')

            // Lấy FCM token hiện tại
            const token = await NotificationService.getFCMToken()
            if (token) {
                // Xóa FCM token theo token string
                await NotificationService.removeFCMTokenByToken(token)
                console.log('✅ FCM token unregistered successfully')
            }
        } catch (error) {
            console.error('Error unregistering FCM token:', error)
        }
    }

    return {
        // State
        user,
        userProfile,
        isLoading,
        error,

        // Computed
        isAuthenticated,
        userId,
        userRole,
        permissions,
        isAdmin,
        isModerator,

        // Actions
        setUser,
        setUserProfile,
        setLoading,
        setError,
        signInAnonymously,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        initAuth,
        loadUserProfile,
        updateUserRole,
        // FCM Token management
        registerFCMTokenForUser,
        unregisterFCMTokenForUser
    }
})
