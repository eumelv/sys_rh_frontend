<template>
    <div class="attendance-page">
        <div class="page-header">
            <div class="header-content">
                <h2>Gestão de Presenças</h2>
                <p class="text-muted">Acompanhe e controle a pontualidade da sua equipa</p>
            </div>
            <div class="header-actions">
                <input v-model="selectedDate" type="date" class="date-picker" @change="fetchAttendance" />
                <button @click="exportReport" class="btn-primary">
                    <i class="pi pi-file-pdf"></i>
                    Exportar Relatório
                </button>
            </div>
        </div>

        <!-- Summary Stats -->
        <div class="stats-grid">
            <div class="stat-card present">
                <div class="stat-icon">
                    <i class="pi pi-check-circle"></i>
                </div>
                <div class="stat-content">
                    <span class="stat-label">Presentes</span>
                    <span class="stat-value">{{ stats.present }}</span>
                </div>
            </div>
            <div class="stat-card absent">
                <div class="stat-icon">
                    <i class="pi pi-times-circle"></i>
                </div>
                <div class="stat-content">
                    <span class="stat-label">Ausentes</span>
                    <span class="stat-value">{{ stats.absent }}</span>
                </div>
            </div>
            <div class="stat-card late">
                <div class="stat-icon">
                    <i class="pi pi-clock"></i>
                </div>
                <div class="stat-content">
                    <span class="stat-label">Atrasados</span>
                    <span class="stat-value">{{ stats.late }}</span>
                </div>
            </div>
            <div class="stat-card overtime">
                <div class="stat-icon">
                    <i class="pi pi-plus-circle"></i>
                </div>
                <div class="stat-content">
                    <span class="stat-label">Horas Extra</span>
                    <span class="stat-value">{{ stats.overtime }}</span>
                </div>
            </div>
        </div>

        <!-- View Toggle & Filters -->
        <div class="view-controls">
            <div class="tabs">
                <button :class="{ active: activeTab === 'list' }" @click="activeTab = 'list'">
                    <i class="pi pi-list"></i> Lista de Hoje
                </button>
                <button :class="{ active: activeTab === 'map' }" @click="activeTab = 'map'">
                    <i class="pi pi-calendar"></i> Mapa de Presença
                </button>
            </div>

            <div class="filters-bar" v-if="activeTab === 'list'">
                <select v-model="statusFilter" @change="applyFilters" class="filter-select">
                    <option value="">Todos os Status</option>
                    <option value="present">Presente</option>
                    <option value="absent">Ausente</option>
                    <option value="late">Atrasado</option>
                </select>
                <select v-model="departmentFilter" @change="applyFilters" class="filter-select">
                    <option value="">Todos Departamentos</option>
                    <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                        {{ dept.name }}
                    </option>
                </select>
            </div>
        </div>

        <!-- Attendance Table (List View) -->
        <Card v-if="activeTab === 'list'">
            <div v-if="loading" class="loading-state">
                <Loading message="Carregando presenças..." />
            </div>

            <div v-else-if="filteredAttendance.length === 0" class="empty-state">
                <div class="empty-icon">
                    <i class="pi pi-calendar-times"></i>
                </div>
                <h3>Nenhum registro encontrado</h3>
                <p>Não há registros de presença para os filtros selecionados</p>
            </div>

            <div v-else>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Funcionário</th>
                            <th>Entrada</th>
                            <th>Saída</th>
                            <th>Horas</th>
                            <th>Atraso</th>
                            <th>H. Extra</th>
                            <th>Status</th>
                            <th>Ações Rápidas</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="record in filteredAttendance" :key="record.id">
                            <td>
                                <div class="employee-cell">
                                    <div class="employee-avatar">
                                        {{ record.employee?.first_name?.charAt(0) }}{{
                                            record.employee?.last_name?.charAt(0) }}
                                    </div>
                                    <div class="employee-info">
                                        <span class="name">{{ record.employee?.full_name }}</span>
                                        <span class="dept">{{ record.employee?.department?.name || '-' }}</span>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span v-if="record.check_in" class="time-badge in">
                                    <i class="pi pi-arrow-circle-down"></i>
                                    {{ formatTime(record.check_in) }}
                                </span>
                                <span v-else class="status-placeholder">-</span>
                            </td>
                            <td>
                                <span v-if="record.check_out" class="time-badge out">
                                    <i class="pi pi-arrow-circle-up"></i>
                                    {{ formatTime(record.check_out) }}
                                </span>
                                <span v-else class="status-placeholder">-</span>
                            </td>
                            <td>
                                <span class="hours-badge">{{ calculateHours(record) }}</span>
                            </td>
                            <td>
                                <span v-if="record.late_minutes > 0" class="late-badge">
                                    {{ record.late_minutes }}m
                                </span>
                                <span v-else class="status-placeholder">-</span>
                            </td>
                            <td>
                                <span v-if="record.overtime_hours > 0" class="ot-badge">
                                    +{{ record.overtime_hours }}h
                                </span>
                                <span v-else class="status-placeholder">-</span>
                            </td>
                            <td>
                                <span :class="`status-badge status-${getStatus(record)}`">
                                    {{ getStatusLabel(getStatus(record)) }}
                                </span>
                            </td>
                            <td>
                                <div class="quick-mark-actions">
                                    <button @click="markAs(record, 'present')" class="mark-btn present"
                                        title="Marcar Presença">P</button>
                                    <button @click="markAs(record, 'late')" class="mark-btn late"
                                        title="Marcar Atraso">A</button>
                                    <button @click="markAs(record, 'absent')" class="mark-btn absent"
                                        title="Marcar Falta">F</button>
                                </div>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <button @click="viewDetails(record)" class="btn-icon" title="Ver Detalhes">
                                        <i class="pi pi-eye"></i>
                                    </button>
                                    <button v-if="record.check_in && !record.check_out" @click="manualCheckout(record)"
                                        class="btn-icon checkout-btn" title="Registrar Saída">
                                        <i class="pi pi-sign-out"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Card>

        <!-- Attendance Map (Calendar View) -->
        <Card v-if="activeTab === 'map'" class="map-view-card">
            <div class="map-header">
                <h3>Visualização Mensal</h3>
                <div class="map-legend">
                    <span class="legend-item"><i class="dot present"></i> Presente</span>
                    <span class="legend-item"><i class="dot late"></i> Atraso</span>
                    <span class="legend-item"><i class="dot absent"></i> Falta</span>
                </div>
            </div>
            <div class="calendar-container">
                <!-- Custom Minimalist Calendar for Attendance Map -->
                <div class="attendance-map-grid">
                    <p class="text-center text-muted">A funcionalidade de Calendário Interativo está a ser integrada com
                        os dados mensais.</p>
                    <div class="placeholder-calendar">
                        <!-- Imagine a PrimeVue Calendar here or a specialized grid -->
                        <div class="calendar-day-placeholder" v-for="i in 31" :key="i">
                            <span class="day-num">{{ i }}</span>
                            <div class="day-indicators">
                                <span class="indicator present"></span>
                                <span class="indicator late"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>

        <!-- Details Modal -->
        <div v-if="showDetailsModal && selectedRecord" class="modal-overlay" @click="closeDetailsModal">
            <div class="modal" @click.stop>
                <div class="modal-header">
                    <h3>Detalhes da Presença</h3>
                    <button @click="closeDetailsModal" class="close-btn">
                        <i class="pi pi-times"></i>
                    </button>
                </div>

                <div class="modal-body">
                    <div class="detail-group">
                        <label>Funcionário</label>
                        <p>{{ selectedRecord.employee?.full_name }}</p>
                    </div>
                    <div class="detail-group">
                        <label>Data</label>
                        <p>{{ formatDate(selectedRecord.date) }}</p>
                    </div>
                    <div class="details-grid">
                        <div class="detail-group">
                            <label>Entrada</label>
                            <p>{{ formatTime(selectedRecord.check_in) || '-' }}</p>
                        </div>
                        <div class="detail-group">
                            <label>Saída</label>
                            <p>{{ formatTime(selectedRecord.check_out) || '-' }}</p>
                        </div>
                    </div>
                    <div class="detail-group">
                        <label>Total de Horas</label>
                        <p>{{ calculateHours(selectedRecord) }}</p>
                    </div>
                    <div v-if="selectedRecord.notes" class="detail-group">
                        <label>Observações</label>
                        <p>{{ selectedRecord.notes }}</p>
                    </div>
                </div>

                <div class="modal-footer">
                    <button @click="closeDetailsModal" class="btn-secondary">Fechar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/services/api'
