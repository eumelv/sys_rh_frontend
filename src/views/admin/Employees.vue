<template>
  <div class="employees-page">
    <!-- Header Actions -->
    <div class="page-header">
      <div class="search-box">
        <i class="pi pi-search"></i>
        <input v-model="searchQuery" type="text" placeholder="Buscar por nome, email ou número..."
          @input="debouncedSearch" />
      </div>
      <div class="header-actions">
        <select v-model="statusFilter" @change="fetchEmployees" class="filter-select">
          <option value="">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="suspended">Suspensos</option>
          <option value="terminated">Demitidos</option>
        </select>
        <button @click="openCreateModal" class="btn-primary">
          <i class="pi pi-plus"></i>
          Novo Funcionário
        </button>
      </div>
    </div>

    <!-- Employees Table -->
    <Card>
      <div v-if="loading" class="loading-state">
        <Loading message="Carregando funcionários..." />
      </div>

      <div v-else-if="employees.length === 0" class="empty-state">
        <i class="pi pi-users"></i>
        <h3>Nenhum funcionário encontrado</h3>
        <p>Comece adicionando seu primeiro funcionário</p>
        <button @click="openCreateModal" class="btn-primary">
          Adicionar Funcionário
        </button>
      </div>

      <div v-else>
        <table class="data-table">
          <thead>
            <tr>
              <th>Funcionário</th>
              <th>Email</th>
              <th>Departamento</th>
              <th>Cargo</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="employee in employees" :key="employee.id">
              <td>
                <div class="employee-cell">
                  <div class="employee-avatar">
                    {{ employee.first_name.charAt(0) }}{{ employee.last_name.charAt(0) }}
                  </div>
                  <div>
                    <div class="employee-name">{{ employee.full_name }}</div>
                    <div class="employee-number">{{ employee.employee_number }}</div>
                  </div>
                </div>
              </td>
              <td>{{ employee.email }}</td>
              <td>{{ employee.department?.name || '-' }}</td>
              <td>{{ employee.position?.title || '-' }}</td>
              <td>
                <span :class="`status-badge status-${employee.status}`">
                  {{ employee.status }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button @click="viewEmployee(employee)" class="btn-icon" title="Ver">
                    <i class="pi pi-eye"></i>
                  </button>
                  <button @click="editEmployee(employee)" class="btn-icon" title="Editar">
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button @click="deleteEmployee(employee)" class="btn-icon btn-danger" title="Remover">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="pagination">
          <button @click="changePage(pagination.current_page - 1)" :disabled="pagination.current_page === 1"
            class="pagination-btn">
            <i class="pi pi-chevron-left"></i>
          </button>
          <span class="pagination-info">
            Página {{ pagination.current_page }} de {{ pagination.last_page }}
          </span>
          <button @click="changePage(pagination.current_page + 1)"
            :disabled="pagination.current_page === pagination.last_page" class="pagination-btn">
            <i class="pi pi-chevron-right"></i>
          </button>
        </div>
      </div>
    </Card>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditing ? 'Editar Funcionário' : 'Novo Funcionário' }}</h3>
          <button @click="closeModal" class="close-btn">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveEmployee" class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Nome *</label>
              <input v-model="form.first_name" type="text" required />
            </div>
            <div class="form-group">
              <label>Sobrenome *</label>
              <input v-model="form.last_name" type="text" required />
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Email *</label>
              <input v-model="form.email" type="email" required />
            </div>
            <div class="form-group">
              <label>Telefone</label>
              <input v-model="form.phone" type="tel" />
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Número do Funcionário *</label>
              <input v-model="form.employee_number" type="text" required />
            </div>
            <div class="form-group">
              <label>Status *</label>
              <select v-model="form.status" required>
                <option value="active">Ativo</option>
                <option value="suspended">Suspenso</option>
                <option value="terminated">Demitido</option>
              </select>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Departamento</label>
              <select v-model="form.department_id">
                <option value="">Selecione...</option>
                <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                  {{ dept.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Cargo</label>
              <select v-model="form.position_id">
                <option value="">Selecione...</option>
                <option v-for="pos in positions" :key="pos.id" :value="pos.id">
                  {{ pos.title }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Tipo de Emprego *</label>
              <select v-model="form.employment_type" required>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contrato</option>
                <option value="intern">Estagiário</option>
              </select>
            </div>
            <div class="form-group">
              <label>Salário Base (AOA) *</label>
              <input v-model.number="form.base_salary" type="number" min="0" required />
            </div>
          </div>

          <div class="form-group">
            <label>Data de Admissão</label>
            <input v-model="form.hire_date" type="date" />
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="saving">
              {{ saving ? 'Salvando...' : 'Salvar' }}
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
import { debounce } from 'lodash-es'
import { useRouter } from 'vue-router'

const router = useRouter()
const toast = useToast()

const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const isEditing = ref(false)

const employees = ref([])
const departments = ref([])
const positions = ref([])

const searchQuery = ref('')
const statusFilter = ref('')

const pagination = ref({
  current_page: 1,
  last_page: 1,
})

const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  department_id: '',
  position_id: '',
  employment_type: 'full-time',
  employment_type: 'full-time',
  base_salary: 0,
  hire_date: '',
  employee_number: '',
  status: 'active',
})

const fetchEmployees = async (page = 1) => {
  loading.value = true
  try {
    const { data } = await api.get('/admin/employees', {
      params: {
        page,
        search: searchQuery.value,
        status: statusFilter.value,
      },
    })
    employees.value = data.data
    pagination.value = {
      current_page: data.current_page,
      last_page: data.last_page,
    }
  } catch (error) {
    toast.error('Erro ao carregar funcionários')
  } finally {
    loading.value = false
  }
}

const fetchDepartments = async () => {
  try {
    const { data } = await api.get('/admin/departments')
    departments.value = data
  } catch (error) {
    console.error('Error fetching departments:', error)
  }
}

const fetchPositions = async () => {
  try {
    const { data } = await api.get('/admin/positions')
    positions.value = data
  } catch (error) {
    console.error('Error fetching positions:', error)
  }
}

const debouncedSearch = debounce(() => {
  fetchEmployees()
}, 500)

const changePage = (page) => {
  fetchEmployees(page)
}

const openCreateModal = () => {
  isEditing.value = false
  resetForm()
  showModal.value = true
}

const editEmployee = (employee) => {
  isEditing.value = true
  Object.assign(form, {
    id: employee.id,
    first_name: employee.first_name,
    last_name: employee.last_name,
    email: employee.email,
    phone: employee.phone,
    department_id: employee.department_id || '',
    position_id: employee.position_id || '',
    employment_type: employee.employment_type,
    base_salary: employee.base_salary / 100, // Convert from cents
    base_salary: employee.base_salary / 100, // Convert from cents
    hire_date: employee.hire_date,
    employee_number: employee.employee_number,
    status: employee.status,
  })
  showModal.value = true
}

const saveEmployee = async () => {
  saving.value = true
  try {
    const payload = {
      ...form,
      base_salary: form.base_salary * 100, // Convert to cents
    }

    if (isEditing.value) {
      await api.put(`/admin/employees/${form.id}`, payload)
      toast.success('Funcionário atualizado com sucesso!')
    } else {
      await api.post('/admin/employees', payload)
      toast.success('Funcionário criado com sucesso!')
    }

    closeModal()
    fetchEmployees()
  } catch (error) {
    const message = error.response?.data?.message || 'Erro ao salvar funcionário'
    toast.error(message)
  } finally {
    saving.value = false
  }
}

const deleteEmployee = async (employee) => {
  if (!confirm(`Tem certeza que deseja remover ${employee.full_name}?`)) {
    return
  }

  try {
    await api.delete(`/admin/employees/${employee.id}`)
    toast.success('Funcionário removido com sucesso!')
    fetchEmployees()
  } catch (error) {
    toast.error('Erro ao remover funcionário')
  }
}

const viewEmployee = (employee) => {
  router.push({ name: 'EmployeeDetail', params: { id: employee.id } })
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const resetForm = () => {
  Object.assign(form, {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department_id: '',
    position_id: '',
    employment_type: 'full-time',
    employment_type: 'full-time',
    base_salary: 0,
    hire_date: '',
    employee_number: '',
    status: 'active',
  })
}

onMounted(() => {
  fetchEmployees()
  fetchDepartments()
  fetchPositions()
})
</script>

<style scoped>
.employees-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: #3b82f6;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
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
  transition: transform 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

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

.empty-state h3 {
  font-size: 1.25rem;
  color: #111827;
  margin: 0 0 0.5rem;
}

.empty-state p {
  color: #6b7280;
  margin: 0 0 1.5rem;
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
  letter-spacing: 0.05em;
}

.data-table td {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  font-size: 0.875rem;
}

.employee-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.employee-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
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

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-suspended {
  background: #fef3c7;
  color: #92400e;
}

.status-terminated {
  background: #fee2e2;
  color: #991b1b;
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
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #e5e7eb;
  color: #111827;
}

.btn-danger:hover {
  background: #fee2e2;
  color: #dc2626;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.pagination-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.pagination-btn:not(:disabled):hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
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
  z-index: 9999;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #e5e7eb;
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.form-group input,
.form-group select {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: none;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>