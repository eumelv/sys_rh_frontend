<template>
  <div class="careers-portal">
    <header class="portal-header">
      <div class="container header-grid">
        <div class="company-brand" v-if="company">
          <img v-if="company.logo" :src="company.logo" :alt="company.name" class="company-logo" />
          <div class="company-text">
            <h1>{{ company.name }}</h1>
            <p>Junte-se à nossa equipa e ajude-nos a construir o futuro</p>
          </div>
        </div>
        <div v-else class="header-placeholder">
          <h1>Portal de Carreiras</h1>
          <p>Oportunidades profissionais aguardam por si</p>
        </div>
      </div>
    </header>

    <main class="container">
      <div class="search-filters" v-if="!selectedJob">
        <div class="search-bar">
          <i class="pi pi-search"></i>
          <input v-model="searchQuery" placeholder="Pesquisar vagas..." @input="filterJobs" />
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner"></i>
        <p>Carregando oportunidades...</p>
      </div>

      <div v-else-if="filteredJobs.length === 0 && !selectedJob" class="empty-state">
        <div class="empty-icon">
          <i class="pi pi-search"></i>
        </div>
        <h3>Nenhuma vaga aberta no momento</h3>
        <p>Acompanhe esta página para futuras oportunidades ou tente outro termo de pesquisa.</p>
      </div>

      <!-- Job List -->
      <div v-if="!selectedJob && filteredJobs.length > 0" class="jobs-grid">
        <div v-for="job in filteredJobs" :key="job.id" class="job-card" @click="viewJob(job)">
          <div class="job-card-header">
            <h3>{{ job.title }}</h3>
            <span class="type-tag">{{ formatType(job.employment_type) }}</span>
          </div>
          <div class="job-card-meta">
            <span><i class="pi pi-map-marker"></i> {{ job.location || 'Remoto' }}</span>
            <span><i class="pi pi-building"></i> {{ job.department?.name || 'Geral' }}</span>
          </div>
          <p class="job-card-description">{{ truncate(job.description, 140) }}</p>
          <div class="job-card-footer">
            <button class="btn-text">Ver Detalhes <i class="pi pi-arrow-right"></i></button>
          </div>
        </div>
      </div>

      <!-- Job Detail View -->
      <div v-if="selectedJob" class="job-detail-view slide-up">
        <button class="btn-back" @click="closeJob">
           <i class="pi pi-arrow-left"></i> Voltar para a lista
        </button>

        <div class="detail-container">
           <div class="detail-main">
              <div class="detail-header">
                <h1>{{ selectedJob.title }}</h1>
                <div class="detail-meta">
                   <span class="badge"><i class="pi pi-briefcase"></i> {{ formatType(selectedJob.employment_type) }}</span>
                   <span class="badge"><i class="pi pi-map-marker"></i> {{ selectedJob.location || 'Remoto' }}</span>
                   <span class="badge"><i class="pi pi-building"></i> {{ selectedJob.department?.name }}</span>
                </div>
              </div>

              <div class="detail-section">
                <h3>Descrição da Função</h3>
                <div class="text-content" v-html="formatNewlines(selectedJob.description)"></div>
              </div>

              <div class="detail-section" v-if="selectedJob.requirements">
                <h3>Requisitos</h3>
                <div class="text-content" v-html="formatNewlines(selectedJob.requirements)"></div>
              </div>
           </div>

           <aside class="apply-sidebar">
              <div class="apply-card">
                 <h3>Candidatar-me agora</h3>
                 <p>Preencha os dados abaixo para submeter o seu currículo.</p>
                 
                 <form @submit.prevent="submitApplication" class="apply-form">
                    <div class="form-row">
                       <label>Nome Completo *</label>
                       <input v-model="form.first_name" type="text" placeholder="Seu nome" required />
                       <input v-model="form.last_name" type="text" placeholder="Seu apelido" required />
                    </div>
                    <div class="form-row">
                       <label>Email *</label>
                       <input v-model="form.email" type="email" placeholder="email@exemplo.com" required />
                    </div>
                    <div class="form-row">
                       <label>Telefone</label>
                       <input v-model="form.phone" type="tel" placeholder="+351 --- --- ---" />
                    </div>
                    <div class="form-row">
                       <label>Currículo (PDF) *</label>
                       <div class="file-input-wrapper" :class="{ 'has-file': form.resume }">
                          <input type="file" accept=".pdf,.doc,.docx" @change="handleFileUpload" required />
                          <div class="file-placeholder">
                             <i class="pi pi-cloud-upload"></i>
                             <span>{{ form.resume ? form.resume.name : 'Selecionar ficheiro...' }}</span>
                          </div>
                       </div>
                    </div>
                    <div class="form-row">
                       <label>Mensagem / Observações</label>
                       <textarea v-model="form.cover_letter" rows="3" placeholder="Algo que queira destacar..."></textarea>
                    </div>

                    <button type="submit" class="btn-submit" :disabled="submitting">
                       <i v-if="submitting" class="pi pi-spin pi-spinner"></i>
                       {{ submitting ? 'Processando...' : 'Enviar Candidatura' }}
                    </button>
                 </form>
              </div>
           </aside>
        </div>
      </div>
    </main>

    <footer class="portal-footer">
       <p>&copy; {{ new Date().getFullYear() }} {{ company?.name }} - Powered by sys_rh</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const loading = ref(true)