import Card from '@/components/common/Card.vue'
import Loading from '@/components/common/Loading.vue'
import { useToast } from 'vue-toastification'
import dayjs from 'dayjs'

const toast = useToast()
const loading = ref(false)
const showDetailsModal = ref(false)
const selectedRecord = ref(null)
const activeTab = ref('list')

const selectedDate = ref(dayjs().format('YYYY-MM-DD'))
const statusFilter = ref('')
const departmentFilter = ref('')

const attendance = ref([])
const departments = ref([])
const stats = reactive({
    present: 0,
    absent: 0,
    late: 0,
    total: 0
})

const filteredAttendance = computed(() => {
    let filtered = attendance.value

    if (statusFilter.value) {
        filtered = filtered.filter(r => getStatus(r) === statusFilter.value)
    }

    if (departmentFilter.value) {
        filtered = filtered.filter(r => r.employee?.department_id == departmentFilter.value)
    }

    return filtered
})

const fetchAttendance = async () => {
    loading.value = true
    try {
        const { data } = await api.get('/admin/attendance', {
            params: { date: selectedDate.value }
        })
        attendance.value = data.records || []
        fetchStats()
    } catch (error) {
        toast.error('Erro ao carregar presenças')
    } finally {
        loading.value = false
    }
}

const fetchStats = async () => {
    try {
        const { data } = await api.get('/admin/attendance/stats', {
            params: { date: selectedDate.value }
        })
        Object.assign(stats, data)
    } catch (error) {
        console.error('Error fetching stats')
    }
}

