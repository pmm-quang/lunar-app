# Lịch Âm - Lunar Calendar App

Ứng dụng xem lịch âm lịch Việt Nam được xây dựng với Vue 3, TypeScript và Tailwind CSS.

## Tính năng

- 📅 Hiển thị lịch âm lịch Việt Nam chính xác
- 🔄 Chuyển đổi giữa các tháng/năm
- 📱 Giao diện responsive, thân thiện với mobile
- 🌙 Thông tin chi tiết về ngày âm lịch
- 🎉 Hiển thị các ngày lễ quan trọng
- 🐉 Thông tin con giáp, can chi, ngũ hành
- 🌓 Hỗ trợ tháng nhuận âm lịch
- 🎨 Giao diện đẹp với dark mode

## Công nghệ sử dụng

- **Vue 3** - Framework JavaScript
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lunar JavaScript** - Thư viện tính toán lịch âm
- **Lucide Vue** - Icons
- **Pinia** - State management

## Cài đặt

1. Clone repository:
```bash
git clone <repository-url>
cd lunar-app
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Chạy development server:
```bash
npm run dev
```

4. Mở trình duyệt tại `http://localhost:3000`

## Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build production
- `npm run preview` - Preview production build
- `npm run type-check` - Kiểm tra TypeScript

## Cấu trúc project

```
src/
├── components/          # Vue components
│   ├── LunarCalendar.vue    # Component lịch chính
│   └── DayDetail.vue        # Component chi tiết ngày
├── types/              # TypeScript type definitions
│   └── lunar.ts            # Types cho lịch âm
├── utils/              # Utility functions
│   └── lunar.ts            # Logic tính toán lịch âm
├── App.vue             # Root component
├── main.ts             # Entry point
└── style.css           # Global styles
```

## Tính năng chính

### Lịch âm lịch
- Hiển thị lịch âm lịch Việt Nam chính xác
- Hỗ trợ tháng nhuận
- Chuyển đổi giữa các tháng/năm

### Thông tin chi tiết
- Ngày âm lịch (Mồng 1, Mồng 2, ...)
- Tháng âm lịch (Tháng Giêng, Tháng Hai, ...)
- Con giáp (Tý, Sửu, Dần, ...)
- Can chi (Giáp Tý, Ất Sửu, ...)
- Ngũ hành (Kim, Mộc, Thủy, Hỏa, Thổ)

### Ngày lễ
- Tết Nguyên Đán
- Tết Trung Thu
- Tết Đoan Ngọ
- Và nhiều ngày lễ khác

## License

MIT License
