<template>
  <div
    v-if="day"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-xl font-bold text-gray-800 dark:text-white">
              {{ formatSolarDate(day.solarDate) }}
            </h3>
            <p class="text-lg text-blue-600 dark:text-blue-400 font-medium">
              {{ day.lunarDayName }} {{ day.lunarMonthName }}
            </p>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Nội dung chi tiết -->
      <div class="p-6 space-y-6">
        <!-- Thông tin cơ bản -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">Năm Âm Lịch</h4>
            <p class="text-lg font-bold text-blue-600 dark:text-blue-400">
              {{ day.lunarDate.year }}
            </p>
          </div>
          
          <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">Con Giáp</h4>
            <p class="text-lg font-bold text-orange-600 dark:text-orange-400">
              {{ day.zodiac }}
            </p>
          </div>
        </div>

        <!-- Thông tin Can Chi và Ngũ Hành -->
        <div class="space-y-4">
          <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg">
            <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">Can Chi</h4>
            <p class="text-lg font-bold text-purple-600 dark:text-purple-400">
              {{ day.canChi }}
            </p>
          </div>
          
          <div class="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg">
            <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">Ngũ Hành</h4>
            <p class="text-lg font-bold text-green-600 dark:text-green-400">
              {{ day.element }}
            </p>
          </div>
        </div>

        <!-- Thông tin đặc biệt -->
        <div v-if="day.isHoliday" class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border-l-4 border-red-500">
          <h4 class="font-semibold text-red-700 dark:text-red-300 mb-2">Ngày Lễ</h4>
          <p class="text-lg font-bold text-red-600 dark:text-red-400">
            {{ day.holidayName }}
          </p>
        </div>

        <!-- Thông tin tháng -->
        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">Thông Tin Tháng</h4>
          <div class="space-y-2">
            <p class="text-sm">
              <span class="font-medium">Tháng Âm Lịch:</span>
              <span class="ml-2 text-blue-600 dark:text-blue-400">{{ day.lunarMonthName }}</span>
            </p>
            <p class="text-sm">
              <span class="font-medium">Nhuận:</span>
              <span class="ml-2 text-orange-600 dark:text-orange-400">
                {{ day.lunarDate.isLeapMonth ? 'Có' : 'Không' }}
              </span>
            </p>
          </div>
        </div>

        <!-- Thông tin tuần -->
        <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">Thông Tin Tuần</h4>
          <div class="space-y-2">
            <p class="text-sm">
              <span class="font-medium">Thứ:</span>
              <span class="ml-2 text-gray-600 dark:text-gray-300">
                {{ getWeekdayName(day.solarDate) }}
              </span>
            </p>
            <p class="text-sm">
              <span class="font-medium">Cuối tuần:</span>
              <span class="ml-2 text-gray-600 dark:text-gray-300">
                {{ day.isWeekend ? 'Có' : 'Không' }}
              </span>
            </p>
          </div>
        </div>

        <!-- Sự kiện trong ngày -->
        <div v-if="dayEvents.length > 0" class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <Calendar class="w-4 h-4 mr-2" />
            Sự kiện ({{ dayEvents.length }})
          </h4>
          <div class="space-y-3">
            <div
              v-for="event in dayEvents"
              :key="event.id"
              :class="[
                'p-3 rounded-lg border-l-4',
                getEventColorClass(event.color)
              ]"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <h5 class="font-medium text-gray-800 dark:text-white">
                    {{ event.title }}
                  </h5>
                  <p v-if="event.description" class="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {{ event.description }}
                  </p>
                  <div class="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span v-if="event.time" class="flex items-center">
                      <Clock class="w-3 h-3 mr-1" />
                      {{ event.time }}
                    </span>
                    <span v-if="event.isLunar" class="text-orange-600 dark:text-orange-400">
                      Âm lịch
                    </span>
                  </div>
                </div>
                <div class="flex space-x-1 ml-2">
                  <button
                    @click="editEvent(event)"
                    class="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Sửa sự kiện"
                  >
                    <Edit class="w-3 h-3" />
                  </button>
                  <button
                    @click="deleteEvent(event.id)"
                    class="p-1 hover:bg-red-200 dark:hover:bg-red-600 rounded transition-colors"
                    title="Xóa sự kiện"
                  >
                    <Trash2 class="w-3 h-3 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Thêm sự kiện mới -->
        <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <button
            @click="addEvent"
            class="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Calendar class="w-4 h-4" />
            <span>Thêm sự kiện cho ngày này</span>
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-200 dark:border-gray-700">
        <button
          @click="$emit('close')"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Đóng
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { X, Calendar, Clock, Edit, Trash2 } from 'lucide-vue-next'
import type { CalendarDay } from '@/types/lunar'
import { useEventStore } from '@/stores/eventStore'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps<{
  day: CalendarDay
}>()

const emit = defineEmits<{
  close: []
}>()

const eventStore = useEventStore()
const authStore = useAuthStore()

const dayEvents = computed(() => {
  return eventStore.getEventsForDate(props.day.solarDate.year, props.day.solarDate.month, props.day.solarDate.day).value
})

function formatSolarDate(solarDate: { year: number; month: number; day: number }): string {
  return `${solarDate.day}/${solarDate.month}/${solarDate.year}`
}

function getWeekdayName(solarDate: { year: number; month: number; day: number }): string {
  const date = new Date(solarDate.year, solarDate.month - 1, solarDate.day)
  const weekdays = [
    'Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'
  ]
  return weekdays[date.getDay()]
}

function getEventColorClass(color: string): string {
  const colorMap: Record<string, string> = {
    red: 'bg-red-50 border-red-500 dark:bg-red-900/20',
    blue: 'bg-blue-50 border-blue-500 dark:bg-blue-900/20',
    green: 'bg-green-50 border-green-500 dark:bg-green-900/20',
    yellow: 'bg-yellow-50 border-yellow-500 dark:bg-yellow-900/20',
    purple: 'bg-purple-50 border-purple-500 dark:bg-purple-900/20',
    pink: 'bg-pink-50 border-pink-500 dark:bg-pink-900/20',
    orange: 'bg-orange-50 border-orange-500 dark:bg-orange-900/20',
    gray: 'bg-gray-50 border-gray-500 dark:bg-gray-900/20'
  }
  return colorMap[color] || colorMap.blue
}

function addEvent(): void {
  if (!authStore.isAuthenticated) {
    alert('Vui lòng đăng nhập để thêm sự kiện')
    return
  }
  
  eventStore.openAddEventModal(props.day.solarDate)
  emit('close')
}

function editEvent(event: any): void {
  eventStore.openEditEventModal(event)
  emit('close')
}

function deleteEvent(eventId: string): void {
  if (confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) {
    eventStore.deleteEvent(eventId)
  }
}
</script>
