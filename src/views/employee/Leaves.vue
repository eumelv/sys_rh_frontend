<template>
  <div class="leaves-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <i class="pi pi-calendar"></i>
        </div>
        <div class="header-text">
          <h1>Férias & Licenças</h1>
          <p class="subtitle">Solicite e acompanhe suas licenças e ausências</p>
        </div>
      </div>
      <button class="btn-new" @click="showRequestModal = true">
        <i class="pi pi-plus"></i>
        Nova Solicitação
      </button>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card yellow">
        <div class="stat-icon">
          <i class="pi pi-clock"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ getCountByStatus('pending') }}</span>
          <span class="stat-label">Pendentes</span>
        </div>
      </div>

      <div class="stat-card green">
        <div class="stat-icon">
          <i class="pi pi-check-circle"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ getCountByStatus('approved') }}</span>
          <span class="stat-label">Aprovadas</span>
        </div>
      </div>

      <div class="stat-card red">
        <div class="stat-icon">
          <i class="pi pi-times-circle"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ getCountByStatus('rejected') }}</span>
          <span class="stat-label">Rejeitadas</span>
        </div>
      </div>

      <div class="stat-card blue">
        <div class="stat-icon">
          <i class="pi pi-eye"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ getCountByStatus('cancelled') }}</span>
          <span class="stat-label">Em Análise</span>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section filters-card">
      <div class="filter-item">
        <label>Tipo de Solicitação</label>
        <select v-model="filterType" class="filter-select">
          <option value="">Todos os tipos</option>
          <option v-for="type in leaveTypes" :key="type.id" :value="type.id">
            {{ type.name }}
          </option>
        </select>
      </div>

      <div class="filter-item">
        <label>Status</label>
        <select v-model="filterStatus" class="filter-select">
          <option value="all">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="approved">Aprovado</option>
          <option value="rejected">Rejeitado</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <i class="pi pi-spin pi-spinner"></i>
      <p>Carregando licenças...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredLeaves.length === 0" class="empty-state">
      <i class="pi pi-inbox"></i>
      <h3>Nenhuma solicitação encontrada</h3>
      <p>Você ainda não possui solicitações de licença</p>
    </div>

    <!-- Leaves List -->
    <div v-else class="leaves-list">
      <div 
        v-for="leave in filteredLeaves" 
        :key="leave.id" 
        class="leave-card"
        :class="`border-${leave.status}`"
      >
        <div class="leave-header">
          <div class="leave-type">
            <i class="pi pi-briefcase"></i>
            <span>{{ leave.leave_type?.name }}</span>
          </div>
          <span class="leave-badge" :class="`badge-${leave.status}`">
            {{ getStatusLabel(leave.status) }}
          </span>
        </div>

        <h3 class="leave-title">
          {{ leave.leave_type?.name || 'Solicitação de Licença' }}
        </h3>

        <p class="leave-description">{{ leave.reason }}</p>

        <div class="leave-footer">
          <span class="leave-date">
            <i class="pi pi-calendar"></i>
            {{ formatDate(leave.start_date) }} até {{ formatDate(leave.end_date) }}
          </span>
          <span class="leave-duration">
            {{ leave.days }} {{ leave.days === 1 ? 'dia' : 'dias' }}
          </span>
        </div>

        <div v-if="leave.rejection_reason || leave.approved_by" class="leave-response">
          <strong>Resposta do RH:</strong>
          <p v-if="leave.rejection_reason">{{ leave.rejection_reason }}</p>
          <p v-else-if="leave.approver">Aprovada por {{ leave.approver.name }}</p>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showRequestModal" class="modal-overlay" @click="closeRequestModal">
      <div class="modal-box" @click.stop>
        <div class="modal-header">
          <h2>Nova Solicitação de Licença</h2>
          <button class="btn-close" @click="closeRequestModal">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <form @submit.prevent="submitLeaveRequest" class="modal-body">
          <div class="form-field">
            <label>Tipo de Licença *</label>
            <select v-model="requestForm.leave_type_id" required>
              <option value="">Selecione o tipo</option>
              <option v-for="type in leaveTypes" :key="type.id" :value="type.id">
                {{ type.name }}
              </option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label>Data de Início *</label>
              <input 
                v-model="requestForm.start_date" 
                type="date" 
                :min="minDate"
                required 
              />
            </div>
            <div class="form-field">
              <label>Data de Fim *</label>
              <input 
                v-model="requestForm.end_date" 
                type="date" 
                :min="requestForm.start_date || minDate"
                required 
              />
            </div>
          </div>

          <div v-if="calculatedDays > 0" class="info-alert">
            <i class="pi pi-info-circle"></i>
            <span>Total de <strong>{{ calculatedDays }}</strong> {{ calculatedDays === 1 ? 'dia' : 'dias' }}</span>
          </div>

          <div class="form-field">
            <label>Motivo *</label>
            <textarea 
              v-model="requestForm.reason" 
              rows="4" 
              placeholder="Descreva o motivo da solicitação..."
              required
              minlength="10"
            ></textarea>
            <small>Mínimo 10 caracteres</small>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="closeRequestModal">
              Cancelar
            </button>
            <button type="submit" class="btn-submit" :disabled="submitting || !canSubmit">
              <i class="pi pi-spin pi-spinner" v-if="submitting"></i>
              <i class="pi pi-check" v-else></i>
              {{ submitting ? 'Enviando...' : 'Enviar Solicitação' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import { useToast } from 'vue-toastification'
import dayjs from 'dayjs'
import 'dayjs/locale/pt'

dayjs.locale('pt')

const toast = useToast()
const loading = ref(false)
const submitting = ref(false)
const showRequestModal = ref(false)
const filterStatus = ref('all')
const filterType = ref('')

const leaves = ref([])
const leaveBalance = ref([])
const leaveTypes = ref([])

const requestForm = ref({
  leave_type_id: '',
  start_date: '',
  end_date: '',
  reason: '',
})

const minDate = computed(() => dayjs().format('YYYY-MM-DD'))

const calculatedDays = computed(() => {
  if (!requestForm.value.start_date || !requestForm.value.end_date) return 0
  const start = dayjs(requestForm.value.start_date)
  const end = dayjs(requestForm.value.end_date)
  return end.diff(start, 'day') + 1
})

const canSubmit = computed(() => {
  return requestForm.value.leave_type_id &&
         requestForm.value.start_date &&
         requestForm.value.end_date &&
         requestForm.value.reason.length >= 10 &&
         calculatedDays.value > 0
})

const filteredLeaves = computed(() => {
  let filtered = leaves.value

  if (filterStatus.value !== 'all') {
    filtered = filtered.filter(l => l.status === filterStatus.value)
  }

  if (filterType.value) {
    filtered = filtered.filter(l => l.leave_type_id === filterType.value)
  }

  return filtered
})

const getCountByStatus = (status) => {
  return leaves.value.filter(l => l.status === status).length
}

const fetchLeaves = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/employee/leaves')
    leaves.value = data
  } catch (error) {
    toast.error('Erro ao carregar licenças')
  } finally {
    loading.value = false
  }
}

