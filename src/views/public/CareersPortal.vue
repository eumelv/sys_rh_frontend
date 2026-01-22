<template>
    <div class="careers-portal">
        <header class="portal-header">
            <div class="container">
                <h1>Oportunidades de Carreira</h1>
                <p>Junte-se à nossa equipa e ajude-nos a construir o futuro</p>
            </div>
        </header>

        <main class="container">
            <div v-if="loading" class="loading-state">
                <Loading message="Carregando vagas..." />
            </div>

            <div v-else-if="jobs.length === 0" class="empty-state">
                <i class="pi pi-search"></i>
                <h3>Nenhuma vaga aberta no momento</h3>
                <p>Acompanhe esta página para futuras oportunidades</p>
            </div>

            <div v-else class="jobs-list">
                <div v-for="job in jobs" :key="job.id" class="job-card">
                    <div class="job-header">
                        <h3>{{ job.title }}</h3>
                        <span class="job-type">{{ formatType(job.employment_type) }}</span>
                    </div>
                    <p class="job-location">
                        <i class="pi pi-map-marker"></i>
                        {{ job.location || 'Remoto' }}
                    </p>
                    <p class="job-description">{{ truncate(job.description, 150) }}</p>
                    <div class="job-footer">
                        <span class="job-dept">{{ job.department?.name }}</span>
                        <button @click="viewJob(job)" class="btn-primary">Ver Detalhes</button>
                    </div>
                </div>
            </div>
        </main>

        <!-- Job Details Modal -->
        <div v-if="showJobModal && selectedJob" class="modal-overlay" @click="closeJobModal">
            <div class="modal" @click.stop>
                <div class="modal-header">
                    <h2>{{ selectedJob.title }}</h2>
                    <button @click="closeJobModal" class="close-btn">
                        <i class="pi pi-times"></i>
                    </button>
                </div>

                <div class="modal-body">
                    <div class="job-meta">
                        <span class="meta-item">
                            <i class="pi pi-map-marker"></i>
                            {{ selectedJob.location || 'Remoto' }}
                        </span>
                        <span class="meta-item">
                            <i class="pi pi-briefcase"></i>
                            {{ formatType(selectedJob.employment_type) }}
                        </span>
                        <span class="meta-item">
                            <i class="pi pi-building"></i>
                            {{ selectedJob.department?.name }}
                        </span>
                    </div>

                    <div class="job-section">
                        <h3>Descrição da Vaga</h3>
                        <p>{{ selectedJob.description }}</p>
                    </div>

                    <div v-if="selectedJob.salary_range" class="job-section">
                        <h3>Faixa Salarial</h3>
                        <p>{{ selectedJob.salary_range }}</p>
                    </div>

                    <button @click="openApplicationForm" class="btn-apply">
                        <i class="pi pi-send"></i>
                        Candidatar-me
                    </button>
                </div>
            </div>
        </div>

        <!-- Application Form Modal -->
        <div v-if="showApplicationForm" class="modal-overlay" @click="closeApplicationForm">
            <div class="modal" @click.stop>
                <div class="modal-header">
                    <h2>Candidatura: {{ selectedJob?.title }}</h2>
                    <button @click="closeApplicationForm" class="close-btn">
                        <i class="pi pi-times"></i>
                    </button>
                </div>

                <form @submit.prevent="submitApplication" class="modal-body">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Nome Completo *</label>
                            <input v-model="applicationForm.name" type="text" required />
                        </div>
                        <div class="form-group">
                            <label>Email *</label>
                            <input v-model="applicationForm.email" type="email" required />
                        </div>
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label>Telefone *</label>
                            <input v-model="applicationForm.phone" type="tel" required />
                        </div>
                        <div class="form-group">
                            <label>LinkedIn</label>
                            <input v-model="applicationForm.linkedin" type="url"
                                placeholder="https://linkedin.com/in/..." />
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Carta de Apresentação</label>
                        <textarea v-model="applicationForm.cover_letter" rows="5"
                            placeholder="Conte-nos porque é o candidato ideal..."></textarea>
                    </div>

                    <div class="form-group">
                        <label>Currículo (PDF) *</label>
                        <input type="file" accept=".pdf" @change="handleFileUpload" required />
                    </div>

                    <div class="modal-footer">
                        <button type="button" @click="closeApplicationForm" class="btn-secondary">Cancelar</button>
                        <button type="submit" class="btn-primary" :disabled="submitting">
                            {{ submitting ? 'Enviando...' : 'Enviar Candidatura' }}
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

