<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Quản lý Thông báo</h1>
        <p class="mt-1 text-sm text-gray-500">Gửi và quản lý thông báo cho người dùng</p>
      </div>
      <button
        @click="showSendModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
      >
        Gửi thông báo mới
      </button>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <button
        @click="sendTestNotification"
        :disabled="isLoading"
        class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-md text-sm font-medium"
      >
        {{ isLoading ? 'Đang gửi...' : 'Gửi thông báo test' }}
      </button>
      <button
        @click="sendDailyNotifications"
        :disabled="isLoading"
        class="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-md text-sm font-medium"
      >
        {{ isLoading ? 'Đang gửi...' : 'Gửi thông báo hàng ngày' }}
      </button>
      <button
        @click="sendToAllUsers"
        :disabled="isLoading"
        class="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-md text-sm font-medium"
      >
        {{ isLoading ? 'Đang gửi...' : 'Gửi đến tất cả' }}
      </button>
    </div>

    <!-- Notification History -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Lịch sử thông báo</h3>
        <div v-if="isLoading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-500">Đang tải...</p>
        </div>
        <div v-else-if="notifications.length === 0" class="text-center py-8">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.5 19.5a15 15 0 01-1.44-7.5 15 15 0 011.44-7.5M19.5 4.5a15 15 0 011.44 7.5 15 15 0 01-1.44 7.5"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Chưa có thông báo</h3>
          <p class="mt-1 text-sm text-gray-500">Chưa có thông báo nào được gửi.</p>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h4 class="text-sm font-medium text-gray-900">{{ notification.title }}</h4>
                <p class="mt-1 text-sm text-gray-500">{{ notification.body }}</p>
                <div class="mt-2 flex items-center space-x-4 text-xs text-gray-400">
                  <span>Gửi lúc: {{ formatTime(notification.sentAt) }}</span>
                  <span>Loại: {{ notification.type }}</span>
                  <span>Trạng thái: {{ notification.status }}</span>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getStatusColor(notification.status)"
                >
                  {{ notification.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Send Notification Modal -->
    <div v-if="showSendModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Gửi thông báo</h3>
            <button
              @click="showSendModal = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <form @submit.prevent="sendNotification" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Tiêu đề</label>
              <input
                v-model="notificationForm.title"
                type="text"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập tiêu đề thông báo"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Nội dung</label>
              <textarea
                v-model="notificationForm.body"
                required
                rows="3"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập nội dung thông báo"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Loại thông báo</label>
              <select
                v-model="notificationForm.type"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="general">Thông báo chung</option>
                <option value="event">Sự kiện</option>
                <option value="system">Hệ thống</option>
                <option value="promotion">Khuyến mãi</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Gửi đến</label>
              <select
                v-model="notificationForm.target"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả users</option>
                <option value="verified">Chỉ users đã xác thực</option>
                <option value="active">Chỉ users hoạt động</option>
              </select>
            </div>
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="showSendModal = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Hủy
              </button>
              <button
                type="submit"
                :disabled="isLoading"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-md"
              >
                {{ isLoading ? 'Đang gửi...' : 'Gửi thông báo' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AdminService } from '@/services/adminService'

interface Notification {
  id: string
  title: string
  body: string
  type: string
  status: string
  sentAt: Date
  targetCount?: number
  successCount?: number
}

const isLoading = ref(false)
const showSendModal = ref(false)
const notifications = ref<Notification[]>([])

const notificationForm = ref({
  title: '',
  body: '',
  type: 'general',
  target: 'all'
})

const loadNotifications = async () => {
  try {
    isLoading.value = true
    const data = await AdminService.getNotificationHistory()
    notifications.value = data
  } catch (error) {
    console.error('Error loading notifications:', error)
  } finally {
    isLoading.value = false
  }
}

const sendNotification = async () => {
  try {
    isLoading.value = true
    const result = await AdminService.sendNotification({
      title: notificationForm.value.title,
      body: notificationForm.value.body,
      type: notificationForm.value.type,
      target: notificationForm.value.target
    })
    
    // Thêm vào lịch sử
    notifications.value.unshift({
      id: Date.now().toString(),
      title: notificationForm.value.title,
      body: notificationForm.value.body,
      type: notificationForm.value.type,
      status: 'success',
      sentAt: new Date(),
      targetCount: result.targetCount,
      successCount: result.successCount
    })
    
    showSendModal.value = false
    notificationForm.value = {
      title: '',
      body: '',
      type: 'general',
      target: 'all'
    }
    
    alert(`Đã gửi thông báo thành công! ${result.successCount}/${result.targetCount} users`)
  } catch (error) {
    console.error('Error sending notification:', error)
    alert('Lỗi gửi thông báo!')
  } finally {
    isLoading.value = false
  }
}

const sendTestNotification = async () => {
  try {
    isLoading.value = true
    await AdminService.sendTestNotification()
    addNotification('Test Notification', 'Thông báo test từ admin', 'system', 'success')
    alert('Đã gửi thông báo test!')
  } catch (error) {
    console.error('Error sending test notification:', error)
    addNotification('Test Notification', 'Thông báo test từ admin', 'system', 'failed')
    alert('Lỗi gửi thông báo test!')
  } finally {
    isLoading.value = false
  }
}

const sendDailyNotifications = async () => {
  try {
    isLoading.value = true
    const result = await AdminService.sendDailyNotifications()
    addNotification('Daily Notifications', 'Thông báo hàng ngày', 'system', 'success', result.targetCount, result.successCount)
    alert(`Đã gửi thông báo hàng ngày! ${result.successCount}/${result.targetCount} users`)
  } catch (error) {
    console.error('Error sending daily notifications:', error)
    addNotification('Daily Notifications', 'Thông báo hàng ngày', 'system', 'failed')
    alert('Lỗi gửi thông báo hàng ngày!')
  } finally {
    isLoading.value = false
  }
}

const sendToAllUsers = async () => {
  try {
    isLoading.value = true
    const result = await AdminService.sendNotification({
      title: 'Thông báo từ Admin',
      body: 'Đây là thông báo gửi đến tất cả người dùng',
      type: 'general',
      target: 'all'
    })
    addNotification('Broadcast Notification', 'Thông báo gửi đến tất cả', 'general', 'success', result.targetCount, result.successCount)
    alert(`Đã gửi thông báo đến tất cả! ${result.successCount}/${result.targetCount} users`)
  } catch (error) {
    console.error('Error sending broadcast notification:', error)
    addNotification('Broadcast Notification', 'Thông báo gửi đến tất cả', 'general', 'failed')
    alert('Lỗi gửi thông báo!')
  } finally {
    isLoading.value = false
  }
}

const addNotification = (title: string, body: string, type: string, status: string, targetCount?: number, successCount?: number) => {
  notifications.value.unshift({
    id: Date.now().toString(),
    title,
    body,
    type,
    status,
    sentAt: new Date(),
    targetCount,
    successCount
  })
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'success':
      return 'bg-green-100 text-green-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
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
  loadNotifications()
})
</script>

