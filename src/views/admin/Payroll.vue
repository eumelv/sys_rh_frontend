<template>
  <div class="payroll-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <i class="pi pi-money-bill"></i>
          <div>
            <h1>Folha de Pagamento</h1>
            <p class="subtitle">Gerencie a folha de pagamento mensal dos colaboradores</p>
          </div>
        </div>
        <button @click="openGenerateModal" class="btn-primary">
          <i class="pi pi-plus"></i>
          Gerar Folha do Mês
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon total">
          <i class="pi pi-list"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total de Folhas</span>
          <span class="stat-value">{{ pagination.total || 0 }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon draft">
          <i class="pi pi-file"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Rascunhos</span>
          <span class="stat-value">{{ draftCount }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon approved">
          <i class="pi pi-check-circle"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Aprovadas</span>
          <span class="stat-value">{{ approvedCount }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon paid">
          <i class="pi pi-dollar"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Pagas</span>
          <span class="stat-value">{{ paidCount }}</span>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-card">
      <div class="filters-row">
        <div class="filter-group">
          <label>Status</label>
          <select v-model="filters.status" @change="loadPayrolls(1)" class="filter-select">
            <option value="">Todos</option>
            <option value="draft">Rascunho</option>
            <option value="approved">Aprovado</option>
            <option value="paid">Pago</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Colaborador</label>
          <select v-model="filters.employee_id" @change="loadPayrolls(1)" class="filter-select">
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
      <p>Carregando folhas de pagamento...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="payrolls.length === 0" class="empty-state">
      <i class="pi pi-money-bill"></i>
      <h3>Nenhuma folha encontrada</h3>
      <p>Gere a primeira folha de pagamento do mês</p>
      <button @click="openGenerateModal" class="btn-primary">
        <i class="pi pi-plus"></i>
        Gerar Folha
      </button>
    </div>

    <!-- Payrolls List -->
    <div v-else class="payrolls-list">
      <div 
        v-for="payroll in payrolls" 
        :key="payroll.id"
        class="payroll-card"
        :class="`status-${payroll.status}`"
      >
        <div class="card-header">
          <div class="employee-info">
            <div class="employee-avatar">
              {{ getInitials(payroll.employee?.user?.name) }}
            </div>
            <div class="employee-details">
              <h3>{{ payroll.employee?.user?.name }}</h3>
              <span class="employee-position">{{ payroll.employee?.position?.title }}</span>
            </div>
          </div>

          <div class="status-badge" :class="`badge-${payroll.status}`">
            <i :class="getStatusIcon(payroll.status)"></i>
            {{ getStatusLabel(payroll.status) }}
          </div>
        </div>

        <div class="card-body">
          <div class="payroll-period">
            <i class="pi pi-calendar"></i>
            <span>{{ payroll.reference_period }}</span>
          </div>

          <div class="payroll-values">
            <div class="value-item earnings">
              <span class="value-label">Vencimentos</span>
              <span class="value-amount">{{ formatCurrency(payroll.total_earnings) }}</span>
            </div>

            <div class="value-item deductions">
              <span class="value-label">Descontos</span>
              <span class="value-amount">-{{ formatCurrency(payroll.total_deductions) }}</span>
            </div>

            <div class="value-item tax">
              <span class="value-label">Impostos</span>
              <span class="value-amount">-{{ formatCurrency(payroll.total_tax) }}</span>
            </div>

            <div class="value-item net">
              <span class="value-label">Líquido</span>
              <span class="value-amount net-value">{{ formatCurrency(payroll.net_salary) }}</span>
            </div>
          </div>

          <div v-if="payroll.payment_date" class="payment-date">
            <i class="pi pi-calendar-check"></i>
            <span>Pagamento: {{ formatDate(payroll.payment_date) }}</span>
          </div>
        </div>

        <div class="card-footer">
          <button @click="viewPayroll(payroll)" class="btn-view" title="Ver Detalhes">
            <i class="pi pi-eye"></i>
          </button>

          <button 
            v-if="payroll.status === 'draft'" 
            @click="approvePayroll(payroll)" 
            class="btn-approve" 
            title="Aprovar"
          >
            <i class="pi pi-check"></i>
          </button>

          <button 
            v-if="payroll.status === 'draft'" 
            @click="deletePayroll(payroll)" 
            class="btn-delete" 
            title="Excluir"
          >
            <i class="pi pi-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.last_page > 1" class="pagination">
      <button
        @click="loadPayrolls(pagination.current_page - 1)"
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
        @click="loadPayrolls(pagination.current_page + 1)"
        :disabled="pagination.current_page === pagination.last_page"
        class="pagination-btn"
      >
        Próxima
        <i class="pi pi-chevron-right"></i>
      </button>
    </div>

    <!-- Modal Generate -->
    <div v-if="showGenerateModal" class="modal-overlay" @click="closeGenerateModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Gerar Folha de Pagamento</h2>
          <button class="btn-close" @click="closeGenerateModal">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <form @submit.prevent="generatePayroll" class="modal-body">
          <div class="form-group">
            <label>Mês de Referência *</label>
            <select v-model="generateForm.reference_month" required class="form-select">
              <option value="">Selecione o mês</option>
              <option v-for="(month, index) in months" :key="index" :value="index + 1">
                {{ month }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Ano de Referência *</label>
            <select v-model="generateForm.reference_year" required class="form-select">
              <option value="">Selecione o ano</option>
              <option v-for="year in years" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>

          <div class="info-box">
            <i class="pi pi-info-circle"></i>
            <div>
              <strong>Atenção:</strong>
              <p>A folha será gerada para TODOS os colaboradores ativos. Certifique-se de que os salários base estão atualizados.</p>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeGenerateModal" class="btn-secondary" :disabled="generating">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="generating">
              <i class="pi" :class="generating ? 'pi-spin pi-spinner' : 'pi-check'"></i>
              {{ generating ? 'Gerando...' : 'Gerar Folha' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal View Details -->
    <div v-if="showViewModal && selectedPayroll" class="modal-overlay" @click="closeViewModal">
      <div class="modal-content modal-large" @click.stop>
        <div class="modal-header">
          <h2>Detalhes da Folha de Pagamento</h2>
          <button class="btn-close" @click="closeViewModal">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="payroll-detail-header">
            <div class="detail-employee">
              <div class="employee-avatar large">
                {{ getInitials(selectedPayroll.employee?.user?.name) }}
              </div>
              <div>
                <h3>{{ selectedPayroll.employee?.user?.name }}</h3>
                <p>{{ selectedPayroll.employee?.position?.title }}</p>
                <p class="text-muted">{{ selectedPayroll.employee?.department?.name }}</p>
              </div>
            </div>

            <div class="detail-period">
              <span class="period-label">Período</span>
              <span class="period-value">{{ selectedPayroll.reference_period }}</span>
            </div>
          </div>

          <div class="payroll-items">
            <h4>Vencimentos</h4>
            <div class="items-list">
              <div 
                v-for="item in getItemsByType('earning')" 
                :key="item.id"
                class="item-row earning"
              >
                <span class="item-description">{{ item.description }}</span>
                <span class="item-amount">{{ formatCurrency(item.amount) }}</span>
              </div>
            </div>

            <h4>Descontos</h4>
            <div class="items-list">
              <div 
                v-for="item in getItemsByType('deduction')" 
                :key="item.id"
                class="item-row deduction"
              >
                <span class="item-description">{{ item.description }}</span>
                <span class="item-amount">-{{ formatCurrency(item.amount) }}</span>
              </div>
            </div>

            <h4>Impostos</h4>
            <div class="items-list">
              <div 
                v-for="item in getItemsByType('tax')" 
                :key="item.id"
                class="item-row tax"
              >
                <span class="item-description">{{ item.description }}</span>
                <span class="item-amount">-{{ formatCurrency(item.amount) }}</span>
              </div>
            </div>

            <div class="total-summary">
              <div class="summary-row">
                <span>Total de Vencimentos:</span>
                <span class="earning">{{ formatCurrency(selectedPayroll.total_earnings) }}</span>
              </div>
              <div class="summary-row">
                <span>Total de Descontos:</span>
                <span class="deduction">-{{ formatCurrency(selectedPayroll.total_deductions) }}</span>
              </div>
              <div class="summary-row">
                <span>Total de Impostos:</span>
                <span class="tax">-{{ formatCurrency(selectedPayroll.total_tax) }}</span>
              </div>
              <div class="summary-row total">
                <span>TOTAL LÍQUIDO:</span>
                <span class="net">{{ formatCurrency(selectedPayroll.net_salary) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeViewModal" class="btn-secondary">Fechar</button>
          <button 
            v-if="selectedPayroll.status === 'draft'" 
            @click="approvePayroll(selectedPayroll)" 
            class="btn-primary"
          >
            <i class="pi pi-check"></i>
            Aprovar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { adminService } from '@/services/adminService'
import { useToast } from 'vue-toastification'

const toast = useToast()

const loading = ref(true)
const generating = ref(false)
const showGenerateModal = ref(false)
const showViewModal = ref(false)
const selectedPayroll = ref(null)

const payrolls = ref([])
const employees = ref([])
const pagination = ref({
  current_page: 1,
  last_page: 1,
  total: 0
})

const filters = reactive({
  status: '',
  employee_id: ''
})

const generateForm = reactive({
  reference_month: new Date().getMonth() + 1,
  reference_year: new Date().getFullYear()
})

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return [currentYear - 1, currentYear, currentYear + 1]
})

// Computed
const draftCount = computed(() => payrolls.value.filter(p => p.status === 'draft').length)
const approvedCount = computed(() => payrolls.value.filter(p => p.status === 'approved').length)
const paidCount = computed(() => payrolls.value.filter(p => p.status === 'paid').length)

// Methods
const loadPayrolls = async (page = 1) => {
  loading.value = true
  try {
    const params = {
      page,
      per_page: 15,
      ...filters
    }

    const { data } = await adminService.payroll.getAll(params)
    
    if (data.data) {
      payrolls.value = data.data
      pagination.value = {
        current_page: data.current_page,
        last_page: data.last_page,
        total: data.total
      }
    } else {
      payrolls.value = data
    }
  } catch (error) {
    console.error('Erro ao carregar:', error)
    toast.error('Erro ao carregar folhas de pagamento')
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

const openGenerateModal = () => {
  generateForm.reference_month = new Date().getMonth() + 1
  generateForm.reference_year = new Date().getFullYear()
  showGenerateModal.value = true
}

const closeGenerateModal = () => {
  showGenerateModal.value = false
}

const generatePayroll = async () => {
  generating.value = true
  try {
    const { data } = await adminService.payroll.generateMonthly(generateForm)
    toast.success(data.message || 'Folha gerada com sucesso!')
    closeGenerateModal()
    loadPayrolls()
  } catch (error) {
    console.error('Erro ao gerar:', error)
    toast.error(error.response?.data?.message || 'Erro ao gerar folha de pagamento')
  } finally {
    generating.value = false
  }
}

const viewPayroll = async (payroll) => {
  try {
    const { data } = await adminService.payroll.getById(payroll.id)
    selectedPayroll.value = data
    showViewModal.value = true
  } catch (error) {
    console.error('Erro ao carregar detalhes:', error)
    toast.error('Erro ao carregar detalhes')
  }
}

const closeViewModal = () => {
  showViewModal.value = false
  selectedPayroll.value = null
}

const approvePayroll = async (payroll) => {
  if (!confirm(`Aprovar a folha de pagamento de ${payroll.employee?.user?.name}?`)) return

  try {
    const { data } = await adminService.payroll.approve(payroll.id)
    toast.success(data.message || 'Folha aprovada!')
    closeViewModal()
    loadPayrolls()
  } catch (error) {
    console.error('Erro ao aprovar:', error)
    toast.error(error.response?.data?.message || 'Erro ao aprovar folha')
  }
}

const deletePayroll = async (payroll) => {
  if (!confirm(`Excluir a folha de pagamento de ${payroll.employee?.user?.name}?`)) return

  try {
    const { data } = await adminService.payroll.delete(payroll.id)
    toast.success(data.message || 'Folha excluída!')
    loadPayrolls()
  } catch (error) {
    console.error('Erro ao excluir:', error)
    toast.error(error.response?.data?.message || 'Erro ao excluir folha')
  }
}

const clearFilters = () => {
  filters.status = ''
  filters.employee_id = ''
  loadPayrolls(1)
}

const getItemsByType = (type) => {
  if (!selectedPayroll.value?.items) return []
  return selectedPayroll.value.items.filter(item => item.type === type)
}

const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
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

onMounted(() => {
  loadPayrolls()
  loadEmployees()
})
</script>

<style scoped>
.payroll-page {
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
  gap: 1rem;
  flex-wrap: wrap;
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

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
}

.stat-icon.total {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #2563eb;
}

.stat-icon.draft {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
}

.stat-icon.approved {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #059669;
}

.stat-icon.paid {
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
  color: #7c3aed;
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
}

.filter-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 0.95rem;
  transition: all 0.2s;
  background: white;
}

.filter-select:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
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
}

.btn-clear:hover {
  background: #e2e8f0;
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
  margin: 0 0 1.5rem 0;
}

/* Payrolls List */
.payrolls-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.payroll-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  border-left: 4px solid #cbd5e1;
}

.payroll-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.payroll-card.status-draft {
  border-left-color: #f59e0b;
}

.payroll-card.status-approved {
  border-left-color: #10b981;
}

.payroll-card.status-paid {
  border-left-color: #8b5cf6;
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
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
}

.employee-avatar.large {
  width: 64px;
  height: 64px;
  font-size: 1.5rem;
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

.payroll-period {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  color: #166534;
  font-weight: 600;
}

.payroll-values {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.value-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 0.5rem;
}

.value-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.value-amount {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
}

.value-item.net {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.net-value {
  font-size: 1.25rem;
  color: #065f46;
}

.payment-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
  padding: 0.5rem;
}

.card-footer {
  display: flex;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 2px solid #f1f5f9;
}

.btn-view,
.btn-approve,
.btn-delete {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
  background: #f1f5f9;
  color: #475569;
}

.btn-view:hover {
  background: #dbeafe;
  color: #3b82f6;
  transform: scale(1.05);
}

.btn-approve:hover {
  background: #d1fae5;
  color: #059669;
  transform: scale(1.05);
}

.btn-delete:hover {
  background: #fee2e2;
  color: #dc2626;
  transform: scale(1.05);
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
}

.pagination-btn:hover:not(:disabled) {
  background: #10b981;
  border-color: #10b981;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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
  color: #10b981;
}

.separator {
  color: #cbd5e1;
}

.total-pages {
  color: #64748b;
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

.modal-content.modal-large {
  max-width: 800px;
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
  background: #f1f5f9;
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

.form-group {
  margin-bottom: 1.5rem;

  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #475569;
    font-size: 0.9375rem;
  }
}

.form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-select:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.info-box {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;

  i {
    font-size: 1.5rem;
    color: #1e40af;
    flex-shrink: 0;
  }

  strong {
    display: block;
    color: #1e40af;
    margin-bottom: 0.25rem;
  }

  p {
    color: #1e3a8a;
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.5;
  }
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

.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Payroll Details */
.payroll-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
}

.detail-employee {
  display: flex;
  align-items: center;
  gap: 1rem;

  h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 0.25rem 0;
  }

  p {
    font-size: 0.9375rem;
    color: #64748b;
    margin: 0;
  }

  .text-muted {
    font-size: 0.875rem;
    color: #94a3b8;
  }
}

.detail-period {
  text-align: right;

  .period-label {
    display: block;
    font-size: 0.75rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.25rem;
  }

  .period-value {
    display: block;
    font-size: 1.25rem;
    font-weight: 700;
    color: #166534;
  }
}

.payroll-items {
  h4 {
    font-size: 1rem;
    font-weight: 600;
    color: #475569;
    margin: 1.5rem 0 0.75rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #f1f5f9;
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
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 0.5rem;

  .item-description {
    font-size: 0.9375rem;
    color: #475569;
  }

  .item-amount {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
  }
}

.item-row.earning {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  
  .item-amount {
    color: #065f46;
  }
}

.item-row.deduction,
.item-row.tax {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  
  .item-amount {
    color: #991b1b;
  }
}

.total-summary {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.75rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  font-size: 0.9375rem;

  span:first-child {
    color: #64748b;
    font-weight: 500;
  }

  span:last-child {
    font-weight: 700;
    color: #1e293b;
  }

  &.total {
    margin-top: 0.5rem;
    padding-top: 1rem;
    border-top: 2px solid #e2e8f0;
    font-size: 1.125rem;

    span:first-child {
      color: #1e293b;
      font-weight: 700;
    }

    .net {
      font-size: 1.5rem;
      color: #065f46;
    }
  }
}

.earning {
  color: #065f46 !important;
}

.deduction,
.tax {
  color: #991b1b !important;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .payrolls-list {
    grid-template-columns: 1fr;
  }

  .filters-row {
    flex-direction: column;
  }

  .payroll-detail-header {
    flex-direction: column;
    gap: 1rem;
  }

  .detail-period {
    text-align: left;
  }
}
</style>