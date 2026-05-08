import axios from 'axios'
import router from '@/router'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://rh.enviazap.net/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    }
    
    if (error.response?.status === 403) {
      const data = error.response.data
      if (data?.license_expired || data?.subscription_expired) {
        const currentPath = window.location.pathname
        if (currentPath !== '/license-expired' && currentPath !== '/admin/subscription') {
          router.push('/license-expired')
        }
      }
    }
    
    return Promise.reject(error)
  }
)

export default api