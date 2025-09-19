# Hướng dẫn Cấu hình Firestore Rules

## Lỗi "Missing or insufficient permissions"

### Nguyên nhân
- Firestore Rules chưa được cấu hình đúng
- User chưa được authenticate
- Rules quá nghiêm ngặt

### Giải pháp

#### 1. Cấu hình Firestore Rules

1. **Mở Firebase Console:**
   - Truy cập [Firebase Console](https://console.firebase.google.com)
   - Chọn project của bạn
   - Vào "Firestore Database" → "Rules"

2. **Cập nhật Rules:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Events - chỉ user sở hữu mới truy cập được
       match /events/{eventId} {
         allow read, write: if request.auth != null && 
           request.auth.uid == resource.data.userId;
         allow create: if request.auth != null && 
           request.auth.uid == request.resource.data.userId;
       }
       
       // Notifications - cho phép user đã đăng nhập tạo và đọc token của mình
       match /notifications/{notificationId} {
         allow read, write: if request.auth != null && 
           request.auth.uid == resource.data.userId;
         allow create: if request.auth != null && 
           request.auth.uid == request.resource.data.userId;
       }
       
       // Fallback rules cho development - cho phép tất cả user đã đăng nhập
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

3. **Publish Rules:**
   - Click "Publish" để áp dụng rules mới

#### 2. Rules cho Production (Bảo mật hơn)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Events - chỉ user sở hữu mới truy cập được
    match /events/{eventId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Notifications - chỉ user sở hữu mới truy cập được
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

#### 3. Rules cho Development (Mở rộng)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Cho phép tất cả user đã đăng nhập truy cập
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Các bước khắc phục

### Bước 1: Kiểm tra Authentication
```javascript
// Trong console
console.log('User ID:', authStore.userId)
console.log('Authenticated:', authStore.isAuthenticated)
```

### Bước 2: Test Firestore Permissions
```javascript
// Trong console
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'

// Test tạo document
addDoc(collection(db, 'notifications'), {
  userId: 'test-user',
  test: true,
  createdAt: new Date()
}).then(() => {
  console.log('✅ Firestore write successful')
}).catch(error => {
  console.error('❌ Firestore write failed:', error)
})
```

### Bước 3: Kiểm tra Rules hiện tại
1. Vào Firebase Console
2. Firestore Database → Rules
3. Xem rules hiện tại có đúng không

### Bước 4: Cập nhật Rules
1. Copy rules từ file `firestore.rules`
2. Paste vào Firebase Console
3. Click "Publish"

## Troubleshooting

### Lỗi "Permission denied"
- **Nguyên nhân:** User chưa đăng nhập
- **Giải pháp:** Đảm bảo user đã đăng nhập trước khi lưu FCM token

### Lỗi "Missing or insufficient permissions"
- **Nguyên nhân:** Rules không cho phép tạo document
- **Giải pháp:** Cập nhật rules để cho phép user tạo document

### Lỗi "Resource not found"
- **Nguyên nhân:** Collection không tồn tại
- **Giải pháp:** Firestore sẽ tự tạo collection khi có document đầu tiên

### Lỗi "Invalid argument"
- **Nguyên nhân:** Dữ liệu không đúng format
- **Giải pháp:** Kiểm tra dữ liệu gửi lên Firestore

## Fallback System

Khi Firestore không khả dụng, hệ thống sẽ tự động sử dụng localStorage:

```javascript
// Tự động fallback khi Firestore lỗi
try {
  await NotificationService.saveFCMToken(userId, token)
} catch (error) {
  // Tự động lưu vào localStorage
  NotificationService.saveFCMTokenToLocalStorage(userId, token)
}
```

## Monitoring

Sử dụng FirestoreStatus component để monitor:
- User authentication status
- Firestore write permissions
- Fallback usage

## Best Practices

1. **Development:** Sử dụng rules mở rộng để dễ test
2. **Production:** Sử dụng rules nghiêm ngặt để bảo mật
3. **Testing:** Luôn test rules trước khi deploy
4. **Monitoring:** Theo dõi Firestore usage và errors
5. **Fallback:** Luôn có fallback system khi Firestore lỗi
