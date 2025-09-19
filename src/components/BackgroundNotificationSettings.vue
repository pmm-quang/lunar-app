<template>
  <div class="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
    <div class="flex items-start space-x-3">
      <div class="flex-shrink-0">
        <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="flex-1">
        <h3 class="text-sm font-medium text-purple-800 dark:text-purple-200">
          Background Notifications
        </h3>
        <div class="mt-2 text-sm text-purple-700 dark:text-purple-300">
          <p class="mb-3">Nhận thông báo ngay cả khi tắt web:</p>
          
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <div
                :class="[
                  'w-2 h-2 rounded-full',
                  serviceWorkerActive ? 'bg-green-500' : 'bg-red-500'
                ]"
              ></div>
              <span>
                Service Worker: {{ serviceWorkerActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
            
            <div class="flex items-center space-x-2">
              <div
                :class="[
                  'w-2 h-2 rounded-full',
                  fcmTokenAvailable ? 'bg-green-500' : 'bg-red-500'
                ]"
              ></div>
              <span>
                FCM Token: {{ fcmTokenAvailable ? 'Available' : 'Not Available' }}
              </span>
            </div>
            
            <div class="flex items-center space-x-2">
              <div
                :class="[
                  'w-2 h-2 rounded-full',
                  backgroundSyncSupported ? 'bg-green-500' : 'bg-yellow-500'
                ]"
              ></div>
              <span>
                Background Sync: {{ backgroundSyncSupported ? 'Supported' : 'Not Supported' }}
              </span>
            </div>
          </div>
          
          <div class="mt-4 space-y-2">
            <button
              @click="testBackgroundNotification"
              :disabled="!canTest"
              class="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded text-xs"
            >
              Test Background Notification
            </button>
            
            <button
              @click="testFCMApi"
              :disabled="!canTest"
              class="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-xs ml-2"
            >
              Test FCM API
            </button>
          </div>
          
          <div class="mt-3 p-3 bg-purple-100 dark:bg-purple-800/30 rounded-lg">
            <p class="text-xs font-medium text-purple-800 dark:text-purple-200">
              💡 Background notifications hoạt động ngay cả khi tắt web nhờ Service Worker và FCM.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useNotificationStore } from '@/stores/notificationStore'
import { BackgroundNotificationService } from '@/services/backgroundNotificationService'
import { FCMApiService } from '@/services/fcmApiService'

const notificationStore = useNotificationStore()

const serviceWorkerActive = ref(false)
const fcmTokenAvailable = ref(false)
const backgroundSyncSupported = ref(false)

const canTest = computed(() => {
  return serviceWorkerActive.value && fcmTokenAvailable.value
})

async function checkStatus(): Promise<void> {
  // Kiểm tra Service Worker
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js')
    serviceWorkerActive.value = !!registration?.active
  }
  
  // Kiểm tra FCM Token
  fcmTokenAvailable.value = !!notificationStore.fcmToken
  
  // Kiểm tra Background Sync
  backgroundSyncSupported.value = 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype
}

async function testBackgroundNotification(): Promise<void> {
  try {
    await BackgroundNotificationService.testNotification()
    console.log('✅ Background notification test sent')
  } catch (error) {
    console.error('❌ Background notification test failed:', error)
  }
}

async function testFCMApi(): Promise<void> {
  try {
    const success = await FCMApiService.testNotification()
    if (success) {
      console.log('✅ FCM API test successful')
    } else {
      console.log('❌ FCM API test failed')
    }
  } catch (error) {
    console.error('❌ FCM API test error:', error)
  }
}

onMounted(() => {
  checkStatus()
})
</script>
