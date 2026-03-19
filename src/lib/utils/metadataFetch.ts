type ApiResponse<T> = {
  data: T
}

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''

export async function fetchPublicResource<T>(path: string): Promise<T | null> {
  if (!baseUrl) {
    return null
  }

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: 'GET',
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const payload = (await response.json()) as ApiResponse<T>
    return payload.data
  } catch {
    return null
  }
}
