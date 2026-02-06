<template>
  <div class="settings-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <i class="pi pi-cog"></i>
          <div>
            <h1>Definições</h1>
            <p class="subtitle">Configure suas preferências e informações pessoais</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Navigation -->
    <div class="settings-container">
      <div class="settings-sidebar">
        <button
          v-for="section in sections"
          :key="section.id"
          @click="activeSection = section.id"
          class="settings-nav-item"
          :class="{ 'active': activeSection === section.id }"
        >
          <i :class="section.icon"></i>
          <span>{{ section.label }}</span>
        </button>
      </div>

      <div class="settings-content">
        <!-- Perfil Pessoal -->
        <div v-show="activeSection === 'profile'" class="settings-section">
          <div class="section-header">
            <h2>Informações Pessoais</h2>
            <p>Atualize suas informações básicas</p>
          </div>

          <form @submit.prevent="saveProfile" class="settings-form">
            <div class="form-row">
              <div class="form-group">
                <label for="fullName">Nome Completo *</label>
                <input
                  id="fullName"
                  v-model="profileForm.fullName"
                  type="text"
                  class="form-control"
                  required
                />
              </div>

              <div class="form-group">
                <label for="email">Email *</label>
                <input
                  id="email"
                  v-model="profileForm.email"
                  type="email"
                  class="form-control"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="phone">Telefone</label>
                <input
                  id="phone"
                  v-model="profileForm.phone"
                  type="tel"
                  class="form-control"
                  placeholder="+351 123 456 789"
                />
              </div>

              <div class="form-group">
                <label for="birthdate">Data de Nascimento</label>
                <input
                  id="birthdate"
                  v-model="profileForm.birthdate"
                  type="date"
                  class="form-control"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="address">Endereço</label>
              <textarea
                id="address"
                v-model="profileForm.address"
                rows="3"
                class="form-control"
                placeholder="Rua, número, complemento, cidade, código postal"
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="resetProfile">
                Cancelar
              </button>
              <button type="submit" class="btn-primary" :disabled="savingProfile">
                <i class="pi pi-spin pi-spinner" v-if="savingProfile"></i>
                <i class="pi pi-check" v-else></i>
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>

        <!-- Segurança -->
        <div v-show="activeSection === 'security'" class="settings-section">
          <div class="section-header">
            <h2>Segurança</h2>
            <p>Gerencie sua senha e configurações de segurança</p>
          </div>

          <form @submit.prevent="changePassword" class="settings-form">
            <div class="form-group">
              <label for="currentPassword">Senha Atual *</label>
              <div class="password-input">
                <input
                  id="currentPassword"
                  v-model="securityForm.currentPassword"
                  :type="showCurrentPassword ? 'text' : 'password'"
                  class="form-control"
                  required
                />
                <button
                  type="button"
                  @click="showCurrentPassword = !showCurrentPassword"
                  class="password-toggle"
                >
                  <i :class="showCurrentPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="newPassword">Nova Senha *</label>
              <div class="password-input">
                <input
                  id="newPassword"
                  v-model="securityForm.newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  class="form-control"
                  required
                  minlength="8"
                />
                <button
                  type="button"
                  @click="showNewPassword = !showNewPassword"
                  class="password-toggle"
                >
                  <i :class="showNewPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                </button>
              </div>
              <small class="form-text">Mínimo de 8 caracteres</small>
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirmar Nova Senha *</label>
              <div class="password-input">
                <input
                  id="confirmPassword"
                  v-model="securityForm.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  class="form-control"
                  required
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="password-toggle"
                >
                  <i :class="showConfirmPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                </button>
              </div>
            </div>

            <div v-if="passwordError" class="alert-error">
              <i class="pi pi-times-circle"></i>
              {{ passwordError }}
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="resetSecurity">
                Cancelar
              </button>
              <button type="submit" class="btn-primary" :disabled="savingSecurity">
                <i class="pi pi-spin pi-spinner" v-if="savingSecurity"></i>
                <i class="pi pi-lock" v-else></i>
                Alterar Senha
              </button>
            </div>
          </form>

          <!-- Two Factor Authentication -->
          <div class="security-option">
            <div class="option-header">
              <div class="option-info">
                <h3>Autenticação de Dois Fatores</h3>
                <p>Adicione uma camada extra de segurança à sua conta</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="twoFactorEnabled" @change="toggleTwoFactor">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- Notificações -->
        <div v-show="activeSection === 'notifications'" class="settings-section">
          <div class="section-header">
            <h2>Notificações</h2>
            <p>Configure como você quer receber notificações</p>
          </div>

          <div class="notification-options">
            <div class="notification-category">
              <h3>Notificações por Email</h3>
              
              <div class="notification-item">
                <div class="notification-info">
                  <strong>Novos Comunicados</strong>
                  <p>Receba emails quando houver novos comunicados da empresa</p>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" v-model="notificationSettings.emailAnnouncements">
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="notification-item">
                <div class="notification-info">
                  <strong>Novos Documentos</strong>
                  <p>Receba emails quando novos documentos forem disponibilizados</p>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" v-model="notificationSettings.emailDocuments">
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="notification-item">
                <div class="notification-info">
                  <strong>Status de Solicitações</strong>
                  <p>Receba atualizações sobre suas solicitações</p>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" v-model="notificationSettings.emailRequests">
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="notification-item">
                <div class="notification-info">
                  <strong>Lembretes de Férias</strong>
                  <p>Receba lembretes sobre períodos de férias pendentes</p>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" v-model="notificationSettings.emailLeaveReminders">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div class="notification-category">
              <h3>Notificações no Sistema</h3>
              
              <div class="notification-item">
                <div class="notification-info">
                  <strong>Notificações Push</strong>
                  <p>Receba notificações em tempo real no navegador</p>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" v-model="notificationSettings.pushNotifications">
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="notification-item">
                <div class="notification-info">
                  <strong>Sons de Notificação</strong>
                  <p>Reproduzir som quando receber notificações</p>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" v-model="notificationSettings.soundEnabled">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-primary" @click="saveNotifications">
              <i class="pi pi-check"></i>
              Salvar Preferências
            </button>
          </div>
        </div>

        <!-- Preferências -->
        <div v-show="activeSection === 'preferences'" class="settings-section">
          <div class="section-header">
            <h2>Preferências</h2>
            <p>Personalize sua experiência no portal</p>
          </div>

          <div class="preferences-options">
            <div class="preference-item">
              <div class="preference-info">
                <strong>Idioma</strong>
                <p>Selecione o idioma da interface</p>
              </div>
              <select v-model="preferences.language" class="preference-select">
                <option value="pt">Português</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>

            <div class="preference-item">
              <div class="preference-info">
                <strong>Tema</strong>
                <p>Escolha o tema visual do portal</p>
              </div>
              <select v-model="preferences.theme" class="preference-select">
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
                <option value="auto">Automático</option>
              </select>
            </div>

            <div class="preference-item">
              <div class="preference-info">
                <strong>Formato de Data</strong>
                <p>Como as datas devem ser exibidas</p>
              </div>
              <select v-model="preferences.dateFormat" class="preference-select">
                <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                <option value="yyyy-mm-dd">YYYY-MM-DD</option>
              </select>
            </div>

            <div class="preference-item">
              <div class="preference-info">
                <strong>Fuso Horário</strong>
                <p>Selecione seu fuso horário local</p>
              </div>
              <select v-model="preferences.timezone" class="preference-select">
                <option value="Europe/Lisbon">Lisboa (GMT+0)</option>
                <option value="Europe/London">Londres (GMT+0)</option>
                <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                <option value="America/New_York">Nova York (GMT-5)</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-primary" @click="savePreferences">
              <i class="pi pi-check"></i>
              Salvar Preferências
            </button>
          </div>
        </div>

        <!-- Privacidade -->
        <div v-show="activeSection === 'privacy'" class="settings-section">
          <div class="section-header">
            <h2>Privacidade</h2>
            <p>Controle suas informações e privacidade</p>
          </div>

          <div class="privacy-options">
            <div class="privacy-item">
              <div class="privacy-info">
                <strong>Perfil Visível</strong>
                <p>Permitir que outros colaboradores vejam seu perfil</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="privacySettings.profileVisible">
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="privacy-item">
              <div class="privacy-info">
                <strong>Mostrar Status Online</strong>
                <p>Permitir que outros vejam quando você está online</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="privacySettings.showOnlineStatus">
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="privacy-item">
              <div class="privacy-info">
                <strong>Email Visível</strong>
                <p>Mostrar seu email no perfil público</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="privacySettings.emailVisible">
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="privacy-item">
              <div class="privacy-info">
                <strong>Telefone Visível</strong>
                <p>Mostrar seu telefone no perfil público</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="privacySettings.phoneVisible">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="privacy-actions">
            <div class="danger-zone">
              <h3>Zona de Perigo</h3>
              <p>Ações irreversíveis relacionadas à sua conta</p>
              
              <button class="btn-danger" @click="showDeleteAccountModal = true">
                <i class="pi pi-trash"></i>
                Solicitar Exclusão de Conta
              </button>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-primary" @click="savePrivacy">
              <i class="pi pi-check"></i>
              Salvar Configurações
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Confirmação Exclusão -->
    <div v-if="showDeleteAccountModal" class="modal-overlay" @click="showDeleteAccountModal = false">
      <div class="modal-content modal-danger" @click.stop>
        <div class="modal-header">
          <h2>Solicitar Exclusão de Conta</h2>
          <button class="btn-close" @click="showDeleteAccountModal = false">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="warning-message">
            <i class="pi pi-exclamation-triangle"></i>
            <p>Esta ação criará uma solicitação para o RH excluir permanentemente sua conta e todos os dados associados. Esta ação não pode ser desfeita.</p>
          </div>

          <div class="form-group">
            <label for="deleteReason">Motivo da Exclusão *</label>
            <textarea
              id="deleteReason"
              v-model="deleteReason"
              rows="4"
              class="form-control"
              placeholder="Por favor, conte-nos o motivo..."
              required
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="showDeleteAccountModal = false">
            Cancelar
          </button>
          <button class="btn-danger" @click="requestAccountDeletion">
            <i class="pi pi-trash"></i>
            Confirmar Solicitação
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const activeSection = ref('profile')
const savingProfile = ref(false)
const savingSecurity = ref(false)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const passwordError = ref('')
const twoFactorEnabled = ref(false)
const showDeleteAccountModal = ref(false)
const deleteReason = ref('')

