<template>
  <div class="recruitment-page">
    <div class="page-header">
      <div class="header-info">
        <h3>Recrutamento & Seleção (ATS)</h3>
        <p>Gerencie suas vagas e acompanhe os candidatos</p>
      </div>
      <button @click="openCreateModal" class="btn-primary">
        <i class="pi pi-plus"></i>
        Nova Vaga
      </button>
    </div>

    <div class="stats-overview">
      <div class="stat-mini-card">
        <span class="label">Vagas Ativas</span>
        <span class="value">{{ stats.active_jobs }}</span>
      </div>
      <div class="stat-mini-card">
        <span class="label">Candidaturas este mês</span>
        <span class="value">{{ stats.total_applications }}</span>
      </div>
      <div class="stat-mini-card">
        <span class="label">Entrevistas agendadas</span>
        <span class="value">{{ stats.interviews_scheduled }}</span>
      </div>
    </div>

    <Card>
      <div v-if="loading" class="loading-state">
        <Loading message="Carregando vagas..." />
      </div>

      <div v-else-if="jobs.length === 0" class="empty-state">
        <i class="pi pi-briefcase"></i>
        <h3>Nenhuma vaga aberta</h3>
        <p>Publique uma vaga para começar a receber candidaturas</p>
        <button @click="openCreateModal" class="btn-primary">
          Publicar Vaga
        </button>
      </div>

      <div v-else>
        <table class="data-table">
          <thead>
            <tr>
              <th>Título da Vaga</th>
              <th>Departamento</th>
              <th>Candidatos</th>
              <th>Status</th>
              <th>Publicada em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="job in jobs" :key="job.id">
              <td>
                <div class="job-title-cell">
                  <strong>{{ job.title }}</strong>
                  <span>{{ job.location || 'Remoto' }}</span>
                </div>
              </td>
              <td>{{ job.department?.name || '-' }}</td>
              <td>
                <span class="applicant-count">
                  {{ job.applications_count || 0 }} candidatos
                </span>
              </td>
              <td>
                <span :class="`status-badge status-${job.status}`">
                  {{ getStatusLabel(job.status) }}
                </span>
              </td>
              <td>{{ formatDate(job.created_at) }}</td>
              <td>
                <div class="action-buttons">
                  <button @click="viewJob(job)" class="btn-icon" title="Ver Candidatos">
                    <i class="pi pi-users"></i>
                  </button>
                  <button @click="editJob(job)" class="btn-icon" title="Editar">
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button @click="deleteJob(job)" class="btn-icon btn-danger" title="Remover">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <!-- Candidates Search/View Modal -->
    <Modal v-if="showCandidatesModal" :title="`Candidatos - ${selectedJob?.title}`" @close="closeCandidatesModal"
      size="lg">
      <div v-if="!selectedJob?.applications?.length" class="empty-state">
        <i class="pi pi-users"></i>
        <h3>Nenhum candidato ainda</h3>
        <p>Divulgue sua vaga para atrair talentos!</p>
      </div>

      <table v-else class="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Data</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="app in selectedJob.applications" :key="app.id">
            <td>{{ app.first_name }} {{ app.last_name }}</td>
            <td>{{ app.email }}</td>
            <td>{{ formatDate(app.created_at) }}</td>
            <td>
              <span :class="`status-badge status-${app.status}`">{{ app.status }}</span>
            </td>
            <td>
              <button @click="viewResume(app)" class="btn-text-link">Ver CV</button>
            </td>
          </tr>
        </tbody>
      </table>
    </Modal>

    <!-- Modal for Create/Edit Job -->
    <Modal v-if="showModal" :title="isEditing ? 'Editar Vaga' : 'Nova Vaga'" @close="closeModal">
      <form @submit.prevent="saveJob" class="modal-form">
        <div class="form-group">
          <label>Título da Vaga *</label>
          <input v-model="form.title" type="text" required placeholder="Ex: Desenvolvedor Full Stack" />
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label>Departamento</label>
            <select v-model="form.department_id">
              <option value="">Selecione...</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Tipo de Contrato</label>
            <select v-model="form.employment_type">
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contrato</option>
              <option value="intern">Estágio</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Localização</label>
          <input v-model="form.location" type="text" placeholder="Ex: Luanda, Angola ou Remoto" />
        </div>

        <div class="form-group">
          <label>Descrição da Vaga *</label>
          <textarea v-model="form.description" rows="5" required
            placeholder="Descreva as responsabilidades e requisitos..."></textarea>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label>Salário Mínimo</label>
            <input v-model="form.salary_min" type="number" placeholder="Ex: 500000" />
          </div>
          <div class="form-group">
            <label>Salário Máximo</label>
            <input v-model="form.salary_max" type="number" placeholder="Ex: 800000" />
          </div>
        </div>

        <div class="form-group">
          <label>Data Limite (Expira em)</label>
          <input v-model="form.expires_at" type="date" />
        </div>

        <div class="modal-footer">
          <button type="button" @click="closeModal" class="btn-secondary">Cancelar</button>
          <button type="submit" class="btn-primary" :disabled="saving">
            {{ saving ? 'Publicando...' : (isEditing ? 'Atualizar' : 'Publicar Vaga') }}
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
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const isEditing = ref(false)

