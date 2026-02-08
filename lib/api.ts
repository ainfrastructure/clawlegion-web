import axios from 'axios'

// Use relative URL for API calls (proxied through Next.js rewrites)
const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't log 404s — they're expected for optional resources
    if (error.response?.status !== 404) {
      console.error('API Error:', error.response?.data || error.message)
    }
    return Promise.reject(error)
  }
)

export default api
