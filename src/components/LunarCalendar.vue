<template>
  <div class="max-w-4xl mx-auto">
    <!-- Header với điều khiển tháng/năm -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <button
          @click="previousMonth"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronLeft class="w-6 h-6" />
        </button>
        
        <div class="text-center">
          <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
            {{ currentMonth.lunarMonthName }} {{ currentMonth.lunarYear }}
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            {{ getMonthYearString(currentYear, currentMonthIndex) }}
          </p>
        </div>
        
        <button
          @click="nextMonth"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronRight class="w-6 h-6" />
        </button>
      </div>
      
        <!-- Thông tin năm hiện tại -->
        <div class="text-center text-sm text-gray-600 dark:text-gray-300">
          <span class="font-medium">Năm {{ currentMonth.lunarYear }} - </span>
          <span class="text-red-600 dark:text-red-400">{{ getZodiacInfo(currentMonth.lunarYear) }}</span>
        </div>
        
        <!-- Event management button -->
        <div class="flex justify-center mt-4">
          <button
            @click="openAddEventModal"
            :disabled="!authStore.isAuthenticated"
            class="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            <Plus class="w-4 h-4" />
            <span>Thêm sự kiện</span>
          </button>
        </div>
        
        <!-- Loading state -->
        <div v-if="eventStore.isLoading" class="text-center mt-2">
          <div class="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span class="text-sm">Đang tải sự kiện...</span>
          </div>
        </div>
        
        <!-- Error state -->
        <div v-if="eventStore.error" class="text-center mt-2">
          <div class="text-red-600 dark:text-red-400 text-sm">
            {{ eventStore.error }}
          </div>
        </div>
        
        <!-- Events count -->
        <div v-if="authStore.isAuthenticated" class="text-center mt-2">
          <div class="text-sm text-gray-600 dark:text-gray-300">
            Có {{ eventStore.events.length }} sự kiện
          </div>
          <button
            @click="refreshEvents"
            class="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            Làm mới
          </button>
        </div>
    </div>

    <!-- Lịch -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <!-- Header các ngày trong tuần -->
      <div class="grid grid-cols-7 bg-gray-50 dark:bg-gray-700">
        <div
          v-for="day in weekDays"
          :key="day"
          class="p-4 text-center font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 last:border-r-0"
        >
          {{ day }}
        </div>
      </div>
      
      <!-- Các ngày trong tháng -->
      <div class="grid grid-cols-7">
        <div
          v-for="(day, index) in currentMonth.days"
          :key="index"
          :class="[
            'p-3 min-h-[120px] border-r border-b border-gray-200 dark:border-gray-600 last:border-r-0',
            'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer',
            {
              'bg-blue-50 dark:bg-blue-900/20': day.isToday,
              'bg-gray-100 dark:bg-gray-700/50': !day.isCurrentMonth,
              'bg-red-50 dark:bg-red-900/20': day.isHoliday
            }
          ]"
          @click="selectDay(day)"
        >
          <!-- Ngày dương lịch -->
          <div class="flex justify-between items-start mb-1">
            <span
              :class="[
                'text-lg font-semibold',
                {
                  'text-blue-600 dark:text-blue-400': day.isToday,
                  'text-gray-400 dark:text-gray-500': !day.isCurrentMonth,
                  'text-red-600 dark:text-red-400': day.isHoliday,
                  'text-gray-800 dark:text-white': day.isCurrentMonth && !day.isToday && !day.isHoliday
                }
              ]"
            >
              {{ day.solarDate.day }}
            </span>
            
            <!-- Icon ngày lễ -->
            <div v-if="day.isHoliday" class="text-red-500">
              <Star class="w-4 h-4" />
            </div>
          </div>
          
          <!-- Ngày âm lịch -->
          <div class="text-xs space-y-1">
            <div
              :class="[
                'font-medium',
                {
                  'text-blue-600 dark:text-blue-400': day.isToday,
                  'text-gray-400 dark:text-gray-500': !day.isCurrentMonth,
                  'text-red-600 dark:text-red-400': day.isHoliday,
                  'text-gray-600 dark:text-gray-300': day.isCurrentMonth && !day.isToday && !day.isHoliday
                }
              ]"
            >
              {{ day.lunarDayName }}
            </div>
            
            <!-- Tên ngày lễ -->
            <div
              v-if="day.isHoliday"
              class="text-xs text-red-600 dark:text-red-400 font-medium truncate"
              :title="day.holidayName"
            >
              {{ day.holidayName }}
            </div>
            
            <!-- Sự kiện -->
            <div v-if="getEventsForDay(day).length > 0" class="space-y-1">
              <div
                v-for="event in getEventsForDay(day).slice(0, 2)"
                :key="event.id"
                :class="[
                  'text-xs px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80',
                  getEventColorClass(event.color)
                ]"
                :title="event.title"
                @click.stop="openEditEventModal(event)"
              >
                {{ event.title }}
              </div>
              <div
                v-if="getEventsForDay(day).length > 2"
                class="text-xs text-gray-500 dark:text-gray-400"
              >
                +{{ getEventsForDay(day).length - 2 }} sự kiện khác
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chi tiết ngày được chọn -->
    <DayDetail
      v-if="selectedDay"
      :day="selectedDay"
      @close="selectedDay = null"
    />

    <!-- Event Modal -->
    <EventModal
      :is-open="eventStore.isEventModalOpen"
      :event-data="eventStore.selectedEvent || { id: '', title: '', description: '', date: { year: 0, month: 0, day: 0 }, time: '', color: 'blue', isLunar: false, createdAt: '', updatedAt: '' }"
      :is-editing="!!eventStore.editingEventId"
      @close="eventStore.closeEventModal"
      @save="handleEventSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ChevronLeft, ChevronRight, Star, Plus, Calendar } from 'lucide-vue-next'
