<template>
  <div class="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
    <div class="flex items-start space-x-3">
      <div class="flex-shrink-0">
        <svg class="w-5 h-5 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="flex-1">
        <h3 class="text-sm font-medium text-orange-800 dark:text-orange-200">
          Fallback Notification System
        </h3>
        <div class="mt-2 text-sm text-orange-700 dark:text-orange-300">
          <p class="mb-3">Khi FCM không hoạt động, hệ thống sẽ sử dụng fallback notification:</p>
          
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <div
                :class="[
                  'w-2 h-2 rounded-full',
                  canUseFallback ? 'bg-green-500' : 'bg-red-500'
                ]"
              ></div>
              <span>
                Fallback Available: {{ canUseFallback ? 'Yes' : 'No' }}
              </span>
            </div>
            
            <div class="flex items-center space-x-2">
              <div
                :class="[
                  'w-2 h-2 rounded-full',
                  hasPermission ? 'bg-green-500' : 'bg-red-500'
                ]"
              ></div>
              <span>
                Notification Permission: {{ hasPermission ? 'Granted' : 'Not Granted' }}
              </span>
            </div>
          </div>
          
          <div class="mt-3 p-3 bg-orange-100 dark:bg-orange-800/30 rounded-lg">
            <p class="text-xs font-medium text-orange-800 dark:text-orange-200">
              💡 Fallback notification hoạt động ngay cả khi FCM không khả dụng, nhưng cần permission thông báo.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FallbackNotification } from '@/utils/fallbackNotification'

const canUseFallback = ref(false)
const hasPermission = ref(false)

function checkStatus(): void {
  canUseFallback.value = FallbackNotification.canUseFallback()
  hasPermission.value = Notification.permission === 'granted'
}

onMounted(() => {
  checkStatus()
})
</script>
