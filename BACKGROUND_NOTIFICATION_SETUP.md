# Hướng dẫn Cấu hình Background Notification

## Tổng quan

Background notification cho phép người dùng nhận thông báo ngay cả khi:
- Tắt web browser
- Đóng tab
- Thiết bị ở chế độ sleep
- App không chạy

## Cách hoạt động

### 1. Service Worker
- Chạy trong background ngay cả khi tắt web
- Xử lý push notifications từ Firebase
- Hiển thị notification trên desktop/mobile

### 2. Firebase Cloud Messaging (FCM)
- Gửi push notifications từ server
- Hoạt động trên mọi platform (web, mobile, desktop)
- Tự động retry khi thiết bị offline

### 3. Background Sync
- Đồng bộ dữ liệu khi có kết nối mạng
- Gửi notification khi có sự kiện mới

## Cấu hình

### Bước 1: Kiểm tra Service Worker

1. **Mở Developer Tools** → **Application** → **Service Workers**
2. **Kiểm tra** `firebase-messaging-sw.js` có active không
3. **Nếu không có**, refresh trang và thử lại

### Bước 2: Kiểm tra FCM Token

1. **Mở app** và đăng nhập
2. **Click "Thông báo"** → **Background Notification Settings**
3. **Kiểm tra** FCM Token có available không
4. **Nếu không có**, click "Kiểm tra lại"

### Bước 3: Test Background Notification

1. **Click "Test Background Notification"**
2. **Kiểm tra** có notification hiện không
3. **Tắt web** và test lại

## Server-side Implementation

### Cần tạo API endpoints:

```javascript
// POST /api/send-notification
{
  "token": "fcm_token_here",
  "notification": {
    "title": "Sự kiện hôm nay",
    "body": "Bạn có sự kiện mới",
    "icon": "/favicon.ico"
  },
  "data": {
    "eventId": "event_123",
    "type": "event_reminder"
  }
}

// POST /api/send-daily-notifications
// Gửi notification cho tất cả user có sự kiện hôm nay
```

### Ví dụ server code (Node.js):

```javascript
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-project.firebaseio.com"
});

// Send notification to token
app.post('/api/send-notification', async (req, res) => {
  const { token, notification, data } = req.body;
  
  try {
    const message = {
      token,
      notification,
      data,
      android: {
        notification: {
          icon: 'ic_notification',
          color: '#FF6B6B'
        }
      },
      webpush: {
        notification: {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          requireInteraction: true
        }
      }
    };
    
    const response = await admin.messaging().send(message);
    res.json({ success: true, messageId: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send daily notifications
app.post('/api/send-daily-notifications', async (req, res) => {
  // Lấy tất cả user có sự kiện hôm nay
  // Gửi notification cho mỗi user
  // Return kết quả
});
```

## Cấu hình Production

### 1. HTTPS Required
- Background notification chỉ hoạt động trên HTTPS
- Sử dụng Let's Encrypt hoặc SSL certificate

### 2. Service Worker Registration
```javascript
// Đăng ký service worker
navigator.serviceWorker.register('/firebase-messaging-sw.js')
  .then(registration => {
    console.log('Service Worker registered:', registration);
  })
  .catch(error => {
    console.error('Service Worker registration failed:', error);
  });
```

### 3. FCM Token Management
```javascript
// Lấy FCM token
const token = await getToken(messaging, {
  vapidKey: 'your-vapid-key'
});

// Lưu token vào database
await saveFCMToken(userId, token);
```

## Testing

### 1. Local Testing
```javascript
// Test service worker
navigator.serviceWorker.getRegistrations().then(console.log);

// Test FCM token
console.log('FCM Token:', notificationStore.fcmToken);

// Test background notification
BackgroundNotificationService.testNotification();
```

### 2. Production Testing
1. **Deploy app** lên HTTPS
2. **Đăng nhập** và bật notification
3. **Tắt web** hoàn toàn
4. **Chờ** đến giờ có sự kiện
5. **Kiểm tra** có notification không

## Troubleshooting

### Lỗi "Service Worker not registered"
- **Nguyên nhân:** Service worker chưa được đăng ký
- **Giải pháp:** Refresh trang, kiểm tra file service worker

### Lỗi "FCM token not available"
- **Nguyên nhân:** Firebase chưa được cấu hình đúng
- **Giải pháp:** Kiểm tra Firebase config, VAPID key

### Lỗi "Permission denied"
- **Nguyên nhân:** User chưa cho phép notification
- **Giải pháp:** Hướng dẫn user bật notification trong browser

### Notification không hiện khi tắt web
- **Nguyên nhân:** Service worker không hoạt động
- **Giải pháp:** Kiểm tra service worker, FCM token

## Best Practices

1. **Always test** trên production environment
2. **Monitor** FCM token expiration
3. **Handle** token refresh automatically
4. **Provide** clear instructions cho user
5. **Fallback** to local notification khi cần

## Monitoring

Sử dụng Firebase Console để monitor:
- FCM delivery rates
- Token registration
- Notification opens
- Error rates

## Security

1. **Validate** FCM tokens trước khi gửi
2. **Rate limit** notification sending
3. **Encrypt** sensitive data trong notification
4. **Audit** notification logs