const jobs = ref([])
const departments = ref([])
const stats = ref({
  active_jobs: 0,
  total_applications: 0,
  interviews_scheduled: 0
})

const form = reactive({
  title: '',
  department_id: '',
  employment_type: 'full-time',
  location: '',
  description: '',
  salary_min: '',
  salary_max: '',
  expires_at: '',
  status: 'published'
})

const fetchJobs = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/admin/job-postings')
    jobs.value = data
  } catch (error) {
    toast.error('Erro ao carregar vagas')
  } finally {
    loading.value = false
  }
}

const fetchDepartments = async () => {
  try {
    const { data } = await api.get('/admin/departments')
    departments.value = data
  } catch (error) {
    console.error('Error fetching departments')
  }
}

const openCreateModal = () => {
  isEditing.value = false
  resetForm()
  showModal.value = true
}

const editJob = (job) => {
  isEditing.value = true
  Object.assign(form, {
    title: job.title,
    department_id: job.department_id,
    employment_type: job.employment_type,
    location: job.location,
    description: job.description,
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    expires_at: job.expires_at ? dayjs(job.expires_at).format('YYYY-MM-DD') : '',
    status: job.status,
    id: job.id
  })
  showModal.value = true
}

const saveJob = async () => {
  saving.value = true
  try {
    if (isEditing.value) {
      await api.put(`/admin/job-postings/${form.id}`, form)
      toast.success('Vaga atualizada com sucesso!')
    } else {
      await api.post('/admin/job-postings', form)
      toast.success('Vaga publicada com sucesso!')
    }
    closeModal()
    fetchJobs()
  } catch (error) {
    toast.error('Erro ao salvar vaga')
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  Object.assign(form, {
    title: '',
    department_id: '',
    employment_type: 'full-time',
    location: '',
    description: '',
    salary_min: '',
    salary_max: '',
    expires_at: '',
    status: 'published',
    id: null
  })
}

const showCandidatesModal = ref(false)
const selectedJob = ref(null)

const viewJob = async (job) => {
  try {
    const { data } = await api.get(`/admin/job-postings/${job.id}`)
    selectedJob.value = data
    showCandidatesModal.value = true
  } catch (error) {
    toast.error('Erro ao carregar candidatos')
  }
}

const closeCandidatesModal = () => {
  showCandidatesModal.value = false
  selectedJob.value = null
}

const closeModal = () => {
  showModal.value = false
}

const getStatusLabel = (status) => {
  const labels = {
    'published': 'Publicada',
    'draft': 'Rascunho',
    'closed': 'Encerrada'
  }
  return labels[status] || status
}

const formatDate = (date) => {
  return dayjs(date).format('DD/MM/YYYY')
}

onMounted(() => {
  fetchJobs()
  fetchDepartments()
})
</script>

<style scoped>
.recruitment-page {
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

.header-info h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.header-info p {
  color: #64748b;
  font-size: 0.875rem;
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

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-mini-card {
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-mini-card .label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
}

.stat-mini-card .value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
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

.job-title-cell {
  display: flex;
  flex-direction: column;
}

.job-title-cell span {
  font-size: 0.75rem;
  color: #64748b;
}

.applicant-count {
  background: #f1f5f9;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-published {
  background: #dcfce7;
  color: #166534;
}

.status-draft {
  background: #f1f5f9;
  color: #475569;
}

.status-closed {
  background: #fee2e2;
  color: #991b1b;
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
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
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
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
}

.modal-body textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  resize: vertical;
  transition: border-color 0.2s;
}

.modal-body textarea:focus {
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

@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}

.btn-text-link {
  background: none;
  border: none;
  color: #3b82f6;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

.max-w-4xl {
  max-width: 800px;
}

.p-0 {
  padding: 0 !important;
}

.text-xs {
  font-size: 0.75rem;
}
</style>
