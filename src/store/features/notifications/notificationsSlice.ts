import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type LocalToast = {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

export type NotificationsState = {
  optimisticUnreadCount: number
  localToastQueue: LocalToast[]
  lastFcmRegistrationTimestamp: number | null
}

const initialState: NotificationsState = {
  optimisticUnreadCount: 0,
  localToastQueue: [],
  lastFcmRegistrationTimestamp: null,
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setOptimisticUnreadCount(state, action: PayloadAction<number>) {
      state.optimisticUnreadCount = action.payload
    },
    enqueueToast(state, action: PayloadAction<LocalToast>) {
      state.localToastQueue.push(action.payload)
    },
    dequeueToast(state) {
      state.localToastQueue.shift()
    },
    setLastFcmRegistrationTimestamp(
      state,
      action: PayloadAction<number | null>,
    ) {
      state.lastFcmRegistrationTimestamp = action.payload
    },
  },
})

export const {
  setOptimisticUnreadCount,
  enqueueToast,
  dequeueToast,
  setLastFcmRegistrationTimestamp,
} = notificationsSlice.actions

export const notificationsReducer = notificationsSlice.reducer
