import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Event, EventFormData } from '@/types/event'
import { EventService } from '@/services/eventService'
import { useAuthStore } from './authStore'

export const useEventStore = defineStore('event', () => {
    const events = ref<Event[]>([])
    const selectedEvent = ref<Event | null>(null)
    const isEventModalOpen = ref(false)
    const editingEventId = ref<string | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    // Auth store
    const authStore = useAuthStore()

    // Load events from Firebase
    const loadEvents = async (): Promise<void> => {
        if (!authStore.userId) {
            console.warn('No user ID available')
            return
        }

        try {
            isLoading.value = true
            error.value = null
            events.value = await EventService.getEventsByUser(authStore.userId)
        } catch (err: any) {
            console.error('Error loading events:', err)
            error.value = err.message || 'Lỗi tải sự kiện'
            // Fallback to localStorage
            loadEventsFromLocalStorage()
        } finally {
            isLoading.value = false
        }
    }

    // Fallback: Load events from localStorage
    const loadEventsFromLocalStorage = (): void => {
        try {
            const stored = localStorage.getItem('lunar-calendar-events')
            if (stored) {
                events.value = JSON.parse(stored)
            }
        } catch (error) {
            console.error('Error loading events from localStorage:', error)
            events.value = []
        }
    }

    // Save events to localStorage (backup)
    const saveEventsToLocalStorage = (): void => {
        try {
            localStorage.setItem('lunar-calendar-events', JSON.stringify(events.value))
        } catch (error) {
            console.error('Error saving events to localStorage:', error)
        }
    }

    // Get events for a specific date
    const getEventsForDate = (year: number, month: number, day: number) => {
        return computed(() =>
            events.value.filter(event =>
                event.date.year === year &&
                event.date.month === month &&
                event.date.day === day
            )
        )
    }

    // Add new event
    const addEvent = async (eventData: EventFormData, date: { year: number; month: number; day: number }): Promise<void> => {
        if (!authStore.userId) {
            throw new Error('User not authenticated')
        }

        try {
            isLoading.value = true
            error.value = null

            const eventId = await EventService.addEvent(eventData, date, authStore.userId)

            // Add to local state
            const newEvent: Event = {
                id: eventId,
                title: eventData.title,
                description: eventData.description,
                date,
                time: eventData.time || '',
                color: eventData.color,
                isLunar: eventData.isLunar,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            events.value.push(newEvent)
            saveEventsToLocalStorage() // Backup to localStorage
        } catch (err: any) {
            console.error('Error adding event:', err)
            error.value = err.message || 'Lỗi thêm sự kiện'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    // Update existing event
    const updateEvent = async (id: string, eventData: EventFormData, date: { year: number; month: number; day: number }): Promise<void> => {
        try {
            isLoading.value = true
            error.value = null

            await EventService.updateEvent(id, eventData, date)

            // Update local state
            const index = events.value.findIndex(event => event.id === id)
            if (index !== -1) {
                events.value[index] = {
                    ...events.value[index],
                    title: eventData.title,
                    description: eventData.description,
                    date,
                    time: eventData.time || '',
                    color: eventData.color,
                    isLunar: eventData.isLunar,
                    updatedAt: new Date().toISOString()
                }
                saveEventsToLocalStorage() // Backup to localStorage
            }
        } catch (err: any) {
            console.error('Error updating event:', err)
            error.value = err.message || 'Lỗi cập nhật sự kiện'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    // Delete event
    const deleteEvent = async (id: string): Promise<void> => {
        try {
            isLoading.value = true
            error.value = null

            await EventService.deleteEvent(id)

            // Remove from local state
            const index = events.value.findIndex(event => event.id === id)
            if (index !== -1) {
                events.value.splice(index, 1)
                saveEventsToLocalStorage() // Backup to localStorage
            }
        } catch (err: any) {
            console.error('Error deleting event:', err)
            error.value = err.message || 'Lỗi xóa sự kiện'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    // Get event by ID
    const getEventById = (id: string): Event | undefined => {
        return events.value.find(event => event.id === id)
    }

    // Open event modal for adding
    const openAddEventModal = (date: { year: number; month: number; day: number }): void => {
        selectedEvent.value = {
            id: '',
            title: '',
            description: '',
            date,
            time: '',
            color: 'blue',
            isLunar: false,
            createdAt: '',
            updatedAt: ''
        }
        editingEventId.value = null
        isEventModalOpen.value = true
    }

    // Open event modal for editing
    const openEditEventModal = (event: Event): void => {
        selectedEvent.value = { ...event }
        editingEventId.value = event.id
        isEventModalOpen.value = true
    }

    // Close event modal
    const closeEventModal = (): void => {
        isEventModalOpen.value = false
        selectedEvent.value = null
        editingEventId.value = null
    }

    // Generate unique ID
    const generateId = (): string => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2)
    }

    // Initialize store - Don't auto-load, wait for auth
    // loadEvents()

    return {
        // State
        events,
        selectedEvent,
        isEventModalOpen,
        editingEventId,
        isLoading,
        error,

        // Computed
        getEventsForDate,

        // Actions
        addEvent,
        updateEvent,
        deleteEvent,
        getEventById,
        openAddEventModal,
        openEditEventModal,
        closeEventModal,
        loadEvents,
        saveEventsToLocalStorage
    }
})
