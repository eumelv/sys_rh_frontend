<template>
    <div class="employee-detail-page">
        <div class="page-header">
            <div class="header-left">
                <button @click="$router.back()" class="btn-back">
                    <i class="pi pi-arrow-left"></i>
                    Voltar
                </button>
                <h2>Detalhes do Funcionário</h2>
            </div>
            <div class="header-actions">
                <button @click="exportToPdf" class="btn-primary">
                    <i class="pi pi-file-pdf"></i>
                    Exportar PDF
                </button>
                <button @click="editEmployee" class="btn-secondary">
                    <i class="pi pi-pencil"></i>
                    Editar
                </button>
            </div>
        </div>

        <div v-if="loading" class="loading-container">
            <Loading message="Carregando dados do funcionário..." />
        </div>

        <div v-else-if="employee" class="content-grid">
            <!-- Profile Card -->
            <Card class="profile-card">
                <div class="profile-header">
                    <div class="avatar-large">
                        {{ employee.first_name.charAt(0) }}{{ employee.last_name.charAt(0) }}
                    </div>
                    <div class="profile-info">
                        <h3>{{ employee.full_name }}</h3>
                        <span class="role-badge">{{ employee.position?.title || 'Sem Cargo' }}</span>
                    </div>
                </div>

                <div class="info-list">
                    <div class="info-item">
                        <i class="pi pi-id-card"></i>
                        <div>
                            <label>Número do Funcionário</label>
                            <p>{{ employee.employee_number }}</p>
                        </div>
                    </div>
                    <div class="info-item">
                        <i class="pi pi-envelope"></i>
                        <div>
                            <label>Email</label>
                            <p>{{ employee.email }}</p>
                        </div>
                    </div>
                    <div class="info-item">
                        <i class="pi pi-phone"></i>
                        <div>
                            <label>Telefone</label>
                            <p>{{ employee.phone || '-' }}</p>
                        </div>
                    </div>
                    <div class="info-item">
                        <i class="pi pi-circle-fill" :class="`status-${employee.status}`"></i>
                        <div>
                            <label>Status</label>
                            <p class="status-text">{{ employee.status }}</p>
                        </div>
                    </div>
                </div>
            </Card>

            <!-- Professional Info & Personal Info -->
            <div class="details-column">
                <Card title="Informações Profissionais">
                    <div class="details-grid">
                        <div class="detail-group">
                            <label>Departamento</label>
                            <p>{{ employee.department?.name || '-' }}</p>
                        </div>
                        <div class="detail-group">
                            <label>Tipo de Contrato</label>
                            <p class="capitalize">{{ employee.employment_type }}</p>
                        </div>
                        <div class="detail-group">
                            <label>Data de Admissão</label>
                            <p>{{ formatDate(employee.hire_date) }}</p>
                        </div>
                        <div class="detail-group">
                            <label>Salário Base</label>
                            <p>{{ formatCurrency(employee.base_salary) }}</p>
                        </div>
                        <div class="detail-group">
                            <label>Horário de Trabalho</label>
                            <p>{{ employee.work_schedule?.name || 'Não atribuído' }}</p>
                            <button @click="showScheduleModal = true" class="btn-text-link">Atribuir Horário</button>
                        </div>
                    </div>
                </Card>

                <Card title="Dados Pessoais" class="mt-4">
                    <div class="details-grid">
                        <div class="detail-group">
                            <label>Data de Nascimento</label>
                            <p>{{ formatDate(employee.date_of_birth) || '-' }}</p>
                        </div>
                        <div class="detail-group">
                            <label>Gênero</label>
                            <p class="capitalize">{{ employee.gender || '-' }}</p>
                        </div>
                        <div class="detail-group">
                            <label>NIF</label>
                            <p>{{ employee.tax_number || '-' }}</p>
                        </div>
                        <div class="detail-group">
                            <label>Endereço</label>
                            <p>{{ employee.address || '-' }}</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>

        <!-- Assign Schedule Modal -->
        <Modal v-if="showScheduleModal" title="Atribuir Horário de Trabalho" @close="showScheduleModal = false">
            <div class="form-group">
                <label>Selecione o Horário</label>
                <select v-model="selectedScheduleId" class="w-full">
                    <option value="">Nenhum</option>
                    <option v-for="s in schedules" :key="s.id" :value="s.id">{{ s.name }} ({{
                        s.start_time.substring(0, 5) }} - {{ s.end_time.substring(0, 5) }})</option>
                </select>
            </div>
            <div class="modal-footer mt-4">
                <button @click="showScheduleModal = false" class="btn-secondary">Cancelar</button>
                <button @click="assignSchedule" class="btn-primary" :disabled="assigning">
                    {{ assigning ? 'Salvando...' : 'Confirmar Atribuição' }}
                </button>
            </div>
        </Modal>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import Card from '@/components/common/Card.vue'
