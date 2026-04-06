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
        <div class="table-responsive">
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
                      <img v-if="employee.photo_url" :src="employee.photo_url" :alt="employee.full_name" class="avatar-img" />
                      <span v-else>{{ employee.first_name.charAt(0) }}{{ employee.last_name.charAt(0) }}</span>
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
                     <button @click="viewEmployee(employee.id)" class="btn-icon" title="Ver">
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
        </div>

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

    <!-- View Profile Modal -->
    <div v-if="showViewModal" class="modal-overlay" @click="showViewModal = false">
      <div class="modal profile-modal" @click.stop>
        <div class="modal-header">
          <h3>Perfil do Funcionário</h3>
          <button @click="showViewModal = false" class="close-btn">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-body profile-body">
          <div class="profile-header">
            <div class="profile-avatar-large">
              <img v-if="selectedEmployee.photo_url" :src="selectedEmployee.photo_url" :alt="selectedEmployee.full_name" />
              <div v-else class="avatar-placeholder">
                {{ selectedEmployee.first_name.charAt(0) }}{{ selectedEmployee.last_name.charAt(0) }}
              </div>
            </div>
            <div class="profile-title">
              <h2>{{ selectedEmployee.full_name }}</h2>
              <span class="profile-number">{{ selectedEmployee.employee_number }}</span>
              <span :class="`status-badge status-${selectedEmployee.status}`">{{ selectedEmployee.status }}</span>
            </div>
          </div>

          <div class="profile-sections">
            <div class="profile-card">
              <h4><i class="pi pi-user"></i> Informações Pessoais</h4>
              <div class="info-grid">
                <div class="info-item">
                  <label>Pai</label>
                  <span>{{ selectedEmployee.father_name || '-' }}</span>
                </div>
                <div class="info-item">
                  <label>Mãe</label>
                  <span>{{ selectedEmployee.mother_name || '-' }}</span>
                </div>
                <div class="info-item">
                  <label>Gênero</label>
                  <span class="capitalize">{{ selectedEmployee.gender }}</span>
                </div>
                <div class="info-item">
                  <label>Data de Nascimento</label>
                  <span>{{ formatDate(selectedEmployee.date_of_birth) }}</span>
                </div>
                <div class="info-item">
                  <label>NIF</label>
                  <span>{{ selectedEmployee.nif || '-' }}</span>
                </div>
              </div>
            </div>

            <div class="profile-card">
              <h4><i class="pi pi-id-card"></i> Contato e Endereço</h4>
              <div class="info-grid">
                <div class="info-item">
                  <label>Email</label>
                  <span>{{ selectedEmployee.email }}</span>
                </div>
                <div class="info-item">
                  <label>Telefone</label>
                  <span>{{ selectedEmployee.phone || '-' }}</span>
                </div>
                <div class="info-item full">
                  <label>Morada / Endereço</label>
                  <span>{{ selectedEmployee.address || '-' }}</span>
                </div>
              </div>
            </div>

            <div class="profile-card">
              <h4><i class="pi pi-briefcase"></i> Detalhes Profissionais</h4>
              <div class="info-grid">
                <div class="info-item">
                  <label>Departamento</label>
                  <span>{{ selectedEmployee.department?.name || '-' }}</span>
                </div>
                <div class="info-item">
                  <label>Cargo</label>
                  <span>{{ selectedEmployee.position?.title || '-' }}</span>
                </div>
                <div class="info-item">
                  <label>Tipo de Contrato</label>
                  <span class="capitalize">{{ selectedEmployee.employment_type }}</span>
                </div>
                <div class="info-item">
                  <label>Data de Admissão</label>
                  <span>{{ formatDate(selectedEmployee.hire_date) }}</span>
                </div>
                <div class="info-item">
                  <label>Salário Base</label>
                  <span class="salary-text">{{ formatCurrency(selectedEmployee.base_salary) }}</span>
                </div>
              </div>
            </div>

            <div v-if="selectedEmployee.bio" class="profile-card full-card">
              <h4><i class="pi pi-info-circle"></i> Biografia</h4>
              <p class="bio-text">{{ selectedEmployee.bio }}</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="editEmployee(selectedEmployee); showViewModal = false" class="btn-primary">
            <i class="pi pi-pencil"></i> Editar Perfil
          </button>
        </div>
      </div>
    </div>

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
          <!-- Photo Upload Section -->
          <div class="photo-upload-section">
            <ImageUpload
              v-model="form.photo_file"
              label="Foto do Funcionário"
              :initial-preview="form.photo_url"
            />
          </div>

          <div class="form-section">
            <h4 class="section-title">Informações Pessoais</h4>
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
                <label>Nome do Pai</label>
                <input v-model="form.father_name" type="text" />
              </div>
              <div class="form-group">
                <label>Nome da Mãe</label>
                <input v-model="form.mother_name" type="text" />
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>Gênero</label>
                <select v-model="form.gender">
                  <option value="male">Masculino</option>
                  <option value="female">Feminino</option>
                  <option value="other">Outro</option>
                </select>
              </div>
              <div class="form-group">
                <label>Data de Nascimento</label>
                <input v-model="form.date_of_birth" type="date" />
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
                 <label>WhatsApp</label>
                 <input v-model="form.whatsapp" type="tel" />
               </div>
               <div class="form-group">
                 <label>NIF</label>
                 <input v-model="form.nif" type="text" />
               </div>
             </div>

              <div class="form-grid">
                <div class="form-group">
                  <label>Número de Identificação Fiscal</label>
                  <input v-model="form.tax_number" type="text" />
                </div>
                <div class="form-group">
                  <label>NIF</label>
                  <input v-model="form.nif" type="text" />
                </div>
              </div>

            <div class="form-group">
              <label>Morada / Endereço</label>
              <input v-model="form.address" type="text" placeholder="Rua, Bairro, Nº..." />
            </div>
          </div>

          <div class="form-section">
            <h4 class="section-title">Estrutura e Contrato</h4>
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
                 <label>Frequência de Pagamento *</label>
                 <select v-model="form.payment_frequency" required>
                   <option value="daily">Diária</option>
                   <option value="weekly">Semanal</option>
                   <option value="bi-weekly">Quinzenal</option>
                   <option value="monthly">Mensal</option>
                   <option value="quarterly">Trimestral</option>
                   <option value="semiannual">Semestral</option>
                   <option value="annual">Anual</option>
                 </select>
               </div>
               <div class="form-group">
                 <label>Salário Base (AOA) *</label>
                 <input v-model.number="form.base_salary" type="number" min="0" required />
               </div>
             </div>

            <div class="form-grid">
              <div class="form-group">
                <label>Salário Base (AOA) *</label>
                <input v-model.number="form.base_salary" type="number" min="0" required />
              </div>
              <div class="form-group">
                <label>Data de Admissão</label>
                <input v-model="form.hire_date" type="date" />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h4 class="section-title">Biografia e Notas</h4>
            <div class="form-group">
              <label>Biografia</label>
              <textarea v-model="form.bio" rows="3" placeholder="Breve resumo sobre o funcionário..."></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="saving">
              <template v-if="saving">
                <i class="pi pi-spin pi-spinner mr-2"></i>
                Salvando...
              </template>
              <template v-else>
                Salvar
              </template>
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
import ImageUpload from '@/components/common/ImageUpload.vue'
import { useToast } from 'vue-toastification'
import { debounce } from 'lodash-es'
import { useRouter } from 'vue-router'

