import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const company = ref(null)
  const token = ref(localStorage.getItem('token') || null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  
  const isSuperAdmin = computed(() => {
    const roles = user.value?.roles || []
    return roles.some(role => role.name === 'super-admin')
  })

  const isAdmin = computed(() => {
    const roles = user.value?.roles || []
    return roles.some(role => ['admin', 'super-admin', 'manager', 'finance', 'hr'].includes(role.name))
  })

  const isManager = computed(() => {
    const roles = user.value?.roles || []
    return roles.some(role => role.name === 'manager')
  })

  const isEmployee = computed(() => {
    const roles = user.value?.roles || []
    return roles.some(role => role.name === 'employee')
  })

  const userRole = computed(() => {
    if (!user.value?.roles || user.value.roles.length === 0) return null
    return user.value.roles[0].name
  })

  const login = async (credentials) => {
    try {
      // ✅ USAR /auth/login
      const { data } = await api.post('/auth/login', credentials)
      
      token.value = data.token
      user.value = data.user
      company.value = data.company || null
      
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      if (data.company) {
        localStorage.setItem('company', JSON.stringify(data.company))
      }

      return data
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      if (token.value) {
        // ✅ USAR /auth/logout
        await api.post('/auth/logout')
      }
    } catch (error) {
      // Logout error is non-critical
    } finally {
      user.value = null
      company.value = null
      token.value = null
      
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('company')
      localStorage.removeItem('employee-theme')
    }
  }

  const fetchUser = async () => {
    try {
      // ✅ USAR /auth/me
      const { data } = await api.get('/auth/me')
      user.value = data.user
      company.value = data.company || null

      localStorage.setItem('user', JSON.stringify(data.user))
      
      if (data.company) {
        localStorage.setItem('company', JSON.stringify(data.company))
      }

      return data
    } catch (error) {
      console.error('Fetch user error:', error)
      throw error
    }
  }

  const initAuth = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    const storedCompany = localStorage.getItem('company')

    if (storedToken) {
      token.value = storedToken
    }

    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (e) {
        console.error('Error parsing user:', e)
        localStorage.removeItem('user')
      }
    }

    if (storedCompany) {
      try {
        company.value = JSON.parse(storedCompany)
      } catch (e) {
        console.error('Error parsing company:', e)
        localStorage.removeItem('company')
      }
    }
  }

  const register = async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData)
      
      token.value = data.token
      user.value = data.user
      company.value = data.company || null
      
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      if (data.company) {
        localStorage.setItem('company', JSON.stringify(data.company))
      }

      return data
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const forgotPassword = async (email) => {
    try {
      const { data } = await api.post('/auth/forgot-password', { email })
      return data
    } catch (error) {
      console.error('Forgot password error:', error)
      throw error
    }
  }

  const resetPassword = async (payload) => {
    try {
      const { data } = await api.post('/auth/reset-password', payload)
      return data
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    }
  }

  return {
    user,
    company,
    token,
    isAuthenticated,
    isSuperAdmin,
    isAdmin,
    isManager,
    isEmployee,
    userRole,
    login,
    logout,
    fetchUser,
    initAuth,
    register,
    forgotPassword,
    resetPassword
  }
})