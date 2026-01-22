<template>
  <div class="companies-page">
    <div class="page-header">
      <div class="search-box">
        <i class="pi pi-search"></i>
        <input v-model="searchQuery" type="text" placeholder="Buscar empresas..." @input="debouncedSearch" />
      </div>
      <button @click="openCreateModal" class="btn-primary">
        <i class="pi pi-plus"></i>
        Nova Empresa
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
        <button @click="openCreateModal" class="btn-primary">
          Cadastrar Empresa
        </button>
      </div>

      <div v-else>
        <table class="data-table">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Domínio/Subdomínio</th>
              <th>Plano</th>
              <th>Status</th>
              <th>Assinatura</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="company in companies" :key="company.id">
              <td>
                <div class="company-cell">
                  <div class="company-logo">
                    {{ company.name.charAt(0) }}
                  </div>
                  <div class="company-info">
                    <span class="company-name">{{ company.name }}</span>
                    <span class="company-nif">{{ company.nif || 'NIF não inf.' }}</span>
                  </div>
                </div>
              </td>
              <td>{{ company.domain || company.subdomain }}</td>
              <td>
                <span class="plan-badge">
                  {{ company.subscription?.plan?.name || 'N/A' }}
                </span>
              </td>
              <td>
                <span :class="`status-badge ${company.is_active ? 'status-active' : 'status-inactive'}`">
                  {{ company.is_active ? 'Ativa' : 'Inativa' }}
                </span>
              </td>
              <td>
                <span v-if="company.subscription">
                  Expira em: {{ formatDate(company.subscription.end_date) }}
                </span>
                <span v-else class="text-danger">Sem assinatura</span>
              </td>
              <td>
                <div class="action-buttons">
                  <button @click="viewCompany(company)" class="btn-icon" title="Ver Detalhes">
                    <i class="pi pi-eye"></i>
                  </button>
                  <button @click="editCompany(company)" class="btn-icon" title="Editar">
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button @click="toggleStatus(company)" class="btn-icon"
                    :title="company.is_active ? 'Desativar' : 'Ativar'">
                    <i :class="company.is_active ? 'pi pi-times-circle' : 'pi pi-check-circle'"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <!-- Modal for Create/Edit Company -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditing ? 'Editar Empresa' : 'Nova Empresa' }}</h3>
          <button @click="closeModal" class="close-btn">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveCompany" class="modal-body">
          <div class="form-group">
            <label>Nome da Empresa *</label>
            <input v-model="form.name" type="text" required />
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Subdomínio *</label>
              <input v-model="form.subdomain" type="text" required placeholder="empresa" />
            </div>
            <div class="form-group">
              <label>NIF (Opcional)</label>
              <input v-model="form.nif" type="text" />
            </div>
          </div>

          <div class="form-group">
            <label>Email de Contato *</label>
            <input v-model="form.email" type="email" required />
          </div>

          <div class="form-group">
            <label>Plano Inicial</label>
            <select v-model="form.plan_id">
              <option value="">Selecione um plano...</option>
              <option v-for="plan in plans" :key="plan.id" :value="plan.id">
                {{ plan.name }}
              </option>
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

    <!-- Company Details Modal -->
    <div v-if="showDetailsModal && selectedCompany" class="modal-overlay" @click="closeDetailsModal">
      <div class="modal modal-lg" @click.stop>
        <div class="modal-header">
          <h3>Detalhes da Empresa</h3>
          <button @click="closeDetailsModal" class="close-btn">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="company-header">
            <div class="company-logo-large">
              {{ selectedCompany.name.charAt(0) }}
            </div>
            <div>
              <h2>{{ selectedCompany.name }}</h2>
              <span :class="`status-badge status-${selectedCompany.is_active ? 'active' : 'inactive'}`">
                {{ selectedCompany.is_active ? 'Ativa' : 'Inativa' }}
              </span>
            </div>
          </div>

          <div class="details-grid">
            <div class="detail-group">
              <label>NIF</label>
              <p>{{ selectedCompany.nif || 'Não informado' }}</p>
            </div>
            <div class="detail-group">
              <label>Email</label>
              <p>{{ selectedCompany.email }}</p>
            </div>
            <div class="detail-group">
              <label>Telefone</label>
              <p>{{ selectedCompany.phone || '-' }}</p>
            </div>
            <div class="detail-group">
              <label>Plano</label>
              <p>{{ selectedCompany.subscription?.plan?.name || 'Sem plano' }}</p>
            </div>
            <div class="detail-group">
              <label>Domínio</label>
              <p>{{ selectedCompany.domain || selectedCompany.subdomain || '-' }}</p>
            </div>
            <div class="detail-group">
              <label>Cidade</label>
              <p>{{ selectedCompany.city || '-' }}</p>
            </div>
          </div>

          <div v-if="selectedCompany.address" class="detail-group full-width">
            <label>Endereço Completo</label>
            <p>{{ selectedCompany.address }}, {{ selectedCompany.postal_code }} {{ selectedCompany.city }}</p>
          </div>

          <div class="subscription-info" v-if="selectedCompany.subscription">
            <h4>Informações da Assinatura</h4>
            <div class="details-grid">
              <div class="detail-group">
                <label>Status</label>
                <span :class="`status-badge status-${selectedCompany.subscription.status}`">
                  {{ selectedCompany.subscription.status }}
                </span>
              </div>
              <div class="detail-group">
                <label>Data de Início</label>
                <p>{{ formatDate(selectedCompany.subscription.start_date) }}</p>
              </div>
              <div class="detail-group">
                <label>Próxima Renovação</label>
                <p>{{ formatDate(selectedCompany.subscription.end_date) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeDetailsModal" class="btn-secondary">Fechar</button>
          <button @click="editCompany(selectedCompany); closeDetailsModal()" class="btn-primary">
            <i class="pi pi-pencil"></i>
            Editar
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
import dayjs from 'dayjs'

const toast = useToast()
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const showDetailsModal = ref(false)
const isEditing = ref(false)

const companies = ref([])
const plans = ref([])
const selectedCompany = ref(null)

const form = reactive({
  name: '',
  subdomain: '',
  nif: '',
  email: '',
  plan_id: '',
  is_active: true
})

const fetchCompanies = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/super-admin/companies', {
      params: { search: searchQuery.value }
    })
    companies.value = data.data
  } catch (error) {
    toast.error('Erro ao carregar empresas')
  } finally {
    loading.value = false
  }
}

