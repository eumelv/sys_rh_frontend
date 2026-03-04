<template>
  <div class="employee-leaves-page">
    <div class="page-header">
      <div>
        <h2>Minhas Licenças</h2>
        <p class="subtitle">Solicite e acompanhe suas licenças</p>
      </div>
      <button @click="showRequestModal = true" class="btn-primary">
        <i class="pi pi-plus"></i>
        Nova Solicitação
      </button>
    </div>

    <!-- Saldo de Licenças -->
    <div class="balance-cards">
      <Card v-for="balance in leaveBalance" :key="balance.leave_type_id" class="balance-card">
        <div class="balance-header">
          <h3>{{ balance.leave_type_name }}</h3>
        </div>
        <div class="balance-stats">
          <div class="stat">
            <span class="label">Disponível</span>
            <span class="value success">{{ balance.available_days }}</span>
          </div>
          <div class="stat">
            <span class="label">Usado</span>
            <span class="value">{{ balance.used_days }}</span>
          </div>
          <div class="stat">
            <span class="label">Pendente</span>
            <span class="value warning">{{ balance.pending_days }}</span>
          </div>
          <div class="stat">
            <span class="label">Total</span>
            <span class="value info">{{ balance.total_days }}</span>
          </div>
        </div>
      </Card>
    </div>

    <!-- Filtros -->
    <Card class="filters-card">
      <div class="filters">
        <button 
          @click="filterStatus = 'all'" 
          :class="{ active: filterStatus === 'all' }"
          class="filter-btn"
        >
          Todas
        </button>
        <button 
          @click="filterStatus = 'pending'" 
          :class="{ active: filterStatus === 'pending' }"
          class="filter-btn"
        >
          Pendentes
        </button>
        <button 
          @click="filterStatus = 'approved'" 
          :class="{ active: filterStatus === 'approved' }"
          class="filter-btn"
        >
          Aprovadas
        </button>
        <button 
          @click="filterStatus = 'rejected'" 
          :class="{ active: filterStatus === 'rejected' }"
          class="filter-btn"
        >
          Rejeitadas
        </button>
      </div>
    </Card>

    <!-- Listagem de Licenças -->
    <Card>
      <div v-if="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner"></i>
        Carregando...
      </div>

      <div v-else-if="filteredLeaves.length === 0" class="empty-state">
        <i class="pi pi-calendar-times"></i>
        <p>{{ filterStatus === 'all' ? 'Nenhuma licença solicitada ainda' : `Nenhuma licença ${filterStatus}` }}</p>
        <button v-if="filterStatus === 'all'" @click="showRequestModal = true" class="btn-primary">
          Solicitar Licença
        </button>
      </div>

      <div v-else class="leaves-list">
        <div v-for="leave in filteredLeaves" :key="leave.id" class="leave-card">
          <div class="leave-header">
            <div class="leave-type">
              <i class="pi pi-briefcase"></i>
              <span>{{ leave.leave_type?.name }}</span>
            </div>
            <span class="status-badge" :class="leave.status">
              {{ getStatusLabel(leave.status) }}
            </span>
          </div>

          <div class="leave-body">
            <div class="info-row">
              <div class="info-item">
                <i class="pi pi-calendar"></i>
                <span>{{ formatDate(leave.start_date) }} até {{ formatDate(leave.end_date) }}</span>
              </div>
              <div class="info-item">
                <i class="pi pi-clock"></i>
                <span>{{ leave.days }} {{ leave.days === 1 ? 'dia' : 'dias' }}</span>
              </div>
            </div>

            <div class="info-row" v-if="leave.reason">
              <div class="info-item reason">
                <i class="pi pi-align-left"></i>
                <span>{{ leave.reason }}</span>
              </div>
            </div>

            <!-- Informações de Aprovação/Rejeição -->
            <div v-if="leave.approved_by && leave.status !== 'pending'" class="review-info">
              <div class="review-header">
                <i class="pi" :class="leave.status === 'approved' ? 'pi-check' : 'pi-times'"></i>
                <span>{{ leave.status === 'approved' ? 'Aprovada' : 'Rejeitada' }} por {{ leave.approver?.name }}</span>
              </div>
              <span class="review-date">{{ formatDateTime(leave.approved_at) }}</span>
              <p v-if="leave.rejection_reason" class="rejection-reason">
                <strong>Motivo:</strong> {{ leave.rejection_reason }}
              </p>
            </div>
          </div>

          <div v-if="leave.status === 'pending'" class="leave-actions">
            <button @click="cancelLeave(leave)" class="btn-cancel">
              <i class="pi pi-times"></i>
              Cancelar Solicitação
            </button>
          </div>
        </div>
      </div>
    </Card>

    <!-- Modal de Solicitação -->
    <Modal v-if="showRequestModal" @close="closeRequestModal">
      <template #header>
        <h3>
          <i class="pi pi-plus-circle"></i>
          Nova Solicitação de Licença
        </h3>
      </template>

      <form @submit.prevent="submitLeaveRequest" class="request-form">
