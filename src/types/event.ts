export interface Event {
    id: string
    title: string
    description?: string
    date: {
        year: number
        month: number
        day: number
    }
    time?: string
    color: string
    isLunar: boolean
    createdAt: string
    updatedAt: string
}

export interface EventFormData {
    title: string
    description: string
    time: string
    color: string
    isLunar: boolean
}

export const EVENT_COLORS = [
    { name: 'Đỏ', value: 'red', class: 'bg-red-500' },
    { name: 'Xanh dương', value: 'blue', class: 'bg-blue-500' },
    { name: 'Xanh lá', value: 'green', class: 'bg-green-500' },
    { name: 'Vàng', value: 'yellow', class: 'bg-yellow-500' },
    { name: 'Tím', value: 'purple', class: 'bg-purple-500' },
    { name: 'Hồng', value: 'pink', class: 'bg-pink-500' },
    { name: 'Cam', value: 'orange', class: 'bg-orange-500' },
    { name: 'Xám', value: 'gray', class: 'bg-gray-500' }
] as const