const loading = ref(true)
const submitting = ref(false)
const jobs = ref([])
const selectedJob = ref(null)
const showJobModal = ref(false)
const showApplicationForm = ref(false)

const applicationForm = reactive({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    cover_letter: '',
    resume: null
})

const fetchJobs = async () => {
    loading.value = true
    try {
        // Try public endpoint first, fallback to admin endpoint
        const { data } = await api.get('/admin/job-postings')
        jobs.value = data.filter(j => j.status === 'published')
    } catch (error) {
        console.error('Error fetching jobs:', error)
    } finally {
        loading.value = false
    }
}

const formatType = (type) => {
    const types = {
        'full-time': 'Tempo Inteiro',
        'part-time': 'Meio Período',
        'contract': 'Contrato',
        'intern': 'Estágio'
    }
    return types[type] || type
}

const truncate = (text, length) => {
    if (!text) return ''
    return text.length > length ? text.substring(0, length) + '...' : text
}

const viewJob = (job) => {
    selectedJob.value = job
    showJobModal.value = true
}

const closeJobModal = () => {
    showJobModal.value = false
}

const openApplicationForm = () => {
    showJobModal.value = false
    showApplicationForm.value = true
}

const closeApplicationForm = () => {
    showApplicationForm.value = false
    resetForm()
}

const handleFileUpload = (event) => {
    applicationForm.resume = event.target.files[0]
}

const submitApplication = async () => {
    submitting.value = true
    try {
        const formData = new FormData()
        formData.append('job_posting_id', selectedJob.value.id)
        formData.append('name', applicationForm.name)
        formData.append('email', applicationForm.email)
        formData.append('phone', applicationForm.phone)
        formData.append('linkedin', applicationForm.linkedin)
        formData.append('cover_letter', applicationForm.cover_letter)
        if (applicationForm.resume) {
            formData.append('resume', applicationForm.resume)
        }

        await api.post('/public/applications', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })

        alert('Candidatura enviada com sucesso! Entraremos em contacto em breve.')
        closeApplicationForm()
    } catch (error) {
        alert('Erro ao enviar candidatura. Por favor, tente novamente.')
    } finally {
        submitting.value = false
    }
}

const resetForm = () => {
    Object.assign(applicationForm, {
        name: '',
        email: '',
        phone: '',
        linkedin: '',
        cover_letter: '',
        resume: null
    })
}

onMounted(() => {
    fetchJobs()
})
</script>

<style scoped>
.careers-portal {
    min-height: 100vh;
    background: #f8fafc;
}

.portal-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 4rem 0;
    text-align: center;
}

.portal-header h1 {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 1rem;
}

.portal-header p {
    font-size: 1.25rem;
    opacity: 0.9;
}

.container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 2rem;
}

.jobs-list {
    display: grid;
    gap: 1.5rem;
    padding: 3rem 0;
}

.job-card {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid #e2e8f0;
    transition: all 0.3s;
}

.job-card:hover {
    transform: translateY(-4px);
    border-color: #667eea;
    box-shadow: 0 10px 15px -3px rgba(102, 126, 234, 0.2);
}

.job-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
}

.job-header h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
}

.job-type {
    background: #eff6ff;
    color: #1e40af;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
}

.job-location {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #64748b;
    margin-bottom: 1rem;
}

.job-description {
    color: #475569;
    line-height: 1.6;
    margin-bottom: 1.5rem;
}

.job-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.job-dept {
    font-weight: 600;
    color: #667eea;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-primary:hover {
    transform: translateY(-2px);
}

.loading-state,
.empty-state {
    padding: 5rem 0;
    text-align: center;
    color: #64748b;
}

.empty-state i {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
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
    max-width: 700px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
}

.close-btn {
    width: 36px;
    height: 36px;
    border: none;
    background: #f3f4f6;
    border-radius: 50%;
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
}

.job-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #64748b;
    font-size: 0.875rem;
}

.job-section {
    margin-bottom: 2rem;
}

.job-section h3 {
    font-size: 1.125rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.75rem;
}

.job-section p {
    color: #475569;
    line-height: 1.6;
}

.btn-apply {
    width: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 1rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: transform 0.2s;
}

.btn-apply:hover {
    transform: translateY(-2px);
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
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
    transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #667eea;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
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
    background: #f9fafb;
    border-color: #d1d5db;
}

@media (max-width: 768px) {
    .form-grid {
        grid-template-columns: 1fr;
    }

    .portal-header h1 {
        font-size: 2rem;
    }
}
</style>
