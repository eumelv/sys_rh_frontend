<template>
  <div class="generate-payroll-page">
    <div class="page-header">
      <div class="header-breadcrumb">
        <router-link to="/admin/payroll" class="breadcrumb-item">
          <i class="pi pi-chevron-left"></i>
          Voltar para Folha de Pagamento
        </router-link>
      </div>
      <div class="header-content">
        <div class="header-title">
          <i class="pi pi-cog"></i>
          <div>
            <h1>Gerar Folha Salarial</h1>
            <p class="subtitle">Processamento mensal de vencimentos e descontos</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Stepper -->
    <div class="stepper-nav">
      <div 
        v-for="(step, index) in steps" 
        :key="index"
        class="step-item"
        :class="{ active: currentStep === step.id, completed: currentStep > step.id }"
      >
        <div class="step-number">{{ step.id }}</div>
        <div class="step-label">{{ step.label }}</div>
      </div>
    </div>

    <div class="step-content-card">
      <!-- Step 1: Period -->
      <div v-if="currentStep === 1" class="step-pane">
        <div class="pane-header">
          <h2>Selecione o Período</h2>
          <p>Defina o mês e ano de referência para o processamento.</p>
        </div>
        
        <div class="period-selectors">
          <div class="form-group">
            <label>Mês de Referência</label>
            <div class="months-grid">
              <button 
                v-for="(month, index) in months" 
                :key="index"
                @click="form.reference_month = index + 1"
                class="month-btn"
                :class="{ active: form.reference_month === index + 1 }"
              >
                {{ month.substring(0, 3) }}
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>Ano de Referência</label>
            <select v-model="form.reference_year" class="form-select large">
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
        </div>

        <div class="action-footer">
          <button @click="nextStep" class="btn-primary" :disabled="!form.reference_month || !form.reference_year">
            Próximo Passo
            <i class="pi pi-arrow-right"></i>
          </button>
        </div>
      </div>

      <!-- Step 2: Method -->
      <div v-if="currentStep === 2" class="step-pane fade-in">
        <div class="pane-header">
          <h2>Modo de Geração</h2>
          <p>Como você deseja processar a folha para {{ getMonthName(form.reference_month) }} de {{ form.reference_year }}?</p>
        </div>

        <div class="method-cards">
          <div 
            class="method-card" 
            :class="{ active: form.mode === 'all' }"
            @click="form.mode = 'all'"
          >
            <div class="method-icon all">
              <i class="pi pi-users"></i>
            </div>
            <div class="method-info">
              <h3>Todos os Colaboradores</h3>
              <p>Processar folha para todos os funcionários ativos da empresa.</p>
            </div>
            <div class="method-radio">
              <div class="radio-inner"></div>
            </div>
          </div>

          <div 
            class="method-card" 
            :class="{ active: form.mode === 'selective' }"
            @click="form.mode = 'selective'"
          >
            <div class="method-icon selective">
              <i class="pi pi-user-plus"></i>
            </div>
            <div class="method-info">
              <h3>Seleção Personalizada</h3>
              <p>Escolha manualmente quais funcionários terão a folha gerada.</p>
            </div>
            <div class="method-radio">
              <div class="radio-inner"></div>
            </div>
          </div>
        </div>

        <div class="action-footer">
          <button @click="prevStep" class="btn-secondary">Voltar</button>
          <button @click="handleModeSelection" class="btn-primary">
            {{ form.mode === 'selective' ? 'Selecionar Colaboradores' : 'Revisar e Gerar' }}
            <i class="pi pi-arrow-right"></i>
          </button>
        </div>
      </div>

      <!-- Step 3: Selection -->
      <div v-if="currentStep === 3" class="step-pane fade-in">
        <div class="pane-header">
          <h2>Selecionar Colaboradores</h2>
          <p>Selecione os funcionários para os quais deseja gerar a folha salarial.</p>
        </div>

        <div class="selection-tools">
          <div class="search-box">
            <i class="pi pi-search"></i>
            <input v-model="searchQuery" type="text" placeholder="Buscar por nome, número ou cargo...">
          </div>
          <div class="selection-stats">
            <span>{{ selectedEmployees.length }} selecionados</span>
            <button @click="toggleSelectAll" class="btn-text">
              {{ allSelected ? 'Desmarcar Todos' : 'Selecionar Todos' }}
            </button>
          </div>
        </div>

        <div class="employees-list-container">
          <div v-if="loadingEmployees" class="loading-inline">
            <i class="pi pi-spin pi-spinner"></i>
            Carregando funcionários...
          </div>
          <table v-else class="employee-table">
            <thead>
              <tr>
                <th width="50">
                  <input type="checkbox" :checked="allSelected" @change="toggleSelectAll">
                </th>
                <th>Colaborador</th>
                <th>Departamento / Cargo</th>
                <th class="text-right">Salário Base</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="employee in filteredEmployees" 
                :key="employee.id"
                :class="{ selected: isSelected(employee.id) }"
                @click="toggleEmployee(employee.id)"
              >
                <td>
                  <input type="checkbox" :checked="isSelected(employee.id)" @click.stop="toggleEmployee(employee.id)">
                </td>
                <td>
                  <div class="employee-item">
                    <div class="emp-avatar">
                      <img v-if="employee.photo_url" :src="employee.photo_url" :alt="employee.name">
                      <span v-else>{{ getInitials(employee.name) }}</span>
                    </div>
                    <div class="emp-info">
                      <span class="emp-name">{{ employee.name }}</span>
                      <span class="emp-number">#{{ employee.employee_number }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="dept-pos">
                    <span class="dept">{{ employee.department }}</span>
                    <span class="pos">{{ employee.position }}</span>
                  </div>
                </td>
                <td class="text-right font-bold">
                  {{ formatCurrency(employee.base_salary) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="action-footer">
          <button @click="prevStep" class="btn-secondary" :disabled="processing">Voltar</button>
          <button @click="nextStep" class="btn-primary" :disabled="selectedEmployees.length === 0 || processing">
            Confirmar Seleção ({{ selectedEmployees.length }})
            <i class="pi pi-arrow-right"></i>
          </button>
        </div>
      </div>

      <!-- Step 4: Review -->
      <div v-if="currentStep === 4" class="step-pane fade-in">
        <div class="pane-header">
          <h2>Revisão Final</h2>
          <p>Confira os detalhes antes de iniciar o processamento.</p>
        </div>

        <div class="review-summary">
          <div class="summary-card">
            <div class="summary-item">
              <span class="label">Período</span>
              <span class="value">{{ getMonthName(form.reference_month) }} / {{ form.reference_year }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Modo</span>
              <span class="value">{{ form.mode === 'all' ? 'Todos os Colaboradores' : 'Seleção Manual' }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Total de Colaboradores</span>
              <span class="value highlighted">{{ totalToProcess }}</span>
            </div>
          </div>

          <div class="info-alert">
            <i class="pi pi-info-circle"></i>
            <div class="info-text">
              <p><strong>Importante:</strong> Ao processar, o sistema calculará automaticamente o <strong>INSS (3%)</strong> e o <strong>IRT</strong> conforme a tabela vigente de Angola.</p>
              <p>As folhas serão geradas inicialmente como <strong>Rascunho</strong> para que você possa revisar individualmente antes de aprovar.</p>
            </div>
          </div>
        </div>

        <div class="action-footer">
          <button @click="prevStep" class="btn-secondary" :disabled="processing">Voltar</button>
          <button @click="processPayroll" class="btn-generate" :disabled="processing">
            <i class="pi" :class="processing ? 'pi-spin pi-spinner' : 'pi-bolt'"></i>
            {{ processing ? 'Processando...' : 'Iniciar Geração de Folha' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Processing Overlay -->
    <div v-if="processing" class="processing-overlay">
      <div class="processing-card">
        <div class="loader"></div>
        <h3>Processando Folha Salarial</h3>
        <p>Aguarde enquanto calculamos os valores para {{ totalToProcess }} colaboradores...</p>
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
      </div>
    </div>
    
    <!-- Duplication Warning Modal -->
    <ConfirmModal
      :show="duplicateState.show"
      title="Atenção: Folhas Duplicadas"
      :message="duplicateState.message"
      variant="warning"
      icon="pi pi-exclamation-circle"
      confirm-text="Prosseguir Mesmo Assim"
      cancel-text="Cancelar e Revisar"
      @close="duplicateState.show = false"
      @confirm="executeGeneration"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { adminService } from '@/services/adminService'
import { useToast } from 'vue-toastification'
import ConfirmModal from '@/components/common/ConfirmModal.vue'

const router = useRouter()
const toast = useToast()

const currentStep = ref(1)
const loadingEmployees = ref(false)
const processing = ref(false)
const employees = ref([])
const selectedEmployees = ref([])
const searchQuery = ref('')

// Duplicate Warning State
const duplicateState = reactive({
  show: false,
  message: '',
  data: {} // To pass to execution
})

const steps = [
  { id: 1, label: 'Período' },
  { id: 2, label: 'Modo' },
  { id: 3, label: 'Seleção' },
  { id: 4, label: 'Revisão' }
]

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return [currentYear - 2, currentYear - 1, currentYear, currentYear + 1]
})

const form = reactive({
  reference_month: new Date().getMonth() + 1,
  reference_year: new Date().getFullYear(),
  mode: 'all'
})

// Employees data
const loadEmployees = async () => {
  loadingEmployees.value = true
  try {
    const { data } = await adminService.payroll.getEmployeesForSelection()
    employees.value = data
  } catch (error) {
    console.error('Erro ao carregar colaboradores:', error)
    toast.error('Erro ao carregar lista de colaboradores')
  } finally {
    loadingEmployees.value = false
  }
}

// Selection logic
const filteredEmployees = computed(() => {
  if (!searchQuery.value) return employees.value
  const query = searchQuery.value.toLowerCase()
  return employees.value.filter(e => 
    e.name.toLowerCase().includes(query) || 
    e.employee_number.toLowerCase().includes(query) ||
    e.position.toLowerCase().includes(query)
  )
})

const isSelected = (id) => selectedEmployees.value.includes(id)

const toggleEmployee = (id) => {
  const index = selectedEmployees.value.indexOf(id)
  if (index > -1) {
    selectedEmployees.value.splice(index, 1)
  } else {
    selectedEmployees.value.push(id)
  }
}

const allSelected = computed(() => {
  return filteredEmployees.value.length > 0 && 
         filteredEmployees.value.every(e => selectedEmployees.value.includes(e.id))
})

const toggleSelectAll = () => {
  if (allSelected.value) {
    // Unselect only filtered
    const filteredIds = filteredEmployees.value.map(e => e.id)
    selectedEmployees.value = selectedEmployees.value.filter(id => !filteredIds.includes(id))
  } else {
    // Select all filtered
    filteredEmployees.value.forEach(e => {
      if (!selectedEmployees.value.includes(e.id)) {
        selectedEmployees.value.push(e.id)
      }
    })
  }
}

const totalToProcess = computed(() => {
  return form.mode === 'all' ? employees.value.length : selectedEmployees.value.length
})

// Stepper navigation
const nextStep = () => {
  if (currentStep.value < 4) currentStep.value++
}

const prevStep = () => {
  if (currentStep.value > 1) {
    if (currentStep.value === 4 && form.mode === 'all') {
      currentStep.value = 2 // Skip Step 3 if mode all
    } else {
      currentStep.value--
    }
  }
}

const handleModeSelection = () => {
  if (form.mode === 'selective') {
    loadEmployees()
    currentStep.value = 3
  } else {
    // Skip to review
    loadEmployees() // Still need employees count
    currentStep.value = 4
  }
}

// Action
const processPayroll = async () => {
  processing.value = true
  try {
    // 1. Check for duplicates first
    const checkData = {
      reference_month: form.reference_month,
      reference_year: form.reference_year,
      employee_ids: form.mode === 'all' ? [] : selectedEmployees.value
    }

    const { data } = await adminService.payroll.checkExisting(checkData)

    if (data.has_duplicates) {
      processing.value = false
      const names = data.duplicates.map(d => d.name || d.full_name).filter(Boolean)
      let namesText = ""
      
      if (names.length <= 3) {
        namesText = names.join(', ')
      } else {
        namesText = `${names.slice(0, 3).join(', ')} e mais ${names.length - 3} colaboradores`
      }

      duplicateState.message = `Já existem folhas de pagamento geradas para: ${namesText}. Deseja prosseguir e gerar novamente?`
      duplicateState.show = true
      return
    }

    await executeGeneration()
  } catch (error) {
    console.error('Erro ao verificar duplicidade:', error)
    processing.value = false
    toast.error('Erro ao validar processamento')
  }
}

const executeGeneration = async () => {
  duplicateState.show = false
  processing.value = true
  
  try {
    let response;
    if (form.mode === 'all') {
      response = await adminService.payroll.generateMonthly({
        reference_month: form.reference_month,
        reference_year: form.reference_year
      })
    } else {
      response = await adminService.payroll.generateSelected({
        reference_month: form.reference_month,
        reference_year: form.reference_year,
        employee_ids: selectedEmployees.value
      })
    }

    toast.success(response.data.message || 'Folha processada com sucesso!')
    router.push('/admin/payroll')
  } catch (error) {
    console.error('Erro ao processar:', error)
    toast.error(error.response?.data?.message || 'Erro ao processar folha de pagamento')
  } finally {
    processing.value = false
  }
}

// Helpers
const getMonthName = (m) => months[m - 1]
const formatCurrency = (val) => {
  return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(val)
}
const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

onMounted(() => {
  // initial load of count if needed
})
</script>

<style scoped>
.generate-payroll-page {
  max-width: 1000px;
  margin: 0 auto;
  padding-bottom: 5rem;
}

/* Header */
.page-header {
  margin-bottom: 2rem;
}

.header-breadcrumb {
  margin-bottom: 1.5rem;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.breadcrumb-item:hover {
  color: #10b981;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.header-title > i {
  font-size: 2.5rem;
  color: #10b981;
  background: white;
  padding: 0.75rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.header-title h1 {
  font-size: 1.875rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.subtitle {
  color: #64748b;
  margin: 0.25rem 0 0 0;
}

/* Stepper */
.stepper-nav {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2.5rem;
  position: relative;
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.stepper-nav::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 3rem;
  right: 3rem;
  height: 2px;
  background: #e2e8f0;
  transform: translateY(-50%);
  z-index: 1;
}

.step-item {
  position: relative;
  z-index: 2;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1rem;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  border: 4px solid white;
  box-shadow: 0 0 0 2px #e2e8f0;
  transition: all 0.3s;
}

.step-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
}

.step-item.active .step-number {
  background: #10b981;
  color: white;
  box-shadow: 0 0 0 2px #10b981;
}

.step-item.active .step-label {
  color: #10b981;
}

.step-item.completed .step-number {
  background: #10b981;
  color: white;
  box-shadow: 0 0 0 2px #10b981;
}

.step-item.completed .step-number::after {
  content: '\e909';
  font-family: 'primeicons';
}

/* Content Card */
.step-content-card {
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-height: 400px;
}

.step-pane {
  padding: 3rem;
}

.pane-header {
  margin-bottom: 2.5rem;
  text-align: center;
}

.pane-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.pane-header p {
  color: #64748b;
}

/* Step 1 Period selectors */
.period-selectors {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 500px;
  margin: 0 auto;
}

.months-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.month-btn {
  padding: 0.75rem;
  border: 2px solid #f1f5f9;
  background: white;
  border-radius: 0.75rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.month-btn:hover {
  border-color: #10b981;
  background: #f0fdf4;
}

.month-btn.active {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

.form-select.large {
  width: 100%;
  padding: 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  border: 2px solid #e2e8f0;
  border-radius: 1rem;
}

/* Step 2 Method cards */
.method-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.method-card {
  padding: 2rem;
  border: 2px solid #f1f5f9;
  border-radius: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.method-card:hover {
  border-color: #10b981;
  background: #f0fdf4;
}

.method-card.active {
  border-color: #10b981;
  background: #f0fdf4;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
}

.method-icon {
  width: 60px;
  height: 60px;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.method-icon.all {
  background: #dcfce7;
  color: #166534;
}

.method-icon.selective {
  background: #dbeafe;
  color: #1e40af;
}

.method-info h3 {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: #1e293b;
}

.method-info p {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

.method-radio {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
}

.method-card.active .method-radio {
  border-color: #10b981;
}

.radio-inner {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: transparent;
  transition: all 0.2s;
}

.method-card.active .radio-inner {
  background: #10b981;
}

/* Step 3 Selection Table */
.selection-tools {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.search-box {
  position: relative;
  flex: 1;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
}

.selection-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.btn-text {
  color: #10b981;
  background: transparent;
  border: none;
  font-weight: 700;
  cursor: pointer;
}

.employees-list-container {
  max-height: 400px;
  overflow-y: auto;
  border: 2px solid #f1f5f9;
  border-radius: 1rem;
}

.employee-table {
  width: 100%;
  border-collapse: collapse;
}

.employee-table th {
  background: #f8fafc;
  text-align: left;
  padding: 1rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #64748b;
  position: sticky;
  top: 0;
  z-index: 5;
}

.employee-table td {
  padding: 1rem;
  border-top: 1px solid #f1f5f9;
  transition: all 0.2s;
}

.employee-table tr:hover td {
  background: #f8fafc;
}

.employee-table tr.selected td {
  background: #f0fdf4;
}

.employee-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.emp-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-weight: 700;
  font-size: 0.75rem;
  color: #64748b;
}

.emp-name {
  display: block;
  font-weight: 700;
  color: #1e293b;
}

.emp-number {
  font-size: 0.75rem;
  color: #94a3b8;
}

.dept-pos .dept {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.dept-pos .pos {
  font-size: 0.75rem;
  color: #64748b;
}

/* Step 4 Review & Processing */
.review-summary {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.summary-card {
  background: #f8fafc;
  padding: 2rem;
  border-radius: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-item .label {
  color: #64748b;
  font-weight: 500;
}

.summary-item .value {
  font-weight: 700;
  color: #1e293b;
}

.summary-item .value.highlighted {
  font-size: 1.5rem;
  color: #10b981;
}

.info-alert {
  background: #fffbeb;
  border: 1px solid #fde68a;
  padding: 1.5rem;
  border-radius: 1rem;
  display: flex;
  gap: 1rem;
}

.info-alert i {
  color: #d97706;
  font-size: 1.25rem;
  margin-top: 0.25rem;
}

.info-text p {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #92400e;
}

/* Common Actions */
.action-footer {
  margin-top: 3rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn-primary, .btn-secondary, .btn-generate {
  padding: 1rem 2rem;
  border-radius: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #10b981;
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-2px);
}

.btn-primary:disabled {
  background: #e2e8f0;
  color: #94a3b8;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: none;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-generate {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  font-size: 1.125rem;
  box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.4);
}

.btn-generate:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 20px -3px rgba(16, 185, 129, 0.5);
}

/* Processing Overlay */
.processing-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.processing-card {
  background: white;
  padding: 3rem;
  border-radius: 2rem;
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.loader {
  width: 60px;
  height: 60px;
  border: 6px solid #f1f5f9;
  border-top-color: #10b981;
  border-radius: 50%;
  margin: 0 auto 2rem;
  animation: spin 1s linear infinite;
}

.processing-card h3 {
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
  color: #1e293b;
}

.processing-card p {
  color: #64748b;
  margin-bottom: 2rem;
}

.progress-bar {
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #10b981;
  width: 60%; /* Animation simulation */
  animation: progress 2s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes progress {
  0% { width: 0; margin-left: 0; }
  50% { width: 100%; margin-left: 0; }
  100% { width: 0; margin-left: 100%; }
}

.fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.text-right { text-align: right; }
.font-bold { font-weight: 700; }
</style>
