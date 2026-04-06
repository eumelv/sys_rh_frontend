<template>
  <div class="settings-page">
    <div class="settings-container">
      <!-- Sidebar -->
      <aside class="settings-sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo">
            <i class="pi pi-sliders-h"></i>
          </div>
          <div class="sidebar-title">
            <h1>Configurações</h1>
            <span>Painel Admin</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="currentTab = tab.id"
            :class="['nav-item', { active: currentTab === tab.id }]"
          >
            <div class="nav-icon">
              <i :class="tab.icon"></i>
            </div>
            <div class="nav-content">
              <span class="nav-label">{{ tab.label }}</span>
              <span class="nav-desc">{{ tab.desc }}</span>
            </div>
            <div class="active-indicator"></div>
          </button>
        </nav>

        <div class="sidebar-footer">
          <button class="save-btn" @click="saveSettings" :disabled="saving">
            <i v-if="saving" class="pi pi-spin pi-spinner"></i>
            <i v-else class="pi pi-save"></i>
            <span>{{ saving ? 'A guardar...' : 'Guardar Alterações' }}</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="settings-content">
        <div class="content-header">
          <div class="header-icon" :style="{ background: getActiveTabColor }">
            <i :class="currentTabData?.icon"></i>
          </div>
          <div class="header-text">
            <h2>{{ currentTabData?.label }}</h2>
            <p>{{ currentTabData?.desc }}</p>
          </div>
        </div>

        <div class="content-body">
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <span>A carregar configurações...</span>
          </div>

          <Transition name="slide-fade" mode="out-in">
            <form :key="currentTab" @submit.prevent="saveSettings" v-if="!loading">
              <!-- TAB: Geral -->
              <div v-if="currentTab === 'general'" class="tab-panel">
                <div class="panel-section">
                  <div class="section-header">
                    <div class="section-icon">
                      <i class="pi pi-building"></i>
                    </div>
                    <div>
                      <h3>Informações da Empresa</h3>
                      <p>Dados básicos e identificação</p>
                    </div>
                  </div>

                  <div class="logo-section">
                    <div class="logo-upload" @click="$refs.logoInput.click()">
                      <div class="logo-preview">
                        <img v-if="logoPreview || company.logo_url" :src="logoPreview || company.logo_url" alt="Logo" />
                        <i v-else class="pi pi-image"></i>
                      </div>
                      <input type="file" ref="logoInput" @change="onLogoChange" accept="image/*" hidden />
                      <div class="logo-overlay">
                        <i class="pi pi-upload"></i>
                        <span>Alterar</span>
                      </div>
                    </div>
                    <div class="logo-info">
                      <strong>Logótipo da Empresa</strong>
                      <span>PNG ou JPG, máx 2MB</span>
                    </div>
                  </div>

                  <div class="form-grid">
                    <div class="form-group">
                      <label>Nome Comercial</label>
                      <div class="input-icon">
                        <i class="pi pi-building"></i>
                        <input v-model="form.name" type="text" placeholder="Nome da empresa" />
                      </div>
                    </div>
                    <div class="form-group">
                      <label>Razão Social</label>
                      <div class="input-icon">
                        <i class="pi pi-briefcase"></i>
                        <input v-model="form.legal_name" type="text" placeholder="Nome legal oficial" />
                      </div>
                    </div>
                    <div class="form-group">
                      <label>NIF / Tax ID</label>
                      <div class="input-icon">
                        <i class="pi pi-id-card"></i>
                        <input v-model="form.tax_id" type="text" placeholder="Número de identificação fiscal" />
                      </div>
                    </div>
                  </div>
                </div>

                <div class="panel-section">
                  <div class="section-header">
                    <div class="section-icon">
                      <i class="pi pi-envelope"></i>
                    </div>
                    <div>
                      <h3>Contactos</h3>
                      <p>Informações de contato institucional</p>
                    </div>
                  </div>

                  <div class="form-grid three-cols">
                    <div class="form-group">
                      <label>Email Institucional</label>
                      <div class="input-icon">
                        <i class="pi pi-envelope"></i>
                        <input v-model="form.email" type="email" placeholder="email@empresa.com" />
                      </div>
                    </div>
                    <div class="form-group">
                      <label>Telefone</label>
                      <div class="input-icon">
                        <i class="pi pi-phone"></i>
                        <input v-model="form.phone" type="text" placeholder="+244 ..." />
                      </div>
                    </div>
                    <div class="form-group">
                      <label>Website</label>
                      <div class="input-icon">
                        <i class="pi pi-globe"></i>
                        <input v-model="form.website" type="text" placeholder="https://" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- TAB: Localização -->
              <div v-if="currentTab === 'location'" class="tab-panel">
                <div class="panel-section">
                  <div class="section-header">
                    <div class="section-icon">
                      <i class="pi pi-map-marker"></i>
                    </div>
                    <div>
                      <h3>Endereço da Empresa</h3>
                      <p>Localização e morada oficial</p>
                    </div>
                  </div>

                  <div class="form-group full">
                    <label>Endereço Completo</label>
                    <div class="input-icon textarea">
                      <i class="pi pi-map"></i>
                      <textarea v-model="form.address" rows="3" placeholder="Rua, número, bairro..."></textarea>
                    </div>
                  </div>

                  <div class="form-grid three-cols">
                    <div class="form-group">
                      <label>Cidade</label>
                      <div class="input-icon">
                        <i class="pi pi-building"></i>
                        <input v-model="form.city" type="text" />
                      </div>
                    </div>
                    <div class="form-group">
                      <label>Província / Estado</label>
                      <div class="input-icon">
                        <i class="pi pi-map"></i>
                        <input v-model="form.state" type="text" />
                      </div>
                    </div>
                    <div class="form-group">
                      <label>País</label>
                      <div class="input-icon">
                        <i class="pi pi-globe"></i>
                        <input v-model="form.country" type="text" />
                      </div>
                    </div>
                  </div>

                  <div class="form-group" style="max-width: 280px;">
                    <label>Código Postal</label>
                    <div class="input-icon">
                      <i class="pi pi-send"></i>
                      <input v-model="form.postal_code" type="text" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- TAB: Cálculo Salarial -->
              <div v-if="currentTab === 'payroll'" class="tab-panel">
                <div class="info-card info">
                  <div class="info-icon">
                    <i class="pi pi-info-circle"></i>
                  </div>
                  <div class="info-content">
                    <strong>Regras de Processamento</strong>
                    <p>Configure como o sistema calculará automaticamente os salários dos colaboradores.</p>
                  </div>
                </div>

                <div class="panel-section">
                  <div class="section-header">
                    <div class="section-icon warning">
                      <i class="pi pi-percentage"></i>
                    </div>
                    <div>
                      <h3>Descontos Obrigatórios</h3>
                      <p>Impostos e contribuições legais</p>
                    </div>
                  </div>

                  <div class="toggle-list">
                    <div v-for="item in payrollSwitches" :key="item.model" class="toggle-item">
                      <div class="toggle-icon" :style="{ background: item.color }">
                        <i :class="item.icon"></i>
                      </div>
                      <div class="toggle-content">
                        <strong>{{ item.label }}</strong>
                        <span>{{ item.desc }}</span>
                      </div>
                      <label class="toggle-switch">
                        <input type="checkbox" v-model="form[item.model]" />
                        <span class="toggle-slider"></span>
                      </label>
                    </div>

                    <!-- Absence deduction amount — shown inline below the toggle -->
                    <div v-if="form.absence_deduction_enabled" class="deduction-amount-row">
                      <div class="toggle-icon" style="background: #fef3c7; visibility: hidden;"></div>
                      <div class="toggle-content">
                        <strong>Valor de Desconto por Falta</strong>
                        <span>Montante fixo descontado por cada dia de ausência</span>
                      </div>
                      <div class="deduction-input-wrap">
                        <span class="deduction-currency">AOA</span>
                        <input
                          v-model.number="form.absence_deduction_amount"
                          type="number"
                          min="0"
                          step="100"
                          placeholder="0.00"
                          class="deduction-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div class="panel-section">
                  <div class="section-header">
                    <div class="section-icon success">
                      <i class="pi pi-gift"></i>
                    </div>
                    <div>
                      <h3>Subsídios</h3>
                      <p>Benefícios adicionais aos colaboradores</p>
                    </div>
                  </div>

                  <div class="subsidy-grid">
                    <div v-for="item in subsidiesSwitches" :key="item.model" class="subsidy-card">
                      <div class="subsidy-icon">
                        <i :class="item.icon"></i>
                      </div>
                      <div class="subsidy-content">
                        <span class="subsidy-name">{{ item.label }}</span>
                        <span class="subsidy-desc">{{ item.desc }}</span>
                      </div>
                      <label class="toggle-switch small">
                        <input type="checkbox" v-model="form[item.model]" />
                        <span class="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- TAB: Assiduidade -->
              <div v-if="currentTab === 'attendance'" class="tab-panel">
                <div class="info-card attention">
                  <div class="info-icon">
                    <i class="pi pi-clock"></i>
                  </div>
                  <div class="info-content">
                    <strong>Políticas de Assiduidade</strong>
                    <p>Configure tolerância, regras e comportamento do sistema de ponto.</p>
                  </div>
                </div>

                <div class="panel-section">
                  <div class="section-header">
                    <div class="section-icon indigo">
                      <i class="pi pi-tablet"></i>
                    </div>
                    <div>
                      <h3>Módulo de Ponto</h3>
                      <p>Controlo de entradas e saídas</p>
                    </div>
                  </div>

                  <div class="toggle-item large">
                    <div class="toggle-icon indigo">
                      <i class="pi pi-clock"></i>
                    </div>
                    <div class="toggle-content">
                      <strong>Activar Registo de Ponto</strong>
                      <span>Habilitar o sistema de assiduidade para todos os colaboradores</span>
                    </div>
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="form.attendance_enabled" />
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div class="panel-section">
                  <div class="section-header">
                    <div class="section-icon purple">
                      <i class="pi pi-history"></i>
                    </div>
                    <div>
                      <h3>Tolerância</h3>
                      <p>Tempo máximo de atraso aceitável</p>
                    </div>
                  </div>

                  <div class="tolerance-input">
                    <div class="input-with-suffix">
                      <input v-model="form.attendance_tolerance" type="number" min="0" max="60" />
                      <span class="suffix">minutos</span>
                    </div>
                    <p class="input-hint">Tempo em minutos que o colaborador pode chegar atrasado sem penalização.</p>
                  </div>
                </div>
              </div>

              <!-- TAB: Notificações -->
              <div v-if="currentTab === 'notifications'" class="tab-panel">
                <div class="panel-section">
                  <div class="section-header">
                    <div class="section-icon amber">
                      <i class="pi pi-bell"></i>
                    </div>
                    <div>
                      <h3>Alertas por Email</h3>
                      <p>Notificações e avisos automáticos</p>
                    </div>
                  </div>

                  <div class="toggle-item large">
                    <div class="toggle-icon amber">
                      <i class="pi pi-envelope"></i>
                    </div>
                    <div class="toggle-content">
                      <strong>Notificações por Email</strong>
                      <span>Receba alertas sobre assiduidade, ausências e relatórios</span>
                    </div>
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="form.email_notifications_enabled" />
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div class="notification-preview">
                  <div class="preview-header">
                    <i class="pi pi-envelope"></i>
                    <span>Exemplo de notificação</span>
                  </div>
                  <div class="preview-body">
                    <div class="preview-from">SYS RH - Sistema de Recursos Humanos</div>
                    <div class="preview-subject">Assunto: Novo relatório de assiduidade disponível</div>
                    <div class="preview-text">
                      Caro utilizador,<br><br>
                      Um novo relatório de assiduidade foi gerado e está disponível para consulta no painel administrativo.
                    </div>
                  </div>
                </div>
              </div>

              <!-- TAB: Branding -->
              <div v-if="currentTab === 'branding'" class="tab-panel">
                <div class="panel-section">
                  <div class="section-header">
                    <div class="section-icon blue">
                      <i class="pi pi-pencil"></i>
                    </div>
                    <div>
                      <h3>Assinatura Digital</h3>
                      <p>Identidade em documentos oficiais</p>
                    </div>
                  </div>

                  <div class="form-group full">
                    <label>Nome do Responsável</label>
                    <div class="input-icon">
                      <i class="pi pi-user"></i>
                      <input v-model="form.signature_name" type="text" placeholder="Ex: João Silva - Director de RH" />
                    </div>
                    <span class="field-hint">Aparece em documentos oficiais, recibos e relatórios</span>
                  </div>
                </div>

                <div class="panel-section">
                  <div class="section-header">
                    <div class="section-icon teal">
                      <i class="pi pi-image"></i>
                    </div>
                    <div>
                      <h3>Selo / Assinatura Visual</h3>
                      <p>Imagem para documentos e comprovativos</p>
                    </div>
                  </div>

                  <div class="signature-upload" @click="$refs.signatureInput.click()">
                    <div class="signature-preview">
                      <img v-if="signaturePreview || company.signature_url" :src="signaturePreview || company.signature_url" alt="Signature" />
                      <div v-else class="empty-state">
                        <i class="pi pi-upload"></i>
                        <span>Clique para carregar imagem</span>
                        <small>PNG ou JPG com transparência</small>
                      </div>
                    </div>
                    <input type="file" ref="signatureInput" @change="onSignatureChange" accept="image/*" hidden />
                  </div>
                </div>
              </div>
            </form>
          </Transition>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const authStore = useAuthStore()
