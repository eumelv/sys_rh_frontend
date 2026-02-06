<template>
  <div class="leaves-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <i class="pi pi-calendar"></i>
          <div>
            <h1>Férias & Licenças</h1>
            <p class="subtitle">Solicite e gerencie seus pedidos de ausência</p>
          </div>
        </div>
        <button @click="openModal" class="btn-new-leave">
          <i class="pi pi-plus"></i>
          Nova Solicitação
        </button>
      </div>
    </div>

    <!-- Balance Cards -->
    <div class="balance-grid">
      <div v-for="balance in leaveBalances" :key="balance.id" class="balance-card">
        <div class="balance-header">
          <div class="balance-icon">
            <i :class="getLeaveTypeIcon(balance.leave_type?.name)"></i>
          </div>
          <span class="type-name">{{ balance.leave_type?.name }}</span>
        </div>
        
        <div class="balance-content">
          <div class="days-available">
            <span class="days-value">{{ balance.available_days }}</span>
            <span class="days-label">dias disponíveis</span>
          </div>
          
          <div class="balance-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: `${(balance.used_days / balance.total_allowed) * 100}%` }"
              ></div>
            </div>
            <div class="balance-stats">
              <span class="stat-item">
                <i class="pi pi-check-circle"></i>
                Usado: {{ balance.used_days }}
              </span>
              <span class="stat-item">
                <i class="pi pi-calendar"></i>
                Total: {{ balance.total_allowed }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <i class="pi pi-spin pi-spinner"></i>
      <p>Carregando pedidos...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="leaves.length === 0" class="empty-state">
      <i class="pi pi-calendar-times"></i>
      <h3>Nenhum pedido encontrado</h3>
      <p>Você ainda não realizou nenhum pedido de licença</p>
      <button @click="openModal" class="btn-primary">
        <i class="pi pi-plus"></i>
        Criar Primeira Solicitação
      </button>
    </div>

    <!-- Leaves List -->
    <div v-else class="leaves-list">
      <div class="list-header">
        <h2>Histórico de Solicitações</h2>
        <div class="filter-group">
          <select v-model="statusFilter" class="filter-select">
            <option value="">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="approved">Aprovado</option>
            <option value="rejected">Rejeitado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      <div class="leaves-grid">
        <div
          v-for="leave in filteredLeaves"
          :key="leave.id"
          class="leave-card"
          :class="`status-${leave.status}`"
        >
          <div class="leave-status-indicator"></div>
          
          <div class="leave-header">
            <div class="leave-type-badge">
              <i :class="getLeaveTypeIcon(leave.leave_type?.name)"></i>
              <span>{{ leave.leave_type?.name }}</span>
            </div>
            <span class="status-badge" :class="`badge-${leave.status}`">
              {{ getStatusLabel(leave.status) }}
            </span>
          </div>

          <div class="leave-period">
            <div class="period-dates">
              <div class="date-item">
                <span class="date-label">Início</span>
                <span class="date-value">{{ formatDate(leave.start_date) }}</span>
              </div>
              <i class="pi pi-arrow-right"></i>
              <div class="date-item">
                <span class="date-label">Término</span>
                <span class="date-value">{{ formatDate(leave.end_date) }}</span>
              </div>
            </div>
            <div class="total-days">
              <i class="pi pi-calendar"></i>
              <strong>{{ leave.total_days }}</strong> {{ leave.total_days === 1 ? 'dia' : 'dias' }}
            </div>
          </div>

          <div v-if="leave.reason" class="leave-reason">
            <strong>Motivo:</strong>
            <p>{{ leave.reason }}</p>
          </div>

          <div class="leave-footer">
            <span class="leave-date">
              <i class="pi pi-clock"></i>
              Solicitado em {{ formatDateTime(leave.created_at) }}
            </span>
            
            <div class="leave-actions">
              <button
                v-if="leave.status === 'pending'"
                @click="cancelLeave(leave)"
                class="btn-cancel"
                title="Cancelar Solicitação"
              >
                <i class="pi pi-times"></i>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Solicitar Licença -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Nova Solicitação de Licença</h2>
          <button @click="closeModal" class="btn-close">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <form @submit.prevent="submitLeave" class="modal-body">
          <div class="form-group">
            <label for="leaveType">Tipo de Licença *</label>
            <select id="leaveType" v-model="form.leave_type_id" required class="form-control">
              <option value="">Selecione o tipo de licença...</option>
              <option
                v-for="balance in leaveBalances"
                :key="balance.leave_type_id"
                :value="balance.leave_type_id"
                :disabled="balance.available_days <= 0"
              >
                {{ balance.leave_type?.name }} 
                ({{ balance.available_days }} {{ balance.available_days === 1 ? 'dia disponível' : 'dias disponíveis' }})
              </option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="startDate">Data de Início *</label>
              <input
                id="startDate"
                v-model="form.start_date"
                type="date"
                required
                class="form-control"
                @change="calculateDays"
                :min="minDate"
              />
            </div>
            <div class="form-group">
              <label for="endDate">Data de Término *</label>
              <input
                id="endDate"
                v-model="form.end_date"
                type="date"
                required
                class="form-control"
                @change="calculateDays"
                :min="form.start_date || minDate"
              />
            </div>
          </div>

          <div v-if="form.total_days > 0" class="info-alert">
            <i class="pi pi-info-circle"></i>
            <div>
              <strong>Total de dias solicitados: {{ form.total_days }}</strong>
              <p v-if="selectedBalance && form.total_days > selectedBalance.available_days" class="error-text">
                Atenção: Você não possui dias suficientes. Disponível: {{ selectedBalance.available_days }} dias
              </p>
            </div>
          </div>

          <div class="form-group">
            <label for="reason">Motivo / Observações</label>
            <textarea
              id="reason"
              v-model="form.reason"
              rows="4"
              class="form-control"
              placeholder="Descreva o motivo da sua solicitação (opcional)..."
            ></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn-secondary">
              Cancelar
            </button>
            <button
              type="submit"
              class="btn-primary"
              :disabled="saving || form.total_days <= 0 || isExceedingBalance"
            >
              <i class="pi pi-spin pi-spinner" v-if="saving"></i>
              <i class="pi pi-check" v-else></i>
              {{ saving ? 'Enviando...' : 'Enviar Solicitação' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import api from '@/services/api'
import { useToast } from 'vue-toastification'
import dayjs from 'dayjs'

const toast = useToast()
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const statusFilter = ref('')

const leaves = ref([])
const leaveBalances = ref([])

const form = reactive({
  leave_type_id: '',
  start_date: '',
  end_date: '',
  reason: '',
  total_days: 0
})

const minDate = computed(() => {
  return dayjs().format('YYYY-MM-DD')
})

const selectedBalance = computed(() => {
  return leaveBalances.value.find(b => b.leave_type_id === form.leave_type_id)
})

const isExceedingBalance = computed(() => {
  if (!selectedBalance.value) return false
  return form.total_days > selectedBalance.value.available_days
})

const filteredLeaves = computed(() => {
  if (!statusFilter.value) return leaves.value
  return leaves.value.filter(leave => leave.status === statusFilter.value)
})

const fetchLeaves = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/employee/leaves')
    leaves.value = data.data
  } catch (error) {
    toast.error('Erro ao carregar pedidos de licença')
  } finally {
    loading.value = false
  }
}

const fetchBalances = async () => {
  try {
    const { data } = await api.get('/employee/leaves/balance')
    leaveBalances.value = data
  } catch (error) {
    console.error('Erro ao carregar saldos')
  }
}

const openModal = () => {
  resetForm()
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const resetForm = () => {
  Object.assign(form, {
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: '',
    total_days: 0
  })
}

const calculateDays = () => {
  if (form.start_date && form.end_date) {
    const start = dayjs(form.start_date)
    const end = dayjs(form.end_date)
    const diff = end.diff(start, 'day') + 1
    form.total_days = diff > 0 ? diff : 0
  } else {
    form.total_days = 0
  }
}

const submitLeave = async () => {
  if (isExceedingBalance.value) {
    toast.error('Você não possui dias suficientes para esta solicitação')
    return
  }

  saving.value = true
  try {
    await api.post('/employee/leaves', form)
    toast.success('Solicitação enviada com sucesso!')
    closeModal()
    fetchLeaves()
    fetchBalances()
  } catch (error) {
    const message = error.response?.data?.message || 'Erro ao enviar solicitação'
    toast.error(message)
  } finally {
    saving.value = false
  }
}

const cancelLeave = async (leave) => {
  if (!confirm('Deseja realmente cancelar esta solicitação?')) return

  try {
    await api.post(`/employee/leaves/${leave.id}/cancel`)
    toast.success('Solicitação cancelada com sucesso')
    fetchLeaves()
    fetchBalances()
  } catch (error) {
    toast.error('Erro ao cancelar solicitação')
  }
}

const getLeaveTypeIcon = (typeName) => {
  const icons = {
    'Férias': 'pi pi-sun',
    'Licença Médica': 'pi pi-heart',
    'Licença Maternidade': 'pi pi-users',
    'Licença Paternidade': 'pi pi-user',
    'Falta Justificada': 'pi pi-file',
    'default': 'pi pi-calendar'
  }
  return icons[typeName] || icons.default
}

const formatDate = (date) => {
  return dayjs(date).format('DD/MM/YYYY')
}

const formatDateTime = (date) => {
  return dayjs(date).format('DD/MM/YYYY [às] HH:mm')
}

const getStatusLabel = (status) => {
  const labels = {
    'pending': 'Pendente',
    'approved': 'Aprovado',
    'rejected': 'Rejeitado',
    'cancelled': 'Cancelado'
  }
  return labels[status] || status
}

onMounted(() => {
  fetchLeaves()
  fetchBalances()
})
</script>

<style scoped>
.leaves-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;

  .header-title {
    display: flex;
    align-items: center;
    gap: 1rem;

    > i {
      font-size: 3rem;
      color: #6366f1;
      background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
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

  .btn-new-leave {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.5rem;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    color: white;
    border: none;
    border-radius: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
    }

    i {
      font-size: 1.125rem;
    }
  }
}

.balance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.balance-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #6366f1;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .balance-header {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    margin-bottom: 1.25rem;

    .balance-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        font-size: 1.5rem;
        color: #6366f1;
      }
    }

    .type-name {
      font-size: 0.9375rem;
      font-weight: 600;
      color: #475569;
    }
  }

  .balance-content {
    .days-available {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
      margin-bottom: 1rem;

      .days-value {
        font-size: 2.5rem;
        font-weight: 700;
        color: #1e293b;
        line-height: 1;
      }

      .days-label {
        font-size: 0.875rem;
        color: #64748b;
      }
    }

    .balance-progress {
      .progress-bar {
        height: 8px;
        background: #f1f5f9;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 0.75rem;

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1 0%, #4f46e5 100%);
          transition: width 0.3s ease;
        }
      }

      .balance-stats {
        display: flex;
        justify-content: space-between;
        font-size: 0.8125rem;
        color: #64748b;

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.375rem;

          i {
            font-size: 0.875rem;
          }
        }
      }
    }
  }
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 5rem 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  i {
    font-size: 4rem;
    color: #cbd5e1;
    margin-bottom: 1.5rem;
  }

  h3 {
    font-size: 1.5rem;
    color: #475569;
    margin: 0 0 0.5rem 0;
  }

  p {
    color: #94a3b8;
    margin: 0 0 1.5rem 0;
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.5rem;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    color: white;
    border: none;
    border-radius: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
    }
  }
}

