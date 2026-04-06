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
                    Exportar
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
                <button :class="{ active: activeTab === 'list' }" @click="activeTab = 'list'; fetchAttendance()">
                    <i class="pi pi-list"></i> Lista
                </button>
                <button :class="{ active: activeTab === 'map' }" @click="activeTab = 'map'; fetchAttendanceForMonth()">
                    <i class="pi pi-calendar"></i> Mapa
                </button>
            </div>

            <div class="filters-bar" v-if="activeTab === 'list'">
                <select v-model="statusFilter" @change="applyFilters" class="filter-select">
                    <option value="">Todos</option>
                    <option value="present">Presente</option>
                    <option value="absent">Ausente</option>
                    <option value="late">Atrasado</option>
                </select>
                <select v-model="departmentFilter" @change="applyFilters" class="filter-select">
                    <option value="">Departamentos</option>
                    <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                        {{ dept.name }}
                    </option>
                </select>
            </div>
        </div>

        <!-- List View -->
        <div v-if="activeTab === 'list'" class="list-view">
            <Card>
                <div v-if="loading" class="loading-state">
                    <div class="spinner"></div>
                    <span>Carregando presenças...</span>
                </div>

                <div v-else-if="filteredAttendance.length === 0" class="empty-state">
                    <div class="empty-icon">
                        <i class="pi pi-calendar-times"></i>
                    </div>
                    <h3>Nenhum registro encontrado</h3>
                    <p>Não há registros de presença para os filtros selecionados</p>
                </div>

                <div v-else class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Funcionário</th>
                                <th>Entrada</th>
                                <th>Saída</th>
                                <th>Horas</th>
                                <th>Atraso</th>
                                <th>Status</th>
                                <th>Ações</th>
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
                                        <i class="pi pi-arrow-down"></i>
                                        {{ formatTime(record.check_in) }}
                                    </span>
                                    <span v-else class="no-data">-</span>
                                </td>
                                <td>
                                    <span v-if="record.check_out" class="time-badge out">
                                        <i class="pi pi-arrow-up"></i>
                                        {{ formatTime(record.check_out) }}
                                    </span>
                                    <span v-else class="no-data">-</span>
                                </td>
                                <td>
                                    <span class="hours-badge">{{ calculateHours(record) }}</span>
                                </td>
                                <td>
                                    <span v-if="record.late_minutes > 0" class="late-badge">
                                        {{ record.late_minutes }}m
                                    </span>
                                    <span v-else class="no-data">-</span>
                                </td>
                                <td>
                                    <span :class="`status-badge status-${getStatus(record)}`">
                                        {{ getStatusLabel(getStatus(record)) }}
                                    </span>
                                </td>
                                <td>
                                    <div class="action-buttons">
                                        <button @click="quickMark(record)" class="btn-mark" title="Marcar">
                                            <i class="pi pi-pencil"></i>
                                        </button>
                                        <button v-if="record.check_in && !record.check_out"
                                            @click="manualCheckout(record)" class="btn-checkout" title="Saída">
                                            <i class="pi pi-sign-out"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>

        <!-- Map View - Monthly Calendar -->
        <div v-if="activeTab === 'map'" class="map-view">
            <Card>
                <div class="map-header">
                    <div class="month-nav">
                        <button @click="prevMonth" class="nav-btn">
                            <i class="pi pi-chevron-left"></i>
                        </button>
                        <h3>{{ formatMonthYear(monthDate) }}</h3>
                        <button @click="nextMonth" class="nav-btn">
                            <i class="pi pi-chevron-right"></i>
                        </button>
                    </div>
                    <div class="map-legend">
                        <span class="legend-item"><span class="dot present"></span> Presente</span>
                        <span class="legend-item"><span class="dot late"></span> Atraso</span>
                        <span class="legend-item"><span class="dot absent"></span> Falta</span>
                        <span class="legend-item"><span class="dot justified"></span> Justificado</span>
                    </div>
                </div>

                <div class="calendar-grid">
                    <div class="weekday-header">
                        <span>Dom</span>
                        <span>Seg</span>
                        <span>Ter</span>
                        <span>Qua</span>
                        <span>Qui</span>
                        <span>Sex</span>
                        <span>Sáb</span>
                    </div>
                    <div class="days-grid">
                        <div v-for="(day, index) in calendarDays" :key="index" :class="['day-cell', {
                            'other-month': !day.currentMonth,
                            'today': day.isToday,
                            'weekend': day.isWeekend,
                            'has-records': day.hasRecords
                        }]" @click="selectDay(day.fullDate)"
                            :style="day.currentMonth && !day.isWeekend ? 'cursor: pointer' : ''">
                            <span class="day-number">{{ day.date }}</span>
                            <div v-if="day.status" class="day-status">
                                <span :class="`status-dot ${day.status}`"></span>
                            </div>
                            <div v-if="day.present > 0 || day.absent > 0" class="day-stats">
                                <span v-if="day.present > 0" class="stat present">{{ day.present }}P</span>
                                <span v-if="day.absent > 0" class="stat absent">{{ day.absent }}F</span>
                            </div>
                        </div>
                    </div>
                </div>

            </Card>
        </div>

        <!-- Day Details Modal - Redesigned and Expanded -->
        <div v-if="selectedDayDate" class="modal-overlay" @click="selectedDayDate = null">
            <div class="modal day-modal xlarge-modal" @click.stop>
                <div class="modal-header">
                    <div class="header-title">
                        <div class="header-icon">
                            <i class="pi pi-calendar-clock"></i>
                        </div>
                        <div>
                            <h3>{{ formatDateFull(selectedDayDate) }}</h3>
                            <div class="header-subtitle">
                                <span><i class="pi pi-users"></i> {{ modalEmployees.length }} Funcionários</span>
                                <span class="separator">•</span>
                                <span><i class="pi pi-check-circle"></i> {{ getModalStats().present }} Presentes</span>
                                <span class="separator">•</span>
                                <span><i class="pi pi-times-circle"></i> {{ getModalStats().absent }} Faltas</span>
                            </div>
                        </div>
                    </div>
                    <button @click="selectedDayDate = null" class="close-btn">
                        <i class="pi pi-times"></i>
                    </button>
                </div>

                <div class="modal-body custom-scrollbar">

                    <div v-if="showAbsentModal" class="modal-overlay">
                        <div class="modal">
                            <h3>Marcar Falta</h3>

                            <p>
                                Funcionário: <strong>{{ selectedEmployee?.full_name }}</strong>
                            </p>

                            <textarea v-model="absenceReason" placeholder="Motivo da falta..." rows="4"></textarea>

                            <div class="modal-actions">
                                <button @click="showAbsentModal = false" class="btn cancel">
                                    Cancelar
                                </button>

                                <button @click="confirmAbsent" class="btn confirm">
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Modal Controls -->
                    <div class="modal-controls">
                        <div class="search-box">
                            <i class="pi pi-search"></i>
                            <input v-model="modalSearch" type="text" placeholder="Pesquisar funcionário..."
                                class="search-input" />
                        </div>
                        <div class="modal-actions">
                            <button @click="bulkMarkInModal('present')" class="btn-bulk present">
                                <i class="pi pi-check"></i> Presença em Massa
                            </button>
                            <button @click="bulkMarkInModal('absent')" class="btn-bulk absent">
                                <i class="pi pi-times"></i> Falta em Massa
                            </button>
                        </div>
                    </div>

                    <!-- Employees List -->
                    <div class="attendance-table-container">
                        <div v-if="modalLoading" class="modal-loading">
                            <div class="spinner"></div>
                            <span>A carregar equipa...</span>
                        </div>
                        <table v-else class="attendance-list-table">
                            <thead>
                                <tr>
                                    <th>Funcionário</th>
                                    <th>Status Atual</th>
                                    <th>Horário</th>
                                    <th>Notas / Justificação</th>
                                    <th class="text-right">Ações Rápidas</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="emp in filteredModalEmployees" :key="emp.id"
                                    :class="{ 'has-record': emp.has_attendance }">
                                    <td>
                                        <div class="emp-profile">
                                            <div class="emp-avatar">
                                                {{ emp.first_name?.charAt(0) }}{{ emp.last_name?.charAt(0) }}
                                            </div>
                                            <div class="emp-details">
                                                <span class="emp-name">{{ emp.full_name }}</span>
                                                <span class="emp-dept">{{ emp.department || '-' }}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span v-if="emp.status" :class="`status-tag status-${emp.status}`">
                                            {{ getStatusLabel(emp.status) }}
                                        </span>
                                        <span v-else class="status-tag status-pending">Pendente</span>
                                    </td>
                                    <td>
                                        <div v-if="emp.status === 'present' || emp.status === 'late' || emp.status === 'half_day'"
                                            class="time-inputs">
                                            <div class="time-group">
                                                <input type="time" v-model="emp.record.check_in"
                                                    @change="saveQuickAttendance(emp)" class="mini-time" />
                                                <span>-</span>
                                                <input type="time" v-model="emp.record.check_out"
                                                    @change="saveQuickAttendance(emp)" class="mini-time" />
                                            </div>
                                        </div>
                                        <div v-else class="schedule-info">
                                            <span v-if="emp.work_schedule">
                                                <i class="pi pi-clock"></i> {{ emp.work_schedule.start_time.substring(0,
                                                    5) }} - {{ emp.work_schedule.end_time.substring(0, 5) }}
                                            </span>
                                            <span v-else>-</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="notes-field">
                                            <input v-model="emp.tempNotes" type="text"
                                                placeholder="Adicionar observação..." class="notes-input"
                                                @blur="emp.record?.notes !== emp.tempNotes && saveQuickAttendance(emp)"
                                                @keyup.enter="$event.target.blur()" />
                                        </div>
                                    </td>
                                    <td>
                                        <div class="quick-actions">
                                            <button @click="markEmpPresent(emp)" class="action-pill present"
                                                :class="{ active: emp.status === 'present' || emp.status === 'late' || emp.status === 'half_day' }"
                                                title="Marcar Presença">
                                                <i class="pi pi-check"></i>
                                                Presente
                                            </button>
                                            <button @click="markEmpAbsent(emp)" class="action-pill absent"
                                                :class="{ active: emp.status === 'absent' }" title="Marcar Falta">
                                                <i class="pi pi-times"></i>
                                                Falta
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-footer">
                    <button @click="selectedDayDate = null" class="btn-done">Concluído</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import api from '@/services/api'
