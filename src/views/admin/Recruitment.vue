<template>
  <div class="recruitment-container">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>Recrutamento & ATS</h1>
        <p>Gerencie o pipeline de talentos e o processo de contratação</p>
      </div>
      <div class="header-actions">
        <button class="btn-secondary" @click="activeTab = 'jobs'">
          <i class="pi pi-briefcase"></i> Gerenciar Vagas
        </button>
        <button class="btn-primary" @click="activeTab = 'kanban'">
          <i class="pi pi-th-large"></i> Pipeline de Candidatos
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      
      <!-- Tab: Job Listings -->
      <div v-if="activeTab === 'jobs'" class="jobs-tab slide-in">
        <div class="section-header">
          <h2>Vagas Publicadas</h2>
          <button class="btn-new" @click="openJobModal()">
            <i class="pi pi-plus"></i> Nova Vaga
          </button>
        </div>

        <div v-if="loadingJobs" class="skeleton-loader">
           <div v-for="i in 3" :key="i" class="skeleton-row"></div>
        </div>

        <div v-else class="jobs-list">
          <div v-for="job in jobs" :key="job.id" class="job-item-card">
            <div class="job-info">
              <h3>{{ job.title }}</h3>
              <div class="job-meta">
                <span><i class="pi pi-building"></i> {{ job.department?.name }}</span>
                <span><i class="pi pi-users"></i> {{ job.applications_count || 0 }} Candidatos</span>
                <span :class="['status-tag', job.status]">{{ job.status }}</span>
              </div>
            </div>
            <div class="job-actions">
              <button class="btn-icon" @click="openJobModal(job)"><i class="pi pi-pencil"></i></button>
              <button class="btn-icon danger" @click="deleteJob(job)"><i class="pi pi-trash"></i></button>
              <a :href="getPublicUrl(job)" target="_blank" class="btn-icon link"><i class="pi pi-external-link"></i></a>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Kanban ATS -->
      <div v-if="activeTab === 'kanban'" class="kanban-tab slide-in">
        <div class="kanban-filters">
           <div class="filter-group">
              <label>Filtrar por Vaga:</label>
              <select v-model="selectedJobFilter" @change="fetchApplications">
                 <option value="">Todas as Vagas</option>
                 <option v-for="job in jobs" :key="job.id" :value="job.id">{{ job.title }}</option>
              </select>
           </div>
           <div class="kanban-stats">
              <span>Total: <strong>{{ applications.length }}</strong> candidatos</span>
           </div>
        </div>

        <div class="kanban-board" v-if="!loadingApps">
          <div v-for="column in boardColumns" :key="column.id" class="kanban-column">
            <div class="column-header">
              <h3>{{ column.title }}</h3>
              <span class="count">{{ getColumnApplications(column.id).length }}</span>
            </div>
            
            <draggable 
              v-model="columnsData[column.id]" 
              group="candidates" 
              item-key="id"
              class="drag-area"
              @change="(e) => handleMove(e, column.id)"
            >
              <template #item="{element}">
                <div class="candidate-card" @click="viewApplication(element)">
                  <div class="card-header">
                    <h4>{{ element.first_name }} {{ element.last_name }}</h4>
                    <div class="rating">
                       <i v-for="i in 5" :key="i" class="pi" :class="i <= (element.rating || 0) ? 'pi-star-fill' : 'pi-star'"></i>
                    </div>
                  </div>
                  <p class="job-ref">{{ element.job_posting?.title }}</p>
                  <div class="card-footer">
                    <span class="date">{{ formatDate(element.created_at) }}</span>
                    <div class="avatars">
                       <i class="pi pi-user-edit" v-if="element.interviews?.length > 0"></i>
                    </div>
                  </div>
                </div>
              </template>
            </draggable>
          </div>
        </div>
        <div v-else class="kanban-loading">
           <i class="pi pi-spin pi-spinner"></i>
           <p>Organizando pipeline...</p>
        </div>
      </div>
    </div>

    <!-- Application Detail Modal -->
    <Dialog v-model:visible="showAppModal" :header="`Candidato: ${selectedApp?.first_name} ${selectedApp?.last_name}`" modal class="app-detail-dialog" :style="{ width: '90vw', maxWidth: '800px' }">
      <div v-if="selectedApp" class="app-details">
         <div class="detail-header-info">
            <div class="main-info">
               <h2>{{ selectedApp.first_name }} {{ selectedApp.last_name }}</h2>
               <p>{{ selectedApp.email }} | {{ selectedApp.phone }}</p>
            </div>
            <div class="header-actions">
               <button v-if="selectedApp.resume_path" @click="downloadResume(selectedApp)" class="btn-resume">
                  <i class="pi pi-file-pdf"></i> Ver Currículo
               </button>
               <button v-if="selectedApp.stage === 'hired'" @click="hireCandidate(selectedApp)" class="btn-hire">
                  <i class="pi pi-user-plus"></i> FINALIZAR CONTRATAÇÃO
               </button>
            </div>
         </div>

         <Tabs value="0">
            <TabList>
                <Tab value="0">Informações</Tab>
                <Tab value="1">Entrevistas</Tab>
                <Tab value="2">Histórico & Notas</Tab>
            </TabList>
            <TabPanels>
                <TabPanel value="0">
                   <div class="info-grid">
                      <div class="info-item">
                         <label>Vaga</label>
                         <p>{{ selectedApp.job_posting?.title }}</p>
                      </div>
                      <div class="info-item">
                         <label>Data de Candidatura</label>
                         <p>{{ formatDate(selectedApp.created_at) }}</p>
                      </div>
                      <div class="info-item">
                         <label>Avaliação</label>
                         <Rating v-model="selectedApp.rating" @change="updateApp(selectedApp)" />
                      </div>
                   </div>
                   <div class="notes-section">
                      <label>Carta de Apresentação / Notas</label>
                      <p class="cover-letter-text">{{ selectedApp.cover_letter || 'Nenhuma carta de apresentação enviada.' }}</p>
                   </div>
                </TabPanel>
                <TabPanel value="1">
                   <div class="interviews-header">
                      <h3>Entrevistas Agendadas</h3>
                      <button class="btn-small" @click="openInterviewModal()"><i class="pi pi-plus"></i> Agendar</button>
                   </div>
                   <div v-if="selectedApp.interviews?.length > 0" class="interviews-list">
                      <div v-for="iv in selectedApp.interviews" :key="iv.id" class="interview-card">
                         <div class="iv-info">
                            <strong>{{ iv.type }}</strong>
                            <span><i class="pi pi-calendar"></i> {{ formatDateTime(iv.scheduled_at) }}</span>
                         </div>
                         <div class="iv-status">
                            <span :class="iv.status">{{ iv.status }}</span>
                         </div>
                      </div>
                   </div>
                   <div v-else class="empty-mini">Sem entrevistas agendadas.</div>
                </TabPanel>
                <TabPanel value="2">
                   <div class="history-log">
                      <div class="log-item">
                         <span class="dot"></span>
                         <div class="log-content">
                            <strong>Candidatura Recebida</strong>
                            <small>{{ formatDate(selectedApp.created_at) }}</small>
                         </div>
                      </div>
                   </div>
                </TabPanel>
            </TabPanels>
         </Tabs>
      </div>
    </Dialog>

    <!-- Job Form Modal -->
    <Dialog v-model:visible="showJobModal" :header="editingJob ? 'Editar Vaga' : 'Nova Vaga'" modal class="job-dialog" :style="{ width: '95vw', maxWidth: '600px' }">
       <form @submit.prevent="saveJob" class="p-fluid">
          <div class="field">
             <label for="title">Título da Vaga *</label>
             <InputText id="title" v-model="jobForm.title" required />
          </div>
          <div class="form-row-2">
             <div class="field">
                <label>Departamento</label>
                <Dropdown v-model="jobForm.department_id" :options="departments" optionLabel="name" optionValue="id" placeholder="Selecionar..." />
             </div>
             <div class="field">
                <label>Tipo de Contrato</label>
                <Dropdown v-model="jobForm.employment_type" :options="employmentTypes" optionLabel="label" optionValue="value" />
             </div>
          </div>
          <div class="field">
             <label>Localização</label>
             <InputText v-model="jobForm.location" placeholder="Ex: Luanda, Angola ou Remoto" />
          </div>
          <div class="field">
             <label>Descrição</label>
             <Textarea v-model="jobForm.description" rows="5" required />
          </div>
          <div class="field">
             <label>Requisitos</label>
             <Textarea v-model="jobForm.requirements" rows="4" />
          </div>
          <div class="modal-actions">
             <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="showJobModal = false" />
             <Button :label="editingJob ? 'Atualizar' : 'Publicar'" icon="pi pi-check" type="submit" :loading="savingJob" />
          </div>
       </form>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import api from '@/services/api'
