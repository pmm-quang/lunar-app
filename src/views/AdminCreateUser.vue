<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Tạo User mới</h1>
      <p class="mt-1 text-sm text-gray-500">Tạo tài khoản user mới với role cụ thể</p>
    </div>

    <!-- Create User Form -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <form @submit.prevent="createUser" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                v-model="formData.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="user@example.com"
              />
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu *
              </label>
              <input
                v-model="formData.password"
                type="password"
                required
                minlength="6"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>


            <!-- Role -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Vai trò *
              </label>
              <select
                v-model="formData.role"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="user">Người dùng</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <!-- Error message -->
          <div v-if="error" class="text-red-600 text-sm">
            {{ error }}
          </div>

          <!-- Success message -->
          <div v-if="successMessage" class="text-green-600 text-sm">
            {{ successMessage }}
          </div>

          <!-- Submit button -->
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="resetForm"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Làm mới
            </button>
            <button
              type="submit"
              :disabled="isLoading"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-md"
            >
              {{ isLoading ? 'Đang tạo...' : 'Tạo User' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Recent Created Users -->
    <div v-if="recentUsers.length > 0" class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Users vừa tạo</h3>
        <div class="space-y-2">
          <div
            v-for="user in recentUsers"
            :key="user.uid"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-md"
          >
            <div>
              <p class="text-sm font-medium text-gray-900">{{ user.email }}</p>
            </div>
            <div class="flex items-center space-x-2">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getRoleColor(user.role)"
              >
                {{ getRoleLabel(user.role) }}
              </span>
              <span class="text-xs text-gray-400">
                {{ formatTime(user.createdAt) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AuthService } from '@/services/authService'
import type { UserRole, UserProfile } from '@/types/user'

interface CreatedUser extends UserProfile {
  createdAt: Date
}

const isLoading = ref(false)
const error = ref('')
const successMessage = ref('')
const recentUsers = ref<CreatedUser[]>([])

const formData = ref({
  email: '',
  password: '',
  role: 'user' as UserRole
})

const createUser = async () => {
  try {
    isLoading.value = true
    error.value = ''
    successMessage.value = ''

    // Tạo user với role cụ thể
    const user = await AuthService.signUpWithEmail(
      formData.value.email,
      formData.value.password
    )

    // Cập nhật role
    await AuthService.updateUserRole(user.uid, formData.value.role)

    // Thêm vào danh sách recent users
    recentUsers.value.unshift({
      uid: user.uid,
      email: user.email || formData.value.email,
      role: formData.value.role,
      isActive: true,
      createdAt: new Date(),
      emailVerified: false,
      isAnonymous: false
    })

    successMessage.value = `Đã tạo user "${formData.value.email}" với role "${getRoleLabel(formData.value.role)}" thành công!`
    resetForm()
  } catch (err: any) {
    error.value = err.message || 'Lỗi tạo user!'
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    email: '',
    password: '',
    role: 'user'
  }
  error.value = ''
  successMessage.value = ''
}

const getRoleLabel = (role: UserRole) => {
  const labels: { [key in UserRole]: string } = {
    user: 'Người dùng',
    moderator: 'Moderator',
    admin: 'Admin'
  }
  return labels[role]
}

const getRoleColor = (role: UserRole) => {
  const colors: { [key in UserRole]: string } = {
    user: 'bg-gray-100 text-gray-800',
    moderator: 'bg-blue-100 text-blue-800',
    admin: 'bg-red-100 text-red-800'
  }
  return colors[role]
}

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  }).format(date)
}
</script>
