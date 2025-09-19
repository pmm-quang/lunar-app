<template>
  <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
    <div class="flex items-start space-x-3">
      <div class="flex-shrink-0">
        <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="flex-1">
        <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
          Cần bật quyền thông báo
        </h3>
        <div class="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
          <p class="mb-3">Để nhận thông báo sự kiện, bạn cần cho phép thông báo trong trình duyệt:</p>
          
          <!-- Chrome/Edge -->
          <div class="mb-3">
            <h4 class="font-medium mb-2">Chrome / Edge:</h4>
            <ol class="list-decimal list-inside space-y-1 text-xs">
              <li>Click vào biểu tượng 🔒 bên trái thanh địa chỉ</li>
              <li>Chọn "Thông báo" → "Cho phép"</li>
              <li>Refresh trang và thử lại</li>
            </ol>
          </div>

          <!-- Firefox -->
          <div class="mb-3">
            <h4 class="font-medium mb-2">Firefox:</h4>
            <ol class="list-decimal list-inside space-y-1 text-xs">
              <li>Click vào biểu tượng 🛡️ bên trái thanh địa chỉ</li>
              <li>Chọn "Thông báo" → "Cho phép"</li>
              <li>Refresh trang và thử lại</li>
            </ol>
          </div>

          <!-- Safari -->
          <div class="mb-3">
            <h4 class="font-medium mb-2">Safari:</h4>
            <ol class="list-decimal list-inside space-y-1 text-xs">
              <li>Safari → Preferences → Websites → Notifications</li>
              <li>Tìm trang web này và chọn "Allow"</li>
              <li>Refresh trang và thử lại</li>
            </ol>
          </div>

          <!-- Mobile -->
          <div class="mb-3">
            <h4 class="font-medium mb-2">Mobile (Android/iOS):</h4>
            <ol class="list-decimal list-inside space-y-1 text-xs">
              <li>Mở Settings của trình duyệt</li>
              <li>Tìm "Site Settings" hoặc "Website Settings"</li>
              <li>Chọn trang web này và bật "Notifications"</li>
              <li>Refresh trang và thử lại</li>
            </ol>
          </div>

          <div class="mt-4 p-3 bg-yellow-100 dark:bg-yellow-800/30 rounded-lg">
            <p class="text-xs font-medium text-yellow-800 dark:text-yellow-200">
              💡 Mẹo: Nếu không thấy biểu tượng 🔒 hoặc 🛡️, hãy thử click vào thanh địa chỉ và tìm "Site settings" hoặc "Permissions"
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Component hiển thị hướng dẫn bật notification permission
</script>
