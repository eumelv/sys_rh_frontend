<template>
  <div class="settings-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <i class="pi pi-cog"></i>
          <div>
            <h1>Definições</h1>
            <p class="subtitle">Configure suas preferências e segurança</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <i class="pi pi-spin pi-spinner"></i>
      <p>Carregando configurações...</p>
    </div>

    <div v-else class="settings-container">
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
                  v-model="securityForm.current_password"
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
                  v-model="securityForm.password"
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
                  v-model="securityForm.password_confirmation"
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
                <i class="pi" :class="savingSecurity ? 'pi-spin pi-spinner' : 'pi-lock'"></i>
                {{ savingSecurity ? 'Alterando...' : 'Alterar Senha' }}
              </button>
            </div>
          </form>
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
                  <input type="checkbox" v-model="settings.notify_announcements">
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="notification-item">
                <div class="notification-info">
                  <strong>Novos Documentos</strong>
                  <p>Receba emails quando novos documentos forem disponibilizados</p>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" v-model="settings.notify_documents">
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="notification-item">
                <div class="notification-info">
                  <strong>Status de Solicitações</strong>
                  <p>Receba atualizações sobre suas solicitações</p>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" v-model="settings.notify_requests">
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="notification-item">
                <div class="notification-info">
                  <strong>Lembretes de Licenças</strong>
                  <p>Receba lembretes sobre períodos de licenças</p>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" v-model="settings.notify_leaves">
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
                  <input type="checkbox" v-model="settings.notify_push">
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="notification-item">
                <div class="notification-info">
                  <strong>Sons de Notificação</strong>
                  <p>Reproduzir som quando receber notificações</p>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" v-model="settings.notify_sound">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-primary" @click="saveNotifications" :disabled="savingNotifications">
              <i class="pi" :class="savingNotifications ? 'pi-spin pi-spinner' : 'pi-check'"></i>
              {{ savingNotifications ? 'Salvando...' : 'Salvar Preferências' }}
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
              <select v-model="settings.language" class="preference-select">
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
              <select v-model="settings.theme" class="preference-select" @change="applyTheme">
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
              <select v-model="settings.date_format" class="preference-select">
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
              <select v-model="settings.timezone" class="preference-select">
                <option value="Africa/Luanda">Luanda (GMT+1)</option>
                <option value="Europe/Lisbon">Lisboa (GMT+0)</option>
                <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                <option value="Europe/London">Londres (GMT+0)</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-primary" @click="savePreferences" :disabled="savingPreferences">
              <i class="pi" :class="savingPreferences ? 'pi-spin pi-spinner' : 'pi-check'"></i>
              {{ savingPreferences ? 'Salvando...' : 'Salvar Preferências' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/services/api'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
const toast = useToast()
const { t, locale } = useI18n() 
const loading = ref(true)
const { setTheme } = useTheme()
const activeSection = ref('security')
const savingSecurity = ref(false)
const savingNotifications = ref(false)
const savingPreferences = ref(false)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const passwordError = ref('')

const sections = [
  { id: 'security', label: 'Segurança', icon: 'pi pi-shield' },
  { id: 'notifications', label: 'Notificações', icon: 'pi pi-bell' },
  { id: 'preferences', label: 'Preferências', icon: 'pi pi-sliders-h' },
]

const securityForm = reactive({
  current_password: '',
  password: '',
  password_confirmation: ''
})

const settings = reactive({
  notify_announcements: true,
  notify_documents: true,
  notify_requests: true,
  notify_leaves: true,
  notify_push: true,
  notify_sound: false,
  language: 'pt',
  theme: 'light',
  date_format: 'dd/mm/yyyy',
  timezone: 'Africa/Luanda'
})

const loadSettings = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/employee/settings')
    
    Object.assign(settings, data.settings)
    // Aplicar tema carregado
    setTheme(settings.theme)
    
    // Aplicar idioma
    if (settings.language) {
      locale.value = settings.language
    }
    // Aplicar tema carregado
    applyTheme()
    
  } catch (error) {
    console.error('Erro ao carregar configurações:', error)
    toast.error('Erro ao carregar configurações')
  } finally {
    loading.value = false
  }
}