const toast = useToast()

const currentTab = ref('general')
const loading = ref(true)
const saving = ref(false)
const company = ref({})

const tabs = [
  { id: 'general', label: 'Empresa', icon: 'pi pi-building', desc: 'Dados básicos', color: '#3b82f6' },
  { id: 'location', label: 'Localização', icon: 'pi pi-map-marker', desc: 'Morada', color: '#10b981' },
  { id: 'payroll', label: 'Salário', icon: 'pi pi-money-bill', desc: 'Cálculos', color: '#f59e0b' },
  { id: 'attendance', label: 'Assiduidade', icon: 'pi pi-clock', desc: 'Ponto', color: '#8b5cf6' },
  { id: 'notifications', label: 'Alertas', icon: 'pi pi-bell', desc: 'Notificações', color: '#ec4899' },
  { id: 'branding', label: 'Identidade', icon: 'pi pi-palette', desc: 'Branding', color: '#06b6d4' },
]

const currentTabData = computed(() => tabs.find(t => t.id === currentTab.value))
const getActiveTabColor = computed(() => currentTabData.value?.color || '#3b82f6')

const payrollSwitches = [
  { model: 'irt_enabled', label: 'Retenção de IRT', icon: 'pi pi-percentage', desc: 'Imposto sobre Rendimento', color: '#ef4444' },
  { model: 'inss_enabled', label: 'Contribuição INSS', icon: 'pi pi-shield', desc: 'Segurança Social', color: '#3b82f6' },
  { model: 'absence_deduction_enabled', label: 'Dedução de Faltas', icon: 'pi pi-calendar-minus', desc: 'Descontar dias ausentes', color: '#f59e0b' },
  { model: 'salary_payment_enabled', label: 'Ordens de Pagamento', icon: 'pi pi-send', desc: 'Pagamento via sistema', color: '#10b981' },
]