const fetchLeaveTypes = async () => {
  try {
    const { data } = await api.get('/employee/leaves/types')
    leaveTypes.value = data
  } catch (error) {
    try {
      const { data } = await api.get('/admin/leave-types')
      leaveTypes.value = data.filter(type => type.is_active)
    } catch (err) {
      toast.error('Erro ao carregar tipos de licença')
    }
  }
}

const fetchBalance = async () => {
  try {
    const { data } = await api.get('/employee/leaves/balance')
    leaveBalance.value = data
  } catch (error) {
    toast.error('Erro ao carregar saldo')
  }
}

const submitLeaveRequest = async () => {
  if (!canSubmit.value) return
  submitting.value = true
  try {
    const { data } = await api.post('/employee/leaves', requestForm.value)
    toast.success(data.message || 'Solicitação enviada!')
    closeRequestModal()
    await fetchLeaves()
    await fetchBalance()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Erro ao enviar')
  } finally {
    submitting.value = false
  }
}

const closeRequestModal = () => {
  showRequestModal.value = false
  requestForm.value = {
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: '',
  }
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'PENDENTE',
    approved: 'APROVADO',
    rejected: 'REJEITADO',
    cancelled: 'CANCELADO',
  }
  return labels[status] || status
}

const formatDate = (date) => dayjs(date).format('DD [de] MMMM [de] YYYY')

onMounted(async () => {
  await fetchLeaves()
  await fetchBalance()
  await fetchLeaveTypes()
})
</script>