const changePassword = async () => {
  passwordError.value = ''

  if (securityForm.password !== securityForm.password_confirmation) {
    passwordError.value = 'As senhas não conferem'
    return
  }

  if (securityForm.password.length < 8) {
    passwordError.value = 'A senha deve ter no mínimo 8 caracteres'
    return
  }

  savingSecurity.value = true
  try {
    await api.post('/employee/change-password', securityForm)
    
    toast.success('Senha alterada com sucesso!')
    resetSecurity()
    
  } catch (error) {
    console.error('Erro ao alterar senha:', error)
    passwordError.value = error.response?.data?.message || 'Erro ao alterar senha. Verifique sua senha atual.'
  } finally {
    savingSecurity.value = false
  }
}

const resetSecurity = () => {
  securityForm.current_password = ''
  securityForm.password = ''
  securityForm.password_confirmation = ''
  passwordError.value = ''
  showCurrentPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false
}

const saveNotifications = async () => {
  savingNotifications.value = true
  try {
    const { data } = await api.put('/employee/settings/notifications', {
      notify_announcements: settings.notify_announcements,
      notify_documents: settings.notify_documents,
      notify_requests: settings.notify_requests,
      notify_leaves: settings.notify_leaves,
      notify_push: settings.notify_push,
      notify_sound: settings.notify_sound,
    })
    
    toast.success(data.message)
       // Aplicar idioma
    locale.value = settings.language
    
    // Aplicar tema
    applyTheme()
  } catch (error) {
    console.error('Erro ao salvar:', error)
    toast.error('Erro ao salvar preferências de notificação')
  } finally {
    savingNotifications.value = false
  }
}

const savePreferences = async () => {
  savingPreferences.value = true
  try {
    const { data } = await api.put('/employee/settings/preferences', {
      language: settings.language,
      theme: settings.theme,
      date_format: settings.date_format,
      timezone: settings.timezone,
    })
    
    toast.success(data.message)
        // Aplicar idioma
    locale.value = settings.language
    
    // Aplicar tema GLOBALMENTE
    setTheme(settings.theme)
    
    // Aplicar tema após salvar
    applyTheme()
    
  } catch (error) {
    console.error('Erro ao salvar:', error)
    toast.error('Erro ao salvar preferências')
  } finally {
    savingPreferences.value = false
  }
}

const applyTheme = () => {
  const html = document.documentElement
  
  if (settings.theme === 'dark') {
    html.classList.add('dark-mode')
    html.classList.remove('light-mode')
    localStorage.setItem('app-theme', 'dark') 
  } else if (settings.theme === 'light') {
    html.classList.add('light-mode')
    html.classList.remove('dark-mode')
    localStorage.setItem('app-theme', 'light') 
  } else {
    // Auto
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      html.classList.add('dark-mode')
      html.classList.remove('light-mode')
      localStorage.setItem('app-theme', 'dark') 
    } else {
      html.classList.add('light-mode')
      html.classList.remove('dark-mode')
      localStorage.setItem('app-theme', 'light') 
    }
  }
}

onMounted(async () => {
  await loadSettings()
})
</script>

<style scoped>
/* CSS IGUAL AO ANTERIOR - MANTER TODO O CSS */
.settings-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
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
      color: #3b82f6;
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
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

.loading-state {
  text-align: center;
  padding: 5rem 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  i {
    font-size: 3rem;
    color: #3b82f6;
    margin-bottom: 1rem;
  }

  p {
    color: #64748b;
    margin: 0;
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

      &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
      }
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
.preferences-options {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
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
.preference-item {
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
  .preference-info {
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
}

@media (max-width: 768px) {
  .settings-page {
    padding: 1rem;
  }

  .settings-sidebar {
    grid-template-columns: 1fr;
  }

  .notification-item,
  .preference-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .preference-select {
    width: 100%;
  }
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 0;
  margin-top: 1rem;
  border-top: 2px solid #f1f5f9;
}

.form-actions button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  white-space: nowrap;
}

.form-actions .btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.form-actions .btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.form-actions .btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.form-actions .btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.form-actions .btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
}

/* Dark mode adjustments for buttons */
html.dark-mode .form-actions {
  border-top-color: var(--border-color);
}
</style>