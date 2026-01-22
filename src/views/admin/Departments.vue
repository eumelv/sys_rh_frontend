<template>
  <div class="departments-page">
    <div class="page-header">
      <h2>Departamentos</h2>
      <button @click="openCreateModal" class="btn-primary">
        <i class="pi pi-plus"></i>
        Novo Departamento
      </button>
    </div>

    <Card>
      <div v-if="loading" class="loading-state">
        <Loading message="Carregando departamentos..." />
      </div>

      <div v-else-if="departments.length === 0" class="empty-state">
        <i class="pi pi-sitemap"></i>
        <h3>Nenhum departamento encontrado</h3>
        <p>Organize sua empresa criando departamentos</p>
        <button @click="openCreateModal" class="btn-primary">
          Criar Departamento
        </button>
      </div>

      <div v-else class="departments-grid">
        <div 
          v-for="department in departments" 
          :key="department.id"
          class="department-card"
        >
          <div class="department-header">
            <div class="department-icon">
              <i class="pi pi-sitemap"></i>
            </div>
            <div class="department-info">
              <h3>{{ department.name }}</h3>
              <p v-if="department.code" class="department-code">{{ department.code }}</p>
            </div>
          </div>

          <div class="department-stats">
            <div class="stat">
              <i class="pi pi-users"></i>
              <span>{{ department.employees?.length || 0 }} funcionários</span>
            </div>
            <div v-if="department.manager" class="stat">
              <i class="pi pi-user"></i>
              <span>{{ department.manager.name }}</span>
            </div>
          </div>

          <div class="department-actions">
            <button @click="editDepartment(department)" class="btn-icon">
              <i class="pi pi-pencil"></i>
            </button>
            <button @click="deleteDepartment(department)" class="btn-icon btn-danger">
              <i class="pi pi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </Card>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditing ? 'Editar Departamento' : 'Novo Departamento' }}</h3>
          <button @click="closeModal" class="close-btn">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveDepartment" class="modal-body">
          <div class="form-group">
            <label>Nome *</label>
            <input v-model="form.name" type="text" required />
          </div>

          <div class="form-group">
            <label>Código</label>
            <input v-model="form.code" type="text" placeholder="Ex: TI, RH, FIN" />
          </div>

          <div class="form-group">
            <label>Descrição</label>
            <textarea v-model="form.description" rows="3"></textarea>
          </div>

          <div class="form-group">
            <label>Gestor</label>
            <select v-model="form.manager_id">
              <option value="">Selecione...</option>
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Departamento Pai</label>
            <select v-model="form.parent_id">
              <option value="">Nenhum (departamento principal)</option>
              <option 
                v-for="dept in departments.filter(d => d.id !== form.id)" 
                :key="dept.id" 
                :value="dept.id"
              >
                {{ dept.name }}
              </option>
            </select>
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

const toast = useToast()

const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const isEditing = ref(false)

const departments = ref([])
const users = ref([])

const form = reactive({
  name: '',
  code: '',
  description: '',
  manager_id: '',
  parent_id: '',
})

const fetchDepartments = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/admin/departments')
    departments.value = data
  } catch (error) {
    toast.error('Erro ao carregar departamentos')
  } finally {
    loading.value = false
  }
}

const fetchUsers = async () => {
  try {
    const { data } = await api.get('/admin/users')
    users.value = data.data || data
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}

const openCreateModal = () => {
  isEditing.value = false
  resetForm()
  showModal.value = true
}

const editDepartment = (department) => {
  isEditing.value = true
  Object.assign(form, {
    id: department.id,
    name: department.name,
    code: department.code || '',
    description: department.description || '',
    manager_id: department.manager_id || '',
    parent_id: department.parent_id || '',
  })
  showModal.value = true
}

const saveDepartment = async () => {
  saving.value = true
  try {
    if (isEditing.value) {
      await api.put(`/admin/departments/${form.id}`, form)
      toast.success('Departamento atualizado com sucesso!')
    } else {
      await api.post('/admin/departments', form)
      toast.success('Departamento criado com sucesso!')
    }

    closeModal()
    fetchDepartments()
  } catch (error) {
    const message = error.response?.data?.message || 'Erro ao salvar departamento'
    toast.error(message)
  } finally {
    saving.value = false
  }
}

const deleteDepartment = async (department) => {
  if (!confirm(`Tem certeza que deseja remover o departamento ${department.name}?`)) {
    return
  }

  try {
    await api.delete(`/admin/departments/${department.id}`)
    toast.success('Departamento removido com sucesso!')
    fetchDepartments()
  } catch (error) {
    const message = error.response?.data?.message || 'Erro ao remover departamento'
    toast.error(message)
  }
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const resetForm = () => {
  Object.assign(form, {
    name: '',
    code: '',
    description: '',
    manager_id: '',
    parent_id: '',
  })
}

onMounted(() => {
  fetchDepartments()
  fetchUsers()
})
</script>

<style scoped>
.departments-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.departments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.department-card {
  position: relative;
  padding: 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.2s;
}

.department-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.department-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.department-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.department-info h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.25rem;
}

.department-code {
  font-size: 0.75rem;
  color: #6b7280;
  font-family: monospace;
  background: #f3f4f6;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
  margin: 0;
}

.department-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.stat i {
  color: #9ca3af;
}

.department-actions {
  display: flex;
  gap: 0.5rem;
  position: absolute;
  top: 1rem;
  right: 1rem;
}

textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

/* Reuse modal and button styles from Employees page */
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
  max-width: 500px;
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
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
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
}

.btn-secondary:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}
</style>