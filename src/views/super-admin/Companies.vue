<template>
  <div class="companies-page">
    <div class="page-header">
      <div class="search-box">
        <i class="pi pi-search"></i>
        <input v-model="searchQuery" type="text" placeholder="Buscar empresas..." @input="debouncedSearch" />
      </div>
      <button @click="openCreateModal" class="btn-primary">
        <i class="pi pi-plus"></i> Nova Empresa
      </button>
    </div>

    <Card>
      <div v-if="loading" class="loading-state">
        <Loading message="Carregando empresas..." />
      </div>
      <div v-else-if="companies.length === 0" class="empty-state">
        <i class="pi pi-building"></i>
        <h3>Nenhuma empresa cadastrada</h3>
        <p>Comece adicionando seu primeiro cliente SaaS</p>
        <button @click="openCreateModal" class="btn-primary">Cadastrar Empresa</button>
      </div>
      <div v-else>
        <table class="data-table">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Email</th>
              <th>Plano</th>
              <th>Status</th>
              <th>Licença</th>
              <th>Dias Rest.</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="company in companies" :key="company.id">
              <td>
                <div class="company-cell">
                  <div class="company-logo">{{ company.name.charAt(0) }}</div>
                  <div class="company-info">
                    <span class="company-name">{{ company.name }}</span>
                    <span class="company-nif">{{ company.tax_id || 'NIF não inf.' }}</span>
                  </div>
                </div>
              </td>
              <td>{{ company.email || '-' }}</td>
              <td>
                <span class="plan-badge">{{ company.subscription?.plan?.name || 'N/A' }}</span>
              </td>
              <td>
                <span :class="`status-badge ${company.status === 'active' ? 'status-active' : 'status-inactive'}`">
                  {{ company.status === 'active' ? 'Ativa' : company.status === 'suspended' ? 'Suspensa' : 'Inativa' }}
                </span>
              </td>
              <td>
                <div v-if="company.subscription">
                  <span :class="`status-badge ${getLicenseStatus(company).cls}`">
                    {{ getLicenseStatus(company).label }}
                  </span>
                  <div class="date-small">
                    {{ formatDate(company.subscription.start_date) }} → {{ formatDate(company.subscription.end_date) }}
                  </div>
                </div>
                <span v-else class="text-danger">Sem licença</span>
              </td>
              <td>
                <span v-if="company.subscription?.end_date" :class="getDaysClass(company)">
                  {{ getDaysRemaining(company) }}d
                </span>
                <span v-else class="text-danger">-</span>
              </td>
              <td>
                <div class="action-buttons">
                  <button @click="openLicenseModal(company)" class="btn-icon btn-license" title="Gerir Licença">
                    <i class="pi pi-calendar"></i>
                  </button>
                  <button @click="viewCompany(company)" class="btn-icon" title="Ver Detalhes">
                    <i class="pi pi-eye"></i>
                  </button>
                  <button @click="editCompany(company)" class="btn-icon" title="Editar">
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button @click="toggleStatus(company)" class="btn-icon"
                    :title="company.status === 'active' ? 'Desativar' : 'Ativar'">
                    <i :class="company.status === 'active' ? 'pi pi-times-circle' : 'pi pi-check-circle'"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <!-- Modal Criar/Editar Empresa -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditing ? 'Editar Empresa' : 'Nova Empresa' }}</h3>
          <button @click="closeModal" class="close-btn"><i class="pi pi-times"></i></button>
        </div>
        <form @submit.prevent="saveCompany" class="modal-body">
          <div class="form-group">
            <label>Nome da Empresa *</label>
            <input v-model="form.name" type="text" required />
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>Email *</label>
              <input v-model="form.email" type="email" required />
            </div>
            <div class="form-group">
              <label>Telefone</label>
              <input v-model="form.phone" type="text" />
            </div>
          </div>
          <div class="form-group" v-if="!isEditing">
            <label>Plano Inicial</label>
            <select v-model="form.plan_id">
              <option value="">Selecione um plano...</option>
              <option v-for="plan in plans" :key="plan.id" :value="plan.id">{{ plan.name }}</option>
            </select>
          </div>
          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="saving">
              {{ saving ? 'Processando...' : (isEditing ? 'Atualizar' : 'Criar Empresa') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Licença -->
    <div v-if="showLicenseModal && selectedCompany" class="modal-overlay" @click="closeLicenseModal">
      <div class="modal modal-license" @click.stop>
        <div class="modal-header">
          <div>
            <h3>Gerir Licença</h3>
            <p class="modal-subtitle">{{ selectedCompany.name }}</p>
          </div>
          <button @click="closeLicenseModal" class="close-btn"><i class="pi pi-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="license-status-card" :class="getLicenseStatus(selectedCompany).cls">
            <i class="pi pi-shield"></i>
            <div>
              <strong>Estado Atual: {{ getLicenseStatus(selectedCompany).label }}</strong>
              <p v-if="selectedCompany.subscription?.end_date">
                Expira em: {{ formatDate(selectedCompany.subscription.end_date) }}
                ({{ getDaysRemaining(selectedCompany) }} dias restantes)
              </p>
              <p v-else>Sem licença definida</p>
            </div>
          </div>
          <div class="form-group">
            <label>Data de Início *</label>
            <input v-model="licenseForm.start_date" type="date" required />
          </div>
          <div class="form-group">
            <label>Data de Fim *</label>
            <input v-model="licenseForm.end_date" type="date" required />
          </div>
          <div class="license-presets">
            <span class="presets-label">Definir rapidamente:</span>
            <button type="button" class="preset-btn" @click="setPreset(30)">+30 dias</button>
            <button type="button" class="preset-btn" @click="setPreset(90)">+3 meses</button>
            <button type="button" class="preset-btn" @click="setPreset(180)">+6 meses</button>
            <button type="button" class="preset-btn" @click="setPreset(365)">+1 ano</button>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" @click="closeLicenseModal" class="btn-secondary">Cancelar</button>
          <button @click="saveLicense" class="btn-primary" :disabled="savingLicense">
            <i class="pi pi-check"></i>
            {{ savingLicense ? 'Salvando...' : 'Guardar Licença' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Detalhes -->
    <div v-if="showDetailsModal && selectedCompany" class="modal-overlay" @click="closeDetailsModal">
      <div class="modal modal-lg" @click.stop>
        <div class="modal-header">
          <h3>Detalhes da Empresa</h3>
          <button @click="closeDetailsModal" class="close-btn"><i class="pi pi-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="company-header">
            <div class="company-logo-large">{{ selectedCompany.name.charAt(0) }}</div>
            <div>
              <h2>{{ selectedCompany.name }}</h2>
              <span :class="`status-badge status-${selectedCompany.status === 'active' ? 'active' : 'inactive'}`">
                {{ selectedCompany.status }}
              </span>
            </div>
          </div>
          <div class="details-grid">
            <div class="detail-group"><label>NIF</label><p>{{ selectedCompany.tax_id || '-' }}</p></div>
            <div class="detail-group"><label>Email</label><p>{{ selectedCompany.email }}</p></div>
            <div class="detail-group"><label>Telefone</label><p>{{ selectedCompany.phone || '-' }}</p></div>
            <div class="detail-group"><label>Plano</label><p>{{ selectedCompany.subscription?.plan?.name || 'Sem plano' }}</p></div>
          </div>
          <div class="subscription-info" v-if="selectedCompany.subscription">
            <h4>Informações da Licença</h4>
            <div class="details-grid">
              <div class="detail-group">
                <label>Status</label>
                <span :class="`status-badge status-${selectedCompany.subscription.status}`">{{ selectedCompany.subscription.status }}</span>
              </div>
              <div class="detail-group"><label>Início</label><p>{{ formatDate(selectedCompany.subscription.start_date) }}</p></div>
              <div class="detail-group"><label>Expiração</label><p>{{ formatDate(selectedCompany.subscription.end_date) }}</p></div>
              <div class="detail-group">
                <label>Dias Restantes</label>
                <p :class="getDaysClass(selectedCompany)">{{ getDaysRemaining(selectedCompany) }} dias</p>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeDetailsModal" class="btn-secondary">Fechar</button>
          <button @click="openLicenseModal(selectedCompany); closeDetailsModal()" class="btn-primary">
            <i class="pi pi-calendar"></i> Gerir Licença
          </button>
        </div>
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

const toast = useToast()
const loading = ref(false)
const saving = ref(false)
const savingLicense = ref(false)
const showModal = ref(false)
const showLicenseModal = ref(false)
const showDetailsModal = ref(false)
const isEditing = ref(false)
const searchQuery = ref('')
const companies = ref([])
const plans = ref([])
const selectedCompany = ref(null)

const form = reactive({ id: null, name: '', email: '', phone: '', plan_id: '', tax_id: '' })
const licenseForm = reactive({ start_date: '', end_date: '' })

const fetchCompanies = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/super-admin/companies', { params: { search: searchQuery.value, per_page: 50 } })
    companies.value = data.data ?? data
  } catch (error) {
    toast.error('Erro ao carregar empresas: ' + (error.response?.data?.error || error.message))
  } finally {
    loading.value = false
  }
}

const fetchPlans = async () => {
  try {
    const { data } = await api.get('/super-admin/plans')
    plans.value = Array.isArray(data) ? data : (data.data ?? [])
  } catch {}
}

const debouncedSearch = debounce(() => fetchCompanies(), 500)

const getLicenseStatus = (company) => {
  const sub = company.subscription
  if (!sub) return { label: 'Sem licença', cls: 'status-inactive' }
  if (sub.status === 'expired') return { label: 'Expirada', cls: 'status-inactive' }
  const days = getDaysRemaining(company)
  if (days <= 0) return { label: 'Expirada', cls: 'status-inactive' }
  if (days <= 7) return { label: 'Expira Breve', cls: 'status-warning' }
  return { label: 'Ativa', cls: 'status-active' }
}

const getDaysRemaining = (company) => {
  const end = company.subscription?.end_date
  if (!end) return 0
  return Math.max(0, Math.ceil((new Date(end) - new Date()) / 86400000))
}

const getDaysClass = (company) => {
  const d = getDaysRemaining(company)
  if (d <= 0) return 'text-danger'
  if (d <= 7) return 'text-warning'
  return 'text-success'
}

const openCreateModal = () => {
  isEditing.value = false
  Object.assign(form, { id: null, name: '', email: '', phone: '', plan_id: '', tax_id: '' })
  showModal.value = true
}

const editCompany = (company) => {
  isEditing.value = true
  Object.assign(form, { id: company.id, name: company.name, email: company.email, phone: company.phone, tax_id: company.tax_id, plan_id: company.subscription?.plan_id || '' })
  showModal.value = true
}

const viewCompany = (company) => { selectedCompany.value = company; showDetailsModal.value = true }

const openLicenseModal = (company) => {
  selectedCompany.value = company
  const sub = company.subscription
  licenseForm.start_date = sub?.start_date ? sub.start_date.substring(0, 10) : new Date().toISOString().substring(0, 10)
  licenseForm.end_date = sub?.end_date ? sub.end_date.substring(0, 10) : ''
  showLicenseModal.value = true
}

const setPreset = (days) => {
  const start = licenseForm.start_date || new Date().toISOString().substring(0, 10)
  licenseForm.end_date = new Date(new Date(start).getTime() + days * 86400000).toISOString().substring(0, 10)
}

const saveCompany = async () => {
  saving.value = true
  try {
    if (isEditing.value) {
      await api.put(`/super-admin/companies/${form.id}`, form)
      toast.success('Empresa atualizada!')
    } else {
      await api.post('/super-admin/companies', form)
      toast.success('Empresa criada!')
    }
    closeModal(); fetchCompanies()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Erro ao salvar empresa')
  } finally { saving.value = false }
}

const saveLicense = async () => {
  if (!licenseForm.start_date || !licenseForm.end_date) { toast.error('Preencha as datas'); return }
  savingLicense.value = true
  try {
    const { data } = await api.put(`/super-admin/companies/${selectedCompany.value.id}/license`, licenseForm)
    toast.success('Licença atualizada com sucesso!')
    const idx = companies.value.findIndex(c => c.id === selectedCompany.value.id)
    if (idx !== -1) companies.value[idx] = data.company
    closeLicenseModal()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Erro ao atualizar licença')
  } finally { savingLicense.value = false }
}

const toggleStatus = async (company) => {
  try {
    const { data } = await api.post(`/super-admin/companies/${company.id}/toggle-status`)
    toast.success(data.message)
    const idx = companies.value.findIndex(c => c.id === company.id)
    if (idx !== -1) companies.value[idx] = { ...companies.value[idx], ...data.company }
  } catch { toast.error('Erro ao alternar status') }
}

const closeModal = () => { showModal.value = false }
const closeLicenseModal = () => { showLicenseModal.value = false; selectedCompany.value = null }
const closeDetailsModal = () => { showDetailsModal.value = false; selectedCompany.value = null }
const formatDate = (date) => date ? new Date(date).toLocaleDateString('pt-PT') : '-'

onMounted(() => { fetchCompanies(); fetchPlans() })
</script>

<style scoped>
.companies-page { display: flex; flex-direction: column; gap: 1.5rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; }
.search-box { position: relative; flex: 1; max-width: 400px; }
.search-box i { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #64748b; }
.search-box input { width: 100%; padding: 0.75rem 1rem 0.75rem 3rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 0.875rem; }
.search-box input:focus { outline: none; border-color: #2dd4a8; }
.btn-primary { padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #2dd4a8 0%, #0f4c81 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: transform 0.2s; }
.btn-primary:hover:not(:disabled) { transform: translateY(-2px); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.loading-state, .empty-state { padding: 4rem 2rem; text-align: center; }
.empty-state i { font-size: 4rem; color: #d1d5db; margin-bottom: 1rem; }
.empty-state h3 { font-size: 1.25rem; color: #111827; margin: 0 0 0.5rem; }
.empty-state p { color: #6b7280; margin: 0 0 1.5rem; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table thead { background: #f9fafb; }
.data-table th { padding: 0.875rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
.data-table td { padding: 0.875rem 1rem; border-top: 1px solid #e5e7eb; font-size: 0.875rem; }
.company-cell { display: flex; align-items: center; gap: 0.75rem; }
.company-logo { width: 36px; height: 36px; background: linear-gradient(135deg, #2dd4a8, #0f4c81); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; font-size: 0.9rem; flex-shrink: 0; }
.company-info { display: flex; flex-direction: column; }
.company-name { font-weight: 600; color: #1e293b; }
.company-nif { font-size: 0.75rem; color: #64748b; }
.plan-badge { background: #e0e7ff; color: #4338ca; padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
.status-badge { padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; display: inline-block; }
.status-active { background: #dcfce7; color: #166534; }
.status-inactive { background: #fee2e2; color: #991b1b; }
.status-warning { background: #fef3c7; color: #92400e; }
.status-trial { background: #dbeafe; color: #1e40af; }
.date-small { font-size: 0.7rem; color: #64748b; margin-top: 2px; }
.text-danger { color: #ef4444; font-weight: 600; }
.text-warning { color: #d97706; font-weight: 600; }
.text-success { color: #16a34a; font-weight: 600; }
.action-buttons { display: flex; gap: 0.4rem; }
.btn-icon { width: 30px; height: 30px; border: none; background: #f3f4f6; color: #4b5563; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; font-size: 0.8rem; }
.btn-icon:hover { background: #e5e7eb; color: #111827; }
.btn-license { background: #eff6ff; color: #2563eb; }
.btn-license:hover { background: #dbeafe; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 1rem; }
.modal { background: white; border-radius: 12px; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.modal-lg { max-width: 700px; }
.modal-license { max-width: 500px; }
.modal-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 1.5rem; border-bottom: 1px solid #e5e7eb; }
.modal-header h3 { font-size: 1.15rem; font-weight: 700; margin: 0; color: #111827; }
.modal-subtitle { color: #6b7280; font-size: 0.85rem; margin: 0.25rem 0 0; }
.close-btn { width: 30px; height: 30px; border: none; background: #f3f4f6; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; flex-shrink: 0; }
.close-btn:hover { background: #e5e7eb; }
.modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group label { font-size: 0.875rem; font-weight: 600; color: #374151; }
.form-group input, .form-group select { padding: 0.75rem 1rem; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 0.875rem; width: 100%; transition: border-color 0.2s; }
.form-group input:focus, .form-group select:focus { outline: none; border-color: #2dd4a8; }
.modal-footer { display: flex; justify-content: flex-end; gap: 1rem; padding: 1.25rem 1.5rem; border-top: 1px solid #e5e7eb; }
.btn-secondary { padding: 0.75rem 1.5rem; background: white; border: 2px solid #e5e7eb; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-secondary:hover { border-color: #d1d5db; background: #f9fafb; }
.license-status-card { display: flex; align-items: flex-start; gap: 1rem; padding: 1rem 1.25rem; border-radius: 10px; border: 2px solid; }
.license-status-card.status-active { background: #f0fdf4; border-color: #86efac; color: #166534; }
.license-status-card.status-inactive { background: #fef2f2; border-color: #fca5a5; color: #991b1b; }
.license-status-card.status-warning { background: #fffbeb; border-color: #fcd34d; color: #92400e; }
.license-status-card i { font-size: 1.5rem; margin-top: 2px; }
.license-status-card strong { display: block; margin-bottom: 0.25rem; }
.license-status-card p { margin: 0; font-size: 0.85rem; opacity: 0.8; }
.license-presets { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.presets-label { font-size: 0.8rem; color: #6b7280; font-weight: 600; }
.preset-btn { padding: 0.35rem 0.75rem; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; color: #475569; transition: all 0.2s; }
.preset-btn:hover { background: #2dd4a8; color: white; border-color: #2dd4a8; }
.company-header { display: flex; align-items: center; gap: 1.5rem; padding-bottom: 1.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid #e5e7eb; }
.company-logo-large { width: 64px; height: 64px; background: linear-gradient(135deg, #2dd4a8, #0f4c81); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; font-size: 1.75rem; flex-shrink: 0; }
.company-header h2 { margin: 0 0 0.5rem; font-size: 1.4rem; color: #1e293b; }
.details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.25rem; margin-bottom: 1.25rem; }
.detail-group { display: flex; flex-direction: column; gap: 0.25rem; }
.detail-group label { font-size: 0.7rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.detail-group p { margin: 0; color: #1e293b; font-weight: 500; font-size: 0.9rem; }
.subscription-info { background: #f8fafc; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; }
.subscription-info h4 { margin: 0 0 1rem; font-size: 0.95rem; color: #1e293b; font-weight: 700; }
@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: stretch; }
  .form-grid { grid-template-columns: 1fr; }
  .data-table { font-size: 0.8rem; }
}
</style>
