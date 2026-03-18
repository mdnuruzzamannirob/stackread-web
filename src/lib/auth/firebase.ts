import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getMessaging,
  getToken,
  isSupported,
  type Messaging,
} from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

export const firebaseApp: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

export async function getMessagingClient(): Promise<Messaging | null> {
  if (typeof window === 'undefined') {
    return null
  }

  const supported = await isSupported()

  if (!supported) {
    return null
  }

  return getMessaging(firebaseApp)
}

export async function requestFCMToken() {
  const messaging = await getMessagingClient()

  if (!messaging) {
    return null
  }

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY

  return getToken(messaging, vapidKey ? { vapidKey } : undefined)
}
