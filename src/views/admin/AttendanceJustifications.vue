<template>
  <div class="justifications-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <i class="pi pi-file-check"></i>
          <div>
            <h1>Justificativas de Ponto</h1>
            <p class="subtitle">Aprovar ou rejeitar justificativas dos colaboradores</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon pending">
          <i class="pi pi-clock"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.pending }}</span>
          <span class="stat-label">Pendentes</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon approved">
          <i class="pi pi-check"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.approved }}</span>
          <span class="stat-label">Aprovadas</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon rejected">
          <i class="pi pi-times"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.rejected }}</span>
          <span class="stat-label">Rejeitadas</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon total">
          <i class="pi pi-list"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">Total</span>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-card">
      <div class="filters-row">
        <div class="filter-group">
          <label>Status</label>
          <select v-model="filters.status" @change="loadJustifications(1)">
            <option value="">Todos</option>
            <option value="pending">Pendentes</option>
            <option value="approved">Aprovadas</option>
            <option value="rejected">Rejeitadas</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Tipo</label>
          <select v-model="filters.type" @change="loadJustifications(1)">
            <option value="">Todos</option>
            <option value="late">Atraso</option>
            <option value="absence">Falta</option>
            <option value="early_leave">Saída Antecipada</option>
            <option value="medical">Atestado Médico</option>
            <option value="other">Outro</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Colaborador</label>
          <select v-model="filters.employee_id" @change="loadJustifications(1)">
            <option value="">Todos</option>
            <option v-for="emp in employees" :key="emp.id" :value="emp.id">
              {{ emp.first_name }} {{ emp.last_name }}
            </option>
          </select>
        </div>

        <button @click="clearFilters" class="btn-clear">
          <i class="pi pi-filter-slash"></i>
          Limpar
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <i class="pi pi-spin pi-spinner"></i>
      <p>Carregando justificativas...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="justifications.length === 0" class="empty-state">
      <i class="pi pi-file-check"></i>
      <h3>Nenhuma justificativa encontrada</h3>
      <p>Não há justificativas com os filtros selecionados</p>
    </div>

    <!-- Justifications List -->
    <div v-else class="justifications-list">
      <div 
        v-for="just in justifications" 
        :key="just.id"
        class="justification-card"
        :class="`status-${just.status}`"
      >
        <div class="card-header">
          <div class="employee-info">
            <div class="employee-avatar">
              {{ getInitials(just.employee?.user?.name) }}
            </div>
            <div class="employee-details">
              <h3>{{ just.employee?.user?.name }}</h3>
              <span class="employee-position">{{ just.employee?.position?.title }}</span>
            </div>
          </div>

          <div class="header-badges">
            <span class="type-badge">
              <i :class="getTypeIcon(just.type)"></i>
              {{ just.type_label }}
            </span>
            <span class="status-badge" :class="`badge-${just.status}`">
              {{ just.status_label }}
            </span>
          </div>
        </div>

        <div class="card-body">
          <div class="justification-dates">
            <i class="pi pi-calendar"></i>
            <span>{{ formatDate(just.start_date) }} - {{ formatDate(just.end_date) }}</span>
          </div>

          <div class="justification-reason">
            <strong>Motivo:</strong>
            <p>{{ just.reason }}</p>
          </div>

          <div v-if="just.file_path" class="justification-file">
            <i class="pi pi-paperclip"></i>
            <a :href="just.file_url" target="_blank">Ver Anexo</a>
          </div>

          <div v-if="just.status !== 'pending'" class="review-section">
            <div class="review-header">
              <i :class="just.status === 'approved' ? 'pi pi-check-circle' : 'pi pi-times-circle'"></i>
              <span>{{ just.status === 'approved' ? 'Aprovada' : 'Rejeitada' }} por {{ just.reviewer?.name }}</span>
            </div>
            <p v-if="just.review_notes" class="review-notes">{{ just.review_notes }}</p>
            <span class="review-date">{{ formatDateTime(just.reviewed_at) }}</span>
          </div>
        </div>

        <div v-if="just.status === 'pending'" class="card-footer">
          <button @click="openRejectModal(just)" class="btn-reject">
            <i class="pi pi-times"></i>
            Rejeitar
          </button>
          <button @click="approveJustification(just)" class="btn-approve">
            <i class="pi pi-check"></i>
            Aprovar
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.last_page > 1" class="pagination">
      <button
        @click="loadJustifications(pagination.current_page - 1)"
        :disabled="pagination.current_page === 1"
        class="pagination-btn"
      >
        <i class="pi pi-chevron-left"></i>
        Anterior
      </button>
      
      <div class="pagination-info">
        <span class="current-page">{{ pagination.current_page }}</span>
        <span class="separator">/</span>
        <span class="total-pages">{{ pagination.last_page }}</span>
      </div>
      
      <button
        @click="loadJustifications(pagination.current_page + 1)"
        :disabled="pagination.current_page === pagination.last_page"
        class="pagination-btn"
      >
        Próxima
        <i class="pi pi-chevron-right"></i>
      </button>
    </div>

    <!-- Modal Reject -->
    <div v-if="showRejectModal" class="modal-overlay" @click="closeRejectModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Rejeitar Justificativa</h2>
          <button class="btn-close" @click="closeRejectModal">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <form @submit.prevent="rejectJustification" class="modal-body">
          <div class="employee-summary">
            <strong>Colaborador:</strong>
            <span>{{ selectedJustification?.employee?.user?.name }}</span>
          </div>

          <div class="form-group">
            <label>Motivo da Rejeição *</label>
            <textarea 
              v-model="rejectForm.review_notes" 
              rows="4"
              placeholder="Explique o motivo da rejeição..."
              required
            ></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeRejectModal" class="btn-secondary" :disabled="rejecting">
              Cancelar
            </button>
            <button type="submit" class="btn-danger" :disabled="rejecting">
              <i class="pi" :class="rejecting ? 'pi-spin pi-spinner' : 'pi-times'"></i>
              {{ rejecting ? 'Rejeitando...' : 'Rejeitar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { adminService } from '@/services/adminService'
import { useToast } from 'vue-toastification'

const toast = useToast()

const loading = ref(true)
const approving = ref(false)
const rejecting = ref(false)
const showRejectModal = ref(false)
const selectedJustification = ref(null)

const justifications = ref([])
const employees = ref([])
const stats = ref({
  pending: 0,
  approved: 0,
  rejected: 0,
  total: 0
})

const pagination = ref({
  current_page: 1,
  last_page: 1,
  total: 0
})

const filters = reactive({
  status: '',
  type: '',
  employee_id: ''
})

const rejectForm = reactive({
  review_notes: ''
})

// Methods
const loadStats = async () => {
  try {
    const { data } = await adminService.attendanceJustifications.getStats()
    stats.value = data
  } catch (error) {
    console.error('Erro ao carregar stats:', error)
  }
}

const loadJustifications = async (page = 1) => {
  loading.value = true
  try {
    const params = {
      page,
      per_page: 10,
      ...filters
    }

    const { data } = await adminService.attendanceJustifications.getAll(params)
    
    if (data.data) {
      justifications.value = data.data
      pagination.value = {
        current_page: data.current_page,
        last_page: data.last_page,
        total: data.total
      }
    } else {
      justifications.value = data
    }
  } catch (error) {
    console.error('Erro ao carregar justificativas:', error)
    toast.error('Erro ao carregar justificativas')
  } finally {
    loading.value = false
  }
}

const loadEmployees = async () => {
  try {
    const { data } = await adminService.employees.getAll()
    employees.value = data.data || data
  } catch (error) {
    console.error('Erro ao carregar funcionários:', error)
  }
}

const approveJustification = async (justification) => {
  if (!confirm(`Aprovar a justificativa de ${justification.employee?.user?.name}?`)) return

  approving.value = true
  try {
    const { data } = await adminService.attendanceJustifications.approve(justification.id)
    toast.success(data.message)
    await loadJustifications(pagination.value.current_page)
    await loadStats()
  } catch (error) {
    console.error('Erro ao aprovar:', error)
    toast.error(error.response?.data?.message || 'Erro ao aprovar justificativa')
  } finally {
    approving.value = false
  }
}

const openRejectModal = (justification) => {
  selectedJustification.value = justification
  rejectForm.review_notes = ''
  showRejectModal.value = true
}

const closeRejectModal = () => {
  showRejectModal.value = false
  selectedJustification.value = null
}

const rejectJustification = async () => {
  rejecting.value = true
  try {
    const { data } = await adminService.attendanceJustifications.reject(
      selectedJustification.value.id,
      rejectForm
    )
    toast.success(data.message)
    closeRejectModal()
    await loadJustifications(pagination.value.current_page)
    await loadStats()
  } catch (error) {
    console.error('Erro ao rejeitar:', error)
    toast.error(error.response?.data?.message || 'Erro ao rejeitar justificativa')
  } finally {
    rejecting.value = false
  }
}

const clearFilters = () => {
  filters.status = ''
  filters.type = ''
  filters.employee_id = ''
  loadJustifications(1)
}

const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

const getTypeIcon = (type) => {
  const icons = {
    late: 'pi pi-clock',
    absence: 'pi pi-times-circle',
    early_leave: 'pi pi-sign-out',
    medical: 'pi pi-heart',
    other: 'pi pi-file'
  }
  return icons[type] || 'pi pi-file'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadStats()
  loadJustifications()
  loadEmployees()
})
</script>

<style scoped>
.justifications-page {
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-title > i {
  font-size: 2.5rem;
  color: #8b5cf6;
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
  padding: 1rem;
  border-radius: 1rem;
}

.header-title h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.subtitle {
  color: #64748b;
  font-size: 0.9375rem;
  margin: 0.25rem 0 0 0;
}

/* Stats */
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
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
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

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
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
  display: flex;
  gap: 1rem;
  align-items: end;
  flex-wrap: wrap;
}

.filter-group {
  flex: 1;
  min-width: 200px;

  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #475569;
    margin-bottom: 0.5rem;
  }

  select {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    font-size: 0.9375rem;
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: #8b5cf6;
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
    }
  }
}