const sections = [
  { id: 'profile', label: 'Perfil Pessoal', icon: 'pi pi-user' },
  { id: 'security', label: 'Segurança', icon: 'pi pi-shield' },
  { id: 'notifications', label: 'Notificações', icon: 'pi pi-bell' },
  { id: 'preferences', label: 'Preferências', icon: 'pi pi-sliders-h' },
  { id: 'privacy', label: 'Privacidade', icon: 'pi pi-lock' }
]

const profileForm = reactive({
  fullName: 'João Silva',
  email: 'joao.silva@empresa.com',
  phone: '+351 912 345 678',
  birthdate: '1990-05-15',
  address: 'Rua das Flores, 123\n1000-001 Lisboa'
})

const securityForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const notificationSettings = reactive({
  emailAnnouncements: true,
  emailDocuments: true,
  emailRequests: true,
  emailLeaveReminders: true,
  pushNotifications: true,
  soundEnabled: false
})

const preferences = reactive({
  language: 'pt',
  theme: 'light',
  dateFormat: 'dd/mm/yyyy',
  timezone: 'Europe/Lisbon'
})

const privacySettings = reactive({
  profileVisible: true,
  showOnlineStatus: true,
  emailVisible: false,
  phoneVisible: false
})

const saveProfile = async () => {
  savingProfile.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    alert('Perfil atualizado com sucesso!')
  } catch (error) {
    alert('Erro ao atualizar perfil')
  } finally {
    savingProfile.value = false
  }
}