import Card from '@/components/common/Card.vue'
import { useToast } from 'vue-toastification'
import dayjs from 'dayjs'


const showAbsentModal = ref(false)
const selectedEmployee = ref(null)
const absenceReason = ref('')

const toast = useToast()
const loading = ref(false)
const modalLoading = ref(false)
const activeTab = ref('list')
const selectedDate = ref(dayjs().format('YYYY-MM-DD'))
const monthDate = ref(dayjs().toDate())
const statusFilter = ref('')
const departmentFilter = ref('')
const selectedDayDate = ref(null)
const modalSearch = ref('')
const modalEmployees = ref([])

const attendance = ref([])
const departments = ref([])
const monthAttendance = ref([])

const stats = reactive({
    present: 0,
    absent: 0,
    late: 0,
    overtime: 0,
    not_recorded: 0
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

// Calendar calculations
const calendarDays = computed(() => {
    const days = []
    const startOfMonth = dayjs(monthDate.value).startOf('month')
    const endOfMonth = dayjs(monthDate.value).endOf('month')
    const startDay = startOfMonth.day()
    const totalDays = endOfMonth.date()
    const today = dayjs().format('YYYY-MM-DD')

    // Previous month days
    const prevMonthDate = startOfMonth.subtract(1, 'month')
    const prevMonthDays = prevMonthDate.daysInMonth()
    for (let i = startDay - 1; i >= 0; i--) {
        const date = prevMonthDays - i
        days.push({
            date,
            fullDate: prevMonthDate.date(date).format('YYYY-MM-DD'),
            currentMonth: false,
            isToday: false,
            isWeekend: false,
            status: null,
            hasRecords: false,
            present: 0,
            absent: 0
        })
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
        const fullDate = dayjs(monthDate.value).date(i).format('YYYY-MM-DD')
        const dayOfWeek = dayjs(monthDate.value).date(i).day()
        const dayData = monthAttendance.value.find(a => a.date === fullDate)

        days.push({
            date: i,
            fullDate,
            currentMonth: true,
            isToday: fullDate === today,
            isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
            status: dayData?.status || null,
            hasRecords: !!dayData,
            present: dayData?.present || 0,
            absent: dayData?.absent || 0
        })
    }

    // Next month days
    const remainingDays = 42 - days.length
    const nextMonthDate = endOfMonth.add(1, 'day')
    for (let i = 1; i <= remainingDays; i++) {
        days.push({
            date: i,
            fullDate: nextMonthDate.date(i).format('YYYY-MM-DD'),
            currentMonth: false,
            isToday: false,
            isWeekend: false,
            status: null,
            hasRecords: false,
            present: 0,
            absent: 0
        })
    }

    return days
})

const filteredModalEmployees = computed(() => {
    if (!modalSearch.value) return modalEmployees.value
    const search = modalSearch.value.toLowerCase()
    return modalEmployees.value.filter(e =>
        e.full_name.toLowerCase().includes(search) ||
        (e.department && e.department.toLowerCase().includes(search))
    )
})

const getModalStats = () => {
    return {
        present: modalEmployees.value.filter(e => e.status === 'present' || e.status === 'late' || e.status === 'half_day').length,
        absent: modalEmployees.value.filter(e => e.status === 'absent').length,
        total: modalEmployees.value.length
    }
}

const fetchAttendance = async () => {
    loading.value = true
    try {
        const { data } = await api.get('/admin/attendance', {
            params: { date: selectedDate.value }
        })
        attendance.value = data.data || data.records || []
        fetchStats()
    } catch (error) {
        toast.error('Erro ao carregar presenças')
    } finally {
        loading.value = false
    }
}

const fetchAttendanceForMonth = async () => {
    loading.value = true
    try {
        const year = dayjs(monthDate.value).year()
        const month = dayjs(monthDate.value).month() + 1

        const { data } = await api.get('/admin/attendance', {
            params: {
                start_date: `${year}-${month.toString().padStart(2, '0')}-01`,
                end_date: `${year}-${month.toString().padStart(2, '0')}-${dayjs(monthDate.value).daysInMonth()}`
            }
        })

        const records = data.data || data.records || []

        // Group by date
        const grouped = {}
        records.forEach(record => {
            const date = dayjs(record.date).format('YYYY-MM-DD')
            if (!grouped[date]) {
                grouped[date] = { date, records: [], present: 0, absent: 0, status: 'present' }
            }
            grouped[date].records.push(record)
            if (['present', 'late', 'half_day'].includes(getStatus(record))) grouped[date].present++
            if (getStatus(record) === 'absent') grouped[date].absent++
        })

        monthAttendance.value = Object.values(grouped)
        fetchStats()
    } catch (error) {
        toast.error('Erro ao carregar presenças do mês')
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

const fetchEmployeesForModal = async (date) => {
    modalLoading.value = true
    try {
        const { data } = await api.get('/admin/attendance/employees', {
            params: { date }
        })
        modalEmployees.value = data.map(e => ({
            ...e,
            tempNotes: e.record?.notes || ''
        }))
    } catch (error) {
        toast.error('Erro ao carregar funcionários')
    } finally {
        modalLoading.value = false
    }
}

const markEmpPresent = async (emp) => {
    if (emp.status === 'present') return

    const checkIn = emp.work_schedule?.start_time?.substring(0, 5) || '09:00'
    const checkOut = emp.work_schedule?.end_time?.substring(0, 5) || '18:00'

    try {
        await api.post('/admin/attendance', {
            employee_id: emp.id,
            date: selectedDayDate.value,
            status: 'present',
            check_in: checkIn,
            check_out: checkOut,
            notes: emp.tempNotes
        })
        toast.success(`Presença marcada para ${emp.first_name}`)
        await fetchEmployeesForModal(selectedDayDate.value)
        await fetchAttendanceForMonth()
    } catch (error) {
        toast.error('Erro ao marcar presença')
    }
}

const markEmpAbsent = (emp) => {
    if (emp.status === 'absent') return

    selectedEmployee.value = emp
    absenceReason.value = emp.tempNotes || ''
    showAbsentModal.value = true
}

const confirmAbsent = async () => {
    try {
        await api.post('/admin/attendance', {
            employee_id: selectedEmployee.value.id,
            date: selectedDayDate.value,
            status: 'absent',
            notes: absenceReason.value || 'Falta não justificada'
        })

        toast.success(`Falta marcada para ${selectedEmployee.value.first_name}`)

        showAbsentModal.value = false

        await fetchEmployeesForModal(selectedDayDate.value)
        await fetchAttendanceForMonth()
    } catch (error) {
        toast.error('Erro ao marcar falta')
    }
}

const saveQuickAttendance = async (emp) => {
    if (!emp.has_attendance) return

    try {
        await api.put(`/admin/attendance/${emp.record.id}`, {
            status: emp.status,
            check_in: emp.record.check_in,
            check_out: emp.record.check_out,
            notes: emp.tempNotes
        })
        toast.success('Alterações guardadas')
        await fetchEmployeesForModal(selectedDayDate.value)
        await fetchAttendanceForMonth()
    } catch (error) {
        toast.error('Erro ao guardar alterações')
    }
}

const bulkMarkInModal = async (status) => {
    const employees = filteredModalEmployees.value
    if (employees.length === 0) return

    if (!confirm(`Deseja marcar ${status === 'present' ? 'Presença' : 'Falta'} para ${employees.length} funcionários filtrados?`)) return

    try {
        const payload = {
            date: selectedDayDate.value,
            employee_ids: employees.map(e => e.id),
            status: status
        }

        if (status === 'present') {
            payload.check_in = '09:00'
            payload.check_out = '18:00'
        } else {
            payload.notes = 'Falta em massa'
        }

        await api.post('/admin/attendance/mark-bulk', payload)
        toast.success('Operação concluída com sucesso')
        await fetchEmployeesForModal(selectedDayDate.value)
        await fetchAttendanceForMonth()
    } catch (error) {
        toast.error('Erro na operação em massa')
    }
}

const getStatus = (record) => {
    return record.status || (record.check_in ? 'present' : 'absent')
}

const getStatusLabel = (status) => {
    const labels = {
        present: 'Presente',
        absent: 'Falta',
        late: 'Atraso',
        half_day: 'Meio Dia',
        on_leave: 'Licença',
        justified: 'Justificado'
    }
    return labels[status] || status
}

const selectDay = (fullDate) => {
    selectedDayDate.value = fullDate
    fetchEmployeesForModal(fullDate)
}

const prevMonth = () => {
    monthDate.value = dayjs(monthDate.value).subtract(1, 'month').toDate()
    fetchAttendanceForMonth()
}

const nextMonth = () => {
    monthDate.value = dayjs(monthDate.value).add(1, 'month').toDate()
    fetchAttendanceForMonth()
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

const formatDateFull = (date) => {
    return dayjs(date).format('DD [de] MMMM [de] YYYY')
}

const formatMonthYear = (date) => {
    return dayjs(date).format('MMMM YYYY')
}

const applyFilters = () => { }

const exportReport = async () => {
    try {
        toast.info('A gerar relatório...')
        const response = await api.get('/admin/reports/attendance/export', {
            params: { date: selectedDate.value },
            responseType: 'blob'
        })
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `presencas_${selectedDate.value}.csv`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        toast.success('Relatório exportado!')
    } catch (error) {
        toast.error('Erro ao exportar')
    }
}

onMounted(() => {
    fetchDepartments()
    fetchAttendance()
    fetchAttendanceForMonth()
})
</script>

<style scoped>
.close-btn {
    position: absolute;
    top: 12px;
    right: 12px;

    width: 34px;
    height: 34px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 10px;
    border: 1px solid #e2e8f0;

    background: #ffffff;
    color: #64748b;

    cursor: pointer;

    transition: all 0.2s ease;
}

/* Hover elegante */
.close-btn:hover {
    background: #f1f5f9;
    color: #0f172a;
    border-color: #cbd5f5;

    transform: scale(1.05);
}

/* Clique */
.close-btn:active {
    transform: scale(0.92);
}

/* Ícone */
.close-btn i {
    font-size: 14px;
    pointer-events: none;
}

.attendance-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
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
    flex-wrap: wrap;
    gap: 1rem;
}

.header-content h2 {
    font-size: 1.5rem;
    font-weight: 800;
    color: #1e293b;
    margin: 0;
}

.header-actions {
    display: flex;
    gap: 0.75rem;
}

.date-picker {
    padding: 0.625rem 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    font-weight: 600;
    background: white;
}

.btn-primary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
}

.stat-card {
    background: white;
    padding: 1.25rem;
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    border: 1px solid #e2e8f0;
}

.stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
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

.stat-card.overtime .stat-icon {
    background: #eff6ff;
    color: #2563eb;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 800;
    color: #1e293b;
    display: block;
}

.stat-label {
    font-size: 0.8125rem;
    color: #64748b;
    font-weight: 500;
}

.view-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f1f5f9;
    padding: 0.375rem;
    border-radius: 12px;
}

.tabs {
    display: flex;
    gap: 0.25rem;
}

.tabs button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    border: none;
    border-radius: 10px;
    background: transparent;
    color: #64748b;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.tabs button.active {
    background: white;
    color: #3b82f6;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filters-bar {
    display: flex;
    gap: 0.75rem;
}

.filter-select {
    padding: 0.5rem 0.875rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: white;
    font-size: 0.875rem;
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 3rem;
    color: #64748b;
    gap: 1rem;
}

.spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e2e8f0;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.empty-state {
    text-align: center;
    padding: 3rem;
}

.empty-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 1rem;
    background: #f1f5f9;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: #94a3b8;
}

