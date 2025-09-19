import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { Event, EventFormData } from '@/types/event'

const COLLECTION_NAME = 'events'

export class EventService {
    // Thêm sự kiện mới
    static async addEvent(eventData: EventFormData, date: { year: number; month: number; day: number }, userId: string): Promise<string> {
        try {
            const eventDoc = {
                title: eventData.title,
                description: eventData.description || '',
                date: {
                    year: date.year,
                    month: date.month,
                    day: date.day
                },
                time: eventData.time || '',
                color: eventData.color,
                isLunar: eventData.isLunar,
                userId: userId,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            }

            const docRef = await addDoc(collection(db, COLLECTION_NAME), eventDoc)
            return docRef.id
        } catch (error) {
            console.error('Error adding event:', error)
            throw error
        }
    }

    // Cập nhật sự kiện
    static async updateEvent(eventId: string, eventData: EventFormData, date: { year: number; month: number; day: number }): Promise<void> {
        try {
            const eventRef = doc(db, COLLECTION_NAME, eventId)
            await updateDoc(eventRef, {
                title: eventData.title,
                description: eventData.description || '',
                date: {
                    year: date.year,
                    month: date.month,
                    day: date.day
                },
                time: eventData.time || '',
                color: eventData.color,
                isLunar: eventData.isLunar,
                updatedAt: Timestamp.now()
            })
        } catch (error) {
            console.error('Error updating event:', error)
            throw error
        }
    }

    // Xóa sự kiện
    static async deleteEvent(eventId: string): Promise<void> {
        try {
            const eventRef = doc(db, COLLECTION_NAME, eventId)
            await deleteDoc(eventRef)
        } catch (error) {
            console.error('Error deleting event:', error)
            throw error
        }
    }

    // Lấy tất cả sự kiện của user
    static async getEventsByUser(userId: string): Promise<Event[]> {
        try {
            const q = query(
                collection(db, COLLECTION_NAME),
                where('userId', '==', userId)
            )

            const querySnapshot = await getDocs(q)
            const events: Event[] = []

            querySnapshot.forEach((doc) => {
                const data = doc.data()
                events.push({
                    id: doc.id,
                    title: data.title,
                    description: data.description,
                    date: data.date,
                    time: data.time,
                    color: data.color,
                    isLunar: data.isLunar,
                    createdAt: data.createdAt.toDate().toISOString(),
                    updatedAt: data.updatedAt.toDate().toISOString()
                })
            })

            // Sort by createdAt desc in JavaScript
            events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

            return events
        } catch (error) {
            console.error('Error getting events:', error)
            throw error
        }
    }

    // Lấy sự kiện theo ngày
    static async getEventsByDate(year: number, month: number, day: number, userId: string): Promise<Event[]> {
        try {
            // Sử dụng query đơn giản hơn để tránh lỗi index
            const q = query(
                collection(db, COLLECTION_NAME),
                where('userId', '==', userId)
            )

            const querySnapshot = await getDocs(q)
            const events: Event[] = []

            querySnapshot.forEach((doc) => {
                const data = doc.data()
                // Filter by date in JavaScript instead of Firestore
                if (data.date.year === year && data.date.month === month && data.date.day === day) {
                    events.push({
                        id: doc.id,
                        title: data.title,
                        description: data.description,
                        date: data.date,
                        time: data.time,
                        color: data.color,
                        isLunar: data.isLunar,
                        createdAt: data.createdAt.toDate().toISOString(),
                        updatedAt: data.updatedAt.toDate().toISOString()
                    })
                }
            })

            // Sort by time
            events.sort((a, b) => {
                if (!a.time && !b.time) return 0
                if (!a.time) return 1
                if (!b.time) return -1
                return a.time.localeCompare(b.time)
            })

            return events
        } catch (error) {
            console.error('Error getting events by date:', error)
            throw error
        }
    }

    // Lấy sự kiện theo tháng
    static async getEventsByMonth(year: number, month: number, userId: string): Promise<Event[]> {
        try {
            // Sử dụng query đơn giản hơn để tránh lỗi index
            const q = query(
                collection(db, COLLECTION_NAME),
                where('userId', '==', userId)
            )

            const querySnapshot = await getDocs(q)
            const events: Event[] = []

            querySnapshot.forEach((doc) => {
                const data = doc.data()
                // Filter by month in JavaScript instead of Firestore
                if (data.date.year === year && data.date.month === month) {
                    events.push({
                        id: doc.id,
                        title: data.title,
                        description: data.description,
                        date: data.date,
                        time: data.time,
                        color: data.color,
                        isLunar: data.isLunar,
                        createdAt: data.createdAt.toDate().toISOString(),
                        updatedAt: data.updatedAt.toDate().toISOString()
                    })
                }
            })

            // Sort by day
            events.sort((a, b) => a.date.day - b.date.day)

            return events
        } catch (error) {
            console.error('Error getting events by month:', error)
            throw error
        }
    }
}
