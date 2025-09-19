<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Quản lý Sự kiện</h1>
        <p class="mt-1 text-sm text-gray-500">Xem và quản lý sự kiện của người dùng</p>
      </div>
      <button
        @click="refreshEvents"
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
            placeholder="Tìm kiếm theo tiêu đề hoặc mô tả..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="flex gap-2">
          <select
            v-model="filterUser"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả users</option>
            <option v-for="user in users" :key="user.uid" :value="user.uid">
              {{ user.email || 'Anonymous' }}
            </option>
          </select>
          <select
            v-model="filterType"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả loại</option>
            <option value="birthday">Sinh nhật</option>
            <option value="anniversary">Kỷ niệm</option>
            <option value="holiday">Lễ hội</option>
            <option value="reminder">Nhắc nhở</option>
            <option value="other">Khác</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Events Table -->
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      <div v-if="isLoading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-500">Đang tải dữ liệu...</p>
      </div>
      
      <div v-else-if="filteredEvents.length === 0" class="p-8 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Không có sự kiện</h3>
        <p class="mt-1 text-sm text-gray-500">Chưa có sự kiện nào trong hệ thống.</p>
      </div>

      <ul v-else class="divide-y divide-gray-200">
        <li v-for="event in filteredEvents" :key="event.id" class="px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0 h-10 w-10">
                <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <div class="flex items-center">
                  <p class="text-sm font-medium text-gray-900">{{ event.title }}</p>
                  <span
                    class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getTypeColor(event.type)"
                  >
                    {{ getTypeLabel(event.type) }}
                  </span>
                </div>
                <div class="mt-1">
                  <p class="text-sm text-gray-500">{{ event.description || 'Không có mô tả' }}</p>
                </div>
                <div class="mt-1 flex items-center space-x-4 text-xs text-gray-400">
                  <span>User: {{ getUserEmail(event.userId) }}</span>
                  <span>Ngày: {{ formatDate(event.date) }}</span>
                  <span>Tạo: {{ formatTime(event.createdAt) }}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="viewEventDetails(event)"
                class="text-blue-600 hover:text-blue-900 text-sm font-medium"
              >
                Chi tiết
              </button>
              <button
                @click="deleteEvent(event)"
                :disabled="isLoading"
                class="text-red-600 hover:text-red-900 disabled:text-gray-400 text-sm font-medium"
              >
                Xóa
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
            đến <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, totalEvents) }}</span>
            trong <span class="font-medium">{{ totalEvents }}</span> kết quả
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

    <!-- Event Details Modal -->
    <div v-if="selectedEvent" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Chi tiết Sự kiện</h3>
            <button
              @click="selectedEvent = null"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700">Tiêu đề</label>
              <p class="mt-1 text-sm text-gray-900">{{ selectedEvent.title }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Mô tả</label>
              <p class="mt-1 text-sm text-gray-900">{{ selectedEvent.description || 'Không có mô tả' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Loại</label>
              <p class="mt-1 text-sm text-gray-900">{{ getTypeLabel(selectedEvent.type) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Ngày</label>
              <p class="mt-1 text-sm text-gray-900">{{ formatDate(selectedEvent.date) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">User</label>
              <p class="mt-1 text-sm text-gray-900">{{ getUserEmail(selectedEvent.userId) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Ngày tạo</label>
              <p class="mt-1 text-sm text-gray-900">{{ formatTime(selectedEvent.createdAt) }}</p>
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

interface Event {
  id: string
  title: string
  description?: string
  type: string
  date: {
    year: number
    month: number
    day: number
  }
  userId: string
  createdAt: Date
}

interface User {
  uid: string
  email?: string
}

const isLoading = ref(false)
const events = ref<Event[]>([])
const users = ref<User[]>([])
const searchQuery = ref('')
const filterUser = ref('')
const filterType = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const selectedEvent = ref<Event | null>(null)

const filteredEvents = computed(() => {
  let filtered = events.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(event => 
      event.title.toLowerCase().includes(query) ||
      (event.description && event.description.toLowerCase().includes(query))
    )
  }

  if (filterUser.value) {
    filtered = filtered.filter(event => event.userId === filterUser.value)
  }

  if (filterType.value) {
    filtered = filtered.filter(event => event.type === filterType.value)
  }

  return filtered
})

const totalEvents = computed(() => filteredEvents.value.length)
const totalPages = computed(() => Math.ceil(totalEvents.value / itemsPerPage))

const loadEvents = async () => {
  try {
    isLoading.value = true
    const data = await AdminService.getEvents()
    events.value = data
  } catch (error) {
    console.error('Error loading events:', error)
  } finally {
    isLoading.value = false
  }
}

const loadUsers = async () => {
  try {
    const data = await AdminService.getUsers()
    users.value = data
  } catch (error) {
    console.error('Error loading users:', error)
  }
}

const refreshEvents = async () => {
  await loadEvents()
}

const viewEventDetails = (event: Event) => {
  selectedEvent.value = event
}

const deleteEvent = async (event: Event) => {
  if (!confirm(`Bạn có chắc chắn muốn xóa sự kiện "${event.title}"?`)) {
    return
  }

  try {
    isLoading.value = true
    await AdminService.deleteEvent(event.id)
    events.value = events.value.filter(e => e.id !== event.id)
    alert('Đã xóa sự kiện thành công!')
  } catch (error) {
    console.error('Error deleting event:', error)
    alert('Lỗi xóa sự kiện!')
  } finally {
    isLoading.value = false
  }
}

const getUserEmail = (userId: string) => {
  const user = users.value.find(u => u.uid === userId)
  return user?.email || 'Anonymous'
}

const getTypeLabel = (type: string) => {
  const labels: { [key: string]: string } = {
    birthday: 'Sinh nhật',
    anniversary: 'Kỷ niệm',
    holiday: 'Lễ hội',
    reminder: 'Nhắc nhở',
    other: 'Khác'
  }
  return labels[type] || type
}

const getTypeColor = (type: string) => {
  const colors: { [key: string]: string } = {
    birthday: 'bg-pink-100 text-pink-800',
    anniversary: 'bg-purple-100 text-purple-800',
    holiday: 'bg-green-100 text-green-800',
    reminder: 'bg-yellow-100 text-yellow-800',
    other: 'bg-gray-100 text-gray-800'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

const formatDate = (date: { year: number; month: number; day: number }) => {
  return `${date.day.toString().padStart(2, '0')}/${date.month.toString().padStart(2, '0')}/${date.year}`
}

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

onMounted(() => {
  loadEvents()
  loadUsers()
})
</script>

