<template>
  <div class="users-page">
    <div class="page-header">
      <div class="search-box">
        <i class="pi pi-search"></i>
        <input v-model="searchQuery" type="text" placeholder="Buscar utilizadores..." @input="debouncedSearch" />
      </div>
      <button @click="openCreateModal" class="btn-primary">
        <i class="pi pi-plus"></i>
        Novo Utilizador
      </button>
    </div>

    <Card>
      <div v-if="loading" class="loading-state">
        <Loading message="Carregando utilizadores..." />
      </div>

      <div v-else-if="users.length === 0" class="empty-state">
        <i class="pi pi-users"></i>
        <h3>Nenhum utilizador encontrado</h3>
        <p>Convide membros da equipa para acessar o sistema</p>
        <button @click="openCreateModal" class="btn-primary">
          Convidar Utilizador
        </button>
      </div>

      <div v-else>
        <table class="data-table">
          <thead>
            <tr>
              <th>Utilizador</th>
              <th>Email</th>
              <th>Função</th>
              <th>Último Acesso</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>
                <div class="user-cell">
                  <div class="user-avatar">
                    {{ user.name.charAt(0) }}
                  </div>
                  <div class="user-name">{{ user.name }}</div>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>
                <span class="role-badge">
                  {{ getRoleName(user.roles) }}
                </span>
              </td>
              <td>
                <span v-if="user.last_login_at" class="text-muted">
                  {{ formatDate(user.last_login_at) }}
                </span>
                <span v-else class="text-muted">Nunca</span>
              </td>
              <td>
                <span :class="`status-badge ${user.is_active ? 'status-active' : 'status-inactive'}`">
                  {{ user.is_active ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button @click="editUser(user)" class="btn-icon" title="Editar">
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button @click="resetPassword(user)" class="btn-icon" title="Reset Senha">
                    <i class="pi pi-key"></i>
                  </button>
                  <button @click="deleteUser(user)" class="btn-icon btn-danger" title="Remover"
                    :disabled="user.id === currentUserId">
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

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditing ? 'Editar Utilizador' : 'Novo Utilizador' }}</h3>
          <button @click="closeModal" class="close-btn">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveUser" class="modal-body">
          <div class="form-group">
            <label>Nome *</label>
            <input v-model="form.name" type="text" required />
          </div>

          <div class="form-group">
            <label>Email *</label>
            <input v-model="form.email" type="email" required />
          </div>

          <div class="form-group">
            <label>Função *</label>
            <select v-model="form.role" required>
              <option value="">Selecione...</option>
              <option value="admin">Administrador</option>
              <option value="manager">Gestor</option>
              <option value="hr">RH</option>
              <option value="finance">Financeiro</option>
              <option value="employee">Funcionário</option>
            </select>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.is_active" />
              <span>Utilizador ativo</span>
            </label>
          </div>

          <div v-if="!isEditing" class="info-box">
            <i class="pi pi-info-circle"></i>
            <span>Uma senha temporária será gerada e exibida após criar o utilizador.</span>
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

    <!-- Password Modal -->
    <div v-if="showPasswordModal" class="modal-overlay" @click="showPasswordModal = false">
      <div class="modal modal-sm" @click.stop>
        <div class="modal-header">
          <h3>Senha Temporária</h3>
          <button @click="showPasswordModal = false" class="close-btn">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="password-display">
            <div class="password-label">Senha gerada:</div>
            <div class="password-value">{{ temporaryPassword }}</div>
            <button @click="copyPassword" class="btn-copy">
              <i class="pi pi-copy"></i>
              Copiar
            </button>
          </div>
          <div class="info-box">
            <i class="pi pi-info-circle"></i>
            <span>Guarde esta senha. Ela não será exibida novamente.</span>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="showPasswordModal = false" class="btn-primary">
            Fechar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import Card from '@/components/common/Card.vue'
import Loading from '@/components/common/Loading.vue'
import { useToast } from 'vue-toastification'
import { debounce } from 'lodash-es'
import dayjs from 'dayjs'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const showPasswordModal = ref(false)
const isEditing = ref(false)

const users = ref([])
const searchQuery = ref('')
const temporaryPassword = ref('')