const resetProfile = () => {
  // Reset to original values
  profileForm.fullName = 'João Silva'
  profileForm.email = 'joao.silva@empresa.com'
  profileForm.phone = '+351 912 345 678'
  profileForm.birthdate = '1990-05-15'
  profileForm.address = 'Rua das Flores, 123\n1000-001 Lisboa'
}

const changePassword = async () => {
  passwordError.value = ''

  if (securityForm.newPassword !== securityForm.confirmPassword) {
    passwordError.value = 'As senhas não coincidem'
    return
  }

  if (securityForm.newPassword.length < 8) {
    passwordError.value = 'A senha deve ter no mínimo 8 caracteres'
    return
  }

  savingSecurity.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    alert('Senha alterada com sucesso!')
    resetSecurity()
  } catch (error) {
    passwordError.value = 'Erro ao alterar senha. Verifique sua senha atual.'
  } finally {
    savingSecurity.value = false
  }
}

const resetSecurity = () => {
  securityForm.currentPassword = ''
  securityForm.newPassword = ''
  securityForm.confirmPassword = ''
  passwordError.value = ''
}

const toggleTwoFactor = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    if (twoFactorEnabled.value) {
      alert('Autenticação de dois fatores ativada!')
    } else {
      alert('Autenticação de dois fatores desativada')
    }
  } catch (error) {
    twoFactorEnabled.value = !twoFactorEnabled.value
    alert('Erro ao alterar configuração')
  }
}