const router = useRouter()
const toast = useToast()

const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const showViewModal = ref(false)
const isEditing = ref(false)
const selectedEmployee = ref(null)

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
  id: null,
  first_name: '',
  last_name: '',
  father_name: '',
  mother_name: '',
  email: '',
  phone: '',
  nif: '',
  bio: '',
  gender: 'male',
  date_of_birth: '',
  address: '',
  department_id: '',
  position_id: '',
  employment_type: 'full-time',
  base_salary: 0,
  hire_date: '',
  employee_number: '',
  status: 'active',
  photo_file: null,
  photo_url: null,
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

const viewEmployee = (employeeId) => {
   router.push(`/admin/employees/${employeeId}`)
}

const editEmployee = (employee) => {
   isEditing.value = true
   Object.assign(form, {
     id: employee.id,
     first_name: employee.first_name,
     last_name: employee.last_name,
     father_name: employee.father_name || '',
     mother_name: employee.mother_name || '',
     email: employee.email,
     phone: employee.phone || '',
     whatsapp: employee.whatsapp || '',
     nif: employee.nif || '',
     tax_number: employee.tax_number || '',
     bio: employee.bio || '',
     gender: employee.gender || 'male',
     date_of_birth: employee.date_of_birth ? employee.date_of_birth.split('T')[0] : '',
     address: employee.address || '',
     department_id: employee.department_id || '',
     position_id: employee.position_id || '',
     employment_type: employee.employment_type,
     base_salary: employee.base_salary,
     hire_date: employee.hire_date ? employee.hire_date.split('T')[0] : '',
     employee_number: employee.employee_number,
     status: employee.status,
     photo_file: null,
     photo_url: employee.photo_url,
   })
   showModal.value = true
 }

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('pt-PT')
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
  }).format(value)
}

