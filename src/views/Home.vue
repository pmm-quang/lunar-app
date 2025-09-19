<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <div class="container mx-auto px-4 py-8">
      <header class="text-center mb-8">
        <div class="flex justify-between items-center mb-4">
          <div></div>
          <div class="flex space-x-2">
            <button
              v-if="!authStore.isAuthenticated"
              @click="showAuthModal = true"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Đăng nhập
            </button>
            <div v-else class="flex space-x-2">
              <button
                @click="showNotificationSettings = true"
                class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Thông báo
              </button>
              <button
                @click="goToAdmin"
                class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Admin
              </button>
              <button
                @click="testAuth"
                class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
              >
                Test Auth
              </button>
              <button
                @click="makeMeAdmin"
                class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                Make Admin
              </button>
              <button
                @click="handleSignOut"
                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
        
        <h1 class="text-4xl font-bold text-gray-800 dark:text-white mb-2">
          Lịch Âm
        </h1>
        <p class="text-gray-600 dark:text-gray-300">
          Ứng dụng xem lịch âm lịch Việt Nam
        </p>
        
        <div v-if="authStore.isAuthenticated" class="mt-2 text-sm text-green-600 dark:text-green-400">
          Đã đăng nhập: {{ authStore.user?.email || 'Ẩn danh' }}
          <span v-if="authStore.userProfile?.role" class="ml-2 px-2 py-1 text-xs rounded-full"
                :class="getRoleColor(authStore.userProfile.role)">
            {{ getRoleLabel(authStore.userProfile.role) }}
          </span>
          <span v-else class="ml-2 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
            Đang tải role...
          </span>
        </div>
      </header>
      
      <LunarCalendar />
    </div>

    <!-- Auth Modal -->
    <AuthModal
      :is-open="showAuthModal"
      @close="showAuthModal = false"
    />

    <!-- Notification Settings Modal -->
    <div
      v-if="showNotificationSettings"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showNotificationSettings = false"
    >
      <div class="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <NotificationSettings />
        <div class="mt-4 text-center">
          <button
            @click="showNotificationSettings = false"
            class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import LunarCalendar from '@/components/LunarCalendar.vue'
import AuthModal from '@/components/AuthModal.vue'
import NotificationSettings from '@/components/NotificationSettings.vue'
import { useAuthStore } from '@/stores/authStore'
import { useEventStore } from '@/stores/eventStore'
import { useNotificationStore } from '@/stores/notificationStore'
import type { UserRole } from '@/types/user'

const router = useRouter()
const authStore = useAuthStore()
const eventStore = useEventStore()
const notificationStore = useNotificationStore()
const showAuthModal = ref(false)
const showNotificationSettings = ref(false)

const goToAdmin = () => {
  console.log('Attempting to go to admin...')
  console.log('User role:', authStore.userRole)
  console.log('Is moderator:', authStore.isModerator)
  console.log('Is admin:', authStore.isAdmin)
  console.log('Permissions:', authStore.permissions)
  
  if (!authStore.isModerator) {
    alert('Bạn không có quyền truy cập admin panel!')
    return
  }
  
  router.push('/admin')
}

const testAuth = () => {
  console.log('=== AUTH DEBUG INFO ===')
  console.log('isAuthenticated:', authStore.isAuthenticated)
  console.log('user:', authStore.user)
  console.log('userProfile:', authStore.userProfile)
  console.log('userRole:', authStore.userRole)
  console.log('isModerator:', authStore.isModerator)
  console.log('isAdmin:', authStore.isAdmin)
  console.log('permissions:', authStore.permissions)
  console.log('========================')
  
  alert(`Auth Status:
- Authenticated: ${authStore.isAuthenticated}
- User Role: ${authStore.userRole}
- Is Moderator: ${authStore.isModerator}
- Is Admin: ${authStore.isAdmin}
- User Profile: ${authStore.userProfile ? 'Loaded' : 'Not loaded'}`)
}

const makeMeAdmin = async () => {
  if (!authStore.userId) {
    alert('Bạn cần đăng nhập trước!')
    return
  }
  
  try {
    await authStore.updateUserRole(authStore.userId, 'admin')
    alert('Đã cập nhật role thành admin! Vui lòng refresh trang.')
    window.location.reload()
  } catch (error) {
    console.error('Error updating role:', error)
    alert('Lỗi cập nhật role!')
  }
}

const getRoleLabel = (role: UserRole) => {
  const labels: { [key in UserRole]: string } = {
    user: 'Người dùng',
    moderator: 'Moderator',
    admin: 'Admin'
  }
  return labels[role]
}

const getRoleColor = (role: UserRole) => {
  const colors: { [key in UserRole]: string } = {
    user: 'bg-gray-100 text-gray-800',
    moderator: 'bg-blue-100 text-blue-800',
    admin: 'bg-red-100 text-red-800'
  }
  return colors[role]
}

async function handleSignOut(): Promise<void> {
  try {
    // Cleanup notifications
    if (authStore.userId) {
      await notificationStore.cleanup(authStore.userId)
    }
    
    await authStore.signOut()
    // Clear events when signing out
    eventStore.events = []
  } catch (error) {
    console.error('Error signing out:', error)
  }
}

onMounted(async () => {
  // Initialize auth state listener
  authStore.initAuth()
  
  // Load events when user is authenticated
  if (authStore.isAuthenticated) {
    await eventStore.loadEvents()
  }
})

// Watch for auth state changes
watch(() => authStore.isAuthenticated, async (isAuthenticated) => {
  if (isAuthenticated) {
    await eventStore.loadEvents()
    // Initialize notifications
    if (authStore.userId) {
      await notificationStore.initialize(authStore.userId)
    }
  } else {
    // Clear events when user signs out
    eventStore.events = []
    // Cleanup notifications
    if (authStore.userId) {
      await notificationStore.cleanup(authStore.userId)
    }
  }
})
</script>