const fetchDepartments = async () => {
    try {
        const { data } = await api.get('/admin/departments')
        departments.value = data.data || data
    } catch (error) {
        console.error('Error fetching departments')
    }
}

const getStatus = (record) => {
    return record.status || (record.check_in ? 'present' : 'absent')
}

const getStatusLabel = (status) => {
    const labels = {
        present: 'Presente',
        absent: 'Ausente',
        late: 'Atrasado',
        on_leave: 'Em Licença',
        half_day: 'Meio Dia'
    }
    return labels[status] || status
}

const markAs = async (record, status) => {
    try {
        await api.post('/admin/attendance/mark', {
            employee_id: record.employee_id,
            date: selectedDate.value,
            status: status
        })
        toast.success(`Marcado como ${getStatusLabel(status)}`)
        fetchAttendance()
    } catch (error) {
        toast.error('Erro ao atualizar status')
    }
}

const calculateHours = (record) => {
    if (!record.check_in || !record.check_out) return '-'

    const checkIn = dayjs(record.check_in)
    const checkOut = dayjs(record.check_out)
    const diff = checkOut.diff(checkIn, 'minute')

    const hours = Math.floor(diff / 60)
    const minutes = diff % 60

    return `${hours}h ${minutes}m`
}

const formatTime = (datetime) => {
    if (!datetime) return null
    return dayjs(datetime).format('HH:mm')
}

const formatDate = (date) => {
    if (!date) return '-'
    return dayjs(date).format('DD/MM/YYYY')
}

const applyFilters = () => { }

const viewDetails = (record) => {
    selectedRecord.value = record
    showDetailsModal.value = true
}

const closeDetailsModal = () => {
    showDetailsModal.value = false
    selectedRecord.value = null
}

const manualCheckout = async (record) => {
    if (!confirm('Registrar saída manual para este funcionário?')) return

    try {
        await api.post(`/admin/attendance/${record.id}/checkout`)
        toast.success('Saída registrada com sucesso!')
        fetchAttendance()
    } catch (error) {
        toast.error('Erro ao registrar saída')
    }
}

const exportReport = () => {
    toast.info('A gerar PDF de presenças...')
    // Will implement PDF export route call soon
}

onMounted(() => {
    fetchAttendance()
    fetchDepartments()
})
</script>

<style scoped>
.attendance-page {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.header-content h2 {
    font-size: 1.75rem;
    font-weight: 800;
    color: #1e293b;
    margin: 0;
}

.header-actions {
    display: flex;
    gap: 1rem;
}

.date-picker {
    padding: 0.75rem 1.25rem;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: white;
    font-weight: 600;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-primary {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    border: none;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
}

.stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 1.25rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    border: 1px solid #f1f5f9;
}

.stat-card .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
}

.stat-card.present .stat-icon {
    background: #dcfce7;
    color: #16a34a;
}

