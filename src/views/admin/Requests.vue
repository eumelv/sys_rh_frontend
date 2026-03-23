<template>
  <div class="admin-requests-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <i class="pi pi-inbox"></i>
          <div>
            <h1>Solicitações dos Colaboradores</h1>
            <p class="subtitle">Gerencie solicitações pendentes</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon pending">
          <i class="pi pi-clock"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Pendentes</span>
          <span class="stat-value">{{ stats.pending }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon approved">
          <i class="pi pi-check-circle"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Aprovadas</span>
          <span class="stat-value">{{ stats.approved }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon rejected">
          <i class="pi pi-times-circle"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Rejeitadas</span>
          <span class="stat-value">{{ stats.rejected }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon total">
          <i class="pi pi-list"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total</span>
          <span class="stat-value">{{ stats.total }}</span>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-card">
      <div class="filters-row">
        <div class="filter-group">
          <label>Status</label>
          <select v-model="filters.status" class="filter-select">
            <option value="">Todos os status</option>
            <option value="pending">Pendentes</option>
            <option value="approved">Aprovadas</option>
            <option value="rejected">Rejeitadas</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Tipo</label>
          <select v-model="filters.type" class="filter-select">
            <option value="">Todos os tipos</option>
            <option value="document_request">Solicitação de Documento</option>
            <option value="certificate">Certificado</option>
            <option value="salary_advance">Adiantamento Salarial</option>
            <option value="equipment">Equipamento</option>
            <option value="training">Treinamento</option>
            <option value="other">Outro</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Buscar</label>
          <div class="search-input">
            <i class="pi pi-search"></i>
            <input 
              v-model="filters.search" 
              type="text" 
              placeholder="Nome do colaborador..."
            />
          </div>
        </div>

        <button @click="applyFilters" class="btn-filter">
          <i class="pi pi-filter"></i>
          Filtrar
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <i class="pi pi-spin pi-spinner"></i>
      <p>Carregando solicitações...</p>
    </div>

    <!-- Requests List -->
    <div v-else class="requests-list">
      <div v-if="requests.length === 0" class="empty-state">
        <i class="pi pi-inbox"></i>
        <h3>Nenhuma solicitação encontrada</h3>
        <p>Não há solicitações com os filtros aplicados</p>
      </div>

      <div 
        v-for="request in requests" 
        :key="request.id"
        class="request-card"
        :class="'status-' + request.status"
        @click="viewRequest(request)"
      >
        <div class="request-header">
          <div class="request-user">
            <div class="user-avatar">
              <img v-if="request.employee?.user?.avatar_url" :src="request.employee.user.avatar_url" />
              <span v-else>{{ request.employee?.user?.name?.charAt(0) }}</span>
            </div>
            <div class="user-info">
              <strong>{{ request.employee?.user?.name }}</strong>
              <span>{{ request.employee?.department?.name }}</span>
            </div>
          </div>

          <span class="request-badge" :class="'badge-' + request.status">
            {{ getStatusLabel(request.status) }}
          </span>
        </div>

        <div class="request-body">
          <div class="request-type">
            <i class="pi pi-file"></i>
            <strong>{{ getTypeLabel(request.type) }}</strong>
          </div>
          <p class="request-description">{{ request.description }}</p>
        </div>

        <div class="request-footer">
          <span class="request-date">
            <i class="pi pi-calendar"></i>
            {{ formatDate(request.created_at) }}
          </span>

          <div v-if="request.status === 'pending'" class="request-actions" @click.stop>
            <button @click="approveRequest(request)" class="btn-approve">
              <i class="pi pi-check"></i>
              Aprovar
            </button>
            <button @click="showRejectModal(request)" class="btn-reject">
              <i class="pi pi-times"></i>
              Rejeitar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal View Request -->
    <div v-if="selectedRequest" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Detalhes da Solicitação</h2>
          <button class="btn-close" @click="closeModal">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="detail-group">
            <label>Colaborador</label>
            <p>{{ selectedRequest.employee?.user?.name }}</p>
          </div>

          <div class="detail-row">
            <div class="detail-group">
              <label>Departamento</label>
              <p>{{ selectedRequest.employee?.department?.name }}</p>
            </div>
            <div class="detail-group">
              <label>Cargo</label>
              <p>{{ selectedRequest.employee?.position?.title }}</p>
            </div>
          </div>

          <div class="detail-group">
            <label>Tipo de Solicitação</label>
            <p>{{ getTypeLabel(selectedRequest.type) }}</p>
          </div>

          <div class="detail-group">
            <label>Descrição</label>
            <p class="description-box">{{ selectedRequest.description }}</p>
          </div>

          <div class="detail-group">
            <label>Data da Solicitação</label>
            <p>{{ formatDate(selectedRequest.created_at) }}</p>
          </div>

          <div v-if="selectedRequest.status !== 'pending'" class="detail-group">
            <label>Status</label>
            <span class="request-badge" :class="'badge-' + selectedRequest.status">
              {{ getStatusLabel(selectedRequest.status) }}
            </span>
          </div>

          <div v-if="selectedRequest.reviewed_at" class="detail-group">
            <label>Revisado em</label>
            <p>{{ formatDate(selectedRequest.reviewed_at) }}</p>
          </div>

          <div v-if="selectedRequest.admin_notes" class="detail-group">
            <label>Observações do Admin</label>
            <p class="description-box">{{ selectedRequest.admin_notes }}</p>
          </div>
        </div>

        <div v-if="selectedRequest.status === 'pending'" class="modal-footer">
          <button @click="closeModal" class="btn-secondary">Fechar</button>
          <button @click="approveRequest(selectedRequest)" class="btn-approve">
            <i class="pi pi-check"></i>
            Aprovar
          </button>
          <button @click="showRejectModal(selectedRequest)" class="btn-reject">
            <i class="pi pi-times"></i>
            Rejeitar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Reject -->
    <div v-if="showRejectForm" class="modal-overlay" @click="closeRejectModal">
      <div class="modal-content modal-small" @click.stop>
        <div class="modal-header">
          <h2>Rejeitar Solicitação</h2>
          <button class="btn-close" @click="closeRejectModal">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <form @submit.prevent="rejectRequest" class="modal-body">
          <div class="form-group">
            <label>Motivo da Rejeição *</label>
            <textarea 
              v-model="rejectReason"
              rows="4"
              class="form-control"
              placeholder="Explique o motivo da rejeição..."
              required
            ></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeRejectModal" class="btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn-danger" :disabled="processing">
              <i class="pi" :class="processing ? 'pi-spin pi-spinner' : 'pi-times'"></i>
              {{ processing ? 'Rejeitando...' : 'Confirmar Rejeição' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { adminService } from '@/services/adminService'
import { useToast } from 'vue-toastification'
import dayjs from 'dayjs'

const toast = useToast()

const loading = ref(true)
const processing = ref(false)
const requests = ref([])
const selectedRequest = ref(null)
const showRejectForm = ref(false)
const rejectReason = ref('')
const requestToReject = ref(null)

const stats = reactive({
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0
})

const filters = reactive({
  status: '',
  type: '',
  search: ''
})

const fetchStats = async () => {
  try {
    const { data } = await adminService.requests.getStats()
    Object.assign(stats, data)
  } catch (error) {
    console.error('Erro ao carregar stats:', error)
  }
}

const fetchRequests = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.status) params.status = filters.status
    if (filters.type) params.type = filters.type
    if (filters.search) params.search = filters.search

    const { data } = await adminService.requests.getAll(params)
    requests.value = data.data || data
  } catch (error) {
    console.error('Erro ao carregar solicitações:', error)
    toast.error('Erro ao carregar solicitações')
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  fetchRequests()
}

const viewRequest = (request) => {
  selectedRequest.value = request
}

const closeModal = () => {
  selectedRequest.value = null
}

const approveRequest = async (request) => {
  if (!confirm(`Tem certeza que deseja aprovar esta solicitação de ${request.employee?.user?.name}?`)) {
    return
  }

  try {
    const { data } = await adminService.requests.approve(request.id)
    
    toast.success(data.message || 'Solicitação aprovada com sucesso!')
    
    // Atualizar lista
    const index = requests.value.findIndex(r => r.id === request.id)
    if (index !== -1) {
      requests.value[index] = data.request
    }
    
    // Atualizar stats
    fetchStats()
    
    closeModal()
  } catch (error) {
    console.error('Erro ao aprovar:', error)
    toast.error(error.response?.data?.message || 'Erro ao aprovar solicitação')
  }
}

const showRejectModal = (request) => {
  requestToReject.value = request
  showRejectForm.value = true
  rejectReason.value = ''
}

const closeRejectModal = () => {
  showRejectForm.value = false
  requestToReject.value = null
  rejectReason.value = ''
}

const rejectRequest = async () => {
  if (!rejectReason.value.trim()) {
    toast.error('Informe o motivo da rejeição')
    return
  }

  processing.value = true
  try {
    const { data } = await adminService.requests.reject(requestToReject.value.id, {
      admin_notes: rejectReason.value
    })
    
    toast.success(data.message || 'Solicitação rejeitada')
    
    // Atualizar lista
    const index = requests.value.findIndex(r => r.id === requestToReject.value.id)
    if (index !== -1) {
      requests.value[index] = data.request
    }
    
    // Atualizar stats
    fetchStats()
    
    closeRejectModal()
    closeModal()
  } catch (error) {
    console.error('Erro ao rejeitar:', error)
    toast.error(error.response?.data?.message || 'Erro ao rejeitar solicitação')
  } finally {
    processing.value = false
  }
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pendente',
    approved: 'Aprovada',
    rejected: 'Rejeitada'
  }
  return labels[status] || status
}

const getTypeLabel = (type) => {
  const labels = {
    document_request: 'Solicitação de Documento',
    certificate: 'Certificado',
    salary_advance: 'Adiantamento Salarial',
    equipment: 'Equipamento',
    training: 'Treinamento',
    transfer: 'Transferência',
    schedule_change: 'Mudança de Horário',
    other: 'Outro'
  }
  return labels[type] || type
}

const formatDate = (date) => {
  return date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-'
}

onMounted(() => {
  fetchStats()
  fetchRequests()
})
</script>

<style scoped>
.admin-requests-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
}

/* Header */
.page-header {
  margin-bottom: 2rem;
}

.header-content {
  .header-title {
    display: flex;
    align-items: center;
    gap: 1rem;

    > i {
      font-size: 3rem;
      color: #3b82f6;
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      padding: 1rem;
      border-radius: 1rem;
    }

    h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .subtitle {
      color: #64748b;
      font-size: 1rem;
      margin: 0.25rem 0 0 0;
    }
  }
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
}

.stat-icon.pending {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
}

.stat-icon.approved {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #059669;
}

.stat-icon.rejected {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #dc2626;
}

.stat-icon.total {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #2563eb;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
}

/* Filters */
.filters-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.filters-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #475569;
  }
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 0.95rem;
  transition: all 0.2s;
  background: white;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input {
  position: relative;

  i {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
  }

  input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.75rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    font-size: 0.95rem;
    transition: all 0.2s;
  }

  input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
}