.btn-clear {
  padding: 0.75rem 1.5rem;
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: #e2e8f0;
  }
}

/* Loading & Empty */
.loading-state,
.empty-state {
  background: white;
  padding: 4rem 2rem;
  text-align: center;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading-state i {
  font-size: 3rem;
  color: #8b5cf6;
  margin-bottom: 1rem;
}

.empty-state i {
  font-size: 4rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: #475569;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #94a3b8;
  margin: 0;
}

/* Justifications List */
.justifications-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.justification-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #cbd5e1;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &.status-pending {
    border-left-color: #f59e0b;
  }

  &.status-approved {
    border-left-color: #10b981;
  }

  &.status-rejected {
    border-left-color: #ef4444;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.employee-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
}

.employee-details h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.employee-position {
  font-size: 0.875rem;
  color: #64748b;
}

.header-badges {
  display: flex;
  gap: 0.75rem;
}

.type-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f1f5f9;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;

  i {
    color: #8b5cf6;
  }
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 700;
}

.status-badge.badge-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.badge-approved {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.badge-rejected {
  background: #fee2e2;
  color: #991b1b;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.justification-dates,
.justification-file {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #475569;
  font-size: 0.9375rem;

  i {
    color: #8b5cf6;
    font-size: 1.125rem;
  }

  a {
    color: #8b5cf6;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
}

.justification-reason {
  strong {
    display: block;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }

  p {
    color: #475569;
    line-height: 1.6;
    margin: 0;
  }
}

.review-section {
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  margin-top: 0.5rem;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;

  i {
    font-size: 1.25rem;
  }

  i.pi-check-circle {
    color: #10b981;
  }

  i.pi-times-circle {
    color: #ef4444;
  }
}

.review-notes {
  color: #475569;
  margin: 0.5rem 0;
  font-style: italic;
}

.review-date {
  font-size: 0.8125rem;
  color: #94a3b8;
}

.card-footer {
  display: flex;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #f1f5f9;
}

.btn-reject,
.btn-approve {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9375rem;
}

.btn-reject {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;

  &:hover {
    background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
    transform: translateY(-2px);
  }
}

.btn-approve {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;

  &:hover {
    background: linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%);
    transform: translateY(-2px);
  }
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 2rem 0;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  color: #475569;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #8b5cf6;
    border-color: #8b5cf6;
    color: white;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
}

.current-page {
  color: #8b5cf6;
}

.separator {
  color: #cbd5e1;
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
}

.modal-content {
  background: white;
  border-radius: 1rem;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.btn-close {
  width: 32px;
  height: 32px;
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

.employee-summary {
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  strong {
    color: #1e293b;
  }

  span {
    color: #475569;
    font-weight: 600;
  }
}

.form-group {
  margin-bottom: 1.5rem;

  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #475569;
    font-size: 0.875rem;
  }

  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    font-size: 0.9375rem;
    font-family: inherit;
    resize: vertical;

    &:focus {
      outline: none;
      border-color: #8b5cf6;
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
    }
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #e2e8f0;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.btn-danger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

@media (max-width: 768px) {
  .filters-row {
    flex-direction: column;
  }

  .card-header {
    flex-direction: column;
    gap: 1rem;
  }

  .header-badges {
    width: 100%;
    justify-content: space-between;
  }
}
</style>