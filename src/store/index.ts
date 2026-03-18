import { baseApi } from '@/store/baseApi'
import { authReducer } from '@/store/features/auth/authSlice'
import { catalogReducer } from '@/store/features/catalog/catalogSlice'
import { checkoutReducer } from '@/store/features/checkout/checkoutSlice'
import { notificationsReducer } from '@/store/features/notifications/notificationsSlice'
import { readerReducer } from '@/store/features/reader/readerSlice'
import { uiReducer } from '@/store/features/ui/uiSlice'
import { configureStore } from '@reduxjs/toolkit'

import '@/store/features/admin/adminAuditApi'
import '@/store/features/admin/adminMembersApi'
import '@/store/features/admin/adminRbacApi'
import '@/store/features/admin/adminReportsApi'
import '@/store/features/admin/adminSettingsApi'
import '@/store/features/admin/adminStaffApi'
import '@/store/features/auth/authApi'
import '@/store/features/borrows/borrowsApi'
import '@/store/features/catalog/authorsApi'
import '@/store/features/catalog/booksApi'
import '@/store/features/catalog/categoriesApi'
import '@/store/features/dashboard/dashboardApi'
import '@/store/features/notifications/notificationsApi'
import '@/store/features/onboarding/onboardingApi'
import '@/store/features/payments/paymentsApi'
import '@/store/features/plans/plansApi'
import '@/store/features/promotions/promotionsApi'
import '@/store/features/reading/readingApi'
import '@/store/features/reservations/reservationsApi'
import '@/store/features/reviews/reviewsApi'
import '@/store/features/search/searchApi'
import '@/store/features/staffAuth/staffAuthApi'
import '@/store/features/subscriptions/subscriptionsApi'
import '@/store/features/wishlist/wishlistApi'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    reader: readerReducer,
    notifications: notificationsReducer,
    checkout: checkoutReducer,
    catalog: catalogReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
