import { defineStore } from 'pinia'
import api from '@/services/api'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    company: JSON.parse(localStorage.getItem('company')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false, // Flag to track initial data fetch
  }),

  getters: {
    isSuperAdmin: (state) => {
      return state.user?.roles?.includes('super-admin') || false
    },
    isAdmin: (state) => {
      return state.user?.roles?.includes('admin') ||
        state.user?.roles?.includes('super-admin') ||
        false
    },
    isEmployee: (state) => {
      return state.user?.roles?.includes('employee') || false
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
        this.isAuthenticated = true

        localStorage.setItem('token', this.token)
        localStorage.setItem('user', JSON.stringify(this.user))

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
        this.isAuthenticated = true

        localStorage.setItem('token', this.token)
        localStorage.setItem('user', JSON.stringify(this.user))

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
        this.isAuthenticated = false

        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('company')

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
        localStorage.setItem('user', JSON.stringify(this.user))
        localStorage.setItem('company', JSON.stringify(this.company))
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
    },
  },
})