const submitting = ref(false)
const company = ref(null)
const jobs = ref([])
const filteredJobs = ref([])
const selectedJob = ref(null)
const searchQuery = ref('')

const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  cover_letter: '',
  resume: null
})

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const fetchData = async () => {
    loading.value = true
    const companySlug = route.params.companySlug
    const jobSlug = route.params.jobSlug
    
    try {
        const { data } = await axios.get(`${baseUrl}/public/jobs/${companySlug}`)
        company.value = data.company
        jobs.value = data.jobs
        filteredJobs.value = data.jobs

        // If jobSlug is in URL, auto-select it
        if (jobSlug) {
            selectedJob.value = jobs.value.find(j => j.slug === jobSlug)
        }
    } catch (error) {
        toast.error('Não foi possível carregar as vagas.')
    } finally {
        loading.value = false
    }
}

const filterJobs = () => {
    const q = searchQuery.value.toLowerCase()
    filteredJobs.value = jobs.value.filter(j => 
        j.title.toLowerCase().includes(q) || 
        j.department?.name?.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q)
    )
}

const viewJob = (job) => {
    selectedJob.value = job
    router.push(`/jobs/${route.params.companySlug}/${job.slug}`)
}

const closeJob = () => {
    selectedJob.value = null
    router.push(`/jobs/${route.params.companySlug}`)
}

const handleFileUpload = (e) => {
    form.resume = e.target.files[0]
}

const submitApplication = async () => {
    submitting.value = true
    try {
        const fd = new FormData()
        fd.append('first_name', form.first_name)
        fd.append('last_name', form.last_name)
        fd.append('email', form.email)
        fd.append('phone', form.phone)
        fd.append('cover_letter', form.cover_letter)
        fd.append('resume', form.resume)

        await axios.post(`${baseUrl}/public/jobs/${selectedJob.value.id}/apply`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })

        toast.success('Candidatura enviada com sucesso!')
        resetForm()
        closeJob()
    } catch (error) {
        toast.error('Erro ao submeter candidatura. Verifique os campos.')
    } finally {
        submitting.value = false
    }
}

const resetForm = () => {
    Object.assign(form, { first_name: '', last_name: '', email: '', phone: '', cover_letter: '', resume: null })
}

const formatType = (type) => {
    const map = { 'full-time': 'Tempo Inteiro', 'part-time': 'Meio Período', 'contract': 'Contrato', 'intern': 'Estágio' }
    return map[type] || type
}

const truncate = (str, n) => str?.length > n ? str.substr(0, n - 1) + '...' : str
const formatNewlines = (str) => str?.replace(/\n/g, '<br>') || ''

onMounted(() => fetchData())
</script>

