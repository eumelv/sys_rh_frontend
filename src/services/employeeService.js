import api from './api'

export const employeeService = {
    // Documentos
    documents: {
        async getAll(params = {}) {
            try {
                const response = await api.get('/employee/documents', { params })
                return response.data
            } catch (error) {
                console.error('Error in documents.getAll:', error)
                throw error
            }
        },
        async getById(id) {
            try {
                const response = await api.get(`/employee/documents/${id}`)
                return response.data
            } catch (error) {
                console.error('Error in documents.getById:', error)
                throw error
            }
        },
        async download(id) {
            try {
                const response = await api.get(`/employee/documents/${id}/download`, {
                    responseType: 'blob'
                })
                return response
            } catch (error) {
                console.error('Error in documents.download:', error)
                throw error
            }
        },
        async getUnreadCount() {
            try {
                const response = await api.get('/employee/documents/unread-count')
                return response.data
            } catch (error) {
                console.error('Error in documents.getUnreadCount:', error)
                return { count: 0 }
            }
        }
    },

    // Solicitações
    requests: {
        async getAll(params = {}) {
            try {
                const response = await api.get('/employee/requests', { params })
                return response.data
            } catch (error) {
                console.error('Error in requests.getAll:', error)
                throw error
            }
        },
        async create(formData) {
            try {
                const response = await api.post('/employee/requests', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                return response.data
            } catch (error) {
                console.error('Error in requests.create:', error)
                throw error
            }
        },
        async getById(id) {
            try {
                const response = await api.get(`/employee/requests/${id}`)
                return response.data
            } catch (error) {
                console.error('Error in requests.getById:', error)
                throw error
            }
        }
    },

    // Comunicados
    announcements: {
        async getAll(params = {}) {
            try {
                const response = await api.get('/employee/announcements', { params })
                return response.data
            } catch (error) {
                console.error('Error in announcements.getAll:', error)
                throw error
            }
        },
        async getById(id) {
            try {
                const response = await api.get(`/employee/announcements/${id}`)
                return response.data
            } catch (error) {
                console.error('Error in announcements.getById:', error)
                throw error
            }
        },
        async markAsRead(id) {
            try {
                const response = await api.post(`/employee/announcements/${id}/mark-as-read`)
                return response.data
            } catch (error) {
                console.error('Error in announcements.markAsRead:', error)
                throw error
            }
        },
        async getUnreadCount() {
            try {
                const response = await api.get('/employee/announcements/unread-count')
                return response.data
            } catch (error) {
                console.error('Error in announcements.getUnreadCount:', error)
                return { count: 0 }
            }
        }
    }
}