<style scoped>
.leaves-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-icon i {
  font-size: 2rem;
  color: #3b82f6;
}

.header-text h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.subtitle {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0.25rem 0 0 0;
}

.btn-new {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.btn-new:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-left: 4px solid;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card.yellow {
  border-left-color: #f59e0b;
}

.stat-card.green {
  border-left-color: #10b981;
}

.stat-card.red {
  border-left-color: #ef4444;
}

.stat-card.blue {
  border-left-color: #3b82f6;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card.yellow .stat-icon {
  background: #fef3c7;
}

.stat-card.yellow .stat-icon i {
  color: #f59e0b;
  font-size: 1.5rem;
}

.stat-card.green .stat-icon {
  background: #d1fae5;
}

.stat-card.green .stat-icon i {
  color: #10b981;
  font-size: 1.5rem;
}

.stat-card.red .stat-icon {
  background: #fee2e2;
}

.stat-card.red .stat-icon i {
  color: #ef4444;
  font-size: 1.5rem;
}

.stat-card.blue .stat-icon {
  background: #dbeafe;
}

.stat-card.blue .stat-icon i {
  color: #3b82f6;
  font-size: 1.5rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.stat-label {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 0.25rem;
}

/* Filters */
.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.filter-item label {
  display: block;
  font-weight: 600;
  font-size: 0.9rem;
  color: #475569;
  margin-bottom: 0.5rem;
}

.filter-select {
  width: 100%;
  padding: 0.65rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #1e293b;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Loading & Empty */
.loading-state,
.empty-state {
  background: white;
  padding: 4rem 2rem;
  border-radius: 12px;
  text-align: center;
}

.loading-state i,
.empty-state i {
  font-size: 3.5rem;
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

/* Leaves List */
.leaves-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.leave-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.leave-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.leave-card.border-pending {
  border-left-color: #f59e0b;
}

.leave-card.border-approved {
  border-left-color: #10b981;
}

.leave-card.border-rejected {
  border-left-color: #ef4444;
}

.leave-card.border-cancelled {
  border-left-color: #94a3b8;
}

.leave-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.leave-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
}

.leave-type i {
  font-size: 1rem;
}

.leave-badge {
  padding: 0.3rem 0.75rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.badge-pending {
  background: #fef3c7;
  color: #92400e;
}

.badge-approved {
  background: #d1fae5;
  color: #065f46;
}

.badge-rejected {
  background: #fee2e2;
  color: #991b1b;
}

.badge-cancelled {
  background: #f1f5f9;
  color: #64748b;
}

.leave-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.leave-description {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0 0 1rem 0;
}

.leave-footer {
  display: flex;
  gap: 1.5rem;
  font-size: 0.85rem;
  color: #94a3b8;
  flex-wrap: wrap;
}

.leave-date {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.leave-duration {
  font-weight: 600;
  color: #64748b;
}

.leave-response {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 3px solid #10b981;
}

.leave-response strong {
  display: block;
  color: #475569;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.leave-response p {
  color: #64748b;
  margin: 0;
  font-size: 0.9rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-box {
  background: white;
  border-radius: 12px;
  max-width: 550px;
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
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #ef4444;
  color: white;
}

.modal-body {
  padding: 1.5rem;
}

.form-field {
  margin-bottom: 1.25rem;
}

.form-field label {
  display: block;
  font-weight: 600;
  font-size: 0.9rem;
  color: #475569;
  margin-bottom: 0.5rem;
}

.form-field select,
.form-field input,
.form-field textarea {
  width: 100%;
  padding: 0.65rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.2s;
}

.form-field select:focus,
.form-field input:focus,
.form-field textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-field textarea {
  resize: vertical;
  min-height: 100px;
}

.form-field small {
  display: block;
  margin-top: 0.4rem;
  font-size: 0.8rem;
  color: #94a3b8;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.info-alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem;
  background: #dbeafe;
  border-radius: 8px;
  color: #1e40af;
  font-size: 0.9rem;
  margin-bottom: 1.25rem;
}

.info-alert i {
  font-size: 1.1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn-cancel,
.btn-submit {
  padding: 0.65rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-cancel {
  background: #f1f5f9;
  color: #475569;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

.btn-submit {
  background: #3b82f6;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #2563eb;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .leaves-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-new {
    width: 100%;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>