<style scoped>
.careers-portal { min-height: 100vh; background: #f4f7fa; font-family: 'Inter', sans-serif; }
.portal-header { background: #1e293b; color: white; padding: 4rem 0; border-bottom: 4px solid #3b82f6; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 2rem; }

.company-brand { display: flex; align-items: center; gap: 2rem; flex-wrap: wrap; justify-content: center; text-align: center; }
.company-logo { height: 80px; width: 80px; object-fit: contain; background: white; border-radius: 12px; padding: 0.5rem; }
.company-text h1 { font-size: min(2.5rem, 8vw); font-weight: 800; margin: 0; }
.company-text p { font-size: 1.1rem; opacity: 0.8; margin: 0.5rem 0 0; }

.search-filters { transform: translateY(-50%); }
.search-bar { background: white; padding: 1.25rem 2rem; border-radius: 16px; box-shadow: 0 15px 30px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 1rem; }
.search-bar i { color: #94a3b8; font-size: 1.2rem; }
.search-bar input { border: none; width: 100%; font-size: 1.1rem; color: #1e293b; }
.search-bar input:focus { outline: none; }

.jobs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; padding: 2rem 0 5rem; }
.job-card { background: white; padding: 2rem; border-radius: 20px; border: 1px solid #e2e8f0; transition: 0.3s; cursor: pointer; display: flex; flex-direction: column; }
.job-card:hover { transform: translateY(-8px); border-color: #3b82f6; box-shadow: 0 12px 20px rgba(59, 130, 246, 0.1); }

.job-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
.job-card-header h3 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #1e293b; }
.type-tag { font-size: 0.7rem; font-weight: 800; background: #eff6ff; color: #2563eb; padding: 0.25rem 0.75rem; border-radius: 20px; text-transform: uppercase; }

.job-card-meta { display: flex; gap: 1rem; font-size: 0.85rem; color: #64748b; margin-bottom: 1rem; }
.job-card-meta i { margin-right: 0.25rem; }
.job-card-description { font-size: 0.95rem; color: #475569; line-height: 1.5; margin-bottom: 1.5rem; flex-grow: 1; }

.btn-text { background: none; border: none; color: #3b82f6; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }

.job-detail-view { padding: 2rem 0 6rem; }
.btn-back { background: transparent; border: none; color: #64748b; font-weight: 600; cursor: pointer; margin-bottom: 2rem; display: flex; align-items: center; gap: 0.5rem; }
.btn-back:hover { color: #1e293b; }

.detail-container { display: grid; grid-template-columns: 1fr 380px; gap: 3rem; }
.detail-main { background: white; padding: 3rem; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
.detail-header h1 { font-size: min(2.25rem, 9vw); font-weight: 800; color: #1e293b; margin: 0 0 1rem; }
.detail-meta { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
.badge { display: flex; align-items: center; gap: 0.4rem; font-size: 0.9rem; color: #64748b; }

.detail-section { margin-bottom: 2.5rem; }
.detail-section h3 { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem; border-left: 4px solid #3b82f6; padding-left: 1rem; }
.text-content { font-size: 1.05rem; color: #334155; line-height: 1.7; }

.apply-card { background: #1e293b; color: white; padding: 2.5rem; border-radius: 24px; position: sticky; top: 2rem; }
.apply-card h3 { font-size: 1.5rem; font-weight: 700; margin: 0 0 1rem; }
.apply-card p { font-size: 0.95rem; opacity: 0.8; margin-bottom: 2rem; }

.form-row { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.25rem; }
.form-row label { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: #94a3b8; }
.form-row input, .form-row textarea { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.8rem 1rem; color: white; }
.form-row input:focus { outline: none; border-color: #3b82f6; background: rgba(255,255,255,0.1); }

.file-input-wrapper { position: relative; border: 2px dashed rgba(255,255,255,0.2); border-radius: 12px; padding: 1.5rem; text-align: center; cursor: pointer; transition: 0.3s; }
.file-input-wrapper input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; }
.file-placeholder { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.file-placeholder i { font-size: 1.5rem; color: #3b82f6; }
.file-input-wrapper.has-file { border-color: #10b981; background: rgba(16, 185, 129, 0.05); }

.btn-submit { width: 100%; background: #3b82f6; color: white; border: none; padding: 1rem; border-radius: 12px; font-weight: 800; font-size: 1rem; cursor: pointer; transition: 0.3s; margin-top: 1rem; }
.btn-submit:hover { background: #2563eb; transform: scale(1.02); }

.portal-footer { text-align: center; padding: 4rem 0; color: #94a3b8; font-size: 0.9rem; }

@media (max-width: 900px) {
  .detail-container { grid-template-columns: 1fr; gap: 2rem; }
  .apply-sidebar { order: -1; }
  .detail-main { padding: 1.5rem; }
}

@media (max-width: 600px) {
  .portal-header { padding: 2rem 0 4rem; }
  .company-brand { gap: 1rem; }
  .company-logo { height: 60px; width: 60px; }
  .search-bar { padding: 1rem; }
  .job-card { padding: 1.25rem; }
  .apply-card { padding: 1.5rem; }
}
</style>
