<template>
  <div class="financial-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <i class="pi pi-wallet"></i>
          <div>
            <h1>Meus Holerites</h1>
            <p class="subtitle">Visualize seu histórico de pagamentos</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Card -->
    <div class="summary-card">
      <div class="summary-header">
        <div class="summary-icon">
          <i class="pi pi-calendar"></i>
        </div>
        <div class="summary-info">
          <span class="summary-label">Último Pagamento</span>
          <span class="summary-value">{{ lastPayrollPeriod }}</span>
        </div>
      </div>

      <div class="summary-body">
        <div class="summary-item">
          <span class="item-label">Salário Bruto</span>
          <span class="item-value earnings">{{ formatCurrency(lastPayroll?.total_earnings) }}</span>
        </div>
        <div class="summary-item">
          <span class="item-label">Descontos</span>
          <span class="item-value deductions">-{{ formatCurrency(lastPayroll?.total_deductions) }}</span>
        </div>
        <div class="summary-item">
          <span class="item-label">Impostos</span>
          <span class="item-value tax">-{{ formatCurrency(lastPayroll?.total_tax) }}</span>
        </div>
        <div class="summary-item total">
          <span class="item-label">Salário Líquido</span>
          <span class="item-value net">{{ formatCurrency(lastPayroll?.net_salary) }}</span>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <i class="pi pi-spin pi-spinner"></i>
      <p>Carregando holerites...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="payrolls.length === 0" class="empty-state">
      <i class="pi pi-wallet"></i>
      <h3>Nenhum holerite disponível</h3>
      <p>Seus holerites aparecerão aqui assim que forem processados</p>
    </div>

    <!-- Payrolls List -->
    <div v-else class="payrolls-section">
      <h2 class="section-title">Histórico de Pagamentos</h2>
      
      <div class="payrolls-grid">
        <div 
          v-for="payroll in payrolls" 
          :key="payroll.id"
          class="payroll-card"
          @click="viewPayroll(payroll)"
        >
          <div class="card-header">
            <div class="payroll-period">
              <i class="pi pi-calendar"></i>
              <span>{{ payroll.reference_period }}</span>
            </div>
            <div class="status-badge" :class="`badge-${payroll.status}`">
              <i :class="getStatusIcon(payroll.status)"></i>
              {{ getStatusLabel(payroll.status) }}
            </div>
          </div>

          <div class="card-body">
            <div class="payroll-summary">
              <div class="summary-row">
                <span class="label">Vencimentos:</span>
                <span class="value earnings">{{ formatCurrency(payroll.total_earnings) }}</span>
              </div>
              <div class="summary-row">
                <span class="label">Descontos:</span>
                <span class="value deductions">-{{ formatCurrency(payroll.total_deductions) }}</span>
              </div>
              <div class="summary-row">
                <span class="label">Impostos:</span>
                <span class="value tax">-{{ formatCurrency(payroll.total_tax) }}</span>
              </div>
              <div class="summary-row total">
                <span class="label">Líquido:</span>
                <span class="value net">{{ formatCurrency(payroll.net_salary) }}</span>
              </div>
            </div>

            <div v-if="payroll.payment_date" class="payment-info">
              <i class="pi pi-calendar-check"></i>
              <span>Pago em {{ formatDate(payroll.payment_date) }}</span>
            </div>
          </div>

          <div class="card-footer">
            <button @click.stop="viewPayroll(payroll)" class="btn-view">
              <i class="pi pi-eye"></i>
              Ver Detalhes
            </button>
            <button @click.stop="downloadPayroll(payroll)" class="btn-download">
              <i class="pi pi-download"></i>
              Download
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal View Payroll -->
    <div v-if="showModal && selectedPayroll" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Holerite - {{ selectedPayroll.reference_period }}</h2>
          <button class="btn-close" @click="closeModal">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <!-- Employee Info -->
          <div class="employee-info-section">
            <div class="info-row">
              <span class="info-label">Nome:</span>
              <span class="info-value">{{ selectedPayroll.employee?.user?.name }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Cargo:</span>
              <span class="info-value">{{ selectedPayroll.employee?.position?.title }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Departamento:</span>
              <span class="info-value">{{ selectedPayroll.employee?.department?.name }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Período:</span>
              <span class="info-value">{{ selectedPayroll.reference_period }}</span>
            </div>
          </div>

          <!-- Earnings -->
          <div class="payroll-section">
            <h3 class="section-header earnings-header">
              <i class="pi pi-plus-circle"></i>
              Vencimentos
            </h3>
            <div class="items-list">
              <div 
                v-for="item in getItemsByType('earning')" 
                :key="item.id"
                class="item-row"
              >
                <span class="item-description">{{ item.description }}</span>
                <span class="item-amount earnings">{{ formatCurrency(item.amount) }}</span>
              </div>
            </div>
            <div class="subtotal earnings">
              <span>Total de Vencimentos</span>
              <span>{{ formatCurrency(selectedPayroll.total_earnings) }}</span>
            </div>
          </div>

          <!-- Deductions -->
          <div class="payroll-section" v-if="getItemsByType('deduction').length > 0">
            <h3 class="section-header deductions-header">
              <i class="pi pi-minus-circle"></i>
              Descontos
            </h3>
            <div class="items-list">
              <div 
                v-for="item in getItemsByType('deduction')" 
                :key="item.id"
                class="item-row"
              >
                <span class="item-description">{{ item.description }}</span>
                <span class="item-amount deductions">-{{ formatCurrency(item.amount) }}</span>
              </div>
            </div>
            <div class="subtotal deductions">
              <span>Total de Descontos</span>
              <span>-{{ formatCurrency(selectedPayroll.total_deductions) }}</span>
            </div>
          </div>

          <!-- Taxes -->
          <div class="payroll-section">
            <h3 class="section-header tax-header">
              <i class="pi pi-percentage"></i>
              Impostos
            </h3>
            <div class="items-list">
              <div 
                v-for="item in getItemsByType('tax')" 
                :key="item.id"
                class="item-row"
              >
                <span class="item-description">{{ item.description }}</span>
                <span class="item-amount tax">-{{ formatCurrency(item.amount) }}</span>
              </div>
            </div>
            <div class="subtotal tax">
              <span>Total de Impostos</span>
              <span>-{{ formatCurrency(selectedPayroll.total_tax) }}</span>
            </div>
          </div>

          <!-- Total -->
          <div class="total-section">
            <div class="total-row">
              <span class="total-label">TOTAL LÍQUIDO A RECEBER</span>
              <span class="total-value">{{ formatCurrency(selectedPayroll.net_salary) }}</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeModal" class="btn-secondary">Fechar</button>
          <button @click="downloadPayroll(selectedPayroll)" class="btn-primary">
            <i class="pi pi-download"></i>
            Download PDF
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { employeeService } from '@/services/employeeService'
import api from '@/services/api'
import { useToast } from 'vue-toastification'

const toast = useToast()

const loading = ref(true)
const showModal = ref(false)
const selectedPayroll = ref(null)
const payrolls = ref([])

// Computed
const lastPayroll = computed(() => {
  if (payrolls.value.length === 0) return null
  return payrolls.value[0]
})

const lastPayrollPeriod = computed(() => {
  if (!lastPayroll.value) return 'Nenhum pagamento'
  return lastPayroll.value.reference_period
})

// Methods
const loadPayrolls = async () => {
  loading.value = true
  try {
    const { data } = await employeeService.payroll.getAll()
    payrolls.value = data
  } catch (error) {
    console.error('Erro ao carregar:', error)
    toast.error('Erro ao carregar holerites')
  } finally {
    loading.value = false
  }
}

const viewPayroll = async (payroll) => {
  try {
    const { data } = await employeeService.payroll.getById(payroll.id)
    selectedPayroll.value = data
    showModal.value = true
  } catch (error) {
    console.error('Erro ao carregar detalhes:', error)
    toast.error('Erro ao carregar detalhes do holerite')
  }
}

const closeModal = () => {
  showModal.value = false
  selectedPayroll.value = null
}

const downloadPayroll = async (payroll) => {
  try {
    toast.info('A gerar PDF do holerite...')
    const response = await api.get(`/employee/payrolls/${payroll.id}/pdf`, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `holerite_${payroll.reference_period?.replace('/', '_')}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    toast.success('PDF baixado com sucesso!')
  } catch (error) {
    toast.error('Erro ao baixar PDF do holerite')
  }
}

const getItemsByType = (type) => {
  if (!selectedPayroll.value?.items) return []
  return selectedPayroll.value.items.filter(item => item.type === type)
}

const getStatusLabel = (status) => {
  const labels = {
    draft: 'Rascunho',
    approved: 'Aprovado',
    paid: 'Pago'
  }
  return labels[status] || status
}

const getStatusIcon = (status) => {
  const icons = {
    draft: 'pi pi-file',
    approved: 'pi pi-check-circle',
    paid: 'pi pi-dollar'
  }
  return icons[status] || 'pi pi-circle'
}

const formatCurrency = (value) => {
  if (!value) return 'AOA 0,00'
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA'
  }).format(value)
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

onMounted(loadPayrolls)
</script>

<style scoped>
.financial-page {
  max-width: 1200px;
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
  gap: 1rem;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-title > i {
  font-size: 3rem;
  color: #10b981;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  padding: 1rem;
  border-radius: 1rem;
}

.header-title h1 {
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

/* Summary Card */
.summary-card {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 1.5rem;
  padding: 2rem;
  color: white;
  margin-bottom: 2rem;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.summary-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.summary-info {
  flex: 1;
}

.summary-label {
  display: block;
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 0.25rem;
}

.summary-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
}

.summary-body {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.summary-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &.total {
    background: rgba(255, 255, 255, 0.2);
  }
}

.item-label {
  font-size: 0.875rem;
  opacity: 0.9;
}

.item-value {
  font-size: 1.25rem;
  font-weight: 700;

  &.net {
    font-size: 1.5rem;
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
  color: #10b981;
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

/* Payrolls Section */
.payrolls-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1.5rem 0;
}

.payrolls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.payroll-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  cursor: pointer;
  border: 2px solid transparent;
}

.payroll-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #10b981;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
}

.payroll-period {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;

  i {
    color: #10b981;
  }
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.875rem;
  border-radius: 1rem;
  font-size: 0.8125rem;
  font-weight: 600;
}

.status-badge.badge-draft {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.badge-approved {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.badge-paid {
  background: #ede9fe;
  color: #5b21b6;
}

.card-body {
  margin-bottom: 1rem;
}

.payroll-summary {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 0.5rem;

  .label {
    font-size: 0.875rem;
    color: #64748b;
    font-weight: 500;
  }

  .value {
    font-size: 1rem;
    font-weight: 700;

    &.earnings {
      color: #065f46;
    }

    &.deductions,
    &.tax {
      color: #991b1b;
    }

    &.net {
      font-size: 1.25rem;
      color: #065f46;
    }
  }

  &.total {
    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  }
}

.payment-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #5b21b6;
  font-weight: 600;
}

.card-footer {
  display: flex;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 2px solid #f1f5f9;
}

.btn-view,
.btn-download {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  font-size: 0.9375rem;
}

.btn-view {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
}

.btn-view:hover {
  background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
  transform: scale(1.02);
}

.btn-download {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
}

.btn-download:hover {
  background: linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%);
  transform: scale(1.02);
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
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.modal-header h2 {
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
  background: white;
  border: none;
  border-radius: 0.5rem;
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

.employee-info-section {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 1rem;
  color: #1e293b;
  font-weight: 600;
}

.payroll-section {
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 1rem;

  &.earnings-header {
    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
    color: #065f46;
  }

  &.deductions-header {
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    color: #991b1b;
  }

  &.tax-header {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    color: #92400e;
  }
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
}

.item-description {
  font-size: 0.9375rem;
  color: #475569;
  font-weight: 500;
}

.item-amount {
  font-size: 1rem;
  font-weight: 700;

  &.earnings {
    color: #065f46;
  }

  &.deductions,
  &.tax {
    color: #991b1b;
  }
}

.subtotal {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-weight: 700;

  &.earnings {
    background: #d1fae5;
    color: #065f46;
  }

  &.deductions {
    background: #fee2e2;
    color: #991b1b;
  }

  &.tax {
    background: #fef3c7;
    color: #92400e;
  }
}

.total-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 0.75rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-label {
  font-size: 1rem;
  font-weight: 700;
  color: white;
  letter-spacing: 0.5px;
}

.total-value {
  font-size: 2rem;
  font-weight: 700;
  color: white;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
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
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

@media (max-width: 768px) {
  .payrolls-grid {
    grid-template-columns: 1fr;
  }

  .summary-body {
    grid-template-columns: 1fr;
  }

  .employee-info-section {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn-secondary,
  .btn-primary {
    width: 100%;
    justify-content: center;
  }
}
</style>