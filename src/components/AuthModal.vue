<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
      <!-- Header -->
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-center">
          <h3 class="text-xl font-bold text-gray-800 dark:text-white">
            {{ isLogin ? 'Đăng nhập' : 'Đăng ký' }}
          </h3>
          <button
            @click="$emit('close')"
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email *
          </label>
          <input
            v-model="formData.email"
            type="email"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Nhập email của bạn"
          />
        </div>

        <!-- Password -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mật khẩu *
          </label>
          <input
            v-model="formData.password"
            type="password"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Nhập mật khẩu"
          />
        </div>

        <!-- Info message for registration -->
        <div v-if="!isLogin">
          <p class="text-xs text-gray-500">
            Tài khoản sẽ được tạo với quyền "Người dùng". Admin có thể thay đổi quyền sau này.
          </p>
        </div>


        <!-- Error message -->
        <div v-if="authStore.error" class="text-red-600 dark:text-red-400 text-sm">
          {{ authStore.error }}
        </div>

        <!-- Buttons -->
        <div class="space-y-3">
          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {{ authStore.isLoading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Đăng ký') }}
          </button>
          
          <button
            type="button"
            @click="toggleMode"
            class="w-full px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
          >
            {{ isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập' }}
          </button>
          
          <button
            type="button"
            @click="signInAnonymously"
            :disabled="authStore.isLoading"
            class="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {{ authStore.isLoading ? 'Đang xử lý...' : 'Đăng nhập ẩn danh' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const authStore = useAuthStore()
const isLogin = ref(true)

const formData = ref({
  email: '',
  password: ''
})

function toggleMode(): void {
  isLogin.value = !isLogin.value
  authStore.setError(null)
}

async function handleSubmit(): Promise<void> {
  try {
    if (isLogin.value) {
      await authStore.signInWithEmail(formData.value.email, formData.value.password)
    } else {
      await authStore.signUpWithEmail(
        formData.value.email, 
        formData.value.password
      )
    }
    emit('close')
  } catch (error) {
    // Error is handled by the store
  }
}

async function signInAnonymously(): Promise<void> {
  try {
    await authStore.signInAnonymously()
    emit('close')
  } catch (error) {
    // Error is handled by the store
  }
}
</script>
