<template>
    <div class="absence-map">
        <div class="page-header">
            <div class="header-content">
                <h2>Mapa de Assiduidade</h2>
                <p class="text-muted">Visão geral mensal de presenças e ausências da equipa</p>
            </div>
            <div class="header-actions">
                <div class="filter-group">
                    <label>Mês:</label>
                    <input v-model="selectedMonth" type="month" @change="fetchData" class="month-input" />
                </div>
                <div class="filter-group">
                    <label>Departamento:</label>
                    <select v-model="filters.department_id" @change="fetchData" class="dept-select">
                        <option value="">Todos</option>
                        <option v-for="dept in departments" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
                    </select>
                </div>
                <button @click="exportMap" class="btn-secondary">
                    <i class="pi pi-download"></i> Exportar
                </button>
            </div>
        </div>

        <div v-if="loading" class="loading-container">
            <i class="pi pi-spin pi-spinner text-3xl"></i>
            <p>Carregando mapa...</p>
        </div>

        <div v-else class="map-card card">
            <div class="grid-container" ref="gridContainer">
                <table class="matrix-table">
                    <thead>
                        <tr>
                            <th class="sticky-col employee-header">Funcionário</th>
                            <th v-for="day in days" :key="day" :class="{ 'weekend': isWeekend(day) }" class="day-header">
                                <div class="day-num">{{ formatDayNum(day) }}</div>
                                <div class="day-name">{{ formatDayName(day) }}</div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="emp in matrix" :key="emp.id">
                            <td class="sticky-col employee-cell">
                                <div class="emp-info">
                                    <span class="emp-name">{{ emp.name }}</span>
                                    <span class="emp-dept">{{ emp.department }}</span>
                                </div>
                            </td>
                            <td v-for="day in days" :key="day" 
                                :class="{ 'weekend': isWeekend(day) }" 
                                class="status-cell"
                                @click="handleCellClick(emp, day)">
                                <div v-if="emp.stats[day]" class="status-indicator" :class="emp.stats[day].status">
                                    <i :class="getStatusIcon(emp.stats[day].status)"></i>
                                    <div class="cell-tooltip" v-if="emp.stats[day].details">
                                        <template v-if="emp.stats[day].details.type === 'attendance'">
                                            <span>In: {{ emp.stats[day].details.check_in || '--:--' }}</span>
                                            <span>Out: {{ emp.stats[day].details.check_out || '--:--' }}</span>
                                        </template>
                                        <template v-else>
                                            <span>{{ emp.stats[day].details.label }}</span>
                                        </template>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="map-legend">
                <div class="legend-item"><span class="dot present"></span> Presente</div>
                <div class="legend-item"><span class="dot late"></span> Atraso</div>
                <div class="legend-item"><span class="dot absent"></span> Falta</div>
                <div class="legend-item"><span class="dot on_leave"></span> Licença/Férias</div>
                <div class="legend-item"><span class="dot half_day"></span> Meio Dia</div>
            </div>
        </div>

        <!-- Quick Action Dialog -->
        <div v-if="showActionDialog" class="modal-overlay" @click="showActionDialog = false">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>Ação Rápida: {{ selectedCell.emp.name }}</h3>
                    <button @click="showActionDialog = false" class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <p class="mb-4">Data: <strong>{{ formatDate(selectedCell.day) }}</strong></p>
                    
                    <div v-if="selectedCell.data.status === 'absent'" class="action-options">
                        <button class="action-btn primary" @click="justifyAbsence">
                            <i class="pi pi-file-edit"></i> Justificar Falta
                        </button>
                    </div>
                    
                    <div class="action-options mt-4">
                        <button class="action-btn" @click="viewEmployeeDetails">
                            <i class="pi pi-user"></i> Ver Perfil Completo
                        </button>
                        <button class="action-btn" @click="editAttendance" v-if="selectedCell.data.type === 'attendance'">
                            <i class="pi pi-pencil"></i> Editar Registro
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import api from '@/services/api'
import dayjs from 'dayjs'
import 'dayjs/locale/pt'

dayjs.locale('pt')

const loading = ref(false)
const selectedMonth = ref(dayjs().format('YYYY-MM'))
const days = ref([])
const matrix = ref([])
const departments = ref([])
const filters = reactive({
    department_id: ''
})

const showActionDialog = ref(false)
const selectedCell = ref({ emp: null, day: null, data: null })

