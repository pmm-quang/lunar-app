import {
    signInAnonymously,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User
} from 'firebase/auth'
import { collection, addDoc, doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/config/firebase'
import type { UserProfile, UserRole, UserRegistrationData } from '@/types/user'

export class AuthService {
    // Đăng nhập ẩn danh
    static async signInAnonymously(): Promise<User> {
        try {
            const result = await signInAnonymously(auth)
            return result.user
        } catch (error) {
            console.error('Error signing in anonymously:', error)
            throw error
        }
    }

    // Đăng nhập với email/password
    static async signInWithEmail(email: string, password: string): Promise<User> {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password)
            return result.user
        } catch (error) {
            console.error('Error signing in with email:', error)
            throw error
        }
    }

    // Đăng ký với email/password
    static async signUpWithEmail(email: string, password: string): Promise<User> {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password)

            // Tạo user profile trong Firestore
            await this.createUserProfile(result.user, {
                email,
                password,
                role: 'user' // Mặc định là user
            })

            return result.user
        } catch (error) {
            console.error('Error signing up with email:', error)
            throw error
        }
    }

    // Tạo user profile trong Firestore
    static async createUserProfile(user: User, data: UserRegistrationData): Promise<void> {
        try {
            const userProfile: any = {
                uid: user.uid,
                role: data.role || 'user',
                isActive: true,
                createdAt: new Date(),
                lastSignInAt: new Date(),
                emailVerified: user.emailVerified,
                isAnonymous: user.isAnonymous
            }

            // Chỉ thêm các field không undefined
            if (user.email) {
                userProfile.email = user.email
            }
            if (user.photoURL) {
                userProfile.photoURL = user.photoURL
            }

            // Lưu vào collection 'users'
            await setDoc(doc(db, 'users', user.uid), userProfile)
            console.log('User profile created successfully')
        } catch (error) {
            console.error('Error creating user profile:', error)
            throw error
        }
    }

    // Lấy user profile từ Firestore
    static async getUserProfile(uid: string): Promise<UserProfile | null> {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid))
            if (userDoc.exists()) {
                const data = userDoc.data()
                const profile: UserProfile = {
                    uid: data.uid,
                    role: data.role || 'user',
                    isActive: data.isActive !== false,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    emailVerified: data.emailVerified || false,
                    isAnonymous: data.isAnonymous || false
                }

                // Chỉ thêm các field có giá trị
                if (data.email) {
                    profile.email = data.email
                }
                if (data.displayName) {
                    profile.displayName = data.displayName
                }
                if (data.photoURL) {
                    profile.photoURL = data.photoURL
                }
                if (data.lastSignInAt) {
                    profile.lastSignInAt = data.lastSignInAt.toDate()
                }

                return profile
            }
            return null
        } catch (error) {
            console.error('Error getting user profile:', error)
            return null
        }
    }

    // Cập nhật user profile
    static async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
        try {
            const userRef = doc(db, 'users', uid)

            // Lọc bỏ các field undefined
            const cleanUpdates: any = {}
            Object.keys(updates).forEach(key => {
                const value = updates[key as keyof UserProfile]
                if (value !== undefined) {
                    cleanUpdates[key] = value
                }
            })

            await setDoc(userRef, cleanUpdates, { merge: true })
            console.log('User profile updated successfully')
        } catch (error) {
            console.error('Error updating user profile:', error)
            throw error
        }
    }

    // Cập nhật role của user
    static async updateUserRole(uid: string, role: UserRole): Promise<void> {
        try {
            await this.updateUserProfile(uid, { role })
            console.log(`User role updated to ${role}`)
        } catch (error) {
            console.error('Error updating user role:', error)
            throw error
        }
    }

    // Đăng xuất
    static async signOut(): Promise<void> {
        try {
            await signOut(auth)
        } catch (error) {
            console.error('Error signing out:', error)
            throw error
        }
    }

    // Lắng nghe thay đổi trạng thái auth
    static onAuthStateChanged(callback: (user: User | null) => void): () => void {
        return onAuthStateChanged(auth, callback)
    }

    // Lấy user hiện tại
    static getCurrentUser(): User | null {
        return auth.currentUser
    }

    // Lấy user profile hiện tại
    static async getCurrentUserProfile(): Promise<UserProfile | null> {
        const user = this.getCurrentUser()
        if (!user) return null
        return await this.getUserProfile(user.uid)
    }
}
