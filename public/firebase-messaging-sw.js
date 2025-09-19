// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

// Initialize Firebase
firebase.initializeApp({
    apiKey: "AIzaSyA5VEmvlRwkzquB3RtmyapRwteEiR8HH3s",
    authDomain: "appp-16c20.firebaseapp.com",
    projectId: "appp-16c20",
    storageBucket: "appp-16c20.firebasestorage.app",
    messagingSenderId: "742488165077",
    appId: "1:742488165077:web:13f44a4e3a0f221892305c"
})

// Initialize Firebase Messaging
const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('Received background message:', payload)

    const notificationTitle = payload.notification?.title || payload.data?.title || 'Lịch Âm'
    const notificationBody = payload.notification?.body || payload.data?.body || 'Bạn có sự kiện mới'
    const notificationIcon = payload.notification?.icon || payload.data?.icon || '/favicon.ico'

    const notificationOptions = {
        body: notificationBody,
        icon: notificationIcon,
        badge: '/favicon.ico',
        tag: 'lunar-calendar-event',
        requireInteraction: true,
        data: payload.data || {},
        actions: [
            {
                action: 'open',
                title: 'Mở ứng dụng',
                icon: '/favicon.ico'
            },
            {
                action: 'dismiss',
                title: 'Bỏ qua',
                icon: '/favicon.ico'
            }
        ]
    }

    self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event)
    console.log('Action:', event.action)

    event.notification.close()

    if (event.action === 'dismiss') {
        // User dismissed the notification
        return
    }

    // Focus the app window or open new one
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If app is already open, focus it
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus()
                }
            }

            // If app is not open, open new window
            if (clients.openWindow) {
                return clients.openWindow('/')
            }
        })
    )
})

// Handle notification close
self.addEventListener('notificationclose', (event) => {
    console.log('Notification closed:', event)
})

// Handle push events (for background sync)
self.addEventListener('push', (event) => {
    console.log('Push event received:', event)

    if (event.data) {
        const data = event.data.json()
        console.log('Push data:', data)

        // Handle the push data
        const options = {
            body: data.body || 'Bạn có thông báo mới',
            icon: data.icon || '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'lunar-calendar-push',
            data: data
        }

        event.waitUntil(
            self.registration.showNotification(data.title || 'Lịch Âm', options)
        )
    }
})
