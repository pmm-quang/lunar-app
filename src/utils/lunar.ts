import { SolarDate, LunarDate as VNLunarDate } from '@nghiavuive/lunar_date_vi'
import type { CalendarDay, CalendarMonth, SolarDate, LunarDate } from '@/types/lunar'

// Tên các tháng âm lịch
const LUNAR_MONTHS = [
    'Tháng Giêng', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư', 'Tháng Năm', 'Tháng Sáu',
    'Tháng Bảy', 'Tháng Tám', 'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Chạp'
]

// Tên các ngày âm lịch
const LUNAR_DAYS = [
    'Mồng 1', 'Mồng 2', 'Mồng 3', 'Mồng 4', 'Mồng 5', 'Mồng 6', 'Mồng 7', 'Mồng 8', 'Mồng 9', 'Mồng 10',
    'Mồng 11', 'Mồng 12', 'Mồng 13', 'Mồng 14', 'Mồng 15', 'Mồng 16', 'Mồng 17', 'Mồng 18', 'Mồng 19', 'Mồng 20',
    'Mồng 21', 'Mồng 22', 'Mồng 23', 'Mồng 24', 'Mồng 25', 'Mồng 26', 'Mồng 27', 'Mồng 28', 'Mồng 29', 'Mồng 30'
]

// Tên 12 con giáp
const ZODIAC_NAMES = [
    'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ',
    'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'
]

// Tên 10 thiên can
const HEAVENLY_STEMS = [
    'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'
]

// Tên 12 địa chi
const EARTHLY_BRANCHES = [
    'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ',
    'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'
]

// Ngũ hành
const ELEMENTS = ['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ']

// Các ngày lễ quan trọng
const HOLIDAYS: Record<string, string> = {
    '1-1': 'Tết Nguyên Đán',
    '1-15': 'Tết Nguyên Tiêu',
    '3-3': 'Tết Hàn Thực',
    '4-8': 'Lễ Phật Đản',
    '5-5': 'Tết Đoan Ngọ',
    '7-7': 'Tết Thất Tịch',
    '7-15': 'Tết Trung Nguyên',
    '8-15': 'Tết Trung Thu',
    '9-9': 'Tết Trùng Cửu',
    '10-10': 'Tết Thường Tân',
    '12-8': 'Tết Lạp Bát',
    '12-23': 'Tết Táo Quân'
}

export function convertSolarToLunar(solarDate: SolarDate): LunarDate {
    const solar = new SolarDate(new Date(solarDate.year, solarDate.month - 1, solarDate.day))
    const lunar = solar.toLunarDate()

    return {
        year: lunar.year,
        month: lunar.month,
        day: lunar.day,
        isLeapMonth: Boolean(lunar.isLeapMonth)
    }
}

export function convertLunarToSolar(lunarDate: LunarDate): SolarDate {
    const lunar = new VNLunarDate(lunarDate.year, lunarDate.month, lunarDate.day, lunarDate.isLeapMonth)
    const solar = lunar.toSolarDate()

    return {
        year: solar.year,
        month: solar.month,
        day: solar.day
    }
}

export function getLunarMonthName(month: number, isLeap: boolean = false): string {
    if (month < 1 || month > 12) return ''
    return isLeap ? `Nhuận ${LUNAR_MONTHS[month - 1]}` : LUNAR_MONTHS[month - 1]
}

export function getLunarDayName(day: number): string {
    if (day < 1 || day > 30) return ''
    return LUNAR_DAYS[day - 1]
}

export function getZodiacName(year: number): string {
    // Sử dụng thuật toán tính con giáp cho lịch âm Việt Nam
    const zodiacIndex = (year - 4) % 12
    return ZODIAC_NAMES[zodiacIndex < 0 ? zodiacIndex + 12 : zodiacIndex]
}

export function getCanChi(year: number): string {
    // Sử dụng thuật toán tính can chi cho lịch âm Việt Nam
    const heavenlyStemIndex = (year - 4) % 10
    const earthlyBranchIndex = (year - 4) % 12

    const heavenlyStem = HEAVENLY_STEMS[heavenlyStemIndex < 0 ? heavenlyStemIndex + 10 : heavenlyStemIndex]
    const earthlyBranch = EARTHLY_BRANCHES[earthlyBranchIndex < 0 ? earthlyBranchIndex + 12 : earthlyBranchIndex]

    return `${heavenlyStem} ${earthlyBranch}`
}

export function getElement(year: number): string {
    // Sử dụng thuật toán tính ngũ hành cho lịch âm Việt Nam
    const heavenlyStemIndex = (year - 4) % 10
    const elementIndex = Math.floor(heavenlyStemIndex / 2)
    return ELEMENTS[elementIndex]
}

export function isHoliday(lunarMonth: number, lunarDay: number): { isHoliday: boolean; name?: string } {
    const key = `${lunarMonth}-${lunarDay}`
    const holidayName = HOLIDAYS[key]
    return {
        isHoliday: !!holidayName,
        name: holidayName
    }
}

export function generateCalendarMonth(year: number, month: number): CalendarMonth {
    const days: CalendarDay[] = []
    const today = new Date()

    // Lấy ngày đầu tiên của tháng
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)

    // Lấy ngày đầu tuần của tháng (Chủ nhật = 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    // Tạo 42 ngày (6 tuần) để hiển thị đầy đủ lịch
    for (let i = 0; i < 42; i++) {
        const currentDate = new Date(startDate)
        currentDate.setDate(startDate.getDate() + i)

        const solarDate: SolarDate = {
            year: currentDate.getFullYear(),
            month: currentDate.getMonth() + 1,
            day: currentDate.getDate()
        }

        const lunarDate = convertSolarToLunar(solarDate)
        const isToday = currentDate.toDateString() === today.toDateString()
        const isCurrentMonth = currentDate.getMonth() === month - 1
        const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6

        const holiday = isHoliday(lunarDate.month, lunarDate.day)

        const day: CalendarDay = {
            solarDate,
            lunarDate,
            isToday,
            isCurrentMonth,
            isWeekend,
            lunarDayName: getLunarDayName(lunarDate.day),
            lunarMonthName: getLunarMonthName(lunarDate.month, lunarDate.isLeapMonth),
            zodiac: getZodiacName(lunarDate.year),
            element: getElement(lunarDate.year),
            canChi: getCanChi(lunarDate.year),
            isHoliday: holiday.isHoliday,
            holidayName: holiday.name
        }

        days.push(day)
    }

    return {
        year,
        month,
        days,
        lunarMonthName: getLunarMonthName(month),
        lunarYear: days[15].lunarDate.year // Lấy năm âm lịch từ giữa tháng
    }
}
