<template>
    <div class="dashboard">
        <div class="welcome-card">
            <div class="welcome-content">
                <h2>Olá, {{ user?.name }}! 👋</h2>
                <p>Bem-vindo ao seu portal de funcionário</p>
            </div>
            <div class="quick-actions">
                <button @click="handleCheckIn" :disabled="!canCheckIn" class="action-btn check-in">
                    <i class="pi pi-sign-in"></i>
                    <span>Check-in</span>
                </button>
                <button @click="handleCheckOut" :disabled="!canCheckOut" class="action-btn check-out">
                    <i class="pi pi-sign-out"></i>
                    <span>Check-out</span>
                </button>
            </div>
        </div>

        <div class="stats-grid">
            <StatCard label="Horas Trabalhadas (Mês)" :value="monthSummary.total_hours || 0" icon="pi pi-clock"
                color="#3b82f6" format="number" />
            <StatCard label="Dias Presentes" :value="monthSummary.present_days || 0" icon="pi pi-check-circle"
                color="#10b981" />
            <StatCard label="Horas Extras" :value="monthSummary.total_overtime || 0" icon="pi pi-bolt" color="#f59e0b"
                format="number" />
            <StatCard label="Saldo de Férias" :value="leaveBalance.available_days || 0" icon="pi pi-calendar"
                color="#8b5cf6" />
        </div>

        <div class="content-grid">
            <Card title="Presença de Hoje">
                <div v-if="todayAttendance" class="today-attendance">
                    <div class="time-card">
                        <div class="time-label">Entrada</div>
                        <div class="time-value">
                            {{ todayAttendance.check_in ? formatTime(todayAttendance.check_in) : '--:--' }}
                        </div>
                    </div>
                    <div class="time-separator">
                        <i class="pi pi-arrow-right"></i>
                    </div>
                    <div class="time-card">
                        <div class="time-label">Saída</div>
                        <div class="time-value">
                            {{ todayAttendance.check_out ? formatTime(todayAttendance.check_out) : '--:--' }}
                        </div>
                    </div>
                    <div class="time-card">
                        <div class="time-label">Horas Trabalhadas</div>
                        <div class="time-value">
                            {{ todayAttendance.work_hours ? todayAttendance.work_hours.toFixed(2) : '0.00' }}h
                        </div>
                    </div>
                </div>
                <div v-else class="empty-state-small">
                    <p>Ainda não há registo para hoje</p>
                </div>
            </Card>

            <Card title="Próximas Licenças">
                <div v-if="upcomingLeaves.length === 0" class="empty-state-small">
                    <i class="pi pi-calendar"></i>
                    <p>Nenhuma licença agendada</p>
                </div>
                <div v-else class="leaves-list">
                    <div v-for="leave in upcomingLeaves" :key="leave.id" class="leave-item">
                        <div class="leave-icon">
                            <i class="pi pi-calendar"></i>
                        </div>
                        <div class="leave-info">
                            <div class="leave-type">{{ leave.leave_type?.name }}</div>
                            <div class="leave-dates">
                                {{ formatDate(leave.start_date) }} - {{ formatDate(leave.end_date) }}
                            </div>
                        </div>
                        <span :class="`status-badge status-${leave.status}`">
                            {{ leave.status }}
                        </span>
                    </div>
                </div>
                <template #footer>
                    <button @click="$router.push('/employee/leaves')" class="btn-link">
                        Solicitar Licença
                    </button>
                </template>
            </Card>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import Card from '@/components/common/Card.vue'
import StatCard from '@/components/common/StatCard.vue'
import { useToast } from 'vue-toastification'
import dayjs from 'dayjs'

const authStore = useAuthStore()
const toast = useToast()

const user = computed(() => authStore.user)

const todayAttendance = ref(null)
const canCheckIn = ref(false)
const canCheckOut = ref(false)
const monthSummary = ref({})
const leaveBalance = ref({})
const upcomingLeaves = ref([])

