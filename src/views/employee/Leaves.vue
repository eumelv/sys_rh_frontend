<template>
  <div class="leaves-page">
    <div class="page-header">
      <div class="header-info">
        <h3>Férias & Licenças</h3>
        <p>Solicite e gerencie seus pedidos de ausência</p>
      </div>
      <button @click="openModal" class="btn-primary">
        <i class="pi pi-plus"></i>
        Solicitar Licença
      </button>
    </div>

    <div class="balance-grid">
      <div v-for="balance in leaveBalances" :key="balance.id" class="balance-card">
        <div class="balance-info">
          <span class="type-name">{{ balance.leave_type?.name }}</span>
          <div class="days">
            <span class="value">{{ balance.available_days }}</span>
            <span class="label">dias disponíveis</span>
          </div>
        </div>
        <div class="balance-usage">
          <span>Usado: {{ balance.used_days }} dias</span>
          <span>Total: {{ balance.total_allowed }} dias</span>
        </div>
      </div>
    </div>

    <Card title="Meus Pedidos">
      <div v-if="loading" class="loading-state">
        <Loading message="Carregando pedidos..." />
      </div>

      <div v-else-if="leaves.length === 0" class="empty-state">
        <i class="pi pi-calendar-times"></i>
        <h3>Nenhum pedido encontrado</h3>
        <p>Você ainda não realizou nenhum pedido de licença.</p>
        <button @click="openModal" class="btn-primary">Solicitar Agora</button>
      </div>

      <div v-else>
        <table class="data-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Período</th>
              <th>Dias</th>
              <th>Status</th>
              <th>Solicitado em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="leave in leaves" :key="leave.id">
              <td><strong>{{ leave.leave_type?.name }}</strong></td>
              <td>
                <div class="period">
                  {{ formatDate(leave.start_date) }} - {{ formatDate(leave.end_date) }}
                </div>
              </td>
              <td>{{ leave.total_days }}</td>
              <td>
                <span :class="`status-badge status-${leave.status}`">
                  {{ getStatusLabel(leave.status) }}
                </span>
              </td>
              <td>{{ formatDate(leave.created_at) }}</td>
              <td>
                <button v-if="leave.status === 'pending'" @click="cancelLeave(leave)" class="btn-icon btn-danger" title="Cancelar Pedido">
                  <i class="pi pi-times"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <!-- Modal for leave request -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Solicitar Licença</h3>
          <button @click="closeModal" class="close-btn">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <form @submit.prevent="submitLeave" class="modal-body">
          <div class="form-group">
            <label>Tipo de Licença *</label>
            <select v-model="form.leave_type_id" required>
              <option value="">Selecione o tipo...</option>
              <option v-for="balance in leaveBalances" :key="balance.leave_type_id" :value="balance.leave_type_id">
                {{ balance.leave_type?.name }} ({{ balance.available_days }} dias disponíveis)
              </option>
            </select>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Data de Início *</label>
              <input v-model="form.start_date" type="date" required @change="calculateDays" />
            </div>
            <div class="form-group">
              <label>Data de Término *</label>
              <input v-model="form.end_date" type="date" required @change="calculateDays" />
            </div>
          </div>

          <div v-if="form.total_days > 0" class="info-alert">
            Total de dias solicitados: <strong>{{ form.total_days }}</strong>
          </div>

          <div class="form-group">
            <label>Motivo / Observações</label>
            <textarea v-model="form.reason" rows="3" placeholder="Opcional..."></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="saving || form.total_days <= 0">
              {{ saving ? 'Enviando...' : 'Enviar Solicitação' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/services/api'
import Card from '@/components/common/Card.vue'
import Loading from '@/components/common/Loading.vue'
import { useToast } from 'vue-toastification'
import dayjs from 'dayjs'

const toast = useToast()
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)

const leaves = ref([])
const leaveBalances = ref([])

const form = reactive({
  leave_type_id: '',
  start_date: '',
  end_date: '',
  reason: '',
  total_days: 0
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
    console.error('Error fetching balances')
  }
}

const openModal = () => {
  resetForm()
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
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
  if (!confirm('Deseja realmente cancelar este pedido?')) return

  try {
    await api.post(`/employee/leaves/${leave.id}/cancel`)
    toast.success('Pedido cancelado com sucesso')
    fetchLeaves()
    fetchBalances()
  } catch (error) {
    toast.error('Erro ao cancelar pedido')
  }
}

const formatDate = (date) => {
  return dayjs(date).format('DD/MM/YYYY')
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
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.header-info p {
  color: #64748b;
  font-size: 0.875rem;
}

.balance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.balance-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.type-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
}

.days {
  margin-top: 0.5rem;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.days .value {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
}

.days .label {
  font-size: 0.875rem;
  color: #64748b;
}

.balance-usage {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #94a3b8;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.info-alert {
  background: #eff6ff;
  color: #1e40af;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-approved { background: #dcfce7; color: #166534; }
.status-pending { background: #fef9c3; color: #854d0e; }
.status-rejected { background: #fee2e2; color: #991b1b; }
.status-cancelled { background: #f1f5f9; color: #475569; }

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