.empty-state h3 {
    margin: 0 0 0.5rem;
    color: #1e293b;
}

.empty-state p {
    color: #64748b;
    margin: 0;
}

.table-container {
    overflow-x: auto;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
}

.data-table th {
    padding: 0.875rem 1rem;
    text-align: left;
    color: #64748b;
    font-size: 0.75rem;
    text-transform: uppercase;
    font-weight: 700;
    border-bottom: 2px solid #f1f5f9;
}

.data-table tbody tr {
    transition: background 0.2s;
}

.data-table tbody tr:hover {
    background: #f8fafc;
}

.data-table td {
    padding: 0.875rem 1rem;
    border-bottom: 1px solid #f1f5f9;
}

.employee-cell {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.employee-avatar {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: #dbeafe;
    color: #2563eb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.8125rem;
}

.employee-info .name {
    display: block;
    font-weight: 600;
    color: #1e293b;
}

.employee-info .dept {
    font-size: 0.75rem;
    color: #94a3b8;
}

.time-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.875rem;
}

.time-badge.in {
    background: #dcfce7;
    color: #16a34a;
}

.time-badge.out {
    background: #fce7f3;
    color: #be185d;
}

.no-data {
    color: #cbd5e1;
}

.hours-badge {
    font-weight: 600;
    color: #475569;
}

