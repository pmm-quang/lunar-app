<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-center">
          <h3 class="text-xl font-bold text-gray-800 dark:text-white">
            {{ isEditing ? 'Sửa sự kiện' : 'Thêm sự kiện mới' }}
          </h3>
          <button
            @click="$emit('close')"
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {{ formatDate(eventData.date) }}
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tiêu đề *
          </label>
          <input
            v-model="formData.title"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Nhập tiêu đề sự kiện"
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mô tả
          </label>
          <textarea
            v-model="formData.description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Nhập mô tả sự kiện (tùy chọn)"
          />
        </div>

        <!-- Time -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Thời gian
          </label>
          <input
            v-model="formData.time"
            type="time"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <!-- Color -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Màu sắc
          </label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="color in EVENT_COLORS"
              :key="color.value"
              type="button"
              :class="[
                'w-full h-10 rounded-lg border-2 transition-all',
                color.class,
                formData.color === color.value 
                  ? 'border-gray-800 dark:border-white scale-110' 
                  : 'border-gray-300 dark:border-gray-600 hover:scale-105'
              ]"
              @click="formData.color = color.value"
              :title="color.name"
            />
          </div>
        </div>

        <!-- Date Type -->
        <div>
          <label class="flex items-center space-x-2">
            <input
              v-model="formData.isLunar"
              type="checkbox"
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sử dụng ngày âm lịch
            </span>
          </label>
        </div>

        <!-- Buttons -->
        <div class="flex space-x-3 pt-4">
          <button
            type="button"
            @click="$emit('close')"
            class="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            :disabled="!formData.title.trim()"
            class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {{ isEditing ? 'Cập nhật' : 'Thêm' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { X } from 'lucide-vue-next'
import { EVENT_COLORS } from '@/types/event'
import type { Event, EventFormData } from '@/types/event'

const props = defineProps<{
  isOpen: boolean
  eventData: Event
  isEditing: boolean
}>()

const emit = defineEmits<{
  close: []
  save: [formData: EventFormData]
}>()

const formData = ref<EventFormData>({
  title: '',
  description: '',
  time: '',
  color: 'blue',
  isLunar: false
})

// Watch for changes in eventData
watch(() => props.eventData, (newEventData) => {
  if (newEventData) {
    formData.value = {
      title: newEventData.title,
      description: newEventData.description || '',
      time: newEventData.time || '',
      color: newEventData.color,
      isLunar: newEventData.isLunar
    }
  }
}, { immediate: true })

function handleSubmit(): void {
  if (formData.value.title.trim()) {
    emit('save', { ...formData.value })
  }
}

function formatDate(date: { year: number; month: number; day: number }): string {
  return `${date.day}/${date.month}/${date.year}`
}
</script>
