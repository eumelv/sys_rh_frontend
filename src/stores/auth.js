import { defineStore } from 'pinia'
import api from '@/services/api'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    company: JSON.parse(localStorage.getItem('company')) || null,
    token: localStorage.getItem('token') || null,
    employee: JSON.parse(localStorage.getItem('employee')) || null,
    isEmployee: localStorage.getItem('is_employee') === 'true',
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,
  }),

  getters: {
    // ✅ CORRIGIDO: Usar campo 'role' ao invés de 'roles'
    isSuperAdmin: (state) => {
      return state.user?.role === 'super-admin'
    },
    
    isAdmin: (state) => {
      return state.user?.role === 'admin' || state.user?.role === 'super-admin'
    },
    
    isManager: (state) => {
      return state.user?.role === 'manager'
    },
    
    userRole: (state) => {
      return state.user?.role || null
    },
    
    currentPlan: (state) => {
      return state.company?.subscription?.plan_slug || null
    },
    
    hasFeature: (state) => (feature) => {
      return state.company?.subscription?.features?.includes(feature) || false
    },
  },

  actions: {
    async login(credentials) {
      try {
        const response = await api.post('/auth/login', credentials)

        this.token = response.data.token
        this.user = response.data.user
        this.company = response.data.company
        this.employee = response.data.employee
        this.isEmployee = response.data.is_employee
        this.isAuthenticated = true

        localStorage.setItem('token', this.token)
        localStorage.setItem('user', JSON.stringify(this.user))
        localStorage.setItem('company', JSON.stringify(this.company))
        localStorage.setItem('employee', JSON.stringify(this.employee))
        localStorage.setItem('is_employee', this.isEmployee)

        // ✅ LOG DETALHADO
        console.log('=== AUTH STORE LOGIN ===')
        console.log('User:', this.user)
        console.log('Role:', this.user?.role)
        console.log('Is Admin:', this.isAdmin)
        console.log('Is Employee:', this.isEmployee)

        return response.data
      } catch (error) {
        throw error
      }
    },

    async register(data) {
      try {
        const response = await api.post('/auth/register', data)

        this.token = response.data.token
        this.user = response.data.user
        this.company = response.data.company
        this.employee = response.data.employee
        this.isEmployee = response.data.is_employee
        this.isAuthenticated = true

        localStorage.setItem('token', this.token)
        localStorage.setItem('user', JSON.stringify(this.user))
        localStorage.setItem('company', JSON.stringify(this.company))
        localStorage.setItem('employee', JSON.stringify(this.employee))
        localStorage.setItem('is_employee', this.isEmployee)

        return response.data
      } catch (error) {
        throw error
      }
    },

    async logout() {
      try {
        await api.post('/auth/logout')
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.user = null
        this.company = null
        this.token = null
        this.employee = null
        this.isEmployee = false
        this.isAuthenticated = false

        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('company')
        localStorage.removeItem('employee')
        localStorage.removeItem('is_employee')

        router.push('/login')
      }
    },

    async fetchUser() {
      if (this.isLoading) return
      this.isLoading = true
      try {
        const response = await api.get('/auth/me')
        this.user = response.data.user
        this.company = response.data.company
        this.employee = response.data.employee
        this.isEmployee = response.data.is_employee
        
        localStorage.setItem('user', JSON.stringify(this.user))
        localStorage.setItem('company', JSON.stringify(this.company))
        localStorage.setItem('employee', JSON.stringify(this.employee))
        localStorage.setItem('is_employee', this.isEmployee)
        
        return response.data
      } catch (error) {
        this.logout()
        throw error
      } finally {
        this.isLoading = false
      }
    },

    setUser(user) {
      this.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },

    setCompany(company) {
      this.company = company
      localStorage.setItem('company', JSON.stringify(company))
    },
  },
})