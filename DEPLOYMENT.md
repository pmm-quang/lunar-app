# Hướng dẫn Deploy Production

## Yêu cầu cho Production

### 1. HTTPS (Bắt buộc)
- **Firebase Cloud Messaging** yêu cầu HTTPS
- **Service Worker** chỉ hoạt động trên HTTPS
- **Push Notifications** cần HTTPS

### 2. Domain và SSL Certificate
- Domain name (ví dụ: `lunar-calendar.yourdomain.com`)
- SSL Certificate (Let's Encrypt, Cloudflare, etc.)

## Các phương án Deploy

### Option 1: Vercel (Khuyến nghị)

1. **Cài đặt Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
npm run build
vercel --prod
```

3. **Cấu hình Environment Variables:**
- Vào Vercel Dashboard
- Project Settings > Environment Variables
- Thêm các biến cần thiết

### Option 2: Netlify

1. **Cài đặt Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Deploy:**
```bash
npm run build
netlify deploy --prod --dir=dist
```

3. **Cấu hình Redirects:**
Tạo file `public/_redirects`:
```
/*    /index.html   200
```

### Option 3: Firebase Hosting

1. **Cài đặt Firebase CLI:**
```bash
npm install -g firebase-tools
```

2. **Login và init:**
```bash
firebase login
firebase init hosting
```

3. **Build và deploy:**
```bash
npm run build
firebase deploy
```

### Option 4: VPS/Server

1. **Cài đặt Nginx:**
```bash
sudo apt update
sudo apt install nginx
```

2. **Cấu hình SSL với Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

3. **Cấu hình Nginx:**
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    root /var/www/lunar-calendar/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Service Worker
    location /firebase-messaging-sw.js {
        add_header Cache-Control "no-cache";
        proxy_cache_bypass $http_pragma;
        proxy_cache_revalidate on;
        expires off;
        access_log off;
    }
}
```

## Cấu hình Firebase cho Production

### 1. Cập nhật Firebase Config

Thay đổi trong `src/config/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
}
```

### 2. Environment Variables

Tạo file `.env.production`:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 3. Cập nhật VAPID Key

Trong `src/services/notificationService.ts`:

```typescript
const VAPID_KEY = process.env.VITE_FIREBASE_VAPID_KEY || 'your-vapid-key'
```

## Cấu hình Firestore Rules cho Production

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

## Testing Production

### 1. Kiểm tra HTTPS
- Truy cập `https://yourdomain.com`
- Kiểm tra SSL certificate
- Test notification permission

### 2. Test Notifications
1. Đăng nhập vào app
2. Bật thông báo
3. Thêm sự kiện cho ngày hiện tại
4. Test thông báo

### 3. Kiểm tra Console
- Mở Developer Tools
- Kiểm tra không có lỗi
- Kiểm tra FCM token được tạo

## Troubleshooting

### Lỗi "This site is not secure"
- **Nguyên nhân:** Chưa có HTTPS
- **Giải pháp:** Cấu hình SSL certificate

### Lỗi "Notification permission denied"
- **Nguyên nhân:** User từ chối permission
- **Giải pháp:** Hướng dẫn user bật trong browser settings

### Lỗi "FCM token not available"
- **Nguyên nhân:** Service Worker không load
- **Giải pháp:** Kiểm tra file `firebase-messaging-sw.js` có accessible

### Lỗi "Service Worker registration failed"
- **Nguyên nhân:** HTTPS không đúng hoặc file không tồn tại
- **Giải pháp:** Kiểm tra HTTPS và file service worker

## Performance Optimization

### 1. Build Optimization
```bash
npm run build
# Kiểm tra kích thước bundle
npx vite-bundle-analyzer dist
```

### 2. Caching
- Cấu hình cache headers cho static assets
- Sử dụng CDN cho Firebase assets

### 3. Monitoring
- Sử dụng Firebase Analytics
- Monitor error rates
- Track notification delivery

## Security Checklist

- [ ] HTTPS enabled
- [ ] Firestore rules configured
- [ ] Environment variables secured
- [ ] VAPID key protected
- [ ] CORS configured
- [ ] Content Security Policy set
- [ ] Rate limiting enabled