import Modal from '@/components/common/Modal.vue'
import Loading from '@/components/common/Loading.vue'
import { useToast } from 'vue-toastification'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const loading = ref(true)
const employee = ref(null)
const showScheduleModal = ref(false)
const schedules = ref([])
const selectedScheduleId = ref('')
const assigning = ref(false)

const fetchSchedules = async () => {
    try {
        const { data } = await api.get('/admin/work-schedules')
        schedules.value = data
    } catch (error) {
        console.error('Error fetching schedules')
    }
}

const assignSchedule = async () => {
    assigning.value = true
    try {
        await api.put(`/admin/employees/${employee.value.id}`, {
            work_schedule_id: selectedScheduleId.value || null
        })
        toast.success('Horário atribuído com sucesso')
        showScheduleModal.value = false
        fetchEmployee()
    } catch (error) {
        toast.error('Erro ao atribuir horário')
    } finally {
        assigning.value = false
    }
}

const fetchEmployee = async () => {
    try {
        const { data } = await api.get(`/admin/employees/${route.params.id}`)
        employee.value = data
    } catch (error) {
        toast.error('Erro ao carregar funcionário')
        router.push('/admin/employees')
    } finally {
        loading.value = false
    }
}

const editEmployee = () => {
    toast.info('Edição disponível na listagem principal')
}

const exportToPdf = async () => {
    try {
        toast.info('A gerar PDF...')
        const response = await api.get(`/admin/reports/employee/${employee.value.id}/pdf`, {
            responseType: 'blob'
        })
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `funcionario_${employee.value.id}.pdf`)
        document.body.appendChild(link)
        link.click()
    } catch (error) {
        toast.error('Erro ao gerar PDF')
    }
}

const formatDate = (date) => {
    if (!date) return null
    return dayjs(date).format('DD/MM/YYYY')
}

const formatCurrency = (value) => {
    if (value === null || value === undefined) return '-'
    return new Intl.NumberFormat('pt-AO', {
        style: 'currency',
        currency: 'AOA'
    }).format(value / 100)
}

onMounted(() => {
    fetchEmployee()
    fetchSchedules()
})
</script>

<style scoped>
.employee-detail-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.btn-back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    font-weight: 500;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.2s;
}

.btn-back:hover {
    background: #f1f5f9;
    color: #1e293b;
}

.content-grid {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 1.5rem;
    align-items: start;
}

.profile-card {
    text-align: center;
}

.profile-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 2rem;
    border-bottom: 1px solid #e2e8f0;
    margin-bottom: 1.5rem;
}

.avatar-large {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
}

.profile-info h3 {
    margin: 0 0 0.5rem 0;
    color: #1e293b;
}

.role-badge {
    background: #eff6ff;
    color: #3b82f6;
    padding: 0.25rem 1rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 600;
}

.info-list {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    text-align: left;
}

.info-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
}

.info-item i {
    color: #94a3b8;
    font-size: 1.25rem;
    margin-top: 0.25rem;
}

.info-item label {
    display: block;
    font-size: 0.75rem;
    color: #64748b;
    margin-bottom: 0.25rem;
}

.info-item p {
    margin: 0;
    color: #1e293b;
    font-weight: 500;
}

.status-active {
    color: #10b981;
}

.status-suspended {
    color: #f59e0b;
}

.status-terminated {
    color: #ef4444;
}

.status-text {
    text-transform: capitalize;
}

.details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
}

.detail-group label {
    display: block;
    font-size: 0.875rem;
    color: #64748b;
    margin-bottom: 0.5rem;
}

.detail-group p {
    margin: 0;
    color: #0f172a;
    font-weight: 500;
    font-size: 1rem;
}

.capitalize {
    text-transform: capitalize;
}

.mt-4 {
    margin-top: 1.5rem;
}

.btn-secondary {
    padding: 0.75rem 1.5rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    color: #475569;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
}

.btn-secondary:hover {
    background: #f8fafc;
    color: #1e293b;
    border-color: #cbd5e1;
}

.btn-text-link {
    background: none;
    border: none;
    color: #3b82f6;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0.25rem 0;
    margin-top: 0.5rem;
    text-decoration: underline;
    transition: color 0.2s;
}

.btn-text-link:hover {
    color: #2563eb;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e2e8f0;
}

.w-full {
    width: 100%;
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
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

@media (max-width: 1024px) {
    .content-grid {
        grid-template-columns: 1fr;
    }
}
</style>
