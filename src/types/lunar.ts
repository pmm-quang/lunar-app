export interface LunarDate {
    year: number
    month: number
    day: number
    isLeapMonth: boolean
}

export interface SolarDate {
    year: number
    month: number
    day: number
}

export interface CalendarDay {
    solarDate: SolarDate
    lunarDate: LunarDate
    isToday: boolean
    isCurrentMonth: boolean
    isWeekend: boolean
    lunarDayName: string
    lunarMonthName: string
    zodiac: string
    element: string
    canChi: string
    isHoliday: boolean
    holidayName?: string
}

export interface CalendarMonth {
    year: number
    month: number
    days: CalendarDay[]
    lunarMonthName: string
    lunarYear: number
}
