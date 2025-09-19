# Hướng dẫn setup FCM HTTP v1 API với Firebase Admin SDK

## 🎯 **Tại sao sử dụng HTTP v1 API?**

### **Legacy API (Server Key) đã bị deprecate:**
- ❌ Server Key không còn được khuyến khích
- ❌ Bảo mật kém hơn
- ❌ Không hỗ trợ các tính năng mới

### **HTTP v1 API (Service Account + OAuth 2.0):**
- ✅ Bảo mật cao hơn
- ✅ Hỗ trợ đầy đủ tính năng mới
- ✅ Khuyến khích bởi Firebase
- ✅ Tương lai-proof

## 🚀 **Cách setup:**

### **Bước 1: Tạo Service Account Key**

1. **Truy cập Firebase Console:**
   - Vào [Firebase Console](https://console.firebase.google.com/)
   - Chọn project của bạn

2. **Tạo Service Account:**
   - Vào **Project Settings** → **Service accounts**
   - Click **Generate new private key**
   - Download file JSON (ví dụ: `serviceAccountKey.json`)

3. **Lưu file Service Account:**
   - Đặt file trong thư mục `server/`
   - Đảm bảo file không được commit vào Git

### **Bước 2: Setup API Server**

1. **Cài đặt dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Cấu hình environment:**
   ```bash
   # Tạo file .env trong thư mục server
   FIREBASE_PROJECT_ID=your-project-id
   PORT=3001
   ```

3. **Chạy server:**
   ```bash
   npm run dev
   ```

### **Bước 3: Cấu hình Client**

1. **Cập nhật .env:**
   ```env
   VITE_FCM_API_URL=http://localhost:3001/api
   ```

2. **Test API:**
   - Vào admin panel
   - Click "Gửi thông báo test"

## 📁 **Cấu trúc thư mục:**

```
lunar-app/
├── server/
│   ├── index.js              # API server
│   ├── package.json          # Dependencies
│   └── serviceAccountKey.json # Service Account Key
├── src/
│   └── services/
│       ├── fcmApiV1Service.ts # Client service
│       └── adminService.ts    # Admin service
└── .env                      # Client config
```

## 🔧 **API Endpoints:**

### **POST /api/send-notification**
Gửi thông báo đến một token:
```json
{
  "token": "fcm_token_here",
  "notification": {
    "title": "Tiêu đề",
    "body": "Nội dung",
    "icon": "/favicon.ico"
  },
  "data": {
    "customKey": "customValue"
  }
}
```

### **POST /api/send-notifications**
Gửi thông báo đến nhiều tokens:
```json
{
  "tokens": ["token1", "token2", "token3"],
  "notification": {
    "title": "Tiêu đề",
    "body": "Nội dung"
  }
}
```

### **POST /api/send-daily-notifications**
Gửi thông báo hàng ngày đến tất cả users.

### **GET /api/health**
Kiểm tra trạng thái server.

## ⚠️ **Lưu ý bảo mật:**

### **Service Account Key:**
- ❌ KHÔNG commit vào Git
- ❌ KHÔNG chia sẻ với ai
- ✅ Thêm vào `.gitignore`
- ✅ Chỉ sử dụng trong server

### **API Server:**
- ✅ Chạy trên server riêng
- ✅ Sử dụng HTTPS trong production
- ✅ Implement rate limiting
- ✅ Validate input data

## 🚀 **Deploy Production:**

### **1. Deploy API Server:**
- Sử dụng Heroku, Vercel, hoặc VPS
- Set environment variables
- Upload Service Account Key

### **2. Cập nhật Client:**
```env
VITE_FCM_API_URL=https://your-api-domain.com/api
```

## 🔍 **Debug:**

### **Kiểm tra server:**
```bash
curl http://localhost:3001/api/health
```

### **Test notification:**
```bash
curl -X POST http://localhost:3001/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{"token":"test","notification":{"title":"Test","body":"Test"}}'
```

## 📝 **Ví dụ Service Account Key:**

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "key_id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com"
}
```

## ✅ **Lợi ích của HTTP v1 API:**

1. **Bảo mật cao:** OAuth 2.0 + Service Account
2. **Tính năng đầy đủ:** Hỗ trợ tất cả tính năng FCM mới
3. **Tương lai-proof:** Không bị deprecate
4. **Performance tốt:** Firebase Admin SDK tối ưu
5. **Dễ maintain:** Code rõ ràng, dễ debug

