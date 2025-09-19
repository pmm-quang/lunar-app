import { collection, getDocs, query, where, addDoc, orderBy, limit } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { FCMApiV1Service } from './fcmApiV1Service'

export interface AdminStats {
    totalUsers: number
    activeUsers: number
    totalEvents: number
    notificationsSent: number
}

export interface UserWithMetadata {
    uid: string
    email?: string
    emailVerified: boolean
    isAnonymous: boolean
    createdAt: Date
    lastSignInAt?: Date
}

export interface NotificationData {
    title: string
    body: string
    type: string
    target: 'all' | 'verified' | 'active'
}

export interface NotificationResult {
    successCount: number
    targetCount: number
    errors?: string[]
}

export class AdminService {
    // Lấy thống kê tổng quan
    static async getStats(): Promise<AdminStats> {
        try {
            // Lấy tổng số users
            const usersSnapshot = await getDocs(collection(db, 'users'))
            const totalUsers = usersSnapshot.size

            // Lấy users đã xác thực email
            const verifiedUsersQuery = query(
                collection(db, 'users'),
                where('emailVerified', '==', true)
            )
            const verifiedUsersSnapshot = await getDocs(verifiedUsersQuery)
            const activeUsers = verifiedUsersSnapshot.size

            // Lấy tổng số events
            const eventsSnapshot = await getDocs(collection(db, 'events'))
            const totalEvents = eventsSnapshot.size

            // Lấy số thông báo đã gửi (từ collection notifications)
            const notificationsSnapshot = await getDocs(collection(db, 'notifications'))
            const notificationsSent = notificationsSnapshot.size

            return {
                totalUsers,
                activeUsers,
                totalEvents,
                notificationsSent
            }
        } catch (error) {
            console.error('Error getting admin stats:', error)
            return {
                totalUsers: 0,
                activeUsers: 0,
                totalEvents: 0,
                notificationsSent: 0
            }
        }
    }