const fetchTodayAttendance = async () => {
    try {
        const { data } = await api.get('/employee/attendance/today')
        todayAttendance.value = data.attendance
        canCheckIn.value = data.can_check_in
        canCheckOut.value = data.can_check_out
    } catch (error) {
        console.error('Error fetching attendance:', error)
    }
}

const fetchMonthSummary = async () => {
    try {
        const { data } = await api.get('/employee/attendance/summary')
        monthSummary.value = data
    } catch (error) {
        console.error('Error fetching summary:', error)
    }
}

const fetchLeaveBalance = async () => {
    try {
        const { data } = await api.get('/employee/leaves/balance')
        if (data.length > 0) {
            leaveBalance.value = data[0] // Pegar o primeiro tipo de licença
        }
    } catch (error) {
        console.error('Error fetching leave balance:', error)
    }
}

const fetchUpcomingLeaves = async () => {
    try {
        const { data } = await api.get('/employee/leaves', {
            params: { status: 'approved' }
        })
        upcomingLeaves.value = data.data.slice(0, 3)
    } catch (error) {
        console.error('Error fetching leaves:', error)
    }
}

const handleCheckIn = async () => {
    try {
        await api.post('/employee/attendance/check-in')
        toast.success('Check-in registrado com sucesso!')
        fetchTodayAttendance()
    } catch (error) {
        const message = error.response?.data?.message || 'Erro ao registrar check-in'
        toast.error(message)
    }
}

const handleCheckOut = async () => {
    try {
        await api.post('/employee/attendance/check-out')
        toast.success('Check-out registrado com sucesso!')
        fetchTodayAttendance()
        fetchMonthSummary()
    } catch (error) {
        const message = error.response?.data?.message || 'Erro ao registrar check-out'
        toast.error(message)
    }
}

const formatTime = (datetime) => {
    return dayjs(datetime).format('HH:mm')
}

const formatDate = (date) => {
    return dayjs(date).format('DD/MM/YYYY')
}

onMounted(() => {
    fetchTodayAttendance()
    fetchMonthSummary()
    fetchLeaveBalance()
    fetchUpcomingLeaves()
})
</script>

<style scoped>
.dashboard {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.welcome-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem;
    border-radius: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.welcome-content h2 {
    font-size: 1.875rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
}

.welcome-content p {
    font-size: 1rem;
    opacity: 0.9;
    margin: 0;
}

.quick-actions {
    display: flex;
    gap: 1rem;
}

.action-btn {
    padding: 1rem 2rem;
    border: 2px solid white;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
    backdrop-filter: blur(10px);
}

.action-btn:not(:disabled):hover {
    background: white;
    color: #667eea;
}

.action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.content-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.today-attendance {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 2rem 0;
}

.time-card {
    text-align: center;
}

.time-label {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.5rem;
}

.time-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
}

.time-separator {
    color: #d1d5db;
    font-size: 1.5rem;
}

.empty-state-small {
    text-align: center;
    padding: 2rem;
    color: #6b7280;
}

.empty-state-small i {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    opacity: 0.5;
}

.leaves-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.leave-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
}

.leave-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: #eff6ff;
    color: #3b82f6;
    display: flex;
    align-items: center;
    justify-content: center;
}

.leave-info {
    flex: 1;
}

.leave-type {
    font-weight: 600;
    color: #111827;
    margin-bottom: 0.25rem;
}

.leave-dates {
    font-size: 0.875rem;
    color: #6b7280;
}

.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: capitalize;
}

.status-approved {
    background: #d1fae5;
    color: #065f46;
}

.status-pending {
    background: #fef3c7;
    color: #92400e;
}

.btn-link {
    width: 100%;
    padding: 0.75rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-link:hover {
    background: #2563eb;
}

@media (max-width: 1024px) {
    .welcome-card {
        flex-direction: column;
        gap: 1.5rem;
        text-align: center;
    }

    .content-grid {
        grid-template-columns: 1fr;
    }
}
</style>