const fetchData = async () => {
    loading.value = true
    try {
        const { data } = await api.get('/admin/attendance-map', {
            params: {
                month: selectedMonth.value,
                department_id: filters.department_id
            }
        })
        days.value = data.days
        matrix.value = data.matrix
    } catch (error) {
        console.error('Error fetching map data')
    } finally {
        loading.value = false
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

const isWeekend = (date) => {
    const day = dayjs(date).day()
    return day === 0 || day === 6
}

const formatDayNum = (date) => dayjs(date).format('DD')
const formatDayName = (date) => dayjs(date).format('ddd')
const formatDate = (date) => dayjs(date).format('DD [de] MMMM, YYYY')

const getStatusIcon = (status) => {
    const icons = {
        'present': 'pi pi-check',
        'late': 'pi pi-clock',
        'absent': 'pi pi-times',
        'on_leave': 'pi pi-calendar',
        'half_day': 'pi pi-minus'
    }
    return icons[status] || ''
}

const handleCellClick = (emp, day) => {
    selectedCell.value = {
        emp,
        day,
        data: emp.stats[day] || { status: 'none' }
    }
    showActionDialog.value = true
}

const justifyAbsence = () => {
    // Navigate to justifications with pre-filled data or open a specific modal
    window.location.href = `/admin/attendance/justifications?employee_id=${selectedCell.value.emp.id}&date=${selectedCell.value.day}`
}

const viewEmployeeDetails = () => {
    window.location.href = `/admin/employees/${selectedCell.value.emp.id}`
}

const exportMap = () => {
    window.print() // Simple version for now
}

onMounted(() => {
    fetchData()
    fetchDepartments()
})
</script>

<style scoped>
.absence-map {
    animation: fadeIn 0.4s ease-out;
}

.btn-secondary {
  background: transparent;
  color: #64748b;
  border: 1px solid #cbd5f5;
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #f8fafc;
  color: #334155;
  border-color: #94a3b8;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.header-actions {
    display: flex;
    gap: 1.5rem;
    align-items: center;
}

.filter-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.filter-group label {
    font-weight: 600;
    color: #475569;
    font-size: 0.9rem;
}

.month-input, .dept-select {
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-weight: 500;
}

.map-card {
    background: white;
    padding: 0;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.grid-container {
    overflow: auto;
    max-height: 70vh;
}

.matrix-table {
    border-collapse: separate;
    border-spacing: 0;
    width: 100%;
}

th, td {
    border-bottom: 1px solid #f1f5f9;
    border-right: 1px solid #f1f5f9;
    text-align: center;
}

.sticky-col {
    position: sticky;
    left: 0;
    background: white;
    z-index: 2;
    border-right: 2px solid #e2e8f0;
    text-align: left;
    padding-left: 1rem;
    min-width: 200px;
}

thead th {
    position: sticky;
    top: 0;
    background: #f8fafc;
    z-index: 3;
    padding: 0.75rem;
}

thead th.sticky-col {
    z-index: 4;
}

.day-header {
    min-width: 45px;
}

.day-num { font-size: 1rem; font-weight: 800; color: #1e293b; }
.day-name { font-size: 0.7rem; text-transform: uppercase; color: #94a3b8; }

.weekend { background-color: #f8fafc; }

.emp-info { display: flex; flex-direction: column; }
.emp-name { font-weight: 700; color: #1e293b; font-size: 0.9rem; }
.emp-dept { font-size: 0.75rem; color: #64748b; }

.status-cell {
    padding: 0;
    cursor: pointer;
    transition: background 0.2s;
    height: 50px;
}

.status-cell:hover { background-color: #f1f5f9; }

.status-indicator {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.status-indicator i { font-size: 1.1rem; }

.status-indicator.present { color: #10b981; }
.status-indicator.late { color: #f59e0b; background-color: #fffbeb; }
.status-indicator.absent { color: #ef4444; background-color: #fef2f2; }
.status-indicator.on_leave { color: #3b82f6; background-color: #eff6ff; }
.status-indicator.half_day { color: #8b5cf6; background-color: #f5f3ff; }

.cell-tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: #1e293b;
    color: white;
    padding: 0.5rem;
    border-radius: 6px;
    font-size: 0.75rem;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s;
    z-index: 10;
    display: flex;
    flex-direction: column;
}

.status-indicator:hover .cell-tooltip {
    opacity: 1;
    visibility: visible;
    bottom: calc(100% + 5px);
}

.map-legend {
    display: flex;
    gap: 1.5rem;
    padding: 1.25rem;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: #475569;
}

.dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
}

.dot.present { background-color: #10b981; }
.dot.late { background-color: #f59e0b; }
.dot.absent { background-color: #ef4444; }
.dot.on_leave { background-color: #3b82f6; }
.dot.half_day { background-color: #8b5cf6; }

/* Modal */
.modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.modal-content {
    background: white;
    padding: 2rem;
    border-radius: 16px;
    width: 400px;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
}

.action-btn {
    width: 100%;
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: white;
    font-weight: 600;
    margin-bottom: 0.5rem;
    cursor: pointer;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.action-btn.primary {
    background: #3b82f6;
    color: white;
    border: none;
}
</style>
