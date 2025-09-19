<template>
  <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
    <div class="flex items-start space-x-3">
      <div class="flex-shrink-0">
        <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="flex-1">
        <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200">
          Firestore Permissions Status
        </h3>
        <div class="mt-2 text-sm text-blue-700 dark:text-blue-300">
          <p class="mb-3">Kiểm tra quyền truy cập Firestore cho notifications:</p>
          
          <div class="space-y-2">
            <div class="flex items-center space-x-2">
              <div
                :class="[
                  'w-2 h-2 rounded-full',
                  status.authenticated ? 'bg-green-500' : 'bg-red-500'
                ]"
              ></div>
              <span>
                User Authenticated: {{ status.authenticated ? 'Yes' : 'No' }}
              </span>
            </div>
            
            <div class="flex items-center space-x-2">
              <div
                :class="[
                  'w-2 h-2 rounded-full',
                  status.canWrite ? 'bg-green-500' : 'bg-red-500'
                ]"
              ></div>
              <span>
                Can Write Notifications: {{ status.canWrite ? 'Yes' : 'No' }}
              </span>
            </div>
            
            <div class="flex items-center space-x-2">
              <div
                :class="[
                  'w-2 h-2 rounded-full',
                  status.usingFallback ? 'bg-yellow-500' : 'bg-green-500'
                ]"
              ></div>
              <span>
                Storage Method: {{ status.usingFallback ? 'LocalStorage (Fallback)' : 'Firestore' }}
              </span>
            </div>
          </div>
          
          <div v-if="status.error" class="mt-3 p-3 bg-red-100 dark:bg-red-800/30 rounded-lg">
            <p class="text-xs font-medium text-red-800 dark:text-red-200">
              ❌ Error: {{ status.error }}
            </p>
          </div>
          
          <div class="mt-3 p-3 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
            <p class="text-xs font-medium text-blue-800 dark:text-blue-200">
              💡 Nếu có lỗi permissions, hãy cập nhật Firestore Rules trong Firebase Console.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/config/firebase'

const authStore = useAuthStore()

const status = ref({
  authenticated: false,
  canWrite: false,
  usingFallback: false,
  error: ''
})

async function checkPermissions(): Promise<void> {
  try {
    // Kiểm tra authentication
    status.value.authenticated = !!authStore.userId
    
    if (!status.value.authenticated) {
      status.value.canWrite = false
      status.value.error = 'User not authenticated'
      return
    }

    // Kiểm tra quyền ghi vào Firestore
    try {
      // Thử tạo một document test
      const testDoc = await addDoc(collection(db, 'notifications'), {
        userId: authStore.userId,
        test: true,
        createdAt: new Date()
      })
      
      // Xóa document test
      await deleteDoc(doc(db, 'notifications', testDoc.id))
      
      status.value.canWrite = true
      status.value.usingFallback = false
      status.value.error = ''
    } catch (error) {
      status.value.canWrite = false
      status.value.usingFallback = true
      status.value.error = error instanceof Error ? error.message : 'Unknown error'
    }
  } catch (error) {
    status.value.error = error instanceof Error ? error.message : 'Unknown error'
  }
}

onMounted(() => {
  checkPermissions()
})
</script>
