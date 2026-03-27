import api from './api'

export const adminService = {
  // ==================== REQUESTS ====================
  requests: {
    getAll(params = {}) {
      return api.get('/admin/requests', { params })
    },
    
    getById(id) {
      return api.get(`/admin/requests/${id}`)
    },
    
    approve(id, data = {}) {
      return api.post(`/admin/requests/${id}/approve`, data)
    },
    
    reject(id, data) {
      return api.post(`/admin/requests/${id}/reject`, data)
    },
    
    getStats() {
      return api.get('/admin/requests/stats')
    }
  },

  // ==================== LEAVES ====================
  leaves: {
    getAll(params = {}) {
      return api.get('/admin/leaves', { params })
    },
    
    getById(id) {
      return api.get(`/admin/leaves/${id}`)
    },
    
    create(data) {
      return api.post('/admin/leaves', data)
    },
    
    approve(id) {
      return api.post(`/admin/leaves/${id}/approve`)
    },
    
    reject(id, data) {
      return api.post(`/admin/leaves/${id}/reject`, data)
    },
    
    getStats(params = {}) {
      return api.get('/admin/leaves/stats', { params })
    },
    
    getEmployeeBalance(employeeId) {
      return api.get(`/admin/employees/${employeeId}/leave-balance`)
    }
  },

   attendanceJustifications: {
    getAll(params = {}) {
      return api.get('/admin/attendance/justifications', { params })
    },
    
    getStats() {
      return api.get('/admin/attendance/justifications/stats')
    },
    
    getById(id) {
      return api.get(`/admin/attendance/justifications/${id}`)
    },
    
    approve(id, data = {}) {
      return api.post(`/admin/attendance/justifications/${id}/approve`, data)
    },
    
    reject(id, data) {
      return api.post(`/admin/attendance/justifications/${id}/reject`, data)
    }
  },
  
  // ==================== ANNOUNCEMENTS ====================
  announcements: {
    getAll(params = {}) {
      return api.get('/admin/announcements', { params })
    },
    
    getById(id) {
      return api.get(`/admin/announcements/${id}`)
    },
    
    create(data) {
      return api.post('/admin/announcements', data)
    },
    
    update(id, data) {
      return api.put(`/admin/announcements/${id}`, data)
    },
    
    delete(id) {
      return api.delete(`/admin/announcements/${id}`)
    },
    
    publish(id) {
      return api.post(`/admin/announcements/${id}/publish`)
    },
    
    unpublish(id) {
      return api.post(`/admin/announcements/${id}/unpublish`)
    }
  },

  // ==================== DOCUMENTS ====================
  documents: {
    getAll(params = {}) {
      return api.get('/admin/documents', { params })
    },
    
    getById(id) {
      return api.get(`/admin/documents/${id}`)
    },
    
    create(formData) {
      return api.post('/admin/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    },
    
    update(id, data) {
      return api.put(`/admin/documents/${id}`, data)
    },
    
    delete(id) {
      return api.delete(`/admin/documents/${id}`)
    },
    
    // Categories
    getCategories() {
      return api.get('/admin/document-categories')
    },
    
    createCategory(data) {
      return api.post('/admin/document-categories', data)
    },
    
    updateCategory(id, data) {
      return api.put(`/admin/document-categories/${id}`, data)
    },
    
    deleteCategory(id) {
      return api.delete(`/admin/document-categories/${id}`)
    }
  },
    payroll: {
    getAll(params = {}) {
      return api.get('/admin/payrolls', { params })
    },
    
    getById(id) {
      return api.get(`/admin/payrolls/${id}`)
    },
    
    generateMonthly(data) {
      return api.post('/admin/payrolls/generate', data)
    },
    
    approve(id) {
      return api.post(`/admin/payrolls/${id}/approve`)
    },
    
    delete(id) {
      return api.delete(`/admin/payrolls/${id}`)
    }
  },

  // ==================== DEPARTMENTS & POSITIONS ====================
  departments: {
    getAll() {
      return api.get('/admin/departments')
    }
  },
  
  positions: {
    getAll() {
      return api.get('/admin/positions')
    }
  },

  // ==================== EMPLOYEES ====================
  employees: {
    getAll(params = {}) {
      return api.get('/admin/employees', { params })
    }
  }
}