.leaves-list {
  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;

    h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }

    .filter-group {
      .filter-select {
        padding: 0.625rem 1rem;
        border: 2px solid #e2e8f0;
        border-radius: 0.75rem;
        font-size: 0.9375rem;
        color: #1e293b;
        background: white;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 180px;

        &:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }
      }
    }
  }
}

.leaves-grid {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.leave-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  border-left: 4px solid #e2e8f0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
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

  &.status-cancelled {
    border-left-color: #94a3b8;
  }

  .leave-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;

    .leave-type-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #f8fafc;
      border-radius: 0.75rem;
      font-weight: 600;
      color: #475569;
      font-size: 0.9375rem;

      i {
        font-size: 1.125rem;
        color: #6366f1;
      }
    }

    .status-badge {
      padding: 0.375rem 0.875rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;

      &.badge-pending {
        background: #fef3c7;
        color: #f59e0b;
      }

      &.badge-approved {
        background: #d1fae5;
        color: #10b981;
      }

      &.badge-rejected {
        background: #fee2e2;
        color: #ef4444;
      }

      &.badge-cancelled {
        background: #f1f5f9;
        color: #64748b;
      }
    }
  }

  .leave-period {
    margin-bottom: 1rem;

    .period-dates {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 0.875rem;

      .date-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .date-label {
          font-size: 0.75rem;
          color: #94a3b8;
          text-transform: uppercase;
          font-weight: 600;
        }

        .date-value {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1e293b;
        }
      }

      > i {
        color: #cbd5e1;
        font-size: 1.25rem;
      }
    }

    .total-days {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
      border-radius: 0.75rem;
      color: #4338ca;
      font-size: 0.9375rem;

      i {
        font-size: 1rem;
      }

      strong {
        font-size: 1.125rem;
      }
    }
  }

  .leave-reason {
    padding: 1rem;
    background: #f8fafc;
    border-radius: 0.75rem;
    margin-bottom: 1rem;

    strong {
      display: block;
      color: #475569;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    p {
      color: #64748b;
      margin: 0;
      line-height: 1.6;
      font-size: 0.9375rem;
    }
  }

  .leave-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    border-top: 1px solid #f1f5f9;

    .leave-date {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #94a3b8;

      i {
        font-size: 1rem;
      }
    }

    .leave-actions {
      .btn-cancel {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
        color: #dc2626;
        border: none;
        border-radius: 0.5rem;
        font-weight: 600;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          transform: translateY(-1px);
        }

        i {
          font-size: 0.875rem;
        }
      }
    }
  }
}