const fetchPlans = async () => {
  try {
    const { data } = await api.get('/super-admin/plans')
    plans.value = data
  } catch (error) {
    console.error('Error fetching plans')
  }
}

const debouncedSearch = debounce(() => {
  fetchCompanies()
}, 500)

const openCreateModal = () => {
  isEditing.value = false
  resetForm()
  showModal.value = true
}

const editCompany = (company) => {
  isEditing.value = true
  Object.assign(form, {
    id: company.id,
    name: company.name,
    nif: company.nif,
    email: company.email,
    phone: company.phone,
    address: company.address,
    city: company.city,
    postal_code: company.postal_code,
    subdomain: company.subdomain,
    domain: company.domain,
    plan_id: company.subscription?.plan_id || '',
    is_active: company.is_active
  })
  showModal.value = true
}

const viewCompany = (company) => {
  selectedCompany.value = company
  showDetailsModal.value = true
}

const saveCompany = async () => {
  saving.value = true
  try {
    if (isEditing.value) {
      await api.put(`/super-admin/companies/${form.id}`, form)
      toast.success('Empresa atualizada com sucesso!')
    } else {
      await api.post('/super-admin/companies', form)
      toast.success('Empresa criada com sucesso!')
    }
    closeModal()
    fetchCompanies()
  } catch (error) {
    const msg = error.response?.data?.message || 'Erro ao salvar empresa'
    toast.error(msg)
  } finally {
    saving.value = false
  }
}

const toggleStatus = async (company) => {
  try {
    await api.post(`/super-admin/companies/${company.id}/toggle-status`)
    toast.success(`Empresa ${company.is_active ? 'desativada' : 'ativada'} com sucesso!`)
    fetchCompanies()
  } catch (error) {
    toast.error('Erro ao alternar status')
  }
}

const deleteCompany = async (company) => {
  if (!confirm(`Tem certeza que deseja remover ${company.name}?`)) return

  try {
    await api.delete(`/super-admin/companies/${company.id}`)
    toast.success('Empresa removida com sucesso!')
    fetchCompanies()
  } catch (error) {
    toast.error('Erro ao remover empresa')
  }
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedCompany.value = null
}

const resetForm = () => {
  Object.assign(form, {
    id: null,
    name: '',
    nif: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    subdomain: '',
    domain: '',
    plan_id: '',
    is_active: true
  })
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-PT')
}

onMounted(() => {
  fetchCompanies()
  fetchPlans()
})
</script>

<style scoped>
.companies-page {
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
  color: #64748b;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: #3b82f6;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
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

.company-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.company-logo {
  width: 40px;
  height: 40px;
  background: #f1f5f9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #64748b;
  font-size: 1rem;
}

.company-info {
  display: flex;
  flex-direction: column;
}

.company-name {
  font-weight: 600;
  color: #1e293b;
}

.company-nif {
  font-size: 0.75rem;
  color: #64748b;
}

.plan-badge {
  background: #e0e7ff;
  color: #4338ca;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-active {
  background: #dcfce7;
  color: #166534;
}

.status-inactive {
  background: #fee2e2;
  color: #991b1b;
}

.text-danger {
  color: #ef4444;
  font-weight: 500;
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
  width: 100%;
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

.company-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.company-logo-large {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  font-size: 2rem;
}

.company-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: #1e293b;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.detail-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-group.full-width {
  grid-column: 1 / -1;
}

.detail-group label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
}

.detail-group p {
  margin: 0;
  color: #1e293b;
  font-weight: 500;
}

.subscription-info {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1.5rem;
}

.subscription-info h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #1e293b;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