.btn-filter {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-filter:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Loading */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 1rem;

  i {
    font-size: 3rem;
    color: #3b82f6;
    margin-bottom: 1rem;
  }

  p {
    color: #64748b;
    margin: 0;
  }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 1rem;

  i {
    font-size: 4rem;
    color: #cbd5e1;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.25rem;
    color: #475569;
    margin: 0 0 0.5rem 0;
  }

  p {
    color: #94a3b8;
    margin: 0;
  }
}

/* Requests List */
.requests-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.request-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #cbd5e1;
  cursor: pointer;
  transition: all 0.2s;
}

.request-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.request-card.status-pending {
  border-left-color: #f59e0b;
}

.request-card.status-approved {
  border-left-color: #10b981;
}

.request-card.status-rejected {
  border-left-color: #ef4444;
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.request-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  strong {
    font-size: 1rem;
    color: #1e293b;
  }

  span {
    font-size: 0.875rem;
    color: #64748b;
  }
}

.request-badge {
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.request-badge.badge-pending {
  background: #fef3c7;
  color: #d97706;
}

.request-badge.badge-approved {
  background: #d1fae5;
  color: #059669;
}

.request-badge.badge-rejected {
  background: #fee2e2;
  color: #dc2626;
}

.request-body {
  margin-bottom: 1rem;
}

.request-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  color: #3b82f6;
  font-size: 0.95rem;

  i {
    font-size: 1rem;
  }
}

