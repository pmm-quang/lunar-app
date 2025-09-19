<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">
      Cài đặt thông báo
    </h3>

    <!-- Notification status -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-medium text-gray-700 dark:text-gray-300">
            Thông báo sự kiện
          </h4>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Nhận thông báo khi đến ngày sự kiện
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <div
            :class="[
              'w-12 h-6 rounded-full transition-colors',
              notificationStore.isEnabled ? 'bg-green-500' : 'bg-gray-300'
            ]"
            @click="toggleNotifications"
          >
            <div
              :class="[
                'w-5 h-5 bg-white rounded-full shadow transform transition-transform',
                notificationStore.isEnabled ? 'translate-x-6' : 'translate-x-0.5'
              ]"
            ></div>
          </div>
        </div>
      </div>

      <!-- Permission status -->
      <div class="text-sm">
        <div class="flex items-center space-x-2">
          <div
            :class="[
              'w-2 h-2 rounded-full',
              notificationStore.permission === 'granted' ? 'bg-green-500' : 'bg-red-500'
            ]"
          ></div>
          <span class="text-gray-600 dark:text-gray-300">
            Quyền thông báo: 
            <span
              :class="[
                notificationStore.permission === 'granted' ? 'text-green-600' : 'text-red-600'
              ]"
            >
              {{ getPermissionText(notificationStore.permission) }}
            </span>
          </span>
        </div>
      </div>

       <!-- Support status -->
       <div class="text-sm">
         <div class="flex items-center space-x-2">
           <div
             :class="[
               'w-2 h-2 rounded-full',
               notificationStore.isSupported ? 'bg-green-500' : 'bg-red-500'
             ]"
           ></div>
           <span class="text-gray-600 dark:text-gray-300">
             Hỗ trợ thông báo: 
             <span
               :class="[
                 notificationStore.isSupported ? 'text-green-600' : 'text-red-600'
               ]"
             >
               {{ notificationStore.isSupported ? 'Có' : 'Không' }}
             </span>
           </span>
         </div>
       </div>

       <!-- Service Worker Status -->
       <ServiceWorkerStatus />

       <!-- Fallback Status -->
       <FallbackStatus />

       <!-- Firestore Status -->
       <FirestoreStatus />

       <!-- Background Notification Settings -->
       <BackgroundNotificationSettings />

      <!-- FCM Token (for debugging) -->
      <div v-if="notificationStore.fcmToken" class="text-sm">
        <div class="text-gray-600 dark:text-gray-300 mb-1">FCM Token:</div>
        <div class="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs font-mono break-all">
          {{ notificationStore.fcmToken.substring(0, 50) }}...
        </div>
      </div>

       <!-- Error message -->
       <div v-if="errorMessage" class="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
         {{ errorMessage }}
         
         <!-- Hướng dẫn bật lại permission -->
         <div v-if="errorMessage.includes('từ chối') || errorMessage.includes('denied')" class="mt-3">
           <PermissionGuide />
         </div>
       </div>

       <!-- Action buttons -->
       <div class="pt-4 space-y-2">
         <div class="flex gap-2">
           <button
             @click="testNotification"
             :disabled="!notificationStore.isEnabled"
             class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm"
           >
             Test thông báo
           </button>
           
           <button
             @click="checkAndResetPermission"
             class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
           >
             Kiểm tra lại
           </button>
           
           <button
             @click="runDiagnostics"
             class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
           >
             Chạy test
           </button>
           
           <button
             @click="testFallback"
             class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm"
           >
             Test Fallback
           </button>
         </div>
       </div>

      <!-- Instructions -->
      <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h5 class="font-medium text-blue-800 dark:text-blue-200 mb-2">
          Hướng dẫn:
        </h5>
        <ul class="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Thông báo sẽ được gửi vào 8:00 sáng mỗi ngày</li>
          <li>• Chỉ hiển thị sự kiện của ngày hiện tại</li>
          <li>• Cần cho phép thông báo trong trình duyệt</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useNotificationStore } from '@/stores/notificationStore'
import { useAuthStore } from '@/stores/authStore'
import { NotificationService } from '@/services/notificationService'
import { NotificationTest } from '@/utils/notificationTest'
import { FallbackNotification } from '@/utils/fallbackNotification'
import PermissionGuide from './PermissionGuide.vue'
import ServiceWorkerStatus from './ServiceWorkerStatus.vue'
import FallbackStatus from './FallbackStatus.vue'
import FirestoreStatus from './FirestoreStatus.vue'
import BackgroundNotificationSettings from './BackgroundNotificationSettings.vue'

const notificationStore = useNotificationStore()
const authStore = useAuthStore()
const errorMessage = ref<string | null>(null)

onMounted(() => {
  // Kiểm tra hỗ trợ và permission
  notificationStore.checkSupport()
  notificationStore.checkPermission()
})

function getPermissionText(permission: NotificationPermission): string {
  switch (permission) {
    case 'granted':
      return 'Đã cho phép'
    case 'denied':
      return 'Đã từ chối'
    case 'default':
      return 'Chưa xác định'
    default:
      return 'Không xác định'
  }
}