<div class="form-group">
  <label>Tipo de Licença *</label>
  <select v-model="requestForm.leave_type_id" required>
    <option value="">Selecione o tipo</option>
    <option 
      v-for="type in leaveTypes" 
      :key="type.id" 
      :value="type.id"
    >
      {{ type.name }} ({{ type.default_days }} dias disponíveis)
    </option>
  </select>
  
  <!-- ✅ MOSTRAR se não houver tipos -->
  <small v-if="leaveTypes.length === 0" class="text-warning">
    <i class="pi pi-exclamation-triangle"></i>
    Nenhum tipo de licença disponível. Entre em contato com o RH.
  </small>
</div>

        <div class="form-row">
          <div class="form-group">
            <label>Data de Início *</label>
            <input 
              v-model="requestForm.start_date" 
              type="date" 
              :min="minDate"
              required
            />
          </div>
          <div class="form-group">
            <label>Data de Fim *</label>
            <input 
              v-model="requestForm.end_date" 
              type="date" 
              :min="requestForm.start_date || minDate"
              required
            />
          </div>
        </div>

        <div v-if="calculatedDays > 0" class="info-box">
          <i class="pi pi-info-circle"></i>
          <span>Total de <strong>{{ calculatedDays }}</strong> {{ calculatedDays === 1 ? 'dia' : 'dias' }}</span>
        </div>

        <div class="form-group">
          <label>Motivo *</label>
          <textarea 
            v-model="requestForm.reason" 
            rows="4" 
            placeholder="Descreva o motivo da sua solicitação..."
            required
            minlength="10"
          ></textarea>
          <small class="help-text">Mínimo 10 caracteres</small>
        </div>

        <div class="modal-actions">
          <button 
            type="button" 
            @click="closeRequestModal" 
            class="btn-secondary"
            :disabled="submitting"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            class="btn-primary"
            :disabled="submitting || !canSubmit"
          >
            <i class="pi" :class="submitting ? 'pi-spin pi-spinner' : 'pi-send'"></i>
            {{ submitting ? 'Enviando...' : 'Enviar Solicitação' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import Card from '@/components/common/Card.vue'
import Modal from '@/components/common/Modal.vue'
import { useToast } from 'vue-toastification'
import dayjs from 'dayjs'
import 'dayjs/locale/pt'

dayjs.locale('pt')

const toast = useToast()
const loading = ref(false)
const submitting = ref(false)
const showRequestModal = ref(false)
const filterStatus = ref('all')

const leaves = ref([])
const leaveBalance = ref([])
const leaveTypes = ref([]) // ✅ Declarado

const requestForm = ref({
  leave_type_id: '',
  start_date: '',
  end_date: '',
  reason: '',
})

const minDate = computed(() => dayjs().format('YYYY-MM-DD'))

const selectedLeaveType = computed(() => {
  if (!requestForm.value.leave_type_id) return null
  return leaveBalance.value.find(b => b.leave_type_id === requestForm.value.leave_type_id)
})

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
         calculatedDays.value > 0 &&
         (!selectedLeaveType.value || calculatedDays.value <= selectedLeaveType.value.available_days)
})

const filteredLeaves = computed(() => {
  if (filterStatus.value === 'all') return leaves.value
  return leaves.value.filter(leave => leave.status === filterStatus.value)
})

// ✅ ADICIONAR: Buscar licenças
const fetchLeaves = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/employee/leaves')
    leaves.value = data
    console.log('Licenças carregadas:', data)
  } catch (error) {
    console.error('Erro ao carregar licenças:', error)
    toast.error('Erro ao carregar licenças')
  } finally {
    loading.value = false
  }
}

// ✅ Buscar tipos de licença
const fetchLeaveTypes = async () => {
  try {
    const { data } = await api.get('/employee/leaves/types')
    leaveTypes.value = data
    console.log('✅ Tipos de licença carregados:', data)
  } catch (error) {
    console.error('❌ Erro ao carregar tipos:', error)
    // Tentar rota alternativa
    try {
      const { data } = await api.get('/admin/leave-types')
      leaveTypes.value = data.filter(type => type.is_active)
      console.log('✅ Tipos carregados (rota alternativa):', leaveTypes.value)
    } catch (err) {
      console.error('❌ Erro na rota alternativa:', err)
      toast.error('Erro ao carregar tipos de licença')
    }
  }
}

// ✅ Buscar saldo
const fetchBalance = async () => {
  try {
    const { data } = await api.get('/employee/leaves/balance')
    leaveBalance.value = data
    console.log('Saldo carregado:', data)
  } catch (error) {
    console.error('Erro ao carregar saldo:', error)
    toast.error('Erro ao carregar saldo de licenças')
  }
}

// ✅ Enviar solicitação
const submitLeaveRequest = async () => {
  if (!canSubmit.value) return

  submitting.value = true
  try {
    console.log('Enviando solicitação:', requestForm.value)
    
    const { data } = await api.post('/employee/leaves', requestForm.value)
    toast.success(data.message || 'Solicitação enviada com sucesso!')
    closeRequestModal()
    await fetchLeaves()
    await fetchBalance()
  } catch (error) {
    console.error('Erro ao enviar:', error.response?.data)
    const message = error.response?.data?.message || 'Erro ao enviar solicitação'
    toast.error(message)
  } finally {
    submitting.value = false
  }
}

