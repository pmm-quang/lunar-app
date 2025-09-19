<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Quản lý Users</h1>
        <p class="mt-1 text-sm text-gray-500">Danh sách và quản lý tài khoản người dùng</p>
      </div>
      <button
        @click="refreshUsers"
        :disabled="isLoading"
        class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium"
      >
        {{ isLoading ? 'Đang tải...' : 'Làm mới' }}
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="bg-white p-4 rounded-lg shadow">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm kiếm theo email hoặc UID..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="flex gap-2">
          <select
            v-model="filterStatus"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      <div v-if="isLoading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-500">Đang tải dữ liệu...</p>
      </div>
      
      <div v-else-if="filteredUsers.length === 0" class="p-8 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Không có users</h3>
        <p class="mt-1 text-sm text-gray-500">Chưa có user nào trong hệ thống.</p>
      </div>

      <ul v-else class="divide-y divide-gray-200">
        <li v-for="user in filteredUsers" :key="user.uid" class="px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0 h-10 w-10">
                <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span class="text-sm font-medium text-gray-700">
                    {{ user.email?.charAt(0).toUpperCase() || 'U' }}
                  </span>
                </div>
              </div>
              <div class="ml-4">
                <div class="flex items-center">
                  <p class="text-sm font-medium text-gray-900">{{ user.email || 'Anonymous' }}</p>
                  <span
                    v-if="user.isAnonymous"
                    class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                  >
                    Anonymous
                  </span>
                </div>
                <div class="flex items-center mt-1">
                  <p class="text-sm text-gray-500">UID: {{ user.uid }}</p>
                  <span
                    class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="user.emailVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  >
                    {{ user.emailVerified ? 'Verified' : 'Unverified' }}
                  </span>
                  <span
                    class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getRoleColor(user.role)"
                  >
                    {{ getRoleLabel(user.role) }}
                  </span>
                </div>
                <p class="text-xs text-gray-400">
                  Tạo: {{ formatDate(user.createdAt) }}
                  <span v-if="user.lastSignInAt">
                    | Đăng nhập cuối: {{ formatDate(user.lastSignInAt) }}
                  </span>
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="viewUserDetails(user)"
                class="text-blue-600 hover:text-blue-900 text-sm font-medium"
              >
                Chi tiết
              </button>
              <button
                @click="changeUserRole(user)"
                :disabled="isLoading"
                class="text-purple-600 hover:text-purple-900 disabled:text-gray-400 text-sm font-medium"
              >
                Đổi role
              </button>
              <button
                @click="sendNotificationToUser(user)"
                :disabled="isLoading"
                class="text-green-600 hover:text-green-900 disabled:text-gray-400 text-sm font-medium"
              >
                Gửi thông báo
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      <div class="flex-1 flex justify-between sm:hidden">
        <button
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100"
        >
          Trước
        </button>
        <button
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100"
        >
          Sau
        </button>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Hiển thị <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>
            đến <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, totalUsers) }}</span>
            trong <span class="font-medium">{{ totalUsers }}</span> kết quả
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
            >
              Trước
            </button>
            <button
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
            >
              Sau
            </button>
          </nav>
        </div>
      </div>
    </div>

    <!-- User Details Modal -->
    <div v-if="selectedUser" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Chi tiết User</h3>
            <button
              @click="selectedUser = null"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <p class="mt-1 text-sm text-gray-900">{{ selectedUser.email || 'N/A' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">UID</label>
              <p class="mt-1 text-sm text-gray-900 font-mono">{{ selectedUser.uid }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Trạng thái</label>
              <div class="mt-1 flex space-x-2">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="selectedUser.emailVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                >
                  {{ selectedUser.emailVerified ? 'Verified' : 'Unverified' }}
                </span>
                <span
                  v-if="selectedUser.isAnonymous"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                >
                  Anonymous
                </span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Ngày tạo</label>
              <p class="mt-1 text-sm text-gray-900">{{ formatDate(selectedUser.createdAt) }}</p>
            </div>
            <div v-if="selectedUser.lastSignInAt">
              <label class="block text-sm font-medium text-gray-700">Đăng nhập cuối</label>
              <p class="mt-1 text-sm text-gray-900">{{ formatDate(selectedUser.lastSignInAt) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Role Change Modal -->
    <div v-if="showRoleModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Thay đổi Role</h3>
            <button
              @click="showRoleModal = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700">User</label>
              <p class="mt-1 text-sm text-gray-900">{{ selectedUserForRole?.email || 'Anonymous' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Role hiện tại</label>
              <p class="mt-1 text-sm text-gray-900">{{ getRoleLabel(selectedUserForRole?.role) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Role mới</label>
              <select
                v-model="newRole"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="user">Người dùng</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="flex justify-end space-x-3 mt-4">
              <button
                @click="showRoleModal = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Hủy
              </button>
              <button
                @click="updateUserRole"
                :disabled="isLoading"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-md"
              >
                {{ isLoading ? 'Đang cập nhật...' : 'Cập nhật' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { AdminService } from '@/services/adminService'
import { useAuthStore } from '@/stores/authStore'
import type { User } from 'firebase/auth'
import type { UserRole } from '@/types/user'

interface UserWithMetadata extends User {
  createdAt: Date
  lastSignInAt?: Date
  role?: UserRole
}

const authStore = useAuthStore()
const isLoading = ref(false)
const users = ref<UserWithMetadata[]>([])
const searchQuery = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const selectedUser = ref<UserWithMetadata | null>(null)
const showRoleModal = ref(false)
const selectedUserForRole = ref<UserWithMetadata | null>(null)
const newRole = ref<UserRole>('user')

const filteredUsers = computed(() => {
  let filtered = users.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.email?.toLowerCase().includes(query) ||
      user.uid.toLowerCase().includes(query)
    )
  }

  if (filterStatus.value) {
    if (filterStatus.value === 'active') {
      filtered = filtered.filter(user => user.emailVerified)
    } else if (filterStatus.value === 'inactive') {
      filtered = filtered.filter(user => !user.emailVerified)
    }
  }

  return filtered
})

const totalUsers = computed(() => filteredUsers.value.length)
const totalPages = computed(() => Math.ceil(totalUsers.value / itemsPerPage))

const loadUsers = async () => {
  try {
    isLoading.value = true
    const data = await AdminService.getUsers()
    users.value = data
  } catch (error) {
    console.error('Error loading users:', error)
  } finally {
    isLoading.value = false
  }
}

const refreshUsers = async () => {
  await loadUsers()
}

const viewUserDetails = (user: UserWithMetadata) => {
  selectedUser.value = user
}

const sendNotificationToUser = async (user: UserWithMetadata) => {
  try {
    isLoading.value = true
    await AdminService.sendNotificationToUser(user.uid, {
      title: 'Thông báo từ Admin',
      body: 'Đây là thông báo test từ hệ thống quản trị'
    })
    alert('Đã gửi thông báo thành công!')
  } catch (error) {
    console.error('Error sending notification:', error)
    alert('Lỗi gửi thông báo!')
  } finally {
    isLoading.value = false
  }
}

const changeUserRole = (user: UserWithMetadata) => {
  selectedUserForRole.value = user
  newRole.value = user.role || 'user'
  showRoleModal.value = true
}

const updateUserRole = async () => {
  if (!selectedUserForRole.value) return
  
  try {
    isLoading.value = true
    await authStore.updateUserRole(selectedUserForRole.value.uid, newRole.value)
    
    // Update local data
    const userIndex = users.value.findIndex(u => u.uid === selectedUserForRole.value!.uid)
    if (userIndex !== -1) {
      users.value[userIndex].role = newRole.value
    }
    
    showRoleModal.value = false
    alert('Đã cập nhật role thành công!')
  } catch (error) {
    console.error('Error updating user role:', error)
    alert('Lỗi cập nhật role!')
  } finally {
    isLoading.value = false
  }
}

const getRoleLabel = (role: UserRole | undefined) => {
  const labels: { [key in UserRole]: string } = {
    user: 'Người dùng',
    moderator: 'Moderator',
    admin: 'Admin'
  }
  return labels[role || 'user']
}

const getRoleColor = (role: UserRole | undefined) => {
  const colors: { [key in UserRole]: string } = {
    user: 'bg-gray-100 text-gray-800',
    moderator: 'bg-blue-100 text-blue-800',
    admin: 'bg-red-100 text-red-800'
  }
  return colors[role || 'user']
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

onMounted(() => {
  loadUsers()
})
</script>