import draggable from 'vuedraggable'
import { useToast } from 'vue-toastification'
import dayjs from 'dayjs'

// PrimeVue components (Assuming they are registered globally or we import them)
import Dialog from 'primevue/dialog'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Rating from 'primevue/rating'

const toast = useToast()
const activeTab = ref('kanban')
const loadingJobs = ref(false)
const loadingApps = ref(false)
const savingJob = ref(false)

const jobs = ref([])
const applications = ref([])
const departments = ref([])
const selectedJobFilter = ref('')

const showAppModal = ref(false)
const selectedApp = ref(null)
const showJobModal = ref(false)
const editingJob = ref(null)

const jobForm = reactive({
  title: '',
  department_id: null,
  employment_type: 'full-time',
  location: 'Remoto',
  description: '',
  requirements: '',
  status: 'published'
})

const employmentTypes = [
  { label: 'Tempo Inteiro', value: 'full-time' },
  { label: 'Meio Período', value: 'part-time' },
  { label: 'Contrato', value: 'contract' },
  { label: 'Estágio', value: 'intern' }
]

const boardColumns = [
  { id: 'applied', title: 'Novas' },
  { id: 'screening', title: 'Triagem' },
  { id: 'interview', title: 'Entrevistas' },
  { id: 'final_interview', title: 'Finais' },
  { id: 'offer', title: 'Proposta' },
  { id: 'hired', title: 'Contratado' },
  { id: 'rejected', title: 'Rejeitado' }
]