const pagination = ref({
  current_page: 1,
  last_page: 1,
})

const currentUserId = computed(() => authStore.user?.id)

const form = reactive({
  name: '',
  email: '',
  role: '',
  is_active: true,
})

const fetchUsers = async (page = 1) => {
  loading.value = true
  try {
    const { data } = await api.get('/admin/users', {
      params: {
        page,
        search: searchQuery.value,
      },
    })
    users.value = data.data
    pagination.value = {
      current_page: data.current_page,
      last_page: data.last_page,
    }
  } catch (error) {
    toast.error('Erro ao carregar utilizadores')
  } finally {
    loading.value = false
  }
}

const debouncedSearch = debounce(() => {
  fetchUsers()
}, 500)

const changePage = (page) => {
  fetchUsers(page)
}

const openCreateModal = () => {
  isEditing.value = false
  resetForm()
  showModal.value = true
}

const editUser = (user) => {
  isEditing.value = true
  Object.assign(form, {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.roles?.[0]?.name || '',
    is_active: user.is_active,
  })
  showModal.value = true
}

const saveUser = async () => {
  saving.value = true
  try {
    if (isEditing.value) {
      await api.put(`/admin/users/${form.id}`, form)
      toast.success('Utilizador atualizado com sucesso!')
      closeModal()
    } else {
      const { data } = await api.post('/admin/users', {
        ...form,
        send_invite: true,
      })
      temporaryPassword.value = data.temporary_password
      toast.success('Utilizador criado com sucesso!')
      closeModal()
      showPasswordModal.value = true
    }

    fetchUsers()
  } catch (error) {
    const message = error.response?.data?.message || 'Erro ao salvar utilizador'
    toast.error(message)
  } finally {
    saving.value = false
  }
}

const resetPassword = async (user) => {
  if (!confirm(`Resetar senha de ${user.name}?`)) {
    return
  }

  try {
    const { data } = await api.post(`/admin/users/${user.id}/reset-password`)
    temporaryPassword.value = data.temporary_password
    toast.success('Senha resetada com sucesso!')
    showPasswordModal.value = true
  } catch (error) {
    toast.error('Erro ao resetar senha')
  }
}

const deleteUser = async (user) => {
  if (!confirm(`Tem certeza que deseja remover ${user.name}?`)) {
    return
  }

  try {
    await api.delete(`/admin/users/${user.id}`)
    toast.success('Utilizador removido com sucesso!')
    fetchUsers()
  } catch (error) {
    const message = error.response?.data?.message || 'Erro ao remover utilizador'
    toast.error(message)
  }
}

const copyPassword = () => {
  navigator.clipboard.writeText(temporaryPassword.value)
  toast.success('Senha copiada!')
}

const getRoleName = (roles) => {
  if (!roles || roles.length === 0) return 'Sem função'

  const roleNames = {
    'admin': 'Administrador',
    'manager': 'Gestor',
    'hr': 'RH',
    'finance': 'Financeiro',
    'employee': 'Funcionário',
  }

  // roles might be objects or just strings depending on backend implementation
  const roleName = typeof roles[0] === 'string' ? roles[0] : roles[0].name
  return roleNames[roleName] || roleName
}

const formatDate = (date) => {
  return dayjs(date).format('DD/MM/YYYY HH:mm')
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const resetForm = () => {
  Object.assign(form, {
    name: '',
    email: '',
    role: '',
    is_active: true,
  })
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.users-page {
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

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
}

.user-name {
  font-weight: 600;
  color: #111827;
}

.role-badge {
  background: #eff6ff;
  color: #1e40af;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.text-muted {
  color: #6b7280;
  font-size: 0.875rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-inactive {
  background: #f3f4f6;
  color: #6b7280;
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
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
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

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
}

.info-box {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: #eff6ff;
  border-radius: 8px;
  color: #1e40af;
  font-size: 0.875rem;
}

.password-display {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  border: 2px dashed #e2e8f0;
  margin-bottom: 1rem;
}

.password-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.password-value {
  font-family: monospace;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
}

.btn-copy {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-copy:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
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

.modal-sm {
  max-width: 400px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: none;
  }
}
</style>
