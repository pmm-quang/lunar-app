import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

// Cấu hình Firebase - Sử dụng environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Kiểm tra xem tất cả các biến môi trường có được cung cấp không
const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
]

const missingVars = requiredEnvVars.filter(varName => {
    const value = import.meta.env[varName]
    return !value || value.includes('your_') || value.includes('_here')
})

if (missingVars.length > 0) {
    console.error('❌ Missing or invalid Firebase environment variables:', missingVars)
    console.error('Please update your .env file with actual Firebase configuration values.')
    console.error('Current values appear to be placeholders. Please replace them with real Firebase config.')
    console.error('See FIREBASE_ENV_SETUP.md for detailed instructions.')
    throw new Error(`Invalid Firebase configuration. Please update .env file with real values. Missing: ${missingVars.join(', ')}`)
}

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig)

// Khởi tạo các service
export const db = getFirestore(app)
export const auth = getAuth(app)

// Khởi tạo Cloud Messaging (chỉ hoạt động trong browser)
let messaging: any = null
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
        messaging = getMessaging(app)
        console.log('Firebase Messaging initialized')
    } catch (error) {
        console.warn('Firebase Cloud Messaging not supported:', error)
    }
}

export { messaging, getToken, onMessage }
export default app
