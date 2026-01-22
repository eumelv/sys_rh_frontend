<template>
    <div class="work-schedules-page">
        <div class="page-header">
            <div class="header-left">
                <h2>Horários de Trabalho</h2>
                <p class="text-muted">Defina os turnos e horários para a sua equipa</p>
            </div>
            <button @click="openCreateModal" class="btn-primary">
                <i class="pi pi-plus"></i>
                Novo Horário
            </button>
        </div>

        <div v-if="loading" class="loading-state">
            <Loading message="Carregando horários..." />
        </div>

        <div v-else class="schedules-grid">
            <Card v-for="schedule in schedules" :key="schedule.id" class="schedule-card">
                <div class="card-header">
                    <div class="title-box">
                        <h3>{{ schedule.name }}</h3>
                        <span class="type-badge">{{ schedule.type }}</span>
                    </div>
                    <div class="status-indicator" :class="{ active: schedule.is_active }"></div>
                </div>

                <div class="schedule-details">
                    <div class="detail">
                        <i class="pi pi-clock"></i>
                        <span>{{ formatTime(schedule.start_time) }} - {{ formatTime(schedule.end_time) }}</span>
                    </div>
                    <div class="detail">
                        <i class="pi pi-calendar"></i>
                        <span>{{ formatDays(schedule.days) }}</span>
                    </div>
                    <div class="detail">
                        <i class="pi pi-hourglass"></i>
                        <span>Tolerância: {{ schedule.late_tolerance }} min</span>
                    </div>
                </div>

                <div class="card-footer">
                    <button @click="editSchedule(schedule)" class="btn-icon"><i class="pi pi-pencil"></i></button>
                    <button @click="handleDelete(schedule)" class="btn-icon text-danger"><i
                            class="pi pi-trash"></i></button>
                </div>
            </Card>
        </div>

        <!-- Create/Edit Modal -->
        <Modal v-if="showModal" :title="editingId ? 'Editar Horário' : 'Novo Horário'" @close="closeModal">
            <form @submit.prevent="saveSchedule" class="schedule-form">
                <div class="form-group">
                    <label>Nome do Horário</label>
                    <input v-model="form.name" type="text" placeholder="Ex: Turno Manhã" required />
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label>Hora de Entrada</label>
                        <input v-model="form.start_time" type="time" required />
                    </div>
                    <div class="form-group">
                        <label>Hora de Saída</label>
                        <input v-model="form.end_time" type="time" required />
                    </div>
                </div>

                <div class="form-group">
                    <label>Dias da Semana</label>
                    <div class="days-selector">
                        <label v-for="(label, key) in dayLabels" :key="key" class="day-checkbox">
                            <input type="checkbox" :value="key" v-model="form.days" />
                            <span>{{ label }}</span>
                        </label>
                    </div>
                </div>

                <div class="form-group">
                    <label>Tolerância de Atraso (minutos)</label>
                    <input v-model="form.late_tolerance" type="number" min="0" required />
                </div>

                <div class="modal-actions">
                    <button type="button" @click="closeModal" class="btn-secondary">Cancelar</button>
                    <button type="submit" :loading="saving" class="btn-primary">Salvar</button>
                </div>
            </form>
        </Modal>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import api from '@/services/api'
import Card from '@/components/common/Card.vue'
import Loading from '@/components/common/Loading.vue'
import Modal from '@/components/common/Modal.vue'
import { useToast } from 'vue-toastification'

const schedules = ref([])
const loading = ref(true)
const showModal = ref(false)
const editingId = ref(null)
const saving = ref(false)
const toast = useToast()

const dayLabels = {
    mon: 'Seg', tue: 'Ter', wed: 'Qua', thu: 'Qui', fri: 'Sex', sat: 'Sáb', sun: 'Dom'
}

const form = reactive({
    name: '',
    type: 'fixed',
    days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    start_time: '08:00',
    end_time: '17:00',
    late_tolerance: 10
})

const fetchSchedules = async () => {
    try {
        const { data } = await api.get('/admin/work-schedules')
        schedules.value = data
    } catch (error) {
        toast.error('Erro ao carregar horários')
    } finally {
        loading.value = false
    }
}

const openCreateModal = () => {
    editingId.value = null
    Object.assign(form, {
        name: '', type: 'fixed', days: ['mon', 'tue', 'wed', 'thu', 'fri'],
        start_time: '08:00', end_time: '17:00', late_tolerance: 10
    })
    showModal.value = true
}

const editSchedule = (schedule) => {
    editingId.value = schedule.id
    Object.assign(form, schedule)
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
}

const saveSchedule = async () => {
    saving.value = true
    try {
        if (editingId.value) {
            await api.put(`/admin/work-schedules/${editingId.value}`, form)
            toast.success('Horário atualizado')
        } else {
            await api.post('/admin/work-schedules', form)
            toast.success('Horário criado')
        }
        fetchSchedules()
        closeModal()
    } catch (error) {
        toast.error('Erro ao salvar horário')
    } finally {
        saving.value = false
    }
}

const handleDelete = async (schedule) => {
    if (!confirm('Eliminar este horário?')) return
    try {
        await api.delete(`/admin/work-schedules/${schedule.id}`)
        toast.success('Eliminado com sucesso')
        fetchSchedules()
    } catch (error) {
        toast.error('Erro ao eliminar')
    }
}

const formatDays = (days) => {
    if (!days || !days.length) return 'Nenhum dia'
    return days.map(d => dayLabels[d] || d).join(', ')
}

const formatTime = (time) => time ? time.substring(0, 5) : '-'

onMounted(fetchSchedules)
</script>

<style scoped>
.schedules-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
}

.schedule-card {
    padding: 1.5rem;
    transition: transform 0.2s;
}

.card-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1.5rem;
}

.title-box h3 {
    margin: 0;
    font-size: 1.25rem;
}

.type-badge {
    font-size: 0.75rem;
    color: #64748b;
    background: #f1f5f9;
    padding: 2px 8px;
    border-radius: 4px;
}

.status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #e2e8f0;
}

.status-indicator.active {
    background: #10b981;
}

.schedule-details {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
}

.detail {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #475569;
}

.days-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding-top: 0.5rem;
}

.day-checkbox {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background: #f8fafc;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    cursor: pointer;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.schedule-form .form-group {
    margin-bottom: 1.5rem;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
}
</style>
