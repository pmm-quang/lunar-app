// Debug FCM Token - Chạy trong browser console
console.log('=== FCM Debug Script ===')

// 1. Kiểm tra VAPID key
const VAPID_KEY = 'BODsmEiK468gWjdPfPC2R8m0jN-_IxRicZ1F5WGHqhFoX0Ol2qdHGP1SNw2vhUodqSR13XBCCmlNgfCZysNI8Po'
console.log('VAPID Key:', VAPID_KEY)
console.log('VAPID Key length:', VAPID_KEY.length)

// 2. Kiểm tra Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyA5VEmvlRwkzquB3RtmyapRwteEiR8HH3s",
    authDomain: "appp-16c20.firebaseapp.com",
    projectId: "appp-16c20",
    storageBucket: "appp-16c20.firebasestorage.app",
    messagingSenderId: "742488165077",
    appId: "1:742488165077:web:13f44a4e3a0f221892305c"
}
console.log('Firebase Config:', firebaseConfig)

// 3. Kiểm tra browser support
console.log('Notification support:', 'Notification' in window)
console.log('Service Worker support:', 'serviceWorker' in navigator)

// 4. Kiểm tra service worker
navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('Service Workers:', registrations)
    if (registrations.length > 0) {
        console.log('Active Service Worker:', registrations[0].active)
        console.log('Service Worker Scope:', registrations[0].scope)
    }
})

// 5. Test FCM token
async function testFCMToken() {
    try {
        console.log('Testing FCM token...')

        // Import Firebase
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js')
        const { getMessaging, getToken } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js')

        // Initialize Firebase
        const app = initializeApp(firebaseConfig)
        const messaging = getMessaging(app)
        console.log('Firebase initialized')

        // Request permission
        const permission = await Notification.requestPermission()
        console.log('Notification permission:', permission)

        if (permission !== 'granted') {
            console.error('Notification permission denied')
            return
        }

        // Get FCM token
        console.log('Getting FCM token with VAPID key:', VAPID_KEY)
        const token = await getToken(messaging, {
            vapidKey: VAPID_KEY
        })

        if (token) {
            console.log('✅ FCM Token:', token)
        } else {
            console.log('❌ No FCM token received')
        }

    } catch (error) {
        console.error('❌ Error:', error)
        console.error('Error message:', error.message)
        console.error('Error code:', error.code)
        console.error('Error stack:', error.stack)
    }
}

// Chạy test
testFCMToken()
