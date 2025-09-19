# Hướng dẫn cấu hình Firebase

## Bước 1: Tạo project Firebase

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" hoặc "Add project"
3. Nhập tên project (ví dụ: `lunar-calendar-app`)
4. Chọn region (Asia-Southeast1 cho Việt Nam)
5. Click "Create project"

## Bước 2: Cấu hình Firestore Database

1. Trong Firebase Console, chọn project vừa tạo
2. Vào "Firestore Database" ở menu bên trái
3. Click "Create database"
4. Chọn "Start in test mode" (cho development)
5. Chọn location: `asia-southeast1` (Singapore)
6. Click "Done"

## Bước 3: Cấu hình Authentication

1. Vào "Authentication" ở menu bên trái
2. Click "Get started"
3. Vào tab "Sign-in method"
4. Bật "Email/Password" provider
5. Bật "Anonymous" provider (cho đăng nhập ẩn danh)

## Bước 4: Cấu hình Cloud Messaging

1. Vào "Cloud Messaging" ở menu bên trái
2. Click "Get started"
3. Vào tab "Cloud Messaging API"
4. Bật "Cloud Messaging API"
5. Vào tab "Web push certificates"
6. Tạo key pair mới (VAPID key)
7. Copy VAPID key để sử dụng trong code

## Bước 5: Lấy cấu hình Firebase

1. Vào "Project settings" (icon bánh răng)
2. Scroll xuống phần "Your apps"
3. Click "Web app" icon (</>)
4. Nhập tên app (ví dụ: `lunar-calendar-web`)
5. Click "Register app"
6. Copy cấu hình Firebase

## Bước 6: Cập nhật cấu hình trong code

Mở file `src/config/firebase.ts` và thay thế cấu hình:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
}
```

## Bước 7: Cấu hình Firestore Rules (Quan trọng)

Vào "Firestore Database" > "Rules" và cập nhật:

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

**Lưu ý:** Nếu bạn gặp lỗi index, có thể sử dụng rules đơn giản hơn cho development:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Cho phép tất cả user đã đăng nhập truy cập events
    match /events/{eventId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Bước 8: Cập nhật VAPID Key

Mở file `src/services/notificationService.ts` và thay thế VAPID key:

```typescript
const VAPID_KEY = 'your-vapid-key-here' // Thay thế bằng VAPID key thực tế
```

## Bước 9: Test ứng dụng

1. Chạy `npm run dev`
2. Mở trình duyệt tại `http://localhost:3002`
3. Click "Đăng nhập" để test authentication
4. Thử thêm sự kiện để test Firestore

## Lưu ý quan trọng

- **API Key** có thể public, nhưng nên giới hạn domain trong Firebase Console
- **Project ID** là unique và không thể thay đổi
- **Firestore Rules** nên được cấu hình chặt chẽ cho production
- **Authentication** cần được bật các provider cần thiết

## Troubleshooting

### Lỗi "Firebase: Error (auth/network-request-failed)"
- Kiểm tra kết nối internet
- Kiểm tra cấu hình Firebase

### Lỗi "Firebase: Error (auth/invalid-api-key)"
- Kiểm tra lại API key trong cấu hình
- Đảm bảo project đã được tạo đúng

### Lỗi "Firebase: Error (firestore/permission-denied)"
- Kiểm tra Firestore Rules
- Đảm bảo user đã đăng nhập

### Lỗi "The query requires an index"
- **Nguyên nhân:** Query phức tạp cần index
- **Giải pháp:** Đã sửa code để sử dụng query đơn giản hơn
- **Nếu vẫn lỗi:** Sử dụng Firestore Rules đơn giản cho development

## Production Setup

1. **Cấu hình Firestore Rules** chặt chẽ hơn
2. **Bật App Check** để bảo vệ API
3. **Cấu hình CORS** nếu cần
4. **Monitor** usage và performance
5. **Backup** dữ liệu định kỳ