const subsidiesSwitches = [
  { model: 'food_subsidy_enabled', label: 'Subsídio de Alimentação', icon: 'pi pi-shopping-cart', desc: 'Diária de refeição', color: '#f97316' },
  { model: 'transport_subsidy_enabled', label: 'Subsídio de Transporte', icon: 'pi pi-car', desc: 'Ajuda de custo viagem', color: '#6366f1' },
  { model: 'family_subsidy_enabled', label: 'Abono de Família', icon: 'pi pi-users', desc: 'Por filho dependente', color: '#ec4899' },
]

const form = reactive({
  name: '',
  legal_name: '',
  tax_id: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  city: '',
  state: '',
  country: '',
  postal_code: '',
  attendance_enabled: true,
  attendance_tolerance: 15,
  email_notifications_enabled: true,
  signature_name: '',
  logo: null,
  signature_image: null,
  irt_enabled: true,
  inss_enabled: true,
  absence_deduction_enabled: true,
  absence_deduction_amount: 0,
  family_subsidy_enabled: true,
  food_subsidy_enabled: true,
  transport_subsidy_enabled: true,
  salary_payment_enabled: true
})

const logoPreview = ref(null)
const signaturePreview = ref(null)

const fetchSettings = async () => {
  loading.value = true
  try {
    const [companyRes, payrollRes] = await Promise.all([
      api.get('/admin/settings/company'),
      api.get('/admin/settings/payroll')
    ])
    
    const companyData = companyRes.data.company
    const payrollData = payrollRes.data
    
    company.value = companyData
    
    Object.assign(form, {
      name: companyData.name || '',
      legal_name: companyData.legal_name || '',
      tax_id: companyData.tax_id || '',
      email: companyData.email || '',
      phone: companyData.phone || '',
      website: companyData.website || '',
      address: companyData.address || '',
      city: companyData.city || '',
      state: companyData.state || '',
      country: companyData.country || '',
      postal_code: companyData.postal_code || '',
      attendance_enabled: !!companyData.attendance_enabled,
      attendance_tolerance: companyData.attendance_tolerance || 15,
      email_notifications_enabled: companyData.settings?.email_notifications_enabled !== false,
      signature_name: companyData.signature_name || '',
      irt_enabled: !!payrollData.irt_enabled,
      inss_enabled: !!payrollData.inss_enabled,
      absence_deduction_enabled: !!payrollData.absence_deduction_enabled,
      absence_deduction_amount: payrollData.absence_deduction_amount ? parseFloat(payrollData.absence_deduction_amount) : 0,
      family_subsidy_enabled: !!payrollData.family_subsidy_enabled,
      food_subsidy_enabled: !!payrollData.food_subsidy_enabled,
      transport_subsidy_enabled: !!payrollData.transport_subsidy_enabled,
      salary_payment_enabled: !!payrollData.salary_payment_enabled
    })
  } catch (error) {
    toast.error('Erro ao carregar definições')
  } finally {
    loading.value = false
  }
}

const onLogoChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    form.logo = file
    logoPreview.value = URL.createObjectURL(file)
  }
}

const onSignatureChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    form.signature_image = file
    signaturePreview.value = URL.createObjectURL(file)
  }
}

const saveSettings = async () => {
  saving.value = true
  try {
    const formData = new FormData()
    formData.append('_method', 'PUT')
    
    const companyFields = [
      'name', 'legal_name', 'tax_id', 'email', 'phone', 'website', 
      'address', 'city', 'state', 'country', 'postal_code', 
      'attendance_enabled', 'attendance_tolerance', 
      'signature_name', 'email_notifications_enabled'
    ]
    
    companyFields.forEach(key => {
      formData.append(key, form[key])
    })
    
    if (form.logo) formData.append('logo', form.logo)
    if (form.signature_image) formData.append('signature_image', form.signature_image)

    await api.post('/admin/settings/company', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    const payrollData = {
      irt_enabled: form.irt_enabled,
      inss_enabled: form.inss_enabled,
      absence_deduction_enabled: form.absence_deduction_enabled,
      absence_deduction_amount: form.absence_deduction_amount,
      family_subsidy_enabled: form.family_subsidy_enabled,
      food_subsidy_enabled: form.food_subsidy_enabled,
      transport_subsidy_enabled: form.transport_subsidy_enabled,
      salary_payment_enabled: form.salary_payment_enabled
    }
    
    await api.put('/admin/settings/payroll', payrollData)
    
    toast.success('Configurações salvas com sucesso!')
    fetchSettings()
    logoPreview.value = null
    signaturePreview.value = null
  } catch (error) {
    toast.error(error.response?.data?.message || 'Erro ao salvar configurações')
  } finally {
    saving.value = false
  }
}

onMounted(fetchSettings)
</script>

<style scoped>
.settings-page {
  min-height: calc(100vh - 70px);
  background: #f1f5f9;
}

.settings-container {
  display: flex;
  min-height: calc(100vh - 70px);
}

/* Sidebar */
.settings-sidebar {
  width: 300px;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  color: white;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sidebar-logo {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.sidebar-title h1 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.sidebar-title span {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0.75rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  border-radius: 10px;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  text-align: left;
  width: 100%;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  transition: all 0.2s ease;
}

.nav-item.active .nav-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.nav-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.nav-label {
  font-weight: 600;
  font-size: 0.9375rem;
}

.nav-desc {
  font-size: 0.75rem;
  opacity: 0.7;
}

.active-indicator {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  background: linear-gradient(180deg, #3b82f6 0%, #6366f1 100%);
  border-radius: 4px 0 0 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.nav-item.active .active-indicator {
  opacity: 1;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.save-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Main Content */
.settings-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.content-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.header-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.header-text h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.header-text p {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #64748b;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Tab Panel */
.tab-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.section-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.125rem;
}

.section-icon.warning { background: #f59e0b; }
.section-icon.success { background: #10b981; }
.section-icon.indigo { background: #6366f1; }
.section-icon.purple { background: #8b5cf6; }
.section-icon.amber { background: #f59e0b; }
.section-icon.teal { background: #14b8a6; }
.section-icon.blue { background: #3b82f6; }

.section-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.section-header p {
  font-size: 0.8125rem;
  color: #64748b;
  margin: 0;
}

/* Info Cards */
.info-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
}

.info-card.attention {
  background: #f5f3ff;
  border-color: #c4b5fd;
}

.info-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.info-card.attention .info-icon {
  background: #8b5cf6;
}

.info-content strong {
  display: block;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.info-content p {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.form-grid.three-cols {
  grid-template-columns: repeat(3, 1fr);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #475569;
}

.input-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon i {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  font-size: 1rem;
}

.input-icon.textarea i {
  align-self: flex-start;
  margin-top: 12px;
}

.input-icon input,
.input-icon textarea {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.9375rem;
  color: #1e293b;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.input-icon input:focus,
.input-icon textarea:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-icon textarea {
  resize: vertical;
  min-height: 80px;
}

.field-hint {
  font-size: 0.75rem;
  color: #94a3b8;
}

/* Logo Upload */
.logo-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1.25rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px dashed #e2e8f0;
}

.logo-upload {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  background: #e2e8f0;
}

.logo-preview {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-preview i {
  font-size: 2rem;
  color: #94a3b8;
}

.logo-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.2s ease;
  gap: 0.25rem;
}

.logo-upload:hover .logo-overlay {
  opacity: 1;
}

.logo-overlay span {
  font-size: 0.75rem;
}

.logo-info strong {
  display: block;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.logo-info span {
  font-size: 0.8125rem;
  color: #64748b;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
  flex-shrink: 0;
}

.toggle-switch.small {
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 28px;
}

.toggle-slider::before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch.small .toggle-slider::before {
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
}

.toggle-switch input:checked + .toggle-slider {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(24px);
}

.toggle-switch.small input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

/* Toggle List */
.toggle-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.toggle-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.toggle-item.large {
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
  border-color: #c4b5fd;
}

.deduction-amount-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: #fffbeb;
  border-radius: 12px;
  border: 1px dashed #fcd34d;
  margin-top: -0.25rem;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.deduction-input-wrap {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  width: 150px;
  transition: all 0.2s ease;
}

.deduction-input-wrap:focus-within {
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.deduction-currency {
  background: #f1f5f9;
  padding: 0.5rem 0.75rem;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  border-right: 1px solid #e2e8f0;
}

.deduction-input {
  width: 100%;
  border: none;
  padding: 0.5rem 0.75rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1e293b;
  text-align: right;
}

.deduction-input:focus {
  outline: none;
}

.toggle-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.toggle-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.toggle-content strong {
  font-size: 0.9375rem;
  color: #1e293b;
}

.toggle-content span {
  font-size: 0.8125rem;
  color: #64748b;
}

/* Subsidy Grid */
.subsidy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.subsidy-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.subsidy-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.subsidy-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.subsidy-name {
  font-weight: 600;
  font-size: 0.9375rem;
  color: #1e293b;
}

.subsidy-desc {
  font-size: 0.75rem;
  color: #64748b;
}

/* Tolerance Input */
.tolerance-input {
  max-width: 200px;
}

.input-with-suffix {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.input-with-suffix input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  text-align: center;
  width: 60px;
}

.input-with-suffix input:focus {
  outline: none;
}

.input-with-suffix .suffix {
  padding: 0.75rem 1rem;
  background: #e2e8f0;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
}

.input-hint {
  font-size: 0.8125rem;
  color: #64748b;
  margin-top: 0.5rem;
}

/* Notification Preview */
.notification-preview {
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.preview-header {
  padding: 0.75rem 1rem;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: #64748b;
}

.preview-body {
  padding: 1rem;
}

.preview-from {
  font-size: 0.8125rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.preview-subject {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.75rem;
}

.preview-text {
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.6;
}

/* Signature Upload */
.signature-upload {
  position: relative;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f8fafc;
}

.signature-upload:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.signature-preview {
  width: 100%;
  height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.signature-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
}

.empty-state i {
  font-size: 2rem;
  color: #94a3b8;
}

.empty-state span {
  font-size: 0.9375rem;
}

.empty-state small {
  font-size: 0.75rem;
  color: #94a3b8;
}

/* Transitions */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Responsive */
@media (max-width: 1024px) {
  .settings-sidebar {
    width: 80px;
  }
  
  .sidebar-title,
  .nav-content,
  .active-indicator {
    display: none;
  }
  
  .nav-item {
    justify-content: center;
    padding: 0.875rem;
  }
  
  .sidebar-header {
    justify-content: center;
  }
  
  .save-btn span {
    display: none;
  }
  
  .save-btn {
    padding: 0.875rem;
  }
}

@media (max-width: 768px) {
  .settings-container {
    flex-direction: column;
  }
  
  .settings-sidebar {
    width: 100%;
    height: auto;
    position: relative;
  }
  
  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
    padding: 0.75rem;
    gap: 0.5rem;
  }
  
  .nav-item {
    flex-shrink: 0;
    padding: 0.625rem 1rem;
  }
  
  .nav-icon {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }
  
  .sidebar-header {
    display: none;
  }
  
  .sidebar-footer {
    padding: 0.75rem;
  }
  
  .save-btn span {
    display: inline;
  }
  
  .settings-content {
    padding: 1rem;
  }
  
  .form-grid,
  .form-grid.three-cols {
    grid-template-columns: 1fr;
  }
  
  .content-header {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
  }
  
  .header-icon {
    width: 48px;
    height: 48px;
    font-size: 1.25rem;
  }
  
  .header-text h2 {
    font-size: 1.25rem;
  }
}
</style>
