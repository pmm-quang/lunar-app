# Hướng dẫn Cấu hình Environment Variables

## Lỗi "process is not defined"

### Nguyên nhân
- Vite không hỗ trợ `process.env` trong client-side code
- Cần sử dụng `import.meta.env` thay thế

### Giải pháp

#### 1. Tạo file `.env` (khuyến nghị)

Tạo file `.env` trong thư mục gốc:

```env
# Environment variables for Vite
VITE_FCM_API_URL=http://localhost:3001/api
VITE_FIREBASE_API_KEY=AIzaSyA5VEmvlRwkzquB3RtmyapRwteEiR8HH3s
VITE_FIREBASE_AUTH_DOMAIN=appp-16c20.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=appp-16c20
VITE_FIREBASE_STORAGE_BUCKET=appp-16c20.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=742488165077
VITE_FIREBASE_APP_ID=1:742488165077:web:13f44a4e3a0f221892305c
VITE_FIREBASE_VAPID_KEY=BODsmEiK468gWjdPfPC2R8m0jN-_IxRicZ1F5WGHqhFoX0Ol2qdHGP1SNw2vhUodqSR13XBCCmlNgfCZysNI8Po
```

#### 2. Cấu hình Vite (đã có)

File `vite.config.ts` đã được cấu hình để hỗ trợ cả hai cách:

```typescript
define: {
  'process.env': {
    VITE_FCM_API_URL: JSON.stringify(process.env.VITE_FCM_API_URL || 'http://localhost:3001/api'),
    // ... other variables
  }
}
```

#### 3. Sử dụng trong code

```typescript
// Cách 1: Sử dụng import.meta.env (khuyến nghị)
const API_URL = import.meta.env.VITE_FCM_API_URL

// Cách 2: Sử dụng process.env (fallback)
const API_URL = process.env.VITE_FCM_API_URL

// Cách 3: Kết hợp cả hai (đã implement)
const API_URL = import.meta.env.VITE_FCM_API_URL || process.env.VITE_FCM_API_URL || 'default'
```

## Các biến môi trường

### Firebase Configuration
- `VITE_FIREBASE_API_KEY` - Firebase API Key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase Auth Domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase Project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase Storage Bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase Messaging Sender ID
- `VITE_FIREBASE_APP_ID` - Firebase App ID
- `VITE_FIREBASE_VAPID_KEY` - Firebase VAPID Key

### API Configuration
- `VITE_FCM_API_URL` - FCM API URL

## Cách sử dụng

### Development
1. **Tạo file `.env`** với các giá trị development
2. **Restart dev server** để load environment variables
3. **Test** các tính năng notification

### Production
1. **Tạo file `.env.production`** với các giá trị production
2. **Build** ứng dụng: `npm run build`
3. **Deploy** với environment variables

### Vercel
```bash
# Set environment variables
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
# ... other variables
```

### Netlify
```bash
# Set environment variables in Netlify dashboard
# Site Settings > Environment Variables
```

## Troubleshooting

### Lỗi "process is not defined"
- **Nguyên nhân:** Sử dụng `process.env` trong client-side
- **Giải pháp:** Sử dụng `import.meta.env` hoặc cấu hình Vite

### Lỗi "import.meta is not defined"
- **Nguyên nhân:** Browser cũ không hỗ trợ
- **Giải pháp:** Cấu hình Vite để polyfill

### Environment variables không load
- **Nguyên nhân:** File `.env` không đúng format
- **Giải pháp:** Kiểm tra format, restart dev server

### Build error
- **Nguyên nhân:** Environment variables không có trong build
- **Giải pháp:** Cấu hình Vite define hoặc tạo file `.env`

## Best Practices

1. **Luôn có fallback** cho environment variables
2. **Sử dụng prefix VITE_** cho client-side variables
3. **Không commit** file `.env` vào git
4. **Tạo file `.env.example`** để hướng dẫn
5. **Validate** environment variables khi app khởi động

## Security

1. **Không expose** sensitive data trong client-side
2. **Sử dụng** server-side API cho sensitive operations
3. **Validate** environment variables trên server
4. **Rotate** keys định kỳ
5. **Monitor** usage và access logs
