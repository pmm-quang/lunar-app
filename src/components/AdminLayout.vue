<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Admin Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">Lunar Calendar Admin</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-500">Admin Panel</span>
            <button
              @click="signOut"
              class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="flex">
      <!-- Sidebar -->
      <nav class="w-64 bg-white shadow-sm min-h-screen">
        <div class="p-4">
          <ul class="space-y-2">
            <li>
              <router-link
                to="/admin"
                class="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
                :class="{ 'bg-gray-100': $route.path === '/admin' }"
              >
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
                </svg>
                Dashboard
              </router-link>
            </li>
            <li>
              <router-link
                to="/admin/users"
                class="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
                :class="{ 'bg-gray-100': $route.path === '/admin/users' }"
              >
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
                Quản lý Users
              </router-link>
            </li>
            <li>
              <router-link
                to="/admin/notifications"
                class="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
                :class="{ 'bg-gray-100': $route.path === '/admin/notifications' }"
              >
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.5 19.5a15 15 0 01-1.44-7.5 15 15 0 011.44-7.5M19.5 4.5a15 15 0 011.44 7.5 15 15 0 01-1.44 7.5"></path>
                </svg>
                Quản lý Thông báo
              </router-link>
            </li>
            <li>
              <router-link
                to="/admin/events"
                class="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
                :class="{ 'bg-gray-100': $route.path === '/admin/events' }"
              >
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                Quản lý Sự kiện
              </router-link>
            </li>
            <li>
              <router-link
                to="/admin/create-user"
                class="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
                :class="{ 'bg-gray-100': $route.path === '/admin/create-user' }"
              >
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Tạo User mới
              </router-link>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="flex-1 p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const signOut = async () => {
  try {
    await authStore.signOut()
    router.push('/')
  } catch (error) {
    console.error('Error signing out:', error)
  }
}
</script>
