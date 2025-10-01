/**
 * Admin API utility functions
 * Provides a centralized way to make admin API calls with proper error handling
 */

interface AdminApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  headers?: Record<string, string>
}

interface AdminApiResponse<T = any> {
  data: T
  success: boolean
  message?: string
  error?: string
}

/**
 * Make an admin API call using Next.js API routes
 * @param endpoint - API endpoint path (without /api/admin prefix)
 * @param options - Request options
 * @returns Promise with API response
 */
export async function adminApiCall<T = any>(
  endpoint: string,
  options: AdminApiOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options

  // Get admin token from localStorage (client-side only)
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  // Add authorization header if token exists
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`
  }

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
  }

  // Add body for non-GET requests
  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(`/api/admin${endpoint}`, requestOptions)

    if (!response.ok) {
      try {
        const errorData = await response.json()
        const errorMessage =
          errorData.error || errorData.message || `HTTP ${response.status}`
        console.error(`API Error [${method} ${endpoint}]:`, errorMessage, {
          status: response.status,
          body: body,
          errorData,
        })
        throw new Error(errorMessage)
      } catch (jsonError) {
        // If response is not JSON, try to get text
        try {
          const text = await response.text()
          throw new Error(text || `HTTP ${response.status} Error`)
        } catch (textError) {
          throw new Error(`HTTP ${response.status} Error`)
        }
      }
    }

    try {
      const data = await response.json()
      return data
    } catch (jsonError) {
      // If successful response is not JSON, return empty object
      return {} as T
    }
  } catch (error) {
    console.error(`Admin API call failed for ${endpoint}:`, error)
    throw error
  }
}

/**
 * Make a GET request to admin API
 */
export async function adminGet<T = any>(
  endpoint: string,
  params?: Record<string, string>
): Promise<T> {
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : ''
  return adminApiCall<T>(`${endpoint}${queryString}`, { method: 'GET' })
}

/**
 * Make a POST request to admin API
 */
export async function adminPost<T = any>(
  endpoint: string,
  body?: any
): Promise<T> {
  return adminApiCall<T>(endpoint, { method: 'POST', body })
}

/**
 * Make a PUT request to admin API
 */
export async function adminPut<T = any>(
  endpoint: string,
  body?: any
): Promise<T> {
  return adminApiCall<T>(endpoint, { method: 'PUT', body })
}

/**
 * Make a DELETE request to admin API
 */
export async function adminDelete<T = any>(endpoint: string): Promise<T> {
  return adminApiCall<T>(endpoint, { method: 'DELETE' })
}

/**
 * Make a PATCH request to admin API
 */
export async function adminPatch<T = any>(
  endpoint: string,
  body?: any
): Promise<T> {
  return adminApiCall<T>(endpoint, { method: 'PATCH', body })
}
