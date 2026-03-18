export type ApiResponse<T> = {
  success: boolean
  message?: string
  data: T
  meta?: Record<string, unknown>
}

export type PaginatedResponse<T> = {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export type ApiError = {
  statusCode: number
  message: string
  error?: string
  details?: unknown
}
