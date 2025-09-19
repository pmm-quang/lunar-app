# Hướng dẫn Debug FCM Token

## 🚨 **Lỗi hiện tại:**
```
POST https://fcmregistrations.googleapis.com/v1/projects/appp-16c20/registrations 401 (Unauthorized)
Error getting FCM token: FirebaseError: Request is missing required authentication credential
```

## 🔍 **Debug Steps:**

### **1. Kiểm tra VAPID Key:**
```javascript
// Trong browser console
console.log('VAPID Key:', import.meta.env.VITE_FIREBASE_VAPID_KEY)
```

### **2. Kiểm tra Firebase Config:**
```javascript
// Trong browser console
console.log('Firebase Config:', import.meta.env)
```

### **3. Test FCM Token:**
- Mở file `test-fcm.html` trong browser
- Click "Test FCM Token"
- Kiểm tra console logs chi tiết

### **4. Kiểm tra Service Worker:**
```javascript
// Trong browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('Service Workers:', registrations)
})
```

## ✅ **Đã thêm Debug Logs:**

### **Trong `notificationService.ts`:**
- ✅ VAPID key debug logs
- ✅ Service worker registration logs
- ✅ FCM token attempt logs
- ✅ Error handling logs

### **Console Logs sẽ hiển thị:**
```
VAPID Key from env: BODsmEiK468gWjdPfPC2R8m0jN-_IxRicZ1F5WGHqhFoX0Ol2qdHGP1SNw2vhUodqSR13XBCCmlNgfCZysNI8Po
Using VAPID Key: BODsmEiK468gWjdPfPC2R8m0jN-_IxRicZ1F5WGHqhFoX0Ol2qdHGP1SNw2vhUodqSR13XBCCmlNgfCZysNI8Po
Registering service worker...
Service worker already registered
✅ Service worker registered successfully
Attempting to get FCM token with VAPID key: BODsmEiK468gWjdPfPC2R8m0jN-_IxRicZ1F5WGHqhFoX0Ol2qdHGP1SNw2vhUodqSR13XBCCmlNgfCZysNI8Po
```

## 🎯 **Các bước tiếp theo:**

### **1. Restart Development Server:**
```bash
# Dừng server hiện tại (Ctrl+C)
npm run dev
```

### **2. Kiểm tra Console Logs:**
- Mở browser console
- Refresh trang
- Xem logs chi tiết

### **3. Test với file test-fcm.html:**
- Mở `test-fcm.html` trong browser
- Click "Test FCM Token"
- Xem logs chi tiết

### **4. Nếu vẫn lỗi:**
- Kiểm tra VAPID key trong Firebase Console
- Kiểm tra project ID có đúng không
- Kiểm tra browser có hỗ trợ FCM không

## 🔧 **Troubleshooting:**

### **Lỗi 401 Unauthorized:**
- VAPID key không đúng
- Project ID không đúng
- Firebase project chưa bật Cloud Messaging

### **Lỗi Service Worker:**
- File `firebase-messaging-sw.js` không accessible
- Service worker scope không đúng
- Browser không hỗ trợ service worker

### **Lỗi Permission:**
- User chưa cho phép notification
- Browser chặn notification
- HTTPS required (trừ localhost)

## 📝 **Files đã tạo:**

- `test-fcm.html` - Test FCM token chi tiết
- `FCM_DEBUG_GUIDE.md` - Hướng dẫn debug
- `VAPID_KEY_FIX.md` - Hướng dẫn sửa VAPID key

## 🚀 **Sau khi debug:**

1. Restart server
2. Refresh browser
3. Kiểm tra console logs
4. Test notification từ admin panel

Nếu vẫn lỗi, hãy chia sẻ console logs chi tiết để debug tiếp!
