# Hướng dẫn Khắc phục Sự cố Thông báo

## Lỗi "Notification permission denied"

### Nguyên nhân
- User đã từ chối quyền thông báo khi được hỏi
- Browser đã lưu lựa chọn "Block" cho trang web này

### Giải pháp

#### 1. Chrome / Edge
1. **Cách 1: Qua thanh địa chỉ**
   - Click vào biểu tượng 🔒 bên trái thanh địa chỉ
   - Tìm "Thông báo" và chọn "Cho phép"
   - Refresh trang

2. **Cách 2: Qua Settings**
   - Mở Chrome Settings (chrome://settings/)
   - Privacy and security → Site Settings
   - Tìm trang web này
   - Chọn "Allow" cho Notifications

3. **Cách 3: Qua Developer Tools**
   - F12 → Console
   - Gõ: `Notification.requestPermission()`
   - Chọn "Allow" khi được hỏi

#### 2. Firefox
1. **Cách 1: Qua thanh địa chỉ**
   - Click vào biểu tượng 🛡️ bên trái thanh địa chỉ
   - Tìm "Thông báo" và chọn "Cho phép"
   - Refresh trang

2. **Cách 2: Qua Settings**
   - Mở Firefox Settings
   - Privacy & Security → Notifications
   - Tìm trang web này và chọn "Allow"

#### 3. Safari
1. **Cách 1: Qua Menu**
   - Safari → Preferences → Websites → Notifications
   - Tìm trang web này và chọn "Allow"

2. **Cách 2: Qua thanh địa chỉ**
   - Click vào biểu tượng 🛡️ bên trái thanh địa chỉ
   - Chọn "Allow" cho Notifications

#### 4. Mobile (Android/iOS)
1. **Chrome Mobile**
   - Mở Chrome Settings
   - Site Settings → Notifications
   - Tìm trang web này và bật

2. **Safari Mobile**
   - Settings → Safari → Notifications
   - Tìm trang web này và bật

## Lỗi "Cần HTTPS cho thông báo"

### Nguyên nhân
- Firebase Cloud Messaging yêu cầu HTTPS
- Service Worker chỉ hoạt động trên HTTPS

### Giải pháp

#### Development (localhost)
- Sử dụng `http://localhost:3001` (OK cho development)
- Hoặc cấu hình HTTPS local:
  ```bash
  # Tạo SSL certificate local
  npm install -g mkcert
  mkcert -install
  mkcert localhost 127.0.0.1 ::1
  ```

#### Production
- **Bắt buộc** phải có HTTPS
- Sử dụng Let's Encrypt, Cloudflare, hoặc SSL certificate khác
- Xem hướng dẫn trong `DEPLOYMENT.md`

## Lỗi "Browser không hỗ trợ thông báo"

### Nguyên nhân
- Browser cũ không hỗ trợ Notification API
- Đang sử dụng HTTP thay vì HTTPS

### Giải pháp
1. **Cập nhật Browser**
   - Chrome: Version 22+
   - Firefox: Version 22+
   - Safari: Version 6+
   - Edge: Version 14+

2. **Kiểm tra hỗ trợ**
   ```javascript
   if ('Notification' in window) {
     console.log('Notifications supported')
   } else {
     console.log('Notifications not supported')
   }
   ```

## Lỗi "FCM token not available"

### Nguyên nhân
- Service Worker không load được
- VAPID key không đúng
- Firebase config sai

### Giải pháp

#### 1. Kiểm tra Service Worker
- Mở Developer Tools → Application → Service Workers
- Kiểm tra `firebase-messaging-sw.js` có load không
- Nếu không có, kiểm tra file có tồn tại trong `public/` không

#### 2. Kiểm tra VAPID Key
- Vào Firebase Console → Project Settings → Cloud Messaging
- Copy VAPID key và cập nhật trong `src/services/notificationService.ts`

#### 3. Kiểm tra Firebase Config
- Kiểm tra `src/config/firebase.ts` có đúng không
- Kiểm tra Cloud Messaging đã enable chưa

## Lỗi "Service Worker registration failed"

### Nguyên nhân
- File service worker không tồn tại
- HTTPS không đúng
- CORS issues
- Firebase version không tương thích
- Service worker file không accessible

### Giải pháp

#### 1. Kiểm tra file service worker
```bash
# Kiểm tra file có tồn tại
ls public/firebase-messaging-sw.js

# Kiểm tra file có accessible không
curl http://localhost:3001/firebase-messaging-sw.js
```

#### 2. Kiểm tra Firebase version
- Service worker phải sử dụng Firebase v10+ compat
- Đảm bảo version tương thích với code chính

#### 3. Kiểm tra HTTPS
- Đảm bảo đang sử dụng HTTPS (trừ localhost)
- Kiểm tra SSL certificate có valid không

#### 4. Kiểm tra CORS
- Kiểm tra server có cấu hình CORS đúng không
- Kiểm tra Content Security Policy

#### 5. Debug Service Worker
```javascript
// Trong console
ServiceWorkerTest.runAllTests().then(console.log)

// Kiểm tra registration
navigator.serviceWorker.getRegistrations().then(console.log)

// Kiểm tra file
fetch('/firebase-messaging-sw.js').then(r => console.log(r.status))
```

## Test Notification

### Cách test thông báo
1. **Test Local Notification**
   ```javascript
   // Trong console
   Notification.requestPermission().then(permission => {
     if (permission === 'granted') {
       new Notification('Test', { body: 'This is a test notification' })
     }
   })
   ```

2. **Test FCM Token**
   ```javascript
   // Trong console
   import { getToken } from 'firebase/messaging'
   getToken(messaging, { vapidKey: 'your-vapid-key' })
     .then(token => console.log('FCM Token:', token))
   ```

3. **Test qua UI**
   - Click "Test thông báo" trong app
   - Kiểm tra có thông báo hiện không

## Debug Steps

### 1. Kiểm tra Console
- Mở Developer Tools → Console
- Tìm các lỗi liên quan đến notification
- Kiểm tra FCM token có được tạo không

### 2. Kiểm tra Network
- Mở Developer Tools → Network
- Kiểm tra request đến Firebase có thành công không
- Kiểm tra service worker có load không

### 3. Kiểm tra Application
- Mở Developer Tools → Application
- Service Workers: Kiểm tra service worker
- Storage: Kiểm tra localStorage có lưu token không

## Common Issues

### 1. "Permission denied" sau khi đã cho phép
- **Nguyên nhân:** Browser cache
- **Giải pháp:** Clear cache và thử lại

### 2. Thông báo không hiện
- **Nguyên nhân:** Browser settings, Do Not Disturb mode
- **Giải pháp:** Kiểm tra browser settings, tắt Do Not Disturb

### 3. FCM token thay đổi liên tục
- **Nguyên nhân:** Service worker không stable
- **Giải pháp:** Kiểm tra service worker code, đảm bảo không có lỗi

### 4. Thông báo chỉ hiện khi app mở
- **Nguyên nhân:** Service worker không hoạt động
- **Giải pháp:** Kiểm tra service worker registration

## Support

Nếu vẫn gặp vấn đề:
1. Kiểm tra browser console để xem lỗi chi tiết
2. Thử trên browser khác
3. Kiểm tra network connection
4. Xem hướng dẫn trong `DEPLOYMENT.md`
