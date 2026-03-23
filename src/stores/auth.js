import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const company = ref(null)
  const token = ref(localStorage.getItem('token') || null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  
  const isSuperAdmin = computed(() => {
    if (!user.value?.roles) return false
    return user.value.roles.some(role => role.name === 'super-admin')
  })

  const isAdmin = computed(() => {
    if (!user.value?.roles) return false
    return user.value.roles.some(role => role.name === 'admin' || role.name === 'super-admin')
  })

  const isEmployee = computed(() => {
    if (!user.value?.roles) return false
    return user.value.roles.some(role => role.name === 'employee')
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

      // ✅ DEBUG - Verificar roles
      console.log('🔍 USER ROLES:', data.user?.roles)
      console.log('🔍 Is Super Admin?', isSuperAdmin.value)
      console.log('🔍 Is Admin?', isAdmin.value)
      console.log('🔍 Is Employee?', isEmployee.value)

      return data
    } catch (error) {
      console.error('Login error:', error)
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
      console.error('Logout error:', error)
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

      console.log('🔍 FETCH USER ROLES:', data.user?.roles)

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

  return {
    user,
    company,
    token,
    isAuthenticated,
    isSuperAdmin,
    isAdmin,
    isEmployee,
    userRole,
    login,
    logout,
    fetchUser,
    initAuth
  }
})