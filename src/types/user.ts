export type UserRole = 'user' | 'admin' | 'moderator'

export interface UserProfile {
    uid: string
    email?: string | undefined
    displayName?: string | undefined
    photoURL?: string | undefined
    role: UserRole
    isActive: boolean
    createdAt: Date
    lastSignInAt?: Date | undefined
    emailVerified: boolean
    isAnonymous: boolean
}

export interface UserRegistrationData {
    email: string
    password: string
    role?: UserRole
}

export interface RolePermissions {
    canAccessAdmin: boolean
    canManageUsers: boolean
    canSendNotifications: boolean
    canManageEvents: boolean
    canViewAnalytics: boolean
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
    user: {
        canAccessAdmin: false,
        canManageUsers: false,
        canSendNotifications: false,
        canManageEvents: false,
        canViewAnalytics: false
    },
    moderator: {
        canAccessAdmin: true,
        canManageUsers: false,
        canSendNotifications: true,
        canManageEvents: true,
        canViewAnalytics: true
    },
    admin: {
        canAccessAdmin: true,
        canManageUsers: true,
        canSendNotifications: true,
        canManageEvents: true,
        canViewAnalytics: true
    }
}