async function toggleNotifications(): Promise<void> {
  if (!authStore.userId) {
    errorMessage.value = 'Vui lòng đăng nhập trước'
    return
  }

  errorMessage.value = null

  if (notificationStore.isEnabled) {
    // Tắt thông báo
    await notificationStore.cleanup(authStore.userId)
  } else {
    // Bật thông báo
    const success = await notificationStore.initialize(authStore.userId)
    if (!success) {
      // Lấy lý do cụ thể từ requestPermission
      const permissionResult = await notificationStore.requestPermission()
      if (!permissionResult.granted) {
        errorMessage.value = permissionResult.reason || 'Không thể bật thông báo'
      } else {
        errorMessage.value = 'Không thể khởi tạo thông báo'
      }
    }
  }
}

function testNotification(): void {
  NotificationService.showLocalNotification(
    'Test thông báo',
    'Đây là thông báo test từ Lịch Âm',
    '/favicon.ico'
  )
}

async function checkAndResetPermission(): Promise<void> {
  errorMessage.value = null
  
  // Kiểm tra permission hiện tại
  const currentPermission = Notification.permission
  console.log('Current permission:', currentPermission)
  
  if (currentPermission === 'denied') {
    errorMessage.value = 'Bạn đã từ chối thông báo. Vui lòng bật lại trong cài đặt trình duyệt.'
    return
  }
  
  if (currentPermission === 'granted') {
    // Permission đã được cấp, thử khởi tạo lại
    if (authStore.userId) {
      const success = await notificationStore.initialize(authStore.userId)
      if (success) {
        errorMessage.value = null
      } else {
        errorMessage.value = 'Không thể khởi tạo thông báo'
      }
    }
  } else {
    // Permission chưa được cấp, yêu cầu permission
    const result = await notificationStore.requestPermission()
    if (result.granted && authStore.userId) {
      const success = await notificationStore.initialize(authStore.userId)
      if (!success) {
        errorMessage.value = 'Không thể khởi tạo thông báo'
      }
    } else {
      errorMessage.value = result.reason || 'Không thể bật thông báo'
    }
  }
}

async function runDiagnostics(): Promise<void> {
  console.log('🧪 Running notification diagnostics...')
  
  try {
    const results = await NotificationTest.runAllTests()
    
    console.log('📊 Test Results:', results)
    
    // Hiển thị kết quả trong alert
    let message = 'Kết quả test:\n\n'
    
    message += `Basic Support: ${results.basicSupport.supported ? '✅' : '❌'}\n`
    message += `Service Worker File: ${results.serviceWorker.fileAccessible.accessible ? '✅' : '❌'}\n`
    message += `Service Worker Registered: ${results.serviceWorker.registration.registered ? '✅' : '❌'}\n`
    message += `Service Worker Active: ${results.serviceWorker.registration.active ? '✅' : '❌'}\n`
    message += `Permission: ${results.permission.granted ? '✅' : '❌'}\n`
    message += `FCM Token: ${results.fcmToken.success ? '✅' : '❌'}\n`
    message += `Local Notification: ${results.localNotification.success ? '✅' : '❌'}\n\n`
    
    if (!results.basicSupport.supported) {
      message += 'Chi tiết:\n' + results.basicSupport.details
    }
    
    if (!results.serviceWorker.fileAccessible.accessible) {
      message += `\nLỗi Service Worker File: ${results.serviceWorker.fileAccessible.error}`
    }
    
    if (!results.serviceWorker.registration.registered) {
      message += `\nLỗi Service Worker Registration: ${results.serviceWorker.registration.error}`
    }
    
    if (!results.serviceWorker.registration.active) {
      message += `\nLỗi Service Worker Active: ${results.serviceWorker.registration.error}`
    }
    
    if (!results.permission.granted) {
      message += `\nLỗi permission: ${results.permission.reason}`
    }
    
    if (!results.fcmToken.success) {
      message += `\nLỗi FCM: ${results.fcmToken.error}`
    }
    
    if (!results.localNotification.success) {
      message += `\nLỗi local notification: ${results.localNotification.error}`
    }
    
    alert(message)
    
    // Cập nhật error message nếu có lỗi
    if (!results.permission.granted) {
      errorMessage.value = results.permission.reason || 'Permission test failed'
    } else if (!results.fcmToken.success) {
      errorMessage.value = results.fcmToken.error || 'FCM token test failed'
    } else if (!results.localNotification.success) {
      errorMessage.value = results.localNotification.error || 'Local notification test failed'
    } else {
      errorMessage.value = null
    }
    
  } catch (error) {
    console.error('Error running diagnostics:', error)
    errorMessage.value = 'Lỗi khi chạy test: ' + (error instanceof Error ? error.message : 'Unknown error')
  }
}

function testFallback(): void {
  console.log('🧪 Testing fallback notification...')
  
  const success = FallbackNotification.testFallback()
  
  if (success) {
    console.log('✅ Fallback notification test successful')
    errorMessage.value = null
  } else {
    console.log('❌ Fallback notification test failed')
    errorMessage.value = 'Fallback notification không khả dụng. Cần permission thông báo.'
  }
}
</script>
