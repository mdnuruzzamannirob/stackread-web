import { TAG_TYPES } from '@/constants/tagTypes'
import { baseQueryWithReauth } from '@/store/baseQueryWithReauth'
import { createApi } from '@reduxjs/toolkit/query/react'

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: [...TAG_TYPES],
  endpoints: () => ({}),
})