.late-badge {
    background: #fef3c7;
    color: #d97706;
    padding: 0.25rem 0.625rem;
    border-radius: 6px;
    font-size: 0.8125rem;
    font-weight: 600;
}

.status-badge {
    display: inline-block;
    padding: 0.375rem 0.875rem;
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

.action-buttons {
    display: flex;
    gap: 0.5rem;
}

.btn-mark,
.btn-checkout {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-mark {
    color: #3b82f6;
}

.btn-mark:hover {
    background: #eff6ff;
    border-color: #3b82f6;
}

.btn-checkout {
    color: #ec4899;
}

.btn-checkout:hover {
    background: #fdf2f8;
    border-color: #ec4899;
}

/* Map View */
.map-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.month-nav {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.month-nav h3 {
    min-width: 180px;
    text-align: center;
    text-transform: capitalize;
    margin: 0;
    color: #1e293b;
}

.nav-btn {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.nav-btn:hover {
    background: #f1f5f9;
    border-color: #3b82f6;
    color: #3b82f6;
}

.map-legend {
    display: flex;
    gap: 1.25rem;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #64748b;
    font-weight: 500;
}

.dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
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

.dot.justified {
    background: #6366f1;
}

.calendar-grid {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
}

.weekday-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
}

.weekday-header span {
    padding: 0.75rem;
    text-align: center;
    font-weight: 600;
    font-size: 0.8125rem;
    color: #64748b;
}

.days-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
}

.day-cell {
    min-height: 70px;
    padding: 0.5rem;
    border-right: 1px solid #f1f5f9;
    border-bottom: 1px solid #f1f5f9;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
}

.day-cell:nth-child(7n) {
    border-right: none;
}

.day-cell:hover:not(.other-month):not(.weekend),
.day-cell.clickable:hover {
    background: #e2e8f0;
    cursor: pointer;
}

.day-cell.clickable {
    cursor: pointer;
}

.day-cell.other-month {
    background: #fafafa;
}

.day-cell.other-month .day-number {
    color: #cbd5e1;
}

.day-cell.weekend {
    background: #fafafa;
    cursor: default;
}

.day-cell.today .day-number {
    background: #3b82f6;
    color: white;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.day-number {
    font-weight: 600;
    color: #1e293b;
    font-size: 0.875rem;
}

.day-status {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: block;
}

.status-dot.present {
    background: #16a34a;
}

.status-dot.late {
    background: #d97706;
}

.status-dot.absent {
    background: #dc2626;
}

.status-dot.justified {
    background: #6366f1;
}

.day-stats {
    display: flex;
    gap: 0.25rem;
    margin-top: 0.25rem;
}

.day-stats .stat {
    font-size: 0.625rem;
    font-weight: 700;
    padding: 0.125rem 0.375rem;
    border-radius: 4px;
}

.day-stats .stat.present {
    background: #dcfce7;
    color: #16a34a;
}

.day-stats .stat.absent {
    background: #fee2e2;
    color: #dc2626;
}

.mini-avatar {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: #dbeafe;
    color: #2563eb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.75rem;
}

.record-employee span {
    font-weight: 600;
    color: #1e293b;
    font-size: 0.875rem;
}

.record-time {
    font-weight: 600;
    color: #475569;
}

.record-time .no-in {
    color: #dc2626;
}

.record-status {
    min-width: 100px;
}

.record-actions {
    display: flex;
    gap: 0.25rem;
}

.action-btn {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.action-btn.present {
    background: #dcfce7;
    color: #16a34a;
}

.action-btn.present:hover {
    background: #16a34a;
    color: white;
}

.action-btn.late {
    background: #fef3c7;
    color: #d97706;
}

.action-btn.late:hover {
    background: #d97706;
    color: white;
}

.action-btn.absent {
    background: #fee2e2;
    color: #dc2626;
}

.action-btn.absent:hover {
    background: #dc2626;
    color: white;
}

.no-records {
    text-align: center;
    padding: 1.5rem;
}

.no-records p {
    color: #64748b;
    margin-bottom: 1rem;
}

.btn-mark-all {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    background: #fee2e2;
    color: #dc2626;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-mark-all:hover {
    background: #dc2626;
    color: white;
}

/* Mark Modal */
.modal-overlay {
    position: fixed !important;
    inset: 0 !important;
    background: rgba(0, 0, 0, 0.6) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    z-index: 9999 !important;
}

.modal {
    background: white !important;
    border-radius: 16px;
    width: 90%;
    max-width: 450px;
    overflow: hidden;
    animation: modalIn 0.3s ease;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.day-modal {
    max-width: 600px;
}

.header-title {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.header-title i {
    font-size: 1.5rem;
    color: #3b82f6;
}

.header-title h3 {
    margin: 0;
    font-size: 1.125rem;
}

.header-title span {
    font-size: 0.8125rem;
    color: #64748b;
}

.day-stats-modal {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.day-stats-modal .stat-box {
    background: #f8fafc;
    border-radius: 12px;
    padding: 1rem;
    text-align: center;
    border: 1px solid #e2e8f0;
}

.modal .record-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.875rem;
    background: #f8fafc;
    border-radius: 10px;
    margin-bottom: 0.5rem;
    border: 1px solid #e2e8f0;
    transition: all 0.2s;
}

.modal .record-item:hover {
    border-color: #3b82f6;
    background: white;
}

.modal .record-employee {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    min-width: 0;
}

.modal .mini-avatar {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: #dbeafe;
    color: #2563eb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.8125rem;
    flex-shrink: 0;
}

.modal .record-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.modal .record-name {
    font-weight: 600;
    color: #1e293b;
    font-size: 0.875rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.modal .record-dept {
    font-size: 0.75rem;
    color: #64748b;
}

.modal .record-time {
    min-width: 80px;
}

.modal .record-time .time {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    color: #475569;
    font-weight: 500;
    font-size: 0.875rem;
}

.modal .record-time .time i {
    color: #16a34a;
    font-size: 0.75rem;
}

.modal .record-time .no-in {
    color: #dc2626;
    font-size: 0.8125rem;
}

.modal .btn-sm {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #3b82f6;
    transition: all 0.2s;
}

.modal .btn-sm:hover {
    background: #eff6ff;
    border-color: #3b82f6;
}

/* Modal Improvements */
.xlarge-modal {
    max-width: 1000px !important;
    width: 95% !important;
    height: 90vh !important;
    display: flex;
    flex-direction: column;
}

.xlarge-modal .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem !important;
    background: #f8fafc;
}

.header-icon {
    width: 44px;
    height: 44px;
    background: #eff6ff;
    color: #3b82f6;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
}

.header-subtitle {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.8125rem;
    color: #64748b;
    margin-top: 0.25rem;
}

.header-subtitle i {
    font-size: 0.75rem;
}

.separator {
    color: #cbd5e1;
}

.modal-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    gap: 1rem;
    background: white;
    padding: 1rem;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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
    color: #94a3b8;
}

.search-input {
    width: 100%;
    padding: 0.625rem 1rem 0.625rem 2.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    font-size: 0.875rem;
    transition: all 0.2s;
}

.search-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    outline: none;
}

.modal-actions {
    display: flex;
    gap: 0.75rem;
}

.btn-bulk {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.8125rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-bulk.present {
    background: #dcfce7;
    color: #166534;
}

.btn-bulk.absent {
    background: #fee2e2;
    color: #991b1b;
}

.btn-bulk:hover {
    filter: brightness(0.95);
    transform: translateY(-1px);
}

.attendance-table-container {
    background: white;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.attendance-list-table {
    width: 100%;
    border-collapse: collapse;
}

.attendance-list-table th {
    background: #f8fafc;
    padding: 1rem;
    text-align: left;
    font-size: 0.75rem;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    border-bottom: 2px solid #f1f5f9;
}

.attendance-list-table td {
    padding: 1rem;
    border-bottom: 1px solid #f1f5f9;
}

.attendance-list-table tr:last-child td {
    border-bottom: none;
}

.attendance-list-table tr.has-record {
    background: #fdfdfd;
}

.attendance-list-table tr:hover {
    background: #f8fafc;
}

.emp-profile {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
}

.modal {
    background: #fff;
    padding: 24px;
    border-radius: 12px;
    width: 400px;
    max-width: 90%;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.modal h3 {
    margin-bottom: 10px;
}

.modal textarea {
    width: 100%;
    margin-top: 10px;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #ddd;
    resize: none;
}

.modal-actions {
    margin-top: 15px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.btn {
    padding: 8px 14px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
}

.btn.cancel {
    background: #eee;
}

.btn.confirm {
    background: #ef4444;
    color: white;
}

.emp-avatar {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: #eff6ff;
    color: #3b82f6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 0.875rem;
}

.emp-details {
    display: flex;
    flex-direction: column;
}

.emp-name {
    font-weight: 600;
    color: #1e293b;
    font-size: 0.875rem;
}

.emp-dept {
    font-size: 0.75rem;
    color: #94a3b8;
}

.status-tag {
    padding: 0.375rem 0.75rem;
    border-radius: 99px;
    font-size: 0.75rem;
    font-weight: 700;
}

.status-pending {
    background: #f1f5f9;
    color: #64748b;
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

.status-half_day {
    background: #e0f2fe;
    color: #075985;
}

.time-inputs {
    background: #f8fafc;
    padding: 0.5rem;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    width: fit-content;
}

.time-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.mini-time {
    border: none;
    background: transparent;
    font-size: 0.8125rem;
    font-weight: 600;
    color: #334155;
    padding: 0;
    width: 45px;
    -webkit-appearance: none;
}

.schedule-info {
    font-size: 0.75rem;
    color: #94a3b8;
    display: flex;
    align-items: center;
    gap: 0.375rem;
}

.notes-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid transparent;
    background: transparent;
    font-size: 0.8125rem;
    border-radius: 6px;
    transition: all 0.2s;
}

.notes-input:hover,
.notes-input:focus {
    background: #f8fafc;
    border-color: #e2e8f0;
}

.quick-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
}

.action-pill {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 1rem;
    border-radius: 99px;
    font-size: 0.8125rem;
    font-weight: 600;
    border: 1px solid #e2e8f0;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    color: #64748b;
    white-space: nowrap;
}

.action-pill i {
    font-size: 0.75rem;
}

.action-pill.present:hover,
.action-pill.present.active {
    background: #dcfce7;
    border-color: #16a34a;
    color: #166534;
}

.action-pill.absent:hover,
.action-pill.absent.active {
    background: #fee2e2;
    border-color: #dc2626;
    color: #991b1b;
}

.modal-loading {
    padding: 4rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    color: #64748b;
}

.modal-footer {
    padding: 1.25rem 1.5rem;
    background: white;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: flex-end;
}

.btn-done {
    padding: 0.625rem 2rem;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-done:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.text-right {
    text-align: right;
}

.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

@keyframes modalIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.modal {
    animation: modalIn 0.3s ease-out;
}

/* Responsive Styles */
@media (max-width: 768px) {
    .xlarge-modal {
        width: 100% !important;
        height: 100vh !important;
        border-radius: 0;
    }

    .modal-controls {
        flex-direction: column;
        align-items: stretch;
    }

    .search-box {
        max-width: none;
    }

    .attendance-list-table th:nth-child(3),
    .attendance-list-table td:nth-child(3),
    .attendance-list-table th:nth-child(4),
    .attendance-list-table td:nth-child(4) {
        display: none;
    }
}
</style>
