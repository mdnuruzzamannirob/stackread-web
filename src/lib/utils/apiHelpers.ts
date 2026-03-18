import type { ApiError, ApiResponse } from '@/types'

export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
  return response.data
}

export function formatApiErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object') {
    const maybeError = error as Partial<ApiError>

    if (maybeError.message) {
      return maybeError.message
    }

    if (maybeError.error) {
      return maybeError.error
    }
  }

  return 'Something went wrong. Please try again.'
}
