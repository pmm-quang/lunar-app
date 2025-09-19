<template>
  <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
    <h4 class="font-medium text-gray-800 dark:text-gray-200 mb-3">
      Service Worker Status
    </h4>
    
    <div class="space-y-2 text-sm">
      <!-- File Accessible -->
      <div class="flex items-center justify-between">
        <span class="text-gray-600 dark:text-gray-300">File Accessible:</span>
        <div class="flex items-center space-x-2">
          <div
            :class="[
              'w-2 h-2 rounded-full',
              status.fileAccessible ? 'bg-green-500' : 'bg-red-500'
            ]"
          ></div>
          <span
            :class="[
              status.fileAccessible ? 'text-green-600' : 'text-red-600'
            ]"
          >
            {{ status.fileAccessible ? 'Yes' : 'No' }}
          </span>
        </div>
      </div>
      
      <!-- Registration Status -->
      <div class="flex items-center justify-between">
        <span class="text-gray-600 dark:text-gray-300">Registered:</span>
        <div class="flex items-center space-x-2">
          <div
            :class="[
              'w-2 h-2 rounded-full',
              status.registered ? 'bg-green-500' : 'bg-red-500'
            ]"
          ></div>
          <span
            :class="[
              status.registered ? 'text-green-600' : 'text-red-600'
            ]"
          >
            {{ status.registered ? 'Yes' : 'No' }}
          </span>
        </div>
      </div>
      
      <!-- Active Status -->
      <div class="flex items-center justify-between">
        <span class="text-gray-600 dark:text-gray-300">Active:</span>
        <div class="flex items-center space-x-2">
          <div
            :class="[
              'w-2 h-2 rounded-full',
              status.active ? 'bg-green-500' : 'bg-red-500'
            ]"
          ></div>
          <span
            :class="[
              status.active ? 'text-green-600' : 'text-red-600'
            ]"
          >
            {{ status.active ? 'Yes' : 'No' }}
          </span>
        </div>
      </div>
      
      <!-- Error Message -->
      <div v-if="status.error" class="text-red-600 dark:text-red-400 text-xs mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
        {{ status.error }}
      </div>
      
      <!-- Action Button -->
      <div class="pt-2">
        <button
          @click="refreshStatus"
          :disabled="isLoading"
          class="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-xs"
        >
          {{ isLoading ? 'Checking...' : 'Refresh' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ServiceWorkerTest } from '@/utils/serviceWorkerTest'

const status = ref({
  fileAccessible: false,
  registered: false,
  active: false,
  error: ''
})

const isLoading = ref(false)

async function checkStatus(): Promise<void> {
  isLoading.value = true
  
  try {
    const results = await ServiceWorkerTest.runAllTests()
    
    status.value = {
      fileAccessible: results.fileAccessible.accessible,
      registered: results.registration.registered,
      active: results.registration.active,
      error: results.fileAccessible.error || results.registration.error || ''
    }
  } catch (error) {
    status.value.error = error instanceof Error ? error.message : 'Unknown error'
  } finally {
    isLoading.value = false
  }
}

async function refreshStatus(): Promise<void> {
  await checkStatus()
}

onMounted(() => {
  checkStatus()
})
</script>