// ✅ Cancelar licença
const cancelLeave = async (leave) => {
  if (!confirm('Tem certeza que deseja cancelar esta solicitação?')) return

  try {
    await api.post(`/employee/leaves/${leave.id}/cancel`)
    toast.success('Solicitação cancelada')
    await fetchLeaves()
    await fetchBalance()
  } catch (error) {
    console.error('Erro ao cancelar:', error)
    toast.error(error.response?.data?.message || 'Erro ao cancelar')
  }
}

// ✅ Fechar modal
const closeRequestModal = () => {
  showRequestModal.value = false
  requestForm.value = {
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: '',
  }
}

// ✅ Helpers
const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pendente',
    approved: 'Aprovada',
    rejected: 'Rejeitada',
    cancelled: 'Cancelada',
  }
  return labels[status] || status
}

const formatDate = (date) => {
  return dayjs(date).format('DD/MM/YYYY')
}

const formatDateTime = (datetime) => {
  return dayjs(datetime).format('DD/MM/YYYY [às] HH:mm')
}

// ✅ CARREGAR TUDO ao montar
onMounted(async () => {
  console.log('=== Montando componente ===')
  await fetchLeaves()
  await fetchBalance()
  await fetchLeaveTypes() // ✅ ESTAVA FALTANDO!
  console.log('=== Componente montado ===')
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* {
  font-family: 'Inter', sans-serif;
}

.employee-leaves-page {
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  animation: fadeIn 0.5s ease-out;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.page-header h2 {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
}

.subtitle {
  color: #64748b;
  font-size: 1rem;
  font-weight: 500;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.btn-primary:hover::before {
  left: 100%;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
}

.btn-primary:active {
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Balance Cards - GLASSMORPHISM */
.balance-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.balance-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.balance-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
  opacity: 0;
  transition: opacity 0.3s;
}

.balance-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.3);
}

.balance-card:hover::before {
  opacity: 1;
}

.balance-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1.5rem;
}

.balance-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat .label {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.stat .value {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1;
}

.stat .value.success {
  background: linear-gradient(135deg, #10b981, #059669);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat .value.warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat .value.info {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Filters */
.filters-card {
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.filters {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #64748b;
}

.filter-btn:hover {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.filter-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* Leaves List */
.loading-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: white;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.7;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.leaves-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.leave-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.leave-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  background: linear-gradient(180deg, #667eea, #764ba2);
  transform: scaleY(0);
  transition: transform 0.3s;
}

.leave-card:hover {
  transform: translateX(4px);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.2);
}

.leave-card:hover::before {
  transform: scaleY(1);
}

.leave-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.leave-type {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  font-size: 1.1rem;
  color: #1e293b;
}

.leave-type i {
  font-size: 1.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.pending {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

.status-badge.approved {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: #065f46;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.status-badge.rejected {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: #991b1b;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.status-badge.cancelled {
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  color: #64748b;
  box-shadow: 0 2px 8px rgba(100, 116, 139, 0.2);
}

.leave-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-row {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 500;
}

.info-item.reason {
  flex: 1;
  color: #475569;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 12px;
}

.info-item i {
  font-size: 1.25rem;
  color: #94a3b8;
}

.review-info {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 16px;
  font-size: 0.95rem;
  border-left: 4px solid #667eea;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.review-header i {
  font-size: 1.25rem;
}

.review-date {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 500;
}

.rejection-reason {
  margin-top: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border-radius: 12px;
  color: #991b1b;
  font-size: 0.9rem;
  font-weight: 500;
}

.leave-actions {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #f1f5f9;
}

.btn-cancel {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: #dc2626;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2);
}

.btn-cancel:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(220, 38, 38, 0.3);
  background: linear-gradient(135deg, #fecaca, #fca5a5);
}

/* Form Styles */
.request-form {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-group label {
  font-weight: 700;
  color: #334155;
  font-size: 0.95rem;
}

.form-group select,
.form-group input,
.form-group textarea {
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  transition: all 0.3s;
  font-family: 'Inter', sans-serif;
}

.form-group select:focus,
.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.help-text {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 500;
}

.text-warning {
  color: #f59e0b;
  font-weight: 600;
}

.info-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border-radius: 12px;
  color: #1e40af;
  font-size: 0.95rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.info-box i {
  font-size: 1.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #f1f5f9;
}

.btn-secondary {
  padding: 1rem 2rem;
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
  transform: translateY(-2px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.balance-card {
  animation: slideIn 0.5s ease-out;
}

.balance-card:nth-child(1) { animation-delay: 0.1s; }
.balance-card:nth-child(2) { animation-delay: 0.2s; }
.balance-card:nth-child(3) { animation-delay: 0.3s; }
.balance-card:nth-child(4) { animation-delay: 0.4s; }

.leave-card {
  animation: slideIn 0.5s ease-out;
}

@media (max-width: 768px) {
  .employee-leaves-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
  
  .balance-cards {
    grid-template-columns: 1fr;
  }

  .info-row {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>