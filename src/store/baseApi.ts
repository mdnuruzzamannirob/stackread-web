import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQueryWithReauth } from '@/store/baseQueryWithReauth'

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth', 'Onboarding'],
  endpoints: () => ({}),
})
