import api from './api'

export const employeeService = {
  // Dashboard
  dashboard: {
    getStats() {
      return api.get('/employee/dashboard')
    }
  },

  // Profile
  profile: {
    get() {
      return api.get('/employee/profile')
    },
    update(data) {
      return api.put('/employee/profile', data)
    }
  },

  // Announcements
  announcements: {
    getAll(params = {}) {
      return api.get('/employee/announcements', { params })
    },
    getById(id) {
      return api.get(`/employee/announcements/${id}`)
    },
    markAsRead(id) {
      return api.post(`/employee/announcements/${id}/mark-as-read`)
    },
    getUnreadCount() {
      return api.get('/employee/announcements/unread-count')
    }
  },

  // Documents
  documents: {
    getAll(params = {}) {
      return api.get('/employee/documents', { params })
    },
    getById(id) {
      return api.get(`/employee/documents/${id}`)
    },
    download(id) {
      return api.get(`/employee/documents/${id}/download`, {
        responseType: 'blob'
      })
    },
    getUnreadCount() {
      return api.get('/employee/documents/unread-count')
    }
  },

  // Leaves
  leaves: {
    getAll(params = {}) {
      return api.get('/employee/leaves', { params })
    },
    getById(id) {
      return api.get(`/employee/leaves/${id}`)
    },
    create(data) {
      return api.post('/employee/leaves', data)
    },
    cancel(id) {
      return api.post(`/employee/leaves/${id}/cancel`)
    },
    getBalance() {
      return api.get('/employee/leaves/balance')
    }
  },

  attendance: {
    getAll(params = {}) {
      return api.get('/employee/attendance', { params })
    },
    
    getToday() {
      return api.get('/employee/attendance/today')
    },
    
    checkIn() {
      return api.post('/employee/attendance/check-in')
    },
    
    checkOut() {
      return api.post('/employee/attendance/check-out')
    },
    
    getJustifications() {
      return api.get('/employee/attendance/justifications')
    },
    
    requestJustification(data) {
      return api.post('/employee/attendance/justifications', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }
  },

  // Requests
  requests: {
    getAll(params = {}) {
      return api.get('/employee/requests', { params })
    },
    getById(id) {
      return api.get(`/employee/requests/${id}`)
    },
    create(data) {
      return api.post('/employee/requests', data)
    },
    cancel(id) {
      return api.post(`/employee/requests/${id}/cancel`)
    }
  },
 payroll: {
    getAll(params = {}) {
      return api.get('/employee/payrolls', { params })
    },
    
    getById(id) {
      return api.get(`/employee/payrolls/${id}`)
    }
  },
  // Settings
  settings: {
    get() {
      return api.get('/employee/settings')
    },
    update(data) {
      return api.put('/employee/settings', data)
    },
    changePassword(data) {
      return api.post('/employee/settings/password', data)
    }
  }
}