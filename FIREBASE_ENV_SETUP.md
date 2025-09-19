# Firebase Environment Setup

## Lỗi hiện tại
Bạn đang gặp lỗi: `Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)`

## Nguyên nhân
- Không có file `.env` với cấu hình Firebase
- API key hiện tại không hợp lệ hoặc từ project khác

## Cách khắc phục

### Bước 1: Tạo file .env
Tạo file `.env` trong thư mục gốc của project với nội dung:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_actual_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Bước 2: Lấy thông tin Firebase từ Console
1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Chọn project của bạn (hoặc tạo project mới)
3. Vào **Project Settings** (biểu tượng bánh răng)
4. Cuộn xuống phần **Your apps**
5. Nếu chưa có web app, click **Add app** và chọn **Web**
6. Copy các giá trị từ phần **SDK setup and configuration**

### Bước 3: Cập nhật file .env
Thay thế các giá trị placeholder bằng thông tin thực từ Firebase Console:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=my-project-12345.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=my-project-12345
VITE_FIREBASE_STORAGE_BUCKET=my-project-12345.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

### Bước 4: Khởi động lại dev server
```bash
npm run dev
```

## Lưu ý quan trọng
- File `.env` không được commit vào git (đã có trong .gitignore)
- Luôn sử dụng `VITE_` prefix cho các biến môi trường trong Vite
- Đảm bảo Firebase project đã bật Authentication với Email/Password

## Kiểm tra cấu hình
Sau khi setup, mở Developer Tools và kiểm tra console để đảm bảo không có lỗi Firebase configuration.

