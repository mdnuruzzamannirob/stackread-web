import type { ApiError, ApiResponse } from '@/types'

export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
  return response.data
}

export function formatApiErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object') {
    const maybeError = error as {
      message?: string
      error?: string
      status?: number
      data?: {
        message?: string
        error?: string
        errors?: Array<{ field?: string; message?: string }>
      }
    }

    if (maybeError.data?.message) {
      return maybeError.data.message
    }

    if (maybeError.data?.error) {
      return maybeError.data.error
    }

    if (maybeError.data?.errors?.length) {
      const firstValidationError = maybeError.data.errors[0]

      if (firstValidationError?.message) {
        return firstValidationError.message
      }
    }

    const baseError = maybeError as Partial<ApiError>

    if (baseError.message) {
      return baseError.message
    }

    if (baseError.error) {
      return baseError.error
    }

    if (maybeError.status === 401) {
      return 'Your session has expired. Please sign in again.'
    }
  }

  return 'Something went wrong. Please try again.'
}