/* Modal Styles */
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
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 1rem;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
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
    transition: all 0.2s ease;

    &:hover {
      background: #ef4444;
      color: white;
    }
  }
}

.modal-body {
  padding: 1.5rem;

  .form-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .form-group {
    margin-bottom: 1.5rem;

    label {
      display: block;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #475569;
      font-size: 0.9375rem;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 0.75rem;
      font-size: 1rem;
      transition: all 0.2s ease;
      font-family: inherit;

      &:focus {
        outline: none;
        border-color: #6366f1;
        box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
      }

      &:disabled {
        background: #f1f5f9;
        cursor: not-allowed;
      }
    }

    textarea.form-control {
      resize: vertical;
    }
  }

  .info-alert {
    display: flex;
    gap: 0.875rem;
    padding: 1rem;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 0.75rem;
    margin-bottom: 1.5rem;

    i {
      font-size: 1.25rem;
      color: #3b82f6;
      flex-shrink: 0;
    }

    strong {
      display: block;
      color: #1e40af;
      margin-bottom: 0.25rem;
    }

    .error-text {
      color: #dc2626;
      margin: 0.5rem 0 0 0;
      font-size: 0.875rem;
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
    transition: all 0.2s ease;
    border: none;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .btn-secondary {
    background: #f1f5f9;
    color: #475569;

    &:hover:not(:disabled) {
      background: #e2e8f0;
    }
  }

  .btn-primary {
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;

    .btn-new-leave {
      width: 100%;
      justify-content: center;
    }
  }

  .balance-grid {
    grid-template-columns: 1fr;
  }

  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;

    .filter-select {
      width: 100%;
    }
  }

  .leave-period .period-dates {
    flex-direction: column;
    gap: 1rem;

    > i {
      transform: rotate(90deg);
    }
  }

  .leave-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .modal-body .form-row {
    grid-template-columns: 1fr;
  }

  .modal-content {
    margin: 0.5rem;
    max-height: calc(100vh - 1rem);
  }
}
</style>