const columnsData = reactive({
  applied: [],
  screening: [],
  interview: [],
  final_interview: [],
  offer: [],
  hired: [],
  rejected: []
})

const fetchData = async () => {
    loadingJobs.value = true
    try {
        const [jobsRes, deptsRes] = await Promise.all([
            api.get('/admin/job-postings'),
            api.get('/admin/departments')
        ])
        jobs.value = jobsRes.data
        departments.value = deptsRes.data
        await fetchApplications()
    } catch (error) {
        toast.error('Erro ao carregar dados de recrutamento.')
    } finally {
        loadingJobs.value = false
    }
}

const fetchApplications = async () => {
    loadingApps.value = true
    try {
        const { data } = await api.get('/admin/applications', {
            params: { job_posting_id: selectedJobFilter.value }
        })
        applications.value = data
        
        // Reset columns
        boardColumns.forEach(col => columnsData[col.id] = [])
        
        // Populate columns
        data.forEach(app => {
            const stage = app.stage || 'applied'
            if (columnsData[stage]) {
                columnsData[stage].push(app)
            }
        })
    } catch (error) {
        toast.error('Erro ao carregar candidatos.')
    } finally {
        loadingApps.value = false
    }
}

const getColumnApplications = (columnId) => columnsData[columnId] || []

const handleMove = async (evt, newStage) => {
    if (evt.added) {
        const app = evt.added.element
        try {
            await api.put(`/admin/applications/${app.id}`, { stage: newStage })
            toast.info(`${app.first_name} movido para ${newStage}`)
        } catch (error) {
            toast.error('Erro ao mover candidato.')
            fetchApplications() // revert UI
        }
    }
}

const viewApplication = async (app) => {
    try {
        const { data } = await api.get(`/admin/applications/${app.id}`)
        selectedApp.value = data
        showAppModal.value = true
    } catch (error) {
        toast.error('Erro ao carregar detalhes.')
    }
}

const updateApp = async (app) => {
    try {
        await api.put(`/admin/applications/${app.id}`, app)
        toast.success('Informações atualizadas.')
    } catch (error) {
        toast.error('Erro ao atualizar.')
    }
}

const hireCandidate = async (app) => {
    try {
        await api.post(`/admin/applications/${app.id}/hire`)
        toast.success('Contratação finalizada! O candidato agora é um colaborador.')
        showAppModal.value = false
        fetchApplications()
    } catch (error) {
        toast.error('Erro ao processar contratação.')
    }
}

const openJobModal = (job = null) => {
    editingJob.value = job
    if (job) {
        Object.assign(jobForm, job)
    } else {
        Object.assign(jobForm, { title: '', department_id: null, employment_type: 'full-time', location: 'Remoto', description: '', requirements: '', status: 'published' })
    }
    showJobModal.value = true
}

const saveJob = async () => {
    savingJob.value = true
    try {
        if (editingJob.value) {
            await api.put(`/admin/job-postings/${editingJob.value.id}`, jobForm)
            toast.success('Vaga atualizada.')
        } else {
            await api.post('/admin/job-postings', jobForm)
            toast.success('Vaga publicada.')
        }
        showJobModal.value = false
        fetchData()
    } catch (error) {
        toast.error('Erro ao salvar vaga.')
    } finally {
        savingJob.value = false
    }
}

const deleteJob = async (job) => {
    if (!confirm('Eliminar esta vaga? Isso também removerá candidaturas associadas.')) return
    try {
        await api.delete(`/admin/job-postings/${job.id}`)
        toast.success('Vaga removida.')
        fetchData()
    } catch (error) {
        toast.error('Erro ao remover.')
    }
}

const downloadResume = (app) => {
    const url = `${import.meta.env.VITE_API_STORAGE_URL || 'http://localhost:8000/storage'}/${app.resume_path}`
    window.open(url, '_blank')
}