.stat-card.absent .stat-icon {
    background: #fee2e2;
    color: #dc2626;
}

.stat-card.late .stat-icon {
    background: #fef3c7;
    color: #d97706;
}

.stat-card.total .stat-icon {
    background: #eff6ff;
    color: #2563eb;
}

.stat-value {
    display: block;
    font-size: 1.5rem;
    font-weight: 800;
    color: #1e293b;
}

.stat-label {
    font-size: 0.875rem;
    color: #64748b;
    font-weight: 600;
}

.view-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f1f5f9;
    padding: 0.5rem;
    border-radius: 16px;
}

.tabs {
    display: flex;
    gap: 0.5rem;
}

.tabs button {
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    border: none;
    background: transparent;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s;
}

.tabs button.active {
    background: white;
    color: #3b82f6;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.filters-bar {
    display: flex;
    gap: 1rem;
}

.filter-select {
    padding: 0.5rem 1rem;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    background: white;
    font-size: 0.875rem;
}

.data-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 0.5rem;
}

.data-table th {
    padding: 1rem;
    text-align: left;
    color: #64748b;
    font-size: 0.75rem;
    text-transform: uppercase;
    font-weight: 700;
}

.data-table tbody tr {
    transition: all 0.2s;
}

.data-table tbody tr:hover {
    background: #f8fafc;
}

.employee-cell {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.employee-info .name {
    display: block;
    font-weight: 700;
    color: #1e293b;
}

.employee-info .dept {
    font-size: 0.75rem;
    color: #94a3b8;
}

.time-badge {
    padding: 0.4rem 0.75rem;
    border-radius: 8px;
    font-weight: 700;
    font-size: 0.875rem;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
}

.time-badge.in {
    background: #f0f9ff;
    color: #0369a1;
}

.time-badge.out {
    background: #fdf2f8;
    color: #9d174d;
}

.status-badge {
    padding: 0.4rem 0.85rem;
    border-radius: 99px;
    font-size: 0.75rem;
    font-weight: 700;
}

.status-present {
    background: #dcfce7;
    color: #166534;
}

.status-absent {
    background: #fee2e2;
    color: #991b1b;
}

.status-late {
    background: #fef3c7;
    color: #92400e;
}

.quick-mark-actions {
    display: flex;
    gap: 0.4rem;
}

.mark-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: none;
    font-weight: 800;
    cursor: pointer;
    transition: transform 0.2s;
}

.mark-btn:hover {
    transform: scale(1.1);
}

.mark-btn.present {
    background: #dcfce7;
    color: #16a34a;
}

.mark-btn.late {
    background: #fef3c7;
    color: #d97706;
}

.mark-btn.absent {
    background: #fee2e2;
    color: #dc2626;
}

.action-buttons {
    display: flex;
    gap: 0.5rem;
}

.btn-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    background: white;
    color: #64748b;
    cursor: pointer;
}

.btn-icon:hover {
    color: #3b82f6;
    border-color: #3b82f6;
}

.checkout-btn:hover {
    color: #db2777;
    border-color: #db2777;
}

/* Map View Styling */
.map-view-card {
    padding: 2rem;
}

.map-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.map-legend {
    display: flex;
    gap: 1.5rem;
}

.legend-item {
    font-size: 0.875rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
}

.dot.present {
    background: #16a34a;
}

.dot.late {
    background: #d97706;
}

.dot.absent {
    background: #dc2626;
}

.placeholder-calendar {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1rem;
    border: 1px solid #f1f5f9;
    padding: 1.5rem;
    border-radius: 16px;
}

.calendar-day-placeholder {
    height: 100px;
    background: #f8fafc;
    border-radius: 12px;
    padding: 0.75rem;
    position: relative;
    border: 1px solid transparent;
}

.calendar-day-placeholder:hover {
    border-color: #e2e8f0;
    background: white;
}

.day-num {
    font-weight: 800;
    color: #94a3b8;
}

.day-indicators {
    display: flex;
    gap: 4px;
    position: absolute;
    bottom: 10px;
    right: 10px;
}

.indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
}

.indicator.present {
    background: #22c55e;
}

.indicator.late {
    background: #f59e0b;
}

@media (max-width: 1024px) {
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }

    .page-header {
        flex-direction: column;
    }

    .view-controls {
        flex-direction: column;
        gap: 1rem;
    }
}
</style>
