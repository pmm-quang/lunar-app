<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <p class="mt-1 text-sm text-gray-500">Tổng quan hệ thống và thống kê</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Total Users -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Tổng Users</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats.totalUsers }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Users -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Users Hoạt động</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats.activeUsers }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Total Events -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Tổng Sự kiện</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats.totalEvents }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <!-- Notifications Sent -->
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.5 19.5a15 15 0 01-1.44-7.5 15 15 0 011.44-7.5M19.5 4.5a15 15 0 011.44 7.5 15 15 0 01-1.44 7.5"></path>
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Thông báo đã gửi</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats.notificationsSent }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Thao tác nhanh</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            @click="sendTestNotification"
            :disabled="isLoading"
            class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            {{ isLoading ? 'Đang gửi...' : 'Gửi thông báo test' }}
          </button>
          <button
            @click="sendDailyNotifications"
            :disabled="isLoading"
            class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            {{ isLoading ? 'Đang gửi...' : 'Gửi thông báo hàng ngày' }}
          </button>
          <button
            @click="refreshStats"
            :disabled="isLoading"
            class="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            {{ isLoading ? 'Đang tải...' : 'Làm mới thống kê' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Hoạt động gần đây</h3>
        <div class="flow-root">
          <ul class="-mb-8">
            <li v-for="(activity, index) in recentActivities" :key="index" class="relative pb-8">
              <div v-if="index !== recentActivities.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></div>
              <div class="relative flex space-x-3">
                <div>
                  <span class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                    <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                    </svg>
                  </span>
                </div>
                <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p class="text-sm text-gray-500">{{ activity.description }}</p>
                  </div>
                  <div class="text-right text-sm whitespace-nowrap text-gray-500">
                    <time>{{ formatTime(activity.timestamp) }}</time>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AdminService } from '@/services/adminService'

const isLoading = ref(false)
const stats = ref({
  totalUsers: 0,
  activeUsers: 0,
  totalEvents: 0,
  notificationsSent: 0
})

const recentActivities = ref([
  {
    description: 'Hệ thống khởi động thành công',
    timestamp: new Date()
  }
])

const loadStats = async () => {
  try {
    isLoading.value = true
    const data = await AdminService.getStats()
    stats.value = data
  } catch (error) {
    console.error('Error loading stats:', error)
  } finally {
    isLoading.value = false
  }
}

const sendTestNotification = async () => {
  try {
    isLoading.value = true
    await AdminService.sendTestNotification()
    addActivity('Đã gửi thông báo test')
  } catch (error) {
    console.error('Error sending test notification:', error)
    addActivity('Lỗi gửi thông báo test')
  } finally {
    isLoading.value = false
  }
}

const sendDailyNotifications = async () => {
  try {
    isLoading.value = true
    const result = await AdminService.sendDailyNotifications()
    addActivity(`Đã gửi thông báo hàng ngày cho ${result.successCount}/${result.totalUsers} users`)
  } catch (error) {
    console.error('Error sending daily notifications:', error)
    addActivity('Lỗi gửi thông báo hàng ngày')
  } finally {
    isLoading.value = false
  }
}

const refreshStats = async () => {
  await loadStats()
  addActivity('Đã làm mới thống kê')
}

const addActivity = (description: string) => {
  recentActivities.value.unshift({
    description,
    timestamp: new Date()
  })
  // Giữ tối đa 10 hoạt động
  if (recentActivities.value.length > 10) {
    recentActivities.value = recentActivities.value.slice(0, 10)
  }
}

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  }).format(date)
}

onMounted(() => {
  loadStats()
})
</script>