const saveNotifications = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('Preferências de notificação salvas com sucesso!')
  } catch (error) {
    alert('Erro ao salvar preferências')
  }
}

const savePreferences = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('Preferências salvas com sucesso!')
  } catch (error) {
    alert('Erro ao salvar preferências')
  }
}

const savePrivacy = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('Configurações de privacidade salvas com sucesso!')
  } catch (error) {
    alert('Erro ao salvar configurações')
  }
}

const requestAccountDeletion = async () => {
  if (!deleteReason.value.trim()) {
    alert('Por favor, informe o motivo da exclusão')
    return
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    alert('Solicitação de exclusão enviada ao RH. Você receberá um retorno em breve.')
    showDeleteAccountModal.value = false
    deleteReason.value = ''
  } catch (error) {
    alert('Erro ao enviar solicitação')
  }
}

onMounted(() => {
  // Carregar dados do usuário
  console.log('Carregando configurações do usuário...')
})
</script>

<style scoped>
.settings-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  .header-title {
    display: flex;
    align-items: center;
    gap: 1rem;

    > i {
      font-size: 3rem;
      color: #64748b;
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      padding: 1rem;
      border-radius: 1rem;
    }

    h1 {
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
  }
}

.settings-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;
  align-items: start;
}

.settings-sidebar {
  background: white;
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 2rem;
}

.settings-nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  background: transparent;
  border: none;
  border-radius: 0.75rem;
  color: #64748b;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  i {
    font-size: 1.125rem;
  }

  &:hover {
    background: #f8fafc;
    color: #1e293b;
  }

  &.active {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  }
}

.settings-content {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 500px;
}

.settings-section {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;

  h2 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 0.5rem 0;
  }

  p {
    color: #64748b;
    margin: 0;
    font-size: 1rem;
  }
}