import { generateCalendarMonth, getZodiacName, getCanChi } from '@/utils/lunar'
import type { CalendarDay, CalendarMonth } from '@/types/lunar'
import DayDetail from './DayDetail.vue'
import EventModal from './EventModal.vue'
import { useEventStore } from '@/stores/eventStore'
import { useAuthStore } from '@/stores/authStore'

const currentDate = new Date()
const currentYear = ref(currentDate.getFullYear())
const currentMonthIndex = ref(currentDate.getMonth() + 1)
const selectedDay = ref<CalendarDay | null>(null)

const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

// Event store
const eventStore = useEventStore()
const authStore = useAuthStore()

const currentMonth = computed(() => {
  return generateCalendarMonth(currentYear.value, currentMonthIndex.value)
})

function previousMonth(): void {
  if (currentMonthIndex.value === 1) {
    currentMonthIndex.value = 12
    currentYear.value--
  } else {
    currentMonthIndex.value--
  }
}

function nextMonth(): void {
  if (currentMonthIndex.value === 12) {
    currentMonthIndex.value = 1
    currentYear.value++
  } else {
    currentMonthIndex.value++
  }
}

function getMonthYearString(year: number, month: number): string {
  const months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ]
  return `${months[month - 1]} ${year}`
}

function getZodiacInfo(year: number): string {
  const zodiac = getZodiacName(year)
  const canChi = getCanChi(year)
  return `${zodiac} (${canChi})`
}

function selectDay(day: CalendarDay): void {
  selectedDay.value = day
}

// Event functions
function getEventsForDay(day: CalendarDay) {
  return eventStore.getEventsForDate(day.solarDate.year, day.solarDate.month, day.solarDate.day).value
}

function getEventColorClass(color: string): string {
  const colorMap: Record<string, string> = {
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
  return colorMap[color] || colorMap.blue
}

function openAddEventModal(): void {
  if (!authStore.isAuthenticated) {
    alert('Vui lòng đăng nhập để thêm sự kiện')
    return
  }
  
  const today = new Date()
  eventStore.openAddEventModal({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate()
  })
}

function openEditEventModal(event: any): void {
  eventStore.openEditEventModal(event)
}

function handleEventSave(formData: any): void {
  if (eventStore.editingEventId) {
    // Update existing event
    eventStore.updateEvent(eventStore.editingEventId, formData, eventStore.selectedEvent!.date)
  } else {
    // Add new event
    eventStore.addEvent(formData, eventStore.selectedEvent!.date)
  }
  eventStore.closeEventModal()
}

async function refreshEvents(): Promise<void> {
  console.log('Refreshing events...')
  await eventStore.loadEvents()
  console.log('Events refreshed:', eventStore.events.length)
}

onMounted(async () => {
  // Khởi tạo lịch với tháng hiện tại
  console.log('LunarCalendar mounted, auth state:', authStore.isAuthenticated)
  
  // Load events if authenticated
  if (authStore.isAuthenticated) {
    console.log('Loading events...')
    await eventStore.loadEvents()
    console.log('Events loaded:', eventStore.events.length)
  }
})
</script>
