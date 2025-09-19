# Hướng dẫn sửa lỗi gửi thông báo đến tất cả users

## 🚨 **Vấn đề hiện tại:**
- Không gửi được thông báo đến tất cả người dùng
- Có thể do không có FCM tokens trong Firestore
- Hoặc do lỗi trong việc query FCM tokens

## 🔍 **Debug Steps:**

### **1. Kiểm tra FCM Tokens:**
- Mở file `check-fcm-tokens.html` trong browser
- Click "Check FCM Tokens"
- Xem có bao nhiêu FCM tokens trong Firestore

### **2. Test gửi thông báo:**
- Mở file `debug-notification-sending.html` trong browser
- Click "Check FCM Tokens" trước
- Click "Test Send Notification"
- Xem kết quả gửi thông báo

### **3. Kiểm tra API Server:**
- Đảm bảo API server đang chạy: `npm run dev` trong thư mục `server/`
- Hoặc chạy: `node server/index.js`

## ✅ **Các bước sửa lỗi:**

### **Bước 1: Kiểm tra FCM Tokens**
```javascript
// Trong browser console
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from './src/config/firebase'

const notificationsQuery = query(
    collection(db, 'notifications'),
    where('isActive', '==', true)
)
const snapshot = await getDocs(notificationsQuery)
console.log('FCM Tokens:', snapshot.docs.map(doc => doc.data()))
```

### **Bước 2: Kiểm tra Users**
```javascript
// Trong browser console
const usersQuery = query(collection(db, 'users'))
const usersSnapshot = await getDocs(usersQuery)
console.log('Users:', usersSnapshot.docs.map(doc => doc.data()))
```

### **Bước 3: Test API Server**
```bash
# Kiểm tra API server có chạy không
curl http://localhost:3001/api/health
```

### **Bước 4: Test gửi thông báo**
```bash
# Test gửi thông báo
curl -X POST http://localhost:3001/api/v1/send-notifications \
  -H "Content-Type: application/json" \
  -d '{
    "tokens": ["your_fcm_token_here"],
    "notification": {
      "title": "Test",
      "body": "Test notification",
      "icon": "/favicon.ico"
    }
  }'
```

## 🔧 **Các lỗi có thể gặp:**

### **1. Không có FCM Tokens:**
- **Nguyên nhân:** Users chưa đăng ký nhận thông báo
- **Giải pháp:** Hướng dẫn users bật notification trong app

### **2. API Server không chạy:**
- **Nguyên nhân:** Server chưa được start
- **Giải pháp:** Chạy `npm run dev` trong thư mục `server/`

### **3. Lỗi 401 Unauthorized:**
- **Nguyên nhân:** VAPID key không đúng
- **Giải pháp:** Kiểm tra VAPID key trong Firebase Console

### **4. Lỗi 500 Internal Server Error:**
- **Nguyên nhân:** Service Account Key không đúng
- **Giải pháp:** Kiểm tra `serviceAccountKey.json`

## 🚀 **Sau khi sửa:**

### **1. Test gửi thông báo:**
- Mở admin panel
- Vào "Quản lý Thông báo"
- Click "Gửi đến tất cả"
- Kiểm tra kết quả

### **2. Kiểm tra logs:**
- Xem console logs trong browser
- Xem server logs trong terminal
- Kiểm tra Firestore để xem thông báo có được lưu không

## 📝 **Files đã tạo:**

- `check-fcm-tokens.html` - Kiểm tra FCM tokens trong Firestore
- `debug-notification-sending.html` - Test gửi thông báo
- `NOTIFICATION_BROADCAST_FIX.md` - Hướng dẫn sửa lỗi

## ⚠️ **Lưu ý quan trọng:**

### **FCM Tokens cần:**
- ✅ Được lưu trong collection `notifications`
- ✅ Có `isActive: true`
- ✅ Có `userId` và `token` hợp lệ
- ✅ Được tạo khi user đăng ký notification

### **API Server cần:**
- ✅ Chạy trên port 3001
- ✅ Có Service Account Key đúng
- ✅ Có thể kết nối đến Firestore
- ✅ Có thể gửi FCM notifications

## 🎯 **Các bước tiếp theo:**

1. **Kiểm tra FCM tokens** với `check-fcm-tokens.html`
2. **Test gửi thông báo** với `debug-notification-sending.html`
3. **Sửa lỗi** nếu có
4. **Test lại** từ admin panel

Nếu vẫn lỗi, hãy chia sẻ kết quả từ debug tools để tôi hỗ trợ thêm!