const getPublicUrl = (job) => {
    // This would need the company slug, assuming it's available in authStore
    return `/jobs/company-slug/${job.slug}` 
}

const formatDate = (d) => dayjs(d).format('DD/MM/YYYY')
const formatDateTime = (d) => dayjs(d).format('DD/MM/YYYY HH:mm')

onMounted(() => fetchData())
</script>

<style scoped>
.recruitment-container { padding: 1.5rem; background: #f8fafc; min-height: calc(100vh - 100px); }

/* Header */
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
.header-content h1 { font-size: 1.75rem; font-weight: 800; color: #1e293b; margin: 0; }
.header-content p { color: #64748b; margin: 0.25rem 0 0; }
.header-actions { display: flex; gap: 1rem; }

/* Tabs Logic */
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.section-header h2 { font-size: 1.25rem; font-weight: 700; color: #1e293b; }

/* Jobs Tab */
.job-item-card { background: white; padding: 1.25rem 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; transition: 0.2s; }
.job-item-card:hover { border-color: #3b82f6; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.job-info h3 { font-size: 1.1rem; font-weight: 700; color: #1e293b; margin: 0 0 0.5rem; }
.job-meta { display: flex; gap: 1rem; font-size: 0.85rem; color: #64748b; flex-wrap: wrap; }
.job-meta span { display: flex; align-items: center; gap: 0.4rem; }
.status-tag { padding: 0.2rem 0.6rem; border-radius: 6px; font-weight: 700; text-transform: uppercase; font-size: 0.7rem; }
.status-tag.published { background: #dcfce7; color: #166534; }
.status-tag.draft { background: #f1f5f9; color: #475569; }

.job-actions { display: flex; gap: 0.5rem; }

/* Kanban Tab */
.kanban-filters { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; background: white; padding: 1rem 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0; flex-wrap: wrap; gap: 1rem; }
.filter-group { display: flex; align-items: center; gap: 1rem; }
.filter-group select { padding: 0.5rem; border-radius: 8px; border: 1px solid #e2e8f0; min-width: 250px; }

.kanban-board { display: flex; gap: 1.25rem; overflow-x: auto; padding-bottom: 1rem; min-height: 600px; }
.kanban-column { min-width: 280px; width: 280px; background: #f1f5f9; border-radius: 16px; display: flex; flex-direction: column; overflow: hidden; border: 1px solid #e2e8f0; }
.column-header { padding: 1rem 1.25rem; background: #e2e8f0; border-bottom: 2px solid #cbd5e1; display: flex; justify-content: space-between; align-items: center; }
.column-header h3 { font-size: 0.9rem; font-weight: 800; text-transform: uppercase; color: #475569; margin: 0; }
.column-header .count { background: white; color: #64748b; padding: 0.1rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 800; }

.drag-area { flex-grow: 1; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.75rem; min-height: 200px; }

/* Candidate Card */
.candidate-card { background: white; padding: 1rem; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.05); cursor: grab; transition: 0.2s; }
.candidate-card:hover { border-color: #3b82f6; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
.candidate-card h4 { font-size: 0.95rem; font-weight: 700; color: #1e293b; margin: 0 0 0.5rem; }
.job-ref { font-size: 0.75rem; color: #64748b; margin-bottom: 0.75rem; }
.card-footer { border-top: 1px solid #f1f5f9; padding-top: 0.75rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.7rem; color: #94a3b8; }
.rating { color: #f59e0b; margin-bottom: 0.5rem; font-size: 0.8rem; }

/* Details Dialog */
.detail-header-info { display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
.main-info h2 { margin: 0; color: #1e293b; }
.btn-hire { background: #10b981; color: white; border: none; padding: 0.75rem 1.25rem; border-radius: 8px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
.btn-hire:hover { background: #059669; }

.info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
.info-item label { display: block; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #94a3b8; margin-bottom: 0.25rem; }
.info-item p { font-weight: 600; color: #1e293b; }

.cover-letter-text { background: #f8fafc; padding: 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0; color: #334155; line-height: 1.6; }

/* Buttons */
.btn-primary { background: #3b82f6; color: white; border: none; padding: 0.6rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-secondary { background: white; border: 1px solid #e2e8f0; padding: 0.6rem 1.25rem; border-radius: 8px; color: #475569; font-weight: 600; cursor: pointer; }
.btn-new { background: #1e293b; color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-icon { background: #f1f5f9; border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; color: #64748b; }
.btn-icon:hover { background: #e2e8f0; color: #1e293b; }
.btn-icon.danger:hover { background: #fee2e2; color: #ef4444; }

.form-row-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }

/* Animations */
.slide-in { animation: slideIn 0.3s ease-out; }
@keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
