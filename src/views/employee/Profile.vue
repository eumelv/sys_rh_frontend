<template>
  <div class="profile-page">
    <!-- Header Banner -->
    <div class="profile-banner">
      <div class="banner-gradient"></div>
      <div class="profile-header">
        <div class="profile-avatar-section">
         <div class="avatar-wrapper">
        <div class="avatar-large">
          <img v-if="user?.avatar_url" :src="user.avatar_url" alt="Avatar" />
          <div v-else class="avatar-placeholder">
            {{ user?.name?.charAt(0) }}
          </div>
        </div>
        <button @click="uploadAvatar" class="btn-camera" title="Alterar foto">
          <i class="pi pi-camera"></i>
        </button>
        <button 
          v-if="user?.avatar" 
          @click="deleteAvatar" 
          class="btn-delete-avatar" 
          title="Remover foto">
    <i class="pi pi-trash"></i>
  </button>
</div>
          <div class="profile-info">
            <h1>{{ user?.name }}</h1>
            <p class="profile-role">{{ employee?.position?.title || 'Colaborador' }}</p>
            <p class="profile-department">
              <i class="pi pi-briefcase"></i>
              {{ employee?.department?.name || 'Departamento' }}
            </p>
          </div>
        </div>
        <div class="profile-actions">
          <button v-if="!editMode" @click="editMode = true" class="btn-edit">
            <i class="pi pi-pencil"></i>
            Editar Perfil
          </button>
          <button @click="showPasswordModal = true" class="btn-password">
            <i class="pi pi-lock"></i>
            Alterar Senha
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <i class="pi pi-spin pi-spinner"></i>
      <p>Carregando perfil...</p>
    </div>

    <div v-else class="profile-content">
      <form @submit.prevent="saveProfile" class="profile-form">
        <!-- Informações Pessoais -->
        <div class="info-card">
          <div class="card-header">
            <div class="card-title">
              <i class="pi pi-user"></i>
              <h2>Informações Pessoais</h2>
            </div>
            <span v-if="editMode" class="edit-badge">Modo de Edição</span>
          </div>

          <div class="card-body">
            <div class="form-row">
              <div class="form-field">
                <label>Nome Completo *</label>
                <input 
                  v-model="form.name" 
                  type="text" 
                  :disabled="!editMode || saving"
                  required
                />
              </div>

              <div class="form-field">
                <label>Email *</label>
                <div class="input-with-icon">
                  <i class="pi pi-envelope"></i>
                  <input 
                    v-model="form.email" 
                    type="email" 
                    :disabled="!editMode || saving"
                    required
                  />
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-field">
                <label>Telefone</label>
                <div class="input-with-icon">
                  <i class="pi pi-phone"></i>
                  <input 
                    v-model="form.phone" 
                    type="tel" 
                    :disabled="!editMode || saving"
                    placeholder="+244 900 000 000"
                  />
                </div>
              </div>

              <div class="form-field">
                <label>Data de Nascimento</label>
                <div class="input-with-icon">
                  <i class="pi pi-calendar"></i>
                  <input 
                    v-model="form.date_of_birth" 
                    type="date" 
                    :disabled="!editMode || saving"
                  />
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-field">
                <label>Género</label>
                <select v-model="form.gender" :disabled="!editMode || saving">
                  <option value="">Selecione...</option>
                  <option value="male">Masculino</option>
                  <option value="female">Feminino</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              <div class="form-field">
                <label>Número de Identificação</label>
                <div class="input-with-icon">
                  <i class="pi pi-id-card"></i>
                  <input 
                    v-model="form.id_number" 
                    type="text" 
                    :disabled="!editMode || saving"
                    placeholder="BI/Passaporte"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Endereço -->
        <div class="info-card">
          <div class="card-header">
            <div class="card-title">
              <i class="pi pi-map-marker"></i>
              <h2>Endereço</h2>
            </div>
          </div>

          <div class="card-body">
            <div class="form-row">
              <div class="form-field full">
                <label>Endereço Completo</label>
                <div class="input-with-icon">
                  <i class="pi pi-home"></i>
                  <input 
                    v-model="form.address" 
                    type="text" 
                    :disabled="!editMode || saving"
                    placeholder="Rua, número, bairro..."
                  />
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-field">
                <label>Cidade</label>
                <input 
                  v-model="form.city" 
                  type="text" 
                  :disabled="!editMode || saving"
                  placeholder="Luanda"
                />
              </div>

              <div class="form-field">
                <label>Código Postal</label>
                <input 
                  v-model="form.postal_code" 
                  type="text" 
                  :disabled="!editMode || saving"
                  placeholder="0000"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Informações Profissionais -->
        <div class="info-card readonly">
          <div class="card-header">
            <div class="card-title">
              <i class="pi pi-briefcase"></i>
              <h2>Informações Profissionais</h2>
            </div>
            <span class="readonly-badge">Somente Leitura</span>
          </div>

          <div class="card-body">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Número de Funcionário</span>
                <span class="info-value">{{ employee?.employee_number || '-' }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">Departamento</span>
                <span class="info-value">{{ employee?.department?.name || '-' }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">Cargo</span>
                <span class="info-value">{{ employee?.position?.title || '-' }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">Data de Admissão</span>
                <span class="info-value">{{ formatDate(employee?.hire_date) }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">Tipo de Emprego</span>
                <span class="info-value">{{ getEmploymentTypeLabel(employee?.employment_type) }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">Status</span>
                <span class="status-badge" :class="employee?.status">
                  <i class="pi pi-circle-fill"></i>
                  {{ getStatusLabel(employee?.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div v-if="editMode" class="form-actions">
          <button 
            type="button" 
            @click="cancelEdit" 
            class="btn-cancel"
            :disabled="saving"
          >
            <i class="pi pi-times"></i>
            Cancelar
          </button>
          <button 
            type="submit" 
            class="btn-save"
            :disabled="saving"
          >
            <i class="pi" :class="saving ? 'pi-spin pi-spinner' : 'pi-check'"></i>
            {{ saving ? 'Salvando...' : 'Salvar Alterações' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Modal Alterar Senha -->
    <div v-if="showPasswordModal" class="modal-overlay" @click="closePasswordModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="pi pi-lock"></i>
            Alterar Senha
          </h3>
          <button class="btn-close" @click="closePasswordModal">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <form @submit.prevent="changePassword" class="modal-body">
          <div class="form-field">
            <label>Senha Atual *</label>
            <input 
              v-model="passwordForm.current_password" 
              type="password" 
              required
              placeholder="Digite sua senha atual"
            />
          </div>

          <div class="form-field">
            <label>Nova Senha *</label>
            <input 
              v-model="passwordForm.password" 
              type="password" 
              required
              minlength="8"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div class="form-field">
            <label>Confirmar Nova Senha *</label>
            <input 
              v-model="passwordForm.password_confirmation" 
              type="password" 
              required
              placeholder="Digite a senha novamente"
            />
          </div>

          <div class="modal-footer">
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
              <i class="pi" :class="changingPassword ? 'pi-spin pi-spinner' : 'pi-check'"></i>
              {{ changingPassword ? 'Alterando...' : 'Confirmar' }}
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
    
    form.name = user.value.name || ''
    form.email = user.value.email || ''
    form.phone = user.value.phone || employee.value?.phone || ''
    form.date_of_birth = employee.value?.date_of_birth || ''
    form.gender = employee.value?.gender || ''
    form.id_number = employee.value?.id_number || ''
    form.address = employee.value?.address || ''
    form.city = employee.value?.city || ''
    form.postal_code = employee.value?.postal_code || ''
    
    originalForm.value = { ...form }
    
  } catch (error) {
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
    
    user.value = data.user || data
    employee.value = data.employee
    originalForm.value = { ...form }
    editMode.value = false
    
  } catch (error) {
    toast.error(error.response?.data?.message || 'Erro ao atualizar perfil')
  } finally {
    saving.value = false
  }
}

const cancelEdit = () => {
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
    toast.error(error.response?.data?.message || 'Erro ao alterar senha')
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

// ✅ Upload de Avatar
const uploadAvatar = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  
  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validar tamanho
    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem não pode ser maior que 2MB')
      return
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione apenas arquivos de imagem')
      return
    }

    const formData = new FormData()
    formData.append('avatar', file)

    try {
      const { data } = await api.post('/employee/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      toast.success(data.message)
      
      // Atualizar avatar localmente
      if (user.value) {
        user.value.avatar = data.avatar
        user.value.avatar_url = data.avatar_url
      }

    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      const message = error.response?.data?.message || 'Erro ao fazer upload da foto'
      toast.error(message)
    }
  }

  input.click()
}

// ✅ NOVO: Remover Avatar
const deleteAvatar = async () => {
  if (!confirm('Tem certeza que deseja remover sua foto de perfil?')) return

  try {
    const { data } = await api.delete('/employee/profile/avatar')
    
    toast.success(data.message)
    
    // Remover avatar localmente
    if (user.value) {
      user.value.avatar = null
      user.value.avatar_url = null
    }

  } catch (error) {
    toast.error('Erro ao remover foto')
  }
}

const formatDate = (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-'

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
  min-height: 100vh;
  background: #f8fafc;
}

/* Banner */
.profile-banner {
  position: relative;
  height: 280px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.banner-gradient {
  position: absolute;
  inset: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120"><path fill="rgba(255,255,255,0.1)" d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"/><path fill="rgba(255,255,255,0.1)" d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"/><path fill="rgba(255,255,255,0.1)" d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"/></svg>') no-repeat bottom;
  background-size: cover;
}

.profile-header {
  position: relative;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.profile-avatar-section {
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
}

.avatar-wrapper {
  position: relative;
}

.avatar-large {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 5px solid white;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  background: white;
}

.avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  font-weight: 700;
}

.btn-camera {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 40px;
  height: 40px;
  background: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
}

.btn-camera:hover {
  background: #3b82f6;
  color: white;
  transform: scale(1.1);
}

.profile-info {
  color: white;
  padding-bottom: 0.5rem;
}

.profile-info h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-role {
  font-size: 1.1rem;
  margin: 0 0 0.25rem 0;
  opacity: 0.95;
}

.profile-department {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  opacity: 0.9;
  margin: 0;
}

.profile-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-edit,
.btn-password {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 2px solid white;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-delete-avatar {
  position: absolute;
  bottom: 5px;
  left: 5px;
  width: 40px;
  height: 40px;
  background: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
  color: #ef4444;
}

.btn-delete-avatar:hover {
  background: #ef4444;
  color: white;
  transform: scale(1.1);
}
.btn-edit:hover,
.btn-password:hover {
  background: white;
  color: #667eea;
}

/* Content */
.loading-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 4rem 2rem;
  text-align: center;
  color: #64748b;
}

.loading-container i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.profile-content {
  max-width: 1400px;
  margin: -60px auto 0;
  padding: 0 2rem 2rem;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Info Cards */
.info-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.2s;
}

.info-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.info-card.readonly {
  background: #f9fafb;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid #f1f5f9;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-title i {
  font-size: 1.5rem;
  color: #3b82f6;
}

.card-title h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.edit-badge {
  padding: 0.4rem 0.875rem;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.readonly-badge {
  padding: 0.4rem 0.875rem;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.card-body {
  padding: 1.5rem;
}

/* Form */
.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field.full {
  grid-column: 1 / -1;
}

.form-field label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #374151;
}

.form-field input,
.form-field select {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s;
  background: white;
}

.form-field input:focus,
.form-field select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-field input:disabled,
.form-field select:disabled {
  background: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-icon i {
  position: absolute;
  left: 1rem;
  color: #9ca3af;
  font-size: 1rem;
}

.input-with-icon input {
  padding-left: 3rem;
  width: 100%;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 700;
  width: fit-content;
}

.status-badge i {
  font-size: 0.5rem;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #991b1b;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.btn-cancel,
.btn-save {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-cancel {
  background: #f1f5f9;
  color: #475569;
}

.btn-cancel:hover:not(:disabled) {
  background: #e2e8f0;
}

.btn-save {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.btn-save:disabled,
.btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid #f1f5f9;
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.modal-header h3 i {
  color: #3b82f6;
}

.btn-close {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
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

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f1f5f9;
}

.btn-secondary,
.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 968px) {
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }

  .profile-avatar-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .profile-actions {
    width: 100%;
  }

  .btn-edit,
  .btn-password {
    flex: 1;
    justify-content: center;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .profile-content {
    margin-top: -40px;
  }
}
</style>