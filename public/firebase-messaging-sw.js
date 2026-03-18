importScripts(
  'https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js',
)
importScripts(
  'https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js',
)

firebase.initializeApp({
  apiKey: '',
  authDomain: '',
  projectId: '',
  messagingSenderId: '',
  appId: '',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Stackread'
  const options = {
    body: payload.notification?.body || 'You have a new notification.',
    icon: '/favicon.ico',
  }

  self.registration.showNotification(title, options)
})
