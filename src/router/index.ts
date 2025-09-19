import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// Import components
import AdminLayout from '@/components/AdminLayout.vue'
import AdminDashboard from '@/views/AdminDashboard.vue'
import AdminUsers from '@/views/AdminUsers.vue'
import AdminNotifications from '@/views/AdminNotifications.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/Home.vue')
    },
    {
        path: '/admin',
        component: AdminLayout,
        meta: { requiresAuth: true, requiresAdmin: true },
        children: [
            {
                path: '',
                name: 'AdminDashboard',
                component: AdminDashboard
            },
            {
                path: 'users',
                name: 'AdminUsers',
                component: AdminUsers
            },
            {
                path: 'notifications',
                name: 'AdminNotifications',
                component: AdminNotifications
            },
            {
                path: 'events',
                name: 'AdminEvents',
                component: () => import('@/views/AdminEvents.vue')
            },
            {
                path: 'create-user',
                name: 'AdminCreateUser',
                component: () => import('@/views/AdminCreateUser.vue')
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    console.log('Router guard - navigating to:', to.path)
    console.log('User authenticated:', authStore.isAuthenticated)
    console.log('User role:', authStore.userRole)
    console.log('Is moderator:', authStore.isModerator)

    // Check if route requires authentication
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        console.log('Redirecting to home - not authenticated')
        next('/')
        return
    }

    // Check if route requires admin
    if (to.meta.requiresAdmin) {
        if (!authStore.isAuthenticated) {
            console.log('Redirecting to home - not authenticated for admin')
            next('/')
            return
        }

        // Check if user has admin or moderator role
        if (!authStore.isModerator) {
            console.log('Redirecting to home - insufficient permissions')
            next('/')
            return
        }
    }

    console.log('Navigation allowed')
    next()
})

export default router