.request-description {
  color: #475569;
  line-height: 1.6;
  margin: 0;
}

.request-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.request-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;

  i {
    font-size: 1rem;
  }
}

.request-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-approve,
.btn-reject {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-approve {
  background: #10b981;
  color: white;
}

.btn-approve:hover {
  background: #059669;
  transform: translateY(-1px);
}

.btn-reject {
  background: #ef4444;
  color: white;
}

.btn-reject:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 1rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

.modal-content.modal-small {
  max-width: 500px;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }
}

.btn-close {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #ef4444;
    color: white;
  }
}

.modal-body {
  padding: 1.5rem;
}

.detail-group {
  margin-bottom: 1.5rem;

  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  p {
    font-size: 1rem;
    color: #1e293b;
    margin: 0;
  }
}

.detail-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.description-box {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  line-height: 1.6;
}

.form-group {
  margin-bottom: 1.5rem;

  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #475569;
  }

  .form-control {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    font-size: 1rem;
    font-family: inherit;
    transition: all 0.2s;
    resize: vertical;

    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;

  button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .btn-secondary {
    background: #f1f5f9;
    color: #475569;

    &:hover {
      background: #e2e8f0;
    }
  }

  .btn-danger {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }
  }
}

@media (max-width: 768px) {
  .admin-requests-page {
    padding: 1rem;
  }

  .filters-row {
    grid-template-columns: 1fr;
  }

  .detail-row {
    grid-template-columns: 1fr;
  }
}
</style>