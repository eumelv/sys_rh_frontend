<template>
  <div class="justifications-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <i class="pi pi-file-signature"></i>
          <div>
            <h1>Justificações</h1>
            <p class="subtitle">Gerir justificações de ausências e atrasos</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card" :class="{ highlight: stats.pending > 0 }">
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
        <div class="stat-icon absence">
          <i class="pi pi-calendar-times"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Faltas Pendentes</span>
          <span class="stat-value">{{ stats.pending_absences || 0 }}</span>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-card">
      <div class="filters-row">
        <div class="filter-group">
          <label>Status</label>
          <select v-model="filters.status" @change="fetchJustifications" class="filter-select">
            <option value="">Todos</option>
            <option value="pending">Pendente</option>
            <option value="approved">Aprovado</option>
            <option value="rejected">Rejeitado</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Tipo</label>
          <select v-model="filters.justification_type" @change="fetchJustifications" class="filter-select">
            <option value="">Todos</option>
            <option value="absence">Falta</option>
            <option value="late">Atraso</option>
            <option value="early_exit">Saída Antecipada</option>
            <option value="missing_point">Ponto Faltante</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Departamento</label>
          <select v-model="filters.department_id" @change="fetchJustifications" class="filter-select">
            <option value="">Todos</option>
            <option v-for="dept in departments" :key="dept.id" :value="dept.id">
              {{ dept.name }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Colaborador</label>
          <select v-model="filters.employee_id" @change="fetchJustifications" class="filter-select">
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
      <p>Carregando justificações...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="justifications.length === 0" class="empty-state">
      <i class="pi pi-inbox"></i>
      <h3>Nenhuma justificativa encontrada</h3>
      <p>Não há justificações para os filtros selecionados</p>
    </div>

    <!-- Justifications Table -->
    <div v-else class="justifications-grid">
      <div v-for="just in justifications" :key="just.id" class="justification-card">
        <div class="card-header">
          <div class="employee-info">
            <div class="employee-avatar">{{ getInitials(just.employee) }}</div>
            <div class="employee-details">
              <span class="employee-name">{{ just.employee?.first_name }} {{ just.employee?.last_name }}</span>
              <span class="employee-dept">{{ just.employee?.department?.name }}</span>
            </div>
          </div>
          <span :class="getStatusClass(just.status)">
            {{ getStatusLabel(just.status) }}
          </span>
        </div>

        <div class="card-body">
          <div class="just-type">
            <i :class="getTypeIcon(just.justification_type)"></i>
            <span>{{ getTypeLabel(just.justification_type) }}</span>
          </div>

          <div class="just-dates">
            <span><i class="pi pi-calendar"></i> {{ formatDate(just.start_date) }}</span>
            <span v-if="just.start_date !== just.end_date">até {{ formatDate(just.end_date) }}</span>
          </div>

          <p class="just-reason">{{ just.reason }}</p>

          <div class="just-meta">
            <span class="meta-tag">
              <i class="pi pi-tag"></i>
              {{ just.type_label }}
            </span>
            <span v-if="just.file_path" class="meta-tag">
              <i class="pi pi-paperclip"></i>
              Anexo
            </span>
          </div>

          <div v-if="just.review_notes" class="review-notes">
            <strong>Resposta:</strong> {{ just.review_notes }}
          </div>
        </div>

        <div class="card-footer">
          <span class="just-date">Enviada em {{ formatDate(just.created_at) }}</span>
          <div class="card-actions">
            <button @click="viewJustification(just)" class="btn-action" title="Ver Detalhes">
              <i class="pi pi-eye"></i>
            </button>
            <template v-if="just.status === 'pending'">
              <button @click="approveJustification(just)" class="btn-action success" title="Aprovar">
                <i class="pi pi-check"></i>
              </button>
              <button @click="rejectJustification(just)" class="btn-action danger" title="Rejeitar">
                <i class="pi pi-times"></i>
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="pagination.last_page > 1">
      <button @click="changePage(pagination.current_page - 1)" :disabled="pagination.current_page === 1" class="btn-pagination">
        <i class="pi pi-chevron-left"></i>
      </button>
      <span class="page-info">Página {{ pagination.current_page }} de {{ pagination.last_page }}</span>
      <button @click="changePage(pagination.current_page + 1)" :disabled="pagination.current_page === pagination.last_page" class="btn-pagination">
        <i class="pi pi-chevron-right"></i>
      </button>
    </div>

    <!-- Modal View -->
    <div v-if="showViewModal && selectedJustification" class="modal-overlay" @click="closeViewModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Detalhes da Justificação</h2>
          <button class="btn-close" @click="closeViewModal">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="view-employee">
            <div class="employee-avatar large">{{ getInitials(selectedJustification.employee) }}</div>
            <div class="employee-details">
              <h3>{{ selectedJustification.employee?.first_name }} {{ selectedJustification.employee?.last_name }}</h3>
              <span>{{ selectedJustification.employee?.department?.name }}</span>
            </div>
            <span :class="getStatusClass(selectedJustification.status)">
              {{ getStatusLabel(selectedJustification.status) }}
            </span>
          </div>

          <div class="view-section">
            <h4>Informação</h4>
            <div class="detail-row">
              <strong>Tipo:</strong>
              <span>{{ getTypeLabel(selectedJustification.justification_type) }}</span>
            </div>
            <div class="detail-row">
              <strong>Motivo:</strong>
              <span>{{ selectedJustification.type_label }}</span>
            </div>
            <div class="detail-row">
              <strong>Período:</strong>
              <span>{{ formatDate(selectedJustification.start_date) }} até {{ formatDate(selectedJustification.end_date) }}</span>
            </div>
          </div>

          <div class="view-section">
            <h4>Justificação</h4>
            <p class="reason-text">{{ selectedJustification.reason }}</p>
          </div>

          <div v-if="selectedJustification.file_path" class="view-section">
            <h4>Anexo</h4>
            <a :href="selectedJustification.file_url" target="_blank" class="btn-secondary">
              <i class="pi pi-download"></i>
              Baixar Anexo
            </a>
          </div>

          <div v-if="selectedJustification.review_notes" class="view-section">
            <h4>Resposta</h4>
            <p class="review-text">{{ selectedJustification.review_notes }}</p>
            <span class="reviewer">
              <i class="pi pi-user"></i>
              {{ selectedJustification.reviewer?.name }}
              em {{ formatDate(selectedJustification.reviewed_at) }}
            </span>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeViewModal" class="btn-secondary">Fechar</button>
          <template v-if="selectedJustification.status === 'pending'">
            <button @click="rejectJustification(selectedJustification); closeViewModal()" class="btn-danger">
              <i class="pi pi-times"></i>
              Rejeitar
            </button>
            <button @click="approveJustification(selectedJustification); closeViewModal()" class="btn-success">
              <i class="pi pi-check"></i>
              Aprovar
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Modal Reject -->
    <div v-if="showRejectModal" class="modal-overlay" @click="closeRejectModal">
      <div class="modal-content modal-confirm" @click.stop>
        <div class="confirm-icon reject">
          <i class="pi pi-times"></i>
        </div>
        <h3>Rejeitar Justificação</h3>
        <p>Rejeitar a justificativa de <strong>{{ rejectData?.employee?.first_name }} {{ rejectData?.employee?.last_name }}</strong>?</p>
        
        <div class="form-group" style="margin-top: 1rem;">
          <label>Observações (opcional)</label>
          <textarea v-model="rejectNotes" rows="3" placeholder="Motivo da rejeição..."></textarea>
        </div>

        <div class="confirm-actions">
          <button @click="closeRejectModal" class="btn-secondary">Cancelar</button>
          <button @click="confirmReject" class="btn-danger" :disabled="actionLoading">
            <i class="pi" :class="actionLoading ? 'pi-spin pi-spinner' : 'pi-times'"></i>
            {{ actionLoading ? 'Rejeitando...' : 'Rejeitar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { adminService } from '@/services/adminService'
import { useToast } from 'vue-toastification'
import dayjs from 'dayjs'

const toast = useToast()

const loading = ref(true)
const justifications = ref([])
const employees = ref([])
const departments = ref([])
const selectedJustification = ref(null)
const rejectData = ref(null)
const rejectNotes = ref('')
const actionLoading = ref(false)

const stats = ref({
  pending: 0,
  approved: 0,
  rejected: 0,
  pending_absences: 0,
  pending_late: 0
})

const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 30,
  total: 0
})

const filters = reactive({
  status: '',
  justification_type: '',
  department_id: '',
  employee_id: ''
})

const showViewModal = ref(false)
const showRejectModal = ref(false)

const fetchStats = async () => {
  try {
    const { data } = await adminService.justifications.getStats()
    stats.value = data
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

const fetchJustifications = async (page = 1) => {
  loading.value = true
  try {
    const params = { page, per_page: 30 }
    if (filters.status) params.status = filters.status
    if (filters.justification_type) params.justification_type = filters.justification_type
    if (filters.department_id) params.department_id = filters.department_id
    if (filters.employee_id) params.employee_id = filters.employee_id

    const { data } = await adminService.justifications.getAll(params)
    justifications.value = data.data || []
    pagination.value = {
      current_page: data.current_page,
      last_page: data.last_page,
      per_page: data.per_page,
      total: data.total
    }
  } catch (error) {
    console.error('Error fetching justifications:', error)
    toast.error('Erro ao carregar justificações')
  } finally {
    loading.value = false
  }
}

const fetchEmployees = async () => {
  try {
    const { data } = await adminService.employees.getAll({ status: 'active' })
    employees.value = data.data || data
  } catch (error) {
    console.error('Error fetching employees:', error)
  }
}

const fetchDepartments = async () => {
  try {
    const { data } = await adminService.departments.getAll()
    departments.value = data.data || data
  } catch (error) {
    console.error('Error fetching departments:', error)
  }
}

const fetchAll = async () => {
  await Promise.all([
    fetchStats(),
    fetchJustifications(),
    fetchEmployees(),
    fetchDepartments()
  ])
}

const viewJustification = (just) => {
  selectedJustification.value = just
  showViewModal.value = true
}

const closeViewModal = () => {
  showViewModal.value = false
  selectedJustification.value = null
}

const approveJustification = async (just) => {
  actionLoading.value = true
  try {
    await adminService.justifications.approve(just.id)
    toast.success('Justificação aprovada!')
    fetchAll()
  } catch (error) {
    console.error('Error approving justification:', error)
    toast.error('Erro ao aprovar justificativa')
  } finally {
    actionLoading.value = false
  }
}

const rejectJustification = (just) => {
  rejectData.value = just
  rejectNotes.value = ''
  showRejectModal.value = true
}

const closeRejectModal = () => {
  showRejectModal.value = false
  rejectData.value = null
  rejectNotes.value = ''
}

const confirmReject = async () => {
  if (!rejectData.value) return
  actionLoading.value = true
  try {
    await adminService.justifications.reject(rejectData.value.id, {
      review_notes: rejectNotes.value
    })
    toast.success('Justificação rejeitada!')
    closeRejectModal()
    fetchAll()
  } catch (error) {
    console.error('Error rejecting justification:', error)
    toast.error('Erro ao rejeitar justificativa')
  } finally {
    actionLoading.value = false
  }
}

const clearFilters = () => {
  filters.status = ''
  filters.justification_type = ''
  filters.department_id = ''
  filters.employee_id = ''
  fetchJustifications()
}

const changePage = (page) => {
  fetchJustifications(page)
}

// Helpers
const getInitials = (employee) => {
  if (!employee) return '?'
  return (employee.first_name?.[0] || '') + (employee.last_name?.[0] || '')
}

const formatDate = (date) => {
  return date ? dayjs(date).format('DD/MM/YYYY') : '-'
}

const getStatusLabel = (status) => {
  const labels = { pending: 'Pendente', approved: 'Aprovada', rejected: 'Rejeitada' }
  return labels[status] || status
}

const getStatusClass = (status) => {
  const classes = { pending: 'status-badge pending', approved: 'status-badge approved', rejected: 'status-badge rejected' }
  return classes[status] || 'status-badge'
}

const getTypeLabel = (type) => {
  const labels = { absence: 'Falta', late: 'Atraso', early_exit: 'Saída Antecipada', missing_point: 'Ponto Faltante' }
  return labels[type] || type
}

const getTypeIcon = (type) => {
  const icons = { absence: 'pi pi-calendar-times', late: 'pi pi-clock', early_exit: 'pi pi-sign-out', missing_point: 'pi pi-question-circle' }
  return icons[type] || 'pi pi-file'
}

onMounted(() => {
  fetchAll()
})
</script>

<style scoped>
.justifications-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
}

.page-header { margin-bottom: 2rem; }

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-title > i {
  font-size: 3rem;
  color: #7c3aed;
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
  padding: 1rem;
  border-radius: 1rem;
}

.header-title h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.header-title .subtitle {
  color: #64748b;
  font-size: 1rem;
  margin: 0.25rem 0 0 0;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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

.stat-card.highlight .stat-icon.pending { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); color: #d97706; }

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
}

.stat-icon.pending { background: #f1f5f9; color: #94a3b8; }
.stat-icon.approved { background: #d1fae5; color: #059669; }
.stat-icon.rejected { background: #fee2e2; color: #dc2626; }
.stat-icon.absence { background: #fce7f3; color: #be185d; }

.stat-info { display: flex; flex-direction: column; gap: 0.25rem; }
.stat-label { font-size: 0.875rem; color: #64748b; font-weight: 500; }
.stat-value { font-size: 1.75rem; font-weight: 700; color: #1e293b; }

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
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 150px;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 0.95rem;
  background: white;
}

.btn-clear {
  padding: 0.75rem 1.5rem;
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

/* Empty & Loading */
.loading-state, .empty-state {
  background: white;
  padding: 4rem 2rem;
  text-align: center;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-state i { font-size: 4rem; color: #cbd5e1; margin-bottom: 1rem; }
.empty-state h3 { color: #475569; margin: 0 0 0.5rem 0; }
.empty-state p { color: #94a3b8; margin: 0; }
.loading-state i { font-size: 3rem; color: #7c3aed; }

/* Grid */
.justifications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.justification-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
}

.justification-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
}

.employee-info { display: flex; align-items: center; gap: 0.75rem; }

.employee-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
}

.employee-avatar.large { width: 60px; height: 60px; font-size: 1.5rem; }

.employee-name { font-weight: 600; color: #1e293b; display: block; }
.employee-dept { font-size: 0.8rem; color: #94a3b8; }

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.pending { background: #fef3c7; color: #92400e; }
.status-badge.approved { background: #d1fae5; color: #065f46; }
.status-badge.rejected { background: #fee2e2; color: #991b1b; }

.card-body { padding: 1.25rem; flex: 1; }

.just-type {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #ede9fe;
  color: #6d28d9;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.just-dates {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.75rem;
}

.just-dates i { font-size: 1rem; }

.just-reason {
  color: #475569;
  line-height: 1.6;
  margin: 0 0 1rem 0;
  font-size: 0.9375rem;
}

.just-meta { display: flex; gap: 0.5rem; flex-wrap: wrap; }

.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  background: #f1f5f9;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  color: #475569;
}

.review-notes {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fef3c7;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #92400e;
}

.review-notes strong { display: block; margin-bottom: 0.25rem; }

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-top: 1px solid #f1f5f9;
  background: #fafafa;
}

.just-date { font-size: 0.8125rem; color: #94a3b8; }

.card-actions { display: flex; gap: 0.5rem; }

.btn-action {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  color: #475569;
}

.btn-action:hover { background: #e2e8f0; }
.btn-action.success { color: #059669; }
.btn-action.success:hover { background: #d1fae5; }
.btn-action.danger { color: #dc2626; }
.btn-action.danger:hover { background: #fee2e2; }

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-pagination {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}

.btn-pagination:disabled { opacity: 0.5; cursor: not-allowed; }
.page-info { color: #64748b; font-size: 0.875rem; }

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
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0; }

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
}

.btn-close:hover { background: #ef4444; color: white; }

.modal-body { padding: 1.5rem; }
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.view-employee { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
.view-employee h3 { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0; }
.view-employee span { color: #64748b; font-size: 0.875rem; }

.view-section { margin-bottom: 1.5rem; }
.view-section h4 { font-size: 0.875rem; font-weight: 600; color: #64748b; margin: 0 0 0.75rem 0; text-transform: uppercase; letter-spacing: 0.5px; }

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f5f9;
}
.detail-row:last-child { border-bottom: none; }
.detail-row strong { color: #64748b; }
.detail-row span { color: #1e293b; font-weight: 500; }

.reason-text {
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  color: #475569;
  line-height: 1.6;
  margin: 0;
}

.review-text {
  padding: 0.75rem;
  background: #fef3c7;
  border-radius: 0.5rem;
  color: #92400e;
  margin: 0 0 0.5rem 0;
}

.reviewer { font-size: 0.8125rem; color: #92400e; }

/* Confirm Modal */
.modal-confirm { max-width: 420px; text-align: center; padding: 2rem; }

.confirm-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2rem;
}

.confirm-icon.reject { background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); color: #dc2626; }

.modal-confirm h3 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0 0 1rem 0; }
.modal-confirm p { color: #475569; margin: 0; line-height: 1.6; }
.modal-confirm p strong { color: #1e293b; }

.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-weight: 600; margin-bottom: 0.5rem; color: #475569; }
.form-group textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 1rem;
  resize: vertical;
}

.confirm-actions { display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem; }
.confirm-actions button { min-width: 120px; justify-content: center; }

/* Buttons */
.btn-primary, .btn-secondary, .btn-success, .btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; }
.btn-secondary { background: #f1f5f9; color: #475569; }
.btn-success { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
.btn-danger { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; }

.btn-primary:hover { box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); }
.btn-success:hover { box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4); }
.btn-danger:hover { box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4); }

@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .justifications-grid { grid-template-columns: 1fr; }
  .filters-row { flex-direction: column; }
  .filter-group { width: 100%; }
}
</style>
