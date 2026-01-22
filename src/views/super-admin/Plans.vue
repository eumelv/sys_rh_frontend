<template>
  <div class="plans-page">
    <div class="page-header">
      <div class="header-info">
        <h3>Planos & Preços</h3>
        <p>Gerencie os pacotes do SaaS e seus limites</p>
      </div>
      <button @click="openCreateModal" class="btn-primary">
        <i class="pi pi-plus"></i>
        Novo Plano
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <Loading message="Carregando planos..." />
    </div>

    <div v-else class="plans-grid">
      <div v-for="plan in plans" :key="plan.id" class="plan-card" :class="{ 'plan-inactive': !plan.is_active }">
        <div class="plan-header">
          <div class="plan-main">
            <h4>{{ plan.name }}</h4>
            <span class="price">{{ formatCurrency(plan.price_monthly) }}<small>/mês</small></span>
          </div>
          <span :class="`status-dot ${plan.is_active ? 'active' : 'inactive'}`"></span>
        </div>

        <div class="plan-features">
          <div class="feature-item">
            <i class="pi pi-users"></i>
            <span>Até {{ plan.max_employees || '∞' }} funcionários</span>
          </div>
          <div class="feature-item">
            <i class="pi pi-database"></i>
            <span>{{ plan.storage_limit || '1' }}GB de armazenamento</span>
          </div>
          <div class="feature-list">
            <p><strong>Funcionalidades:</strong></p>
            <ul>
              <li v-for="feature in plan.features" :key="feature">
                <i class="pi pi-check text-success"></i>
                {{ feature }}
              </li>
            </ul>
          </div>
        </div>

        <div class="plan-actions">
          <button @click="editPlan(plan)" class="btn-secondary">Editar</button>
          <button @click="togglePlanStatus(plan)" class="btn-outline">
            {{ plan.is_active ? 'Desativar' : 'Ativar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal for Create/Edit Plan -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal modal-lg" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditing ? 'Editar Plano' : 'Novo Plano' }}</h3>
          <button @click="closeModal" class="close-btn">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <form @submit.prevent="savePlan" class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Nome do Plano *</label>
              <input v-model="form.name" type="text" required @input="generateSlug" />
            </div>
            <div class="form-group">
              <label>Slug (Identificador) *</label>
              <input v-model="form.slug" type="text" required />
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Preço Mensal (AOA) *</label>
              <input v-model.number="form.price_monthly" type="number" required min="0" step="0.01" />
            </div>
            <div class="form-group">
              <label>Limite de Funcionários</label>
              <input v-model="form.max_employees" type="number" placeholder="0 para ilimitado" />
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Limite de Armazenamento (GB)</label>
              <input v-model="form.storage_limit" type="number" />
            </div>
            <div class="form-group">
              <label>Dias de Teste</label>
              <input v-model="form.trial_days" type="number" />
            </div>
          </div>

          <div class="form-group">
            <label>Breve Descrição</label>
            <textarea v-model="form.description" rows="2"></textarea>
          </div>

          <div class="form-group">
            <label>Funcionalidades (uma por linha)</label>
            <textarea v-model="featuresText" rows="5" placeholder="Ex: Recruitment\nPayroll"></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="saving">
              {{ saving ? 'Salvando...' : 'Salvar Plano' }}
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
import Loading from '@/components/common/Loading.vue'
import { useToast } from 'vue-toastification'

const toast = useToast()
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const isEditing = ref(false)

const plans = ref([])
const featuresText = ref('')

const form = reactive({
  id: null,
  name: '',
  slug: '',
  price_monthly: 0,
  max_employees: 0,
  storage_limit: 1,
  trial_days: 14,
  description: '',
  features: [],
  is_active: true
})

const fetchPlans = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/super-admin/plans')
    plans.value = data
  } catch (error) {
    toast.error('Erro ao carregar planos')
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  isEditing.value = false
  resetForm()
  showModal.value = true
}

const editPlan = (plan) => {
  isEditing.value = true
  Object.assign(form, {
    id: plan.id,
    name: plan.name,
    slug: plan.slug,
    price_monthly: plan.price_monthly / 100, // Convert cents to units
    max_employees: plan.max_employees,
    storage_limit: plan.storage_limit,
    trial_days: plan.trial_days,
    description: plan.description,
    features: plan.features || [],
    is_active: plan.is_active
  })
  featuresText.value = form.features.join('\n')
  showModal.value = true
}

const savePlan = async () => {
  saving.value = true
  form.features = featuresText.value.split('\n').filter(f => f.trim() !== '')

  const payload = {
    ...form,
    price_monthly: Math.round(form.price_monthly * 100) // Convert to cents
  }

  try {
    if (isEditing.value) {
      await api.put(`/super-admin/plans/${form.id}`, payload)
      toast.success('Plano atualizado!')
    } else {
      await api.post('/super-admin/plans', payload)
      toast.success('Plano criado!')
    }
    closeModal()
    fetchPlans()
  } catch (error) {
    const msg = error.response?.data?.message || 'Erro ao salvar plano'
    toast.error(msg)
  } finally {
    saving.value = false
  }
}

const togglePlanStatus = async (plan) => {
  try {
    // Check if toggle endpoint exists or use update
    // PlanController doesn't have toggle-status route in api.php usually unless added.
    // Assuming we use update for now as toggle-status route was not seen in api.php dump
    await api.put(`/super-admin/plans/${plan.id}`, {
      is_active: !plan.is_active
    })
    toast.success('Status do plano alterado!')
    fetchPlans()
  } catch (error) {
    toast.error('Erro ao alterar status')
  }
}

const generateSlug = () => {
  if (!isEditing.value) {
    form.slug = form.name.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
  }
}

const resetForm = () => {
  Object.assign(form, {
    id: null,
    name: '',
    slug: '',
    price_monthly: 0,
    max_employees: 0,
    storage_limit: 1,
    trial_days: 14,
    description: '',
    features: [],
    is_active: true
  })
  featuresText.value = ''
}

const closeModal = () => {
  showModal.value = false
}

const formatCurrency = (value) => {
  if (value === undefined || value === null) return 'AOA 0,00'
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA'
  }).format(value / 100)
}

onMounted(() => {
  fetchPlans()
})
</script>

<style scoped>
.plans-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.plan-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.plan-main h4 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.price {
  display: block;
  font-size: 1.5rem;
  font-weight: 800;
  color: #3b82f6;
  margin-top: 0.5rem;
}

.price small {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 400;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-dot.active {
  background: #10b981;
}

.status-dot.inactive {
  background: #ef4444;
}

.plan-features {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #475569;
}

.feature-list ul {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
}

.text-success {
  color: #10b981;
}

.plan-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

/* New Button Styles */
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
  justify-content: center;
  transition: transform 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
}

.btn-secondary {
  padding: 0.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 600;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.btn-outline {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
}

.btn-outline:hover {
  border-color: #64748b;
  background: #f8fafc;
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
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.modal-lg {
  max-width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  color: #64748b;
  padding: 0.5rem;
  border-radius: 50%;
}

.close-btn:hover {
  background: #f1f5f9;
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
.form-group textarea {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  width: 100%;
}

.form-group input:focus,
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

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
