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
    
    getStats() {
      return api.get('/admin/documents/stats')
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

    download(id) {
      return api.get(`/admin/documents/${id}/download`, { responseType: 'blob' })
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
    },
    
    // Types
    getTypes() {
      return api.get('/admin/document-types')
    },
    
    createType(data) {
      return api.post('/admin/document-types', data)
    },
    
    updateType(id, data) {
      return api.put(`/admin/document-types/${id}`, data)
    },
    
    deleteType(id) {
      return api.delete(`/admin/document-types/${id}`)
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
    
    generateSelected(data) {
      return api.post('/admin/payrolls/generate-selected', data)
    },

    getEmployeesForSelection() {
      return api.get('/admin/payrolls/employees-selection')
    },
    
    checkExisting(data) {
      return api.post('/admin/payrolls/check-existing', data)
    },
    
    approve(id) {
      return api.post(`/admin/payrolls/${id}/approve`)
    },

    markAsPaid(id) {
      return api.post(`/admin/payrolls/${id}/mark-as-paid`)
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
  },

   // ==================== ATTENDANCE ====================
   attendance: {
     getAll(params = {}) {
       return api.get('/admin/attendance', { params })
     },
     
     getById(id) {
       return api.get(`/admin/attendance/${id}`)
     },
     
     getStats(params = {}) {
       return api.get('/admin/attendance/stats', { params })
     },
     
     getMonthlyStats(params = {}) {
       return api.get('/admin/attendance/monthly-stats', { params })
     },
     
     create(data) {
       return api.post('/admin/attendance', data)
     },
     
     update(id, data) {
       return api.put(`/admin/attendance/${id}`, data)
     },
     
     delete(id) {
       return api.delete(`/admin/attendance/${id}`)
     },
     
     markAttendance(data) {
       return api.post('/admin/attendance', data)
     },
     
     manualCheckout(attendanceId) {
       return api.post(`/admin/attendance/${attendanceId}/checkout`)
     },
     
     bulkCreate(data) {
       return api.post('/admin/attendance/bulk', data)
     }
   },

  // ==================== JUSTIFICATIONS ====================
  justifications: {
    getAll(params = {}) {
      return api.get('/admin/attendance-justifications', { params })
    },
    
    getById(id) {
      return api.get(`/admin/attendance-justifications/${id}`)
    },
    
    getStats() {
      return api.get('/admin/attendance-justifications/stats')
    },
    
    create(data) {
      const formData = new FormData()
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key])
        }
      })
      return api.post('/admin/attendance-justifications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    },
    
    approve(id, data = {}) {
      return api.post(`/admin/attendance-justifications/${id}/approve`, data)
    },
    
    reject(id, data = {}) {
      return api.post(`/admin/attendance-justifications/${id}/reject`, data)
    }
  },

  // ==================== ABSENCES ====================
  absences: {
    getAll(params = {}) {
      return api.get('/admin/absences', { params })
    },
    
    getById(id) {
      return api.get(`/admin/absences/${id}`)
    },
    
    getStats() {
      return api.get('/admin/absences/stats')
    },
    
    create(data) {
      return api.post('/admin/absences', data)
    },
    
    update(id, data) {
      return api.put(`/admin/absences/${id}`, data)
    },
    
    delete(id) {
      return api.delete(`/admin/absences/${id}`)
    },
    
    approve(id, data = {}) {
      return api.post(`/admin/absences/${id}/approve`, data)
    },
    
    reject(id, data = {}) {
      return api.post(`/admin/absences/${id}/reject`, data)
    }
  },

  // ==================== REPORTS & EXPORTS ====================
  reports: {
    employeePdf(employeeId) {
      return api.get(`/admin/reports/employee/${employeeId}/pdf`, { responseType: 'blob' })
    },
    payrollPdf(params = {}) {
      return api.get('/admin/reports/payroll/pdf', { params, responseType: 'blob' })
    },
    attendanceExport(params = {}) {
      return api.get('/admin/reports/attendance/export', { params, responseType: 'blob' })
    },
    employeesExport() {
      return api.get('/admin/reports/employees/export', { responseType: 'blob' })
    },
    leavesExport(params = {}) {
      return api.get('/admin/reports/leaves/export', { params, responseType: 'blob' })
    },
    payrollExport(params = {}) {
      return api.get('/admin/reports/payroll/export', { params, responseType: 'blob' })
    }
  }
}