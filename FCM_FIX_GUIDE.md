# Hướng dẫn sửa lỗi FCM "Not Found"

## 🚨 Vấn đề hiện tại:
- Lỗi "Not Found" khi gửi thông báo từ admin panel
- `FCMApiService` đang cố gắng gọi API server không tồn tại

## ✅ Giải pháp đã thực hiện:

### 1. **Tạo DirectFCMService**
- Gửi thông báo trực tiếp qua Firebase Cloud Messaging
- Không cần API server riêng
- Hoạt động trong browser environment

### 2. **Cập nhật AdminService**
- Thay thế `FCMApiService` bằng `DirectFCMService`
- Gửi thông báo trực tiếp từ client

## 🔧 Các bước cần làm:

### Bước 1: Thêm Server Key vào .env
Thêm dòng này vào file `.env`:
```env
VITE_FIREBASE_SERVER_KEY=your_actual_server_key_here
```

### Bước 2: Lấy Server Key từ Firebase Console
1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Chọn project của bạn
3. Vào **Project Settings** → **Cloud Messaging**
4. Tìm **Server key** section
5. Copy **Server key**
6. Paste vào file `.env`

### Bước 3: Cập nhật Firestore Rules (nếu cần)
Đảm bảo rules cho phép đọc FCM tokens:
```javascript
// Trong firestore.rules
match /notifications/{notificationId} {
  allow read, write: if request.auth != null;
}
```

### Bước 4: Test thông báo
1. Khởi động server: `npm run dev`
2. Đăng nhập và vào admin panel
3. Click "Gửi thông báo test"
4. Kiểm tra console để xem kết quả

## 🎯 Cách hoạt động mới:

### **Gửi thông báo test:**
- Lấy FCM token của user hiện tại
- Gửi thông báo đến chính mình

### **Gửi thông báo hàng loạt:**
- Lấy tất cả FCM tokens từ Firestore
- Gửi thông báo đến tất cả tokens
- Trả về thống kê thành công/thất bại

### **Gửi thông báo đến user cụ thể:**
- Lấy FCM token của user đó
- Gửi thông báo trực tiếp

## ⚠️ Lưu ý quan trọng:

1. **Server Key là bắt buộc** - không có sẽ không gửi được thông báo
2. **Hoạt động qua REST API** - gửi thông báo qua Firebase Cloud Messaging REST API
3. **Cần HTTPS** - chỉ localhost và HTTPS mới hoạt động
4. **User phải có FCM token** - cần đăng ký notification trước

## 🔍 Debug nếu vẫn lỗi:

1. **Kiểm tra console logs** khi gửi thông báo
2. **Kiểm tra Server key** có đúng không
3. **Kiểm tra FCM tokens** có trong Firestore không
4. **Kiểm tra browser permissions** cho notifications

## 📝 Ví dụ Server Key:
```
VITE_FIREBASE_SERVER_KEY=AAAA1234567890:APA91bH1234567890abcdefghijklmnopqrstuvwxyz1234567890
```
