<template>
  <div class="payroll-page">
    <div class="page-header">
      <div class="period-selector">
        <select v-model="selectedYear" @change="fetchPayrolls">
          <option v-for="year in years" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
        <select v-model="selectedMonth" @change="fetchPayrolls">
          <option v-for="month in 12" :key="month" :value="month">
            {{ getMonthName(month) }}
          </option>
        </select>
      </div>
      <div class="header-right">
        <button @click="exportToPdf" class="btn-primary">
          <i class="pi pi-file-pdf"></i>
          Exportar PDF
        </button>
        <button @click="generatePayroll" class="btn-primary" :disabled="generating">
          <i class="pi pi-file-plus"></i>
          {{ generating ? 'Gerando...' : 'Gerar Folha' }}
        </button>
      </div>
    </div>

    <div class="stats-grid">
      <StatCard label="Total de Folhas" :value="stats.total" icon="pi pi-file" color="#3b82f6" />
      <StatCard label="Valor Total" :value="stats.total_amount" icon="pi pi-money-bill" color="#10b981"
        format="currency" />
      <StatCard label="Pagas" :value="stats.paid" icon="pi pi-check-circle" color="#8b5cf6" />
      <StatCard label="Pendentes" :value="stats.pending" icon="pi pi-clock" color="#f59e0b" />
    </div>

    <Card>
      <div v-if="loading" class="loading-state">
        <Loading message="Carregando folhas..." />
      </div>

      <div v-else-if="payrolls.length === 0" class="empty-state">
        <i class="pi pi-file"></i>
        <h3>Nenhuma folha encontrada</h3>
        <p>Gere a folha de pagamento para {{ getMonthName(selectedMonth) }}/{{ selectedYear }}</p>
        <button @click="generatePayroll" class="btn-primary">
          Gerar Folha
        </button>
      </div>

      <div v-else>
        <table class="data-table">
          <thead>
            <tr>
              <th>Funcionário</th>
              <th>Salário Base</th>
              <th>Acréscimos</th>
              <th>Descontos</th>
              <th>Salário Líquido</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payroll in payrolls" :key="payroll.id">
              <td>
                <div class="employee-name">{{ payroll.employee?.full_name }}</div>
                <div class="employee-number">{{ payroll.employee?.employee_number }}</div>
              </td>
              <td>{{ formatCurrency(payroll.base_salary) }}</td>
              <td class="text-success">{{ formatCurrency(payroll.total_earnings - payroll.base_salary) }}</td>
              <td class="text-danger">{{ formatCurrency(payroll.total_deductions + payroll.total_tax) }}</td>
              <td class="text-bold">{{ formatCurrency(payroll.net_salary) }}</td>
              <td>
                <span :class="`status-badge status-${payroll.status}`">
                  {{ payroll.status }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button v-if="payroll.status === 'draft'" @click="approvePayroll(payroll)" class="btn-icon"
                    title="Aprovar">
                    <i class="pi pi-check"></i>
                  </button>
                  <button v-if="payroll.status === 'approved'" @click="markAsPaid(payroll)" class="btn-icon"
                    title="Marcar como Pago">
                    <i class="pi pi-money-bill"></i>
                  </button>
                  <button @click="viewPayroll(payroll)" class="btn-icon" title="Ver Detalhes">
                    <i class="pi pi-eye"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import Card from '@/components/common/Card.vue'
import StatCard from '@/components/common/StatCard.vue'
import Loading from '@/components/common/Loading.vue'
import { useToast } from 'vue-toastification'

const toast = useToast()

const loading = ref(false)
const generating = ref(false)

const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(new Date().getMonth() + 1)

const payrolls = ref([])

const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return [currentYear - 1, currentYear, currentYear + 1]
})

const stats = computed(() => {
  return {
    total: payrolls.value.length,
    total_amount: payrolls.value.reduce((sum, p) => sum + p.net_salary, 0),
    paid: payrolls.value.filter(p => p.status === 'paid').length,
    pending: payrolls.value.filter(p => p.status !== 'paid').length,
  }
})

const fetchPayrolls = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/admin/payroll', {
      params: {
        year: selectedYear.value,
        month: selectedMonth.value,
      },
    })
    payrolls.value = data.data || data
  } catch (error) {
    toast.error('Erro ao carregar folhas de pagamento')
  } finally {
    loading.value = false
  }
}

const generatePayroll = async () => {
  if (!confirm(`Gerar folha de pagamento para ${getMonthName(selectedMonth.value)}/${selectedYear.value}?`)) {
    return
  }

  generating.value = true
  try {
    const { data } = await api.post('/admin/payroll/generate', {
      year: selectedYear.value,
      month: selectedMonth.value,
    })
    toast.success(data.message)
    fetchPayrolls()
  } catch (error) {
    const message = error.response?.data?.message || 'Erro ao gerar folha'
    toast.error(message)
  } finally {
    generating.value = false
  }
}

const approvePayroll = async (payroll) => {
  try {
    await api.post(`/admin/payroll/${payroll.id}/approve`)
    toast.success('Folha aprovada')
    fetchPayrolls()
  } catch (error) {
    toast.error('Erro ao aprovar folha')
  }
}

const markAsPaid = async (payroll) => {
  if (!confirm('Marcar como pago?')) return

  try {
    await api.post(`/admin/payroll/${payroll.id}/mark-as-paid`)
    toast.success('Marcado como pago')
    fetchPayrolls()
  } catch (error) {
    toast.error('Erro ao marcar como pago')
  }
}

const viewPayroll = (payroll) => {
  // TODO: Open detail modal
  console.log('View payroll:', payroll)
}

const exportToPdf = async () => {
  try {
    toast.info('A gerar PDF da folha...')
    const response = await api.get('/admin/reports/payroll/pdf', {
      params: {
        year: selectedYear.value,
        month: selectedMonth.value
      },
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `folha_salarial_${selectedMonth.value}_${selectedYear.value}.pdf`)
    document.body.appendChild(link)
    link.click()
  } catch (error) {
    toast.error('Erro ao gerar PDF')
  }
}

const getMonthName = (month) => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  return months[month - 1]
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
  }).format(value / 100)
}

onMounted(() => {
  fetchPayrolls()
})
</script>

<style scoped>
.payroll-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.period-selector {
  display: flex;
  gap: 1rem;
}

.period-selector select {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.employee-name {
  font-weight: 600;
  color: #111827;
}

.employee-number {
  font-size: 0.75rem;
  color: #6b7280;
  font-family: monospace;
}

.text-success {
  color: #10b981;
}

.text-danger {
  color: #ef4444;
}

.text-bold {
  font-weight: 700;
  font-size: 1rem;
}

.status-draft {
  background: #fef3c7;
  color: #92400e;
}

.status-approved {
  background: #dbeafe;
  color: #1e40af;
}

.status-paid {
  background: #d1fae5;
  color: #065f46;
}

/* Reuse other styles from previous pages */
.loading-state,
.empty-state {
  padding: 4rem 2rem;
  text-align: center;
}

.empty-state i {
  font-size: 4rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  color: #4b5563;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: #f9fafb;
}

.data-table th {
  padding: 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
}

.data-table td {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  font-size: 0.875rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  color: #4b5563;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: #e5e7eb;
}
</style>