    // Lấy danh sách users
    static async getUsers(): Promise<UserWithMetadata[]> {
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'))
            const users: UserWithMetadata[] = []

            usersSnapshot.forEach((doc) => {
                const data = doc.data()
                users.push({
                    uid: doc.id,
                    email: data.email,
                    emailVerified: data.emailVerified || false,
                    isAnonymous: data.isAnonymous || false,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    lastSignInAt: data.lastSignInAt?.toDate()
                })
            })

            // Sắp xếp theo ngày tạo mới nhất
            return users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        } catch (error) {
            console.error('Error getting users:', error)
            return []
        }
    }

    // Gửi thông báo test
    static async sendTestNotification(): Promise<void> {
        try {
            const success = await FCMApiV1Service.testNotification()
            if (!success) {
                throw new Error('Failed to send test notification')
            }
        } catch (error) {
            console.error('Error sending test notification:', error)
            throw error
        }
    }

    // Gửi thông báo hàng ngày
    static async sendDailyNotifications(): Promise<NotificationResult> {
        try {
            const result = await FCMApiV1Service.sendDailyNotifications()

            return {
                successCount: result.successCount,
                targetCount: result.totalCount
            }
        } catch (error) {
            console.error('Error sending daily notifications:', error)
            throw error
        }
    }

    // Gửi thông báo đến user cụ thể
    static async sendNotificationToUser(userId: string, notification: { title: string; body: string }): Promise<void> {
        try {
            // Lấy FCM token của user
            const tokensQuery = query(
                collection(db, 'notifications'),
                where('userId', '==', userId),
                where('isActive', '==', true)
            )
            const tokensSnapshot = await getDocs(tokensQuery)

            if (tokensSnapshot.empty) {
                throw new Error('User không có FCM token')
            }

            const token = tokensSnapshot.docs[0].data().token
            const success = await FCMApiV1Service.sendNotificationToToken(token, notification)

            if (!success) {
                throw new Error('Failed to send notification')
            }
        } catch (error) {
            console.error('Error sending notification to user:', error)
            throw error
        }
    }

    // Gửi thông báo theo loại
    static async sendNotification(data: NotificationData): Promise<NotificationResult> {
        try {
            let targetUsers: UserWithMetadata[] = []

            // Lấy danh sách users theo target
            if (data.target === 'all') {
                targetUsers = await this.getUsers()
            } else if (data.target === 'verified') {
                const verifiedUsersQuery = query(
                    collection(db, 'users'),
                    where('emailVerified', '==', true)
                )
                const verifiedUsersSnapshot = await getDocs(verifiedUsersQuery)
                targetUsers = verifiedUsersSnapshot.docs.map(doc => ({
                    uid: doc.id,
                    email: doc.data().email,
                    emailVerified: true,
                    isAnonymous: false,
                    createdAt: doc.data().createdAt?.toDate() || new Date()
                }))
            } else if (data.target === 'active') {
                // Users hoạt động trong 30 ngày qua
                const thirtyDaysAgo = new Date()
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

                const activeUsersQuery = query(
                    collection(db, 'users'),
                    where('lastSignInAt', '>=', thirtyDaysAgo)
                )
                const activeUsersSnapshot = await getDocs(activeUsersQuery)
                targetUsers = activeUsersSnapshot.docs.map(doc => ({
                    uid: doc.id,
                    email: doc.data().email,
                    emailVerified: doc.data().emailVerified || false,
                    isAnonymous: doc.data().isAnonymous || false,
                    createdAt: doc.data().createdAt?.toDate() || new Date(),
                    lastSignInAt: doc.data().lastSignInAt?.toDate()
                }))
            }

            let successCount = 0
            const errors: string[] = []

            // Lấy tất cả FCM tokens của target users
            const userIds = targetUsers.map(user => user.uid)
            const tokensQuery = query(
                collection(db, 'fcm_tokens'),
                where('userId', 'in', userIds),
                where('isActive', '==', true)
            )
            const tokensSnapshot = await getDocs(tokensQuery)
            const tokens = tokensSnapshot.docs.map(doc => doc.data().token)

            console.log(`Found ${tokens.length} FCM tokens for ${userIds.length} users from fcm_tokens collection`)

            if (tokens.length === 0) {
                return {
                    successCount: 0,
                    targetCount: targetUsers.length,
                    errors: ['Không có FCM token nào để gửi thông báo']
                }
            }

            // Gửi thông báo đến tất cả tokens
            const result = await FCMApiV1Service.sendNotificationToTokens(tokens, {
                title: data.title,
                body: data.body,
                icon: '/favicon.ico'
            })

            successCount = result.successCount
            errors.push(...result.errors)

            // Lưu lịch sử thông báo
            await this.saveNotificationHistory({
                title: data.title,
                body: data.body,
                type: data.type,
                target: data.target,
                targetCount: targetUsers.length,
                successCount,
                errors
            })

            return {
                successCount,
                targetCount: targetUsers.length,
                errors
            }
        } catch (error) {
            console.error('Error sending notification:', error)
            throw error
        }
    }

    // Lưu lịch sử thông báo
    private static async saveNotificationHistory(data: {
        title: string
        body: string
        type: string
        target: string
        targetCount: number
        successCount: number
        errors?: string[]
    }): Promise<void> {
        try {
            await addDoc(collection(db, 'notification_history'), {
                ...data,
                sentAt: new Date(),
                status: data.successCount > 0 ? 'success' : 'failed'
            })
        } catch (error) {
            console.error('Error saving notification history:', error)
        }
    }

    // Lấy lịch sử thông báo
    static async getNotificationHistory(): Promise<any[]> {
        try {
            const historyQuery = query(
                collection(db, 'notification_history'),
                orderBy('sentAt', 'desc'),
                limit(50)
            )
            const historySnapshot = await getDocs(historyQuery)

            return historySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                sentAt: doc.data().sentAt?.toDate() || new Date()
            }))
        } catch (error) {
            console.error('Error getting notification history:', error)
            return []
        }
    }

    // Lấy danh sách events
    static async getEvents(): Promise<any[]> {
        try {
            const eventsQuery = query(
                collection(db, 'events'),
                orderBy('createdAt', 'desc')
            )
            const eventsSnapshot = await getDocs(eventsQuery)

            return eventsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date()
            }))
        } catch (error) {
            console.error('Error getting events:', error)
            return []
        }
    }

    // Xóa user
    static async deleteUser(userId: string): Promise<void> {
        try {
            // Xóa user data
            const userRef = collection(db, 'users').doc(userId)
            await userRef.delete()

            // Xóa events của user
            const eventsQuery = query(
                collection(db, 'events'),
                where('userId', '==', userId)
            )
            const eventsSnapshot = await getDocs(eventsQuery)
            const deletePromises = eventsSnapshot.docs.map(doc => doc.ref.delete())
            await Promise.all(deletePromises)

            // Xóa FCM tokens của user
            const tokensQuery = query(
                collection(db, 'notifications'),
                where('userId', '==', userId)
            )
            const tokensSnapshot = await getDocs(tokensQuery)
            const deleteTokenPromises = tokensSnapshot.docs.map(doc => doc.ref.delete())
            await Promise.all(deleteTokenPromises)
        } catch (error) {
            console.error('Error deleting user:', error)
            throw error
        }
    }

    // Xóa sự kiện
    static async deleteEvent(eventId: string): Promise<void> {
        try {
            await EventService.deleteEvent(eventId)
            console.log('Event deleted successfully:', eventId)
        } catch (error) {
            console.error('Error deleting event:', error)
            throw error
        }
    }
}