const saveEmployee = async () => {
  saving.value = true
  try {
    const formData = new FormData()
    
    // Add all form fields to FormData
    Object.keys(form).forEach(key => {
      if (key === 'photo_file') {
        if (form[key]) formData.append('photo_file', form[key])
      } else if (key === 'base_salary') {
        formData.append(key, form[key]) // O modelo no backend fará a conversão automatica via mutator
      } else if (key !== 'photo_url') {
        // Include all other fields regardless of their value (including null, undefined, empty string)
        formData.append(key, form[key])
      }
    })

    if (isEditing.value) {
      // Laravel requires _method: 'PUT' when using FormData with PUT
      formData.append('_method', 'PUT')
      await api.post(`/admin/employees/${form.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Funcionário atualizado com sucesso!')
    } else {
      await api.post('/admin/employees', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
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


const closeModal = () => {
  showModal.value = false
  resetForm()
}

const resetForm = () => {
  Object.assign(form, {
    id: null,
    first_name: '',
    last_name: '',
    father_name: '',
    mother_name: '',
    email: '',
    phone: '',
    nif: '',
    bio: '',
    gender: 'male',
    date_of_birth: '',
    address: '',
    department_id: '',
    position_id: '',
    employment_type: 'full-time',
    base_salary: 0,
    hire_date: '',
    employee_number: '',
    status: 'active',
    photo_file: null,
    photo_url: null,
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
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: #111827;
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
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #111827;
}

.modal-body {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.photo-upload-section {
  display: flex;
  justify-content: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #6366f1;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #eef2ff;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
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
.form-group select,
.form-group textarea {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s;
  background: #f9fafb;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #6366f1;
  background: white;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e5e7eb;
  position: sticky;
  bottom: 0;
  background: #f9fafb;
  z-index: 10;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  border-color: #d1d5db;
  background: #f3f4f6;
}

.mr-2 {
  margin-right: 0.5rem;
}

/* Avatar Styles */
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef2ff;
  color: #6366f1;
  font-weight: 700;
  font-size: 1.5rem;
}

/* Profile Modal Styles */
.profile-modal {
  max-width: 900px !important;
}

.profile-body {
  padding: 0 !important;
  background: #f9fafb;
}

.profile-header {
  padding: 3rem 2rem;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.profile-avatar-large {
  width: 120px;
  height: 120px;
  border-radius: 20px;
  background: white;
  padding: 4px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
}

.profile-title h2 {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
}

.profile-number {
  display: block;
  font-size: 1.125rem;
  opacity: 0.9;
  margin-bottom: 0.75rem;
}

.profile-sections {
  padding: 2rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.profile-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.profile-card h4 {
  margin: 0 0 1.25rem 0;
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.profile-card h4 i {
  color: #6366f1;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item.full {
  grid-column: span 2;
}

.info-item label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.info-item span {
  font-size: 0.9375rem;
  color: #111827;
  font-weight: 500;
}

.full-card {
  grid-column: span 2;
}

.bio-text {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #4b5563;
  margin: 0;
  white-space: pre-wrap;
}

.salary-text {
  color: #059669 !important;
  font-weight: 700 !important;
}

.capitalize {
  text-transform: capitalize;
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
  
  .modal {
    max-height: 100vh;
    border-radius: 0;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
    padding: 2rem 1rem;
  }
  
  .profile-sections {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .info-item.full {
    grid-column: span 1;
  }
}
</style>