.settings-form {
  .form-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-bottom: 1.5rem;
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

    .form-control {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 0.75rem;
      font-size: 1rem;
      transition: all 0.2s ease;
      font-family: inherit;

      &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
      }
    }

    textarea.form-control {
      resize: vertical;
    }

    .form-text {
      display: block;
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #94a3b8;
    }
  }

  .password-input {
    position: relative;

    .form-control {
      padding-right: 3rem;
    }

    .password-toggle {
      position: absolute;
      right: 0.5rem;
      top: 50%;
      transform: translateY(-50%);
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      border-radius: 0.5rem;
      transition: all 0.2s ease;

      &:hover {
        background: #f1f5f9;
        color: #475569;
      }
    }
  }

  .alert-error {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    background: #fee2e2;
    border: 1px solid #fecaca;
    border-radius: 0.75rem;
    color: #dc2626;
    margin-bottom: 1.5rem;

    i {
      font-size: 1.25rem;
    }
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding-top: 1.5rem;
    border-top: 1px solid #f1f5f9;

    button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .btn-secondary {
      background: #f1f5f9;
      color: #475569;

      &:hover:not(:disabled) {
        background: #e2e8f0;
      }
    }

    .btn-primary {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      }
    }
  }
}

.security-option {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  border: 2px solid #e2e8f0;

  .option-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;

    .option-info {
      flex: 1;

      h3 {
        font-size: 1.125rem;
        font-weight: 600;
        color: #1e293b;
        margin: 0 0 0.375rem 0;
      }

      p {
        color: #64748b;
        margin: 0;
        font-size: 0.9375rem;
      }
    }
  }
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
  flex-shrink: 0;

  input {
    opacity: 0;
    width: 0;
    height: 0;

    &:checked + .toggle-slider {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    }

    &:checked + .toggle-slider:before {
      transform: translateX(24px);
    }
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #cbd5e1;
    transition: 0.3s;
    border-radius: 28px;

    &:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 4px;
      bottom: 4px;
      background: white;
      transition: 0.3s;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }
}

.notification-options,
.preferences-options,
.privacy-options {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.notification-category {
  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 1rem 0;
  }
}

.notification-item,
.preference-item,
.privacy-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  border: 2px solid #e2e8f0;
  transition: all 0.2s ease;

  &:hover {
    border-color: #cbd5e1;
  }

  .notification-info,
  .preference-info,
  .privacy-info {
    flex: 1;

    strong {
      display: block;
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 0.25rem;
    }

    p {
      color: #64748b;
      margin: 0;
      font-size: 0.9375rem;
    }
  }
}

.preference-select {
  padding: 0.625rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 0.9375rem;
  color: #1e293b;
  background: white;
  cursor: pointer;
  min-width: 180px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  }
}

.privacy-actions {
  margin-top: 2rem;
}

.danger-zone {
  padding: 1.5rem;
  background: #fef2f2;
  border: 2px solid #fecaca;
  border-radius: 0.75rem;

  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #dc2626;
    margin: 0 0 0.5rem 0;
  }

  p {
    color: #991b1b;
    margin: 0 0 1rem 0;
    font-size: 0.9375rem;
  }

  .btn-danger {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    border: none;
    border-radius: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }
  }
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
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
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

  &.modal-danger {
    border-top: 4px solid #ef4444;
  }
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

  h2 {
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
    transition: all 0.2s ease;

    &:hover {
      background: #ef4444;
      color: white;
    }
  }
}

.modal-body {
  padding: 1.5rem;

  .warning-message {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 0.75rem;
    margin-bottom: 1.5rem;

    i {
      font-size: 1.5rem;
      color: #dc2626;
      flex-shrink: 0;
    }

    p {
      color: #991b1b;
      margin: 0;
      line-height: 1.6;
    }
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;

  button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
  }

  .btn-secondary {
    background: #f1f5f9;
    color: #475569;

    &:hover {
      background: #e2e8f0;
    }
  }

  .btn-danger {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }
  }
}

@media (max-width: 1024px) {
  .settings-container {
    grid-template-columns: 1fr;
  }

  .settings-sidebar {
    position: static;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.5rem;
  }

  .settings-form .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .settings-sidebar {
    grid-template-columns: 1fr;
  }

  .notification-item,
  .preference-item,
  .privacy-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .preference-select {
    width: 100%;
  }

  .modal-content {
    margin: 0.5rem;
    max-height: calc(100vh - 1rem);
  }
}
</style>