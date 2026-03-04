<template>
  <div class="profile-page">
    <Card>
      <template #title>
        <div class="card-header">
          <h2>Meu Perfil</h2>
          <button v-if="!editMode" @click="editMode = true" class="btn-primary">
            <i class="pi pi-pencil"></i>
            Editar Perfil
          </button>
        </div>
      </template>

      <div v-if="loading" class="loading-state">
        <Loading />
      </div>

      <div v-else class="profile-content">
        <!-- Avatar Section -->
        <div class="avatar-section">
          <div class="avatar-large">
            <img v-if="user?.avatar" :src="user.avatar" alt="Avatar" />
            <div v-else class="avatar-placeholder">
              {{ user?.name?.charAt(0) }}
            </div>
          </div>
          <button @click="uploadAvatar" class="btn-upload">
            <i class="pi pi-camera"></i>
            Alterar Foto
          </button>
        </div>

        <!-- Form Section -->
        <form @submit.prevent="saveProfile" class="profile-form">
          <div class="section-title">Informações Pessoais</div>
          
          <div class="form-grid">
            <div class="form-group">
              <label>Nome Completo *</label>
              <input 
                v-model="form.name" 
                type="text" 
                :disabled="!editMode || saving"
                required
              />
            </div>

            <div class="form-group">
              <label>Email *</label>
              <input 
                v-model="form.email" 
                type="email" 
                :disabled="!editMode || saving"
                required
              />
            </div>

            <div class="form-group">
              <label>Telefone</label>
              <input 
                v-model="form.phone" 
                type="tel" 
                :disabled="!editMode || saving"
                placeholder="+244 900 000 000"
              />
            </div>

            <div class="form-group">
              <label>Data de Nascimento</label>
              <input 
                v-model="form.date_of_birth" 
                type="date" 
                :disabled="!editMode || saving"
              />
            </div>

            <div class="form-group">
              <label>Género</label>
              <select v-model="form.gender" :disabled="!editMode || saving">
                <option value="">Selecione...</option>
                <option value="male">Masculino</option>
                <option value="female">Feminino</option>
                <option value="other">Outro</option>
              </select>
            </div>

            <div class="form-group">
              <label>Número de Identificação</label>
              <input 
                v-model="form.id_number" 
                type="text" 
                :disabled="!editMode || saving"
                placeholder="BI/Passaporte"
              />
            </div>
          </div>

          <div class="section-title">Endereço</div>

          <div class="form-grid">
            <div class="form-group full-width">
              <label>Endereço</label>
              <input 
                v-model="form.address" 
                type="text" 
                :disabled="!editMode || saving"
                placeholder="Rua, número, bairro..."
              />
            </div>

            <div class="form-group">
              <label>Cidade</label>
              <input 
                v-model="form.city" 
                type="text" 
                :disabled="!editMode || saving"
                placeholder="Luanda"
              />
            </div>

            <div class="form-group">
              <label>Código Postal</label>
              <input 
                v-model="form.postal_code" 
                type="text" 
                :disabled="!editMode || saving"
                placeholder="0000"
              />
            </div>
          </div>

          <div class="section-title">Informações Profissionais (Somente Leitura)</div>

          <div class="form-grid readonly-section">
            <div class="form-group">
              <label>Número de Funcionário</label>
              <input 
                :value="employee?.employee_number || '-'" 
                type="text" 
                disabled
              />
            </div>

            <div class="form-group">
              <label>Departamento</label>
              <input 
                :value="employee?.department?.name || '-'" 
                type="text" 
                disabled
              />
            </div>

            <div class="form-group">
              <label>Cargo</label>
              <input 
                :value="employee?.position?.title || '-'" 
                type="text" 
                disabled
              />
            </div>

            <div class="form-group">
              <label>Data de Admissão</label>
              <input 
                :value="formatDate(employee?.hire_date)" 
                type="text" 
                disabled
              />
            </div>

            <div class="form-group">
              <label>Tipo de Emprego</label>
              <input 
                :value="getEmploymentTypeLabel(employee?.employment_type)" 
                type="text" 
                disabled
              />
            </div>

            <div class="form-group">
              <label>Status</label>
              <span class="status-badge" :class="employee?.status">
                {{ getStatusLabel(employee?.status) }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="editMode" class="form-actions">
            <button 
              type="button" 
              @click="cancelEdit" 
              class="btn-secondary"
              :disabled="saving"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="btn-primary"
              :disabled="saving"
            >
              <i class="pi" :class="saving ? 'pi-spin pi-spinner' : 'pi-check'"></i>
              {{ saving ? 'Salvando...' : 'Salvar Alterações' }}
            </button>
          </div>
        </form>

        <!-- Password Change Section -->
        <div class="password-section">
          <div class="section-title">Segurança</div>
          <button @click="showPasswordModal = true" class="btn-secondary">
            <i class="pi pi-lock"></i>
            Alterar Senha
          </button>
        </div>
      </div>
    </Card>

    <!-- Modal Alterar Senha -->
    <Modal v-if="showPasswordModal" @close="closePasswordModal">
      <template #header>
        <h3>Alterar Senha</h3>
      </template>

      <form @submit.prevent="changePassword" class="password-form">
        <div class="form-group">
          <label>Senha Atual *</label>
          <input 
            v-model="passwordForm.current_password" 
            type="password" 
            required
            placeholder="••••••••"
          />
        </div>

        <div class="form-group">
          <label>Nova Senha *</label>
          <input 
            v-model="passwordForm.password" 
            type="password" 
            required
            minlength="8"
            placeholder="••••••••"
          />
          <small>Mínimo 8 caracteres</small>
        </div>

        <div class="form-group">
          <label>Confirmar Nova Senha *</label>
          <input 
            v-model="passwordForm.password_confirmation" 
            type="password" 
            required
            placeholder="••••••••"
          />
        </div>

        <div class="modal-actions">
          <button 
            type="button" 
            @click="closePasswordModal" 
            class="btn-secondary"
            :disabled="changingPassword"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            class="btn-primary"
            :disabled="changingPassword"
          >
            <i class="pi" :class="changingPassword ? 'pi-spin pi-spinner' : 'pi-lock'"></i>
            {{ changingPassword ? 'Alterando...' : 'Alterar Senha' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/services/api'
import Card from '@/components/common/Card.vue'
import Loading from '@/components/common/Loading.vue'
import Modal from '@/components/common/Modal.vue'
import { useToast } from 'vue-toastification'
import dayjs from 'dayjs'

const toast = useToast()
const loading = ref(true)
const saving = ref(false)
const editMode = ref(false)
const showPasswordModal = ref(false)
const changingPassword = ref(false)

const user = ref(null)
const employee = ref(null)
const originalForm = ref(null)

const form = reactive({
  name: '',
  email: '',
  phone: '',
  date_of_birth: '',
  gender: '',
  id_number: '',
  address: '',
  city: '',
  postal_code: '',
})

const passwordForm = reactive({
  current_password: '',
  password: '',
  password_confirmation: '',
})

const fetchProfile = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/employee/profile')
    
    user.value = data.user || data
    employee.value = data.employee
    
    // Preencher form com dados do usuário e employee
    form.name = user.value.name || ''
    form.email = user.value.email || ''
    form.phone = user.value.phone || employee.value?.phone || ''
    form.date_of_birth = employee.value?.date_of_birth || ''
    form.gender = employee.value?.gender || ''
    form.id_number = employee.value?.id_number || ''
    form.address = employee.value?.address || ''
    form.city = employee.value?.city || ''
    form.postal_code = employee.value?.postal_code || ''
    
    // Guardar cópia original
    originalForm.value = { ...form }
    
  } catch (error) {
    console.error('Erro ao carregar perfil:', error)
    toast.error('Erro ao carregar perfil')
  } finally {
    loading.value = false
  }
}

const saveProfile = async () => {
  saving.value = true
  try {
    const { data } = await api.put('/employee/profile', form)
    
    toast.success('Perfil atualizado com sucesso!')
    
    // Atualizar dados locais
    user.value = data.user || data
    employee.value = data.employee
    originalForm.value = { ...form }
    editMode.value = false
    
  } catch (error) {
    const message = error.response?.data?.message || 'Erro ao atualizar perfil'
    toast.error(message)
  } finally {
    saving.value = false
  }
}

const cancelEdit = () => {
  // Restaurar valores originais
  Object.assign(form, originalForm.value)
  editMode.value = false
}

const changePassword = async () => {
  if (passwordForm.password !== passwordForm.password_confirmation) {
    toast.error('As senhas não conferem')
    return
  }

  changingPassword.value = true
  try {
    await api.post('/employee/change-password', passwordForm)
    
    toast.success('Senha alterada com sucesso!')
    closePasswordModal()
    
  } catch (error) {
    const message = error.response?.data?.message || 'Erro ao alterar senha'
    toast.error(message)
  } finally {
    changingPassword.value = false
  }
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  passwordForm.current_password = ''
  passwordForm.password = ''
  passwordForm.password_confirmation = ''
}

const uploadAvatar = () => {
  toast.info('Funcionalidade de upload de foto em desenvolvimento')
}

const formatDate = (date) => {
  return date ? dayjs(date).format('DD/MM/YYYY') : '-'
}

const getEmploymentTypeLabel = (type) => {
  const labels = {
    'full-time': 'Tempo Integral',
    'part-time': 'Meio Período',
    'contract': 'Contrato',
    'intern': 'Estágio',
  }
  return labels[type] || type || '-'
}

const getStatusLabel = (status) => {
  const labels = {
    active: 'Ativo',
    inactive: 'Inativo',
    suspended: 'Suspenso',
    terminated: 'Desligado',
  }
  return labels[status] || status || '-'
}

onMounted(() => {
  fetchProfile()
})
</script>

<style scoped>
.profile-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.avatar-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #e5e7eb;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 700;
}

.btn-upload {
  padding: 0.5rem 1.25rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-upload:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.form-group input,
.form-group select {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-group input:disabled,
.form-group select:disabled {
  background: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.form-group small {
  font-size: 0.8rem;
  color: #64748b;
}

.readonly-section {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 12px;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  display: inline-block;
  margin-top: 0.5rem;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.password-section {
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
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
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
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
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  border-color: #3b82f6;
  color: #3b82f6;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-state {
  padding: 4rem 2rem;
  text-align: center;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  .profile-page {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>