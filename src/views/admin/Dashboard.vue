<template>
  <div class="dashboard p-6">
    <!-- Stats Row -->
    <div class="stats-grid mb-8">
      <StatCard
        label="Total de Funcionários"
        :value="stats.total_employees"
        icon="pi pi-users"
        color="#3b82f6"
      />
      <StatCard
        label="Taxa de Absenteísmo"
        :value="stats.absenteeism_rate + '%'"
        icon="pi pi-chart-bar"
        color="#ef4444"
        :trend="stats.absenteeism_rate > 5 ? 'up' : 'down'"
      />
      <StatCard
        label="Docs. Expirando"
        :value="stats.expiring_documents"
        icon="pi pi-file-excel"
        color="#f59e0b"
        :alert="stats.expiring_documents > 0"
      />
      <StatCard
        label="Licenças Pendentes"
        :value="stats.pending_leaves"
        icon="pi pi-calendar-plus"
        color="#8b5cf6"
      />
    </div>

    <br />

    <div class="content-grid grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Attendance Today -->
      <div class="attendance-card lg:col-span-2">
        <div class="card-header">
          <div class="header-left">
            <div class="card-icon">
              <i class="pi pi-calendar-check"></i>
            </div>
            <div class="card-title">
              <h3>Presenças Hoje</h3>
              <span class="card-date">{{ formatCurrentDate() }}</span>
            </div>
          </div>
          <button @click="$router.push('/admin/attendance')" class="manage-btn">
            <i class="pi pi-arrow-right"></i>
            <span>Gerir</span>
          </button>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <span>A sincronizar dados...</span>
        </div>

        <div v-else class="card-body">
          <div class="summary-bar">
            <div class="total-info">
              <span class="total-label">Total</span>
              <span class="total-value">{{ stats.total_employees }}</span>
              <span class="total-text">funcionários</span>
            </div>
            <div class="rate-indicator" :class="getRateClass">
              <i :class="getRateIcon"></i>
              <span>{{ getAttendanceRate() }}% presença</span>
            </div>
          </div>

          <div class="progress-container">
            <div class="progress-track">
              <div class="progress-segment present" :style="`width: ${getPercent('present')}%`" title="Presentes">
                <span v-if="getPercent('present') > 8">{{ attendanceToday.present || 0 }}</span>
              </div>
              <div class="progress-segment late" :style="`width: ${getPercent('late')}%`" title="Atrasados">
                <span v-if="getPercent('late') > 8">{{ attendanceToday.late || 0 }}</span>
              </div>
              <div class="progress-segment absent" :style="`width: ${getPercent('absent')}%`" title="Faltas">
                <span v-if="getPercent('absent') > 8">{{ attendanceToday.absent || 0 }}</span>
              </div>
              <div class="progress-segment on-leave" :style="`width: ${getPercent('on_leave')}%`" title="Em Licença">
                <span v-if="getPercent('on_leave') > 8">{{ attendanceToday.on_leave || 0 }}</span>
              </div>
            </div>
            <div class="progress-legend">
              <div class="legend-item">
                <span class="legend-dot present"></span>
                <span class="legend-label">Presentes</span>
                <span class="legend-value">{{ attendanceToday.present || 0 }}</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot late"></span>
                <span class="legend-label">Atrasados</span>
                <span class="legend-value">{{ attendanceToday.late || 0 }}</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot absent"></span>
                <span class="legend-label">Faltas</span>
                <span class="legend-value">{{ attendanceToday.absent || 0 }}</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot on-leave"></span>
                <span class="legend-label">Em Licença</span>
                <span class="legend-value">{{ attendanceToday.on_leave || 0 }}</span>
              </div>
            </div>
          </div>

          <div class="quick-stats">
            <div class="quick-stat success">
              <div class="stat-icon">
                <i class="pi pi-check-circle"></i>
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ attendanceToday.present || 0 }}</span>
                <span class="stat-label">Presentes</span>
              </div>
            </div>
            <div class="quick-stat warning">
              <div class="stat-icon">
                <i class="pi pi-clock"></i>
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ attendanceToday.late || 0 }}</span>
                <span class="stat-label">Atrasados</span>
              </div>
            </div>
            <div class="quick-stat danger">
              <div class="stat-icon">
                <i class="pi pi-times-circle"></i>
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ attendanceToday.absent || 0 }}</span>
                <span class="stat-label">Faltas</span>
              </div>
            </div>
            <div class="quick-stat info">
              <div class="stat-icon">
                <i class="pi pi-calendar"></i>
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ attendanceToday.on_leave || 0 }}</span>
                <span class="stat-label">Em Licença</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <br />

      <!-- Active Alerts -->
      <Card title="Alertas de Gestão">
        <div class="alerts-list">
          <div v-if="stats.expiring_documents > 0" class="alert-item flex gap-4 p-3 bg-amber-50 rounded-xl mb-3 border border-amber-100 alert-warning">
            <div class="alert-icon text-amber-600"><i class="pi pi-file-excel text-xl"></i></div>
            <div class="alert-info">
              <h5 class="text-sm font-bold text-amber-900">{{ stats.expiring_documents }} Documentos Expirando</h5>
              <p class="text-xs text-amber-700">Verifique os documentos que vencem nos próximos 30 dias.</p>
            </div>
          </div>
          
          <div v-if="stats.pending_leaves > 0" class="alert-item flex gap-4 p-3 bg-indigo-50 rounded-xl mb-3 border border-indigo-100 alert-warning">
            <div class="alert-icon text-indigo-600"><i class="pi pi-calendar-plus text-xl"></i></div>
            <div class="alert-info">
              <h5 class="text-sm font-bold text-indigo-900">{{ stats.pending_leaves }} Justificativas/Licenças</h5>
              <p class="text-xs text-indigo-700">Há solicitações aguardando sua revisão e aprovação.</p>
            </div>
          </div>

          <div v-if="!stats.expiring_documents && !stats.pending_leaves" class="p-8 text-center text-slate-400 alert-info-blue">
            <i class="pi pi-check-circle text-4xl mb-2 opacity-20"></i>
            <p class="text-sm font-medium">Sem alertas pendentes</p>
          </div>
        </div>
      </Card>
    </div>

    <br />

    <!-- Recent Employees Section -->
    <div class="recent-section mt-8">
      <Card title="Contratações Recentes">
        <div class="employees-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div 
            v-for="employee in recentEmployees" 
            :key="employee.id"
            class="employee-item p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all cursor-pointer bg-white"
            @click="$router.push(`/admin/employees/${employee.id}`)"
          >
            <div class="flex flex-col items-center text-center">
              <div class="employee-avatar w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mb-3 border-2 border-white shadow-sm">
                {{ employee.first_name.charAt(0) }}{{ employee.last_name.charAt(0) }}
              </div>
              <div class="employee-name font-bold text-slate-800 text-sm mb-1 truncate w-full">{{ employee.full_name }}</div>
              <div class="employee-meta text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                {{ employee.department?.name || 'Geral' }}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/services/api'
import Card from '@/components/common/Card.vue'
import StatCard from '@/components/common/StatCard.vue'
import Loading from '@/components/common/Loading.vue'
import { useToast } from 'vue-toastification'

const toast = useToast()
const loading = ref(true)

const stats = reactive({
  total_employees: 0,
  active_employees: 0,
  total_users: 0,
  total_departments: 0,
  absenteeism_rate: 0,
  expiring_documents: 0,
  pending_leaves: 0
})

const attendanceToday = ref({
  present: 0,
  late: 0,
  absent: 0,
  on_leave: 0,
  justified: 0,
  not_checked: 0,
})

const recentEmployees = ref([])

const fetchDashboard = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/admin/dashboard')
    Object.assign(stats, data.stats)
    stats.absenteeism_rate = data.absenteeism_rate || 0
    stats.expiring_documents = data.expiring_documents || 0
    stats.pending_leaves = data.pending_leaves || 0
    
    attendanceToday.value = data.attendance_today
    recentEmployees.value = data.recent_employees
  } catch (error) {
    toast.error('Erro ao carregar dashboard')
  } finally {
    loading.value = false
  }
}

const getPercent = (key) => {
    if (!stats.total_employees) return 0
    return ((attendanceToday.value[key] || 0) / stats.total_employees) * 100
}

const getAttendanceRate = () => {
    if (!stats.total_employees) return 0
    const present = attendanceToday.value.present || 0
    return Math.round((present / stats.total_employees) * 100)
}

const getRateClass = computed(() => {
    const rate = getAttendanceRate()
    if (rate >= 90) return 'excellent'
    if (rate >= 75) return 'good'
    if (rate >= 60) return 'warning'
    return 'danger'
})

const getRateIcon = computed(() => {
    const rate = getAttendanceRate()
    if (rate >= 90) return 'pi pi-star-fill'
    if (rate >= 75) return 'pi pi-check-circle'
    if (rate >= 60) return 'pi pi-exclamation-triangle'
    return 'pi pi-times-circle'
})

const formatCurrentDate = () => {
    const date = new Date()
    const options = { weekday: 'long', day: 'numeric', month: 'long' }
    return date.toLocaleDateString('pt-PT', options)
}

onMounted(() => {
  fetchDashboard()
})
</script>

<style scoped>
.dashboard {
  animation: fadeIn 0.5s ease-out;
}
.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;

  padding: 14px;
  border-radius: 14px;

  background: #ffffff;
  border: 1px solid #f1f5f9;

  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);

  transition: all 0.25s ease;
  cursor: pointer;
}

.alert-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

/* Ícone */
.alert-icon {
  width: 40px;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;
  flex-shrink: 0;
}

/* Conteúdo */
.alert-info h5 {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 2px;
}

.alert-info p {
  font-size: 12px;
  opacity: 0.8;
}

/* VARIANTES */

.alert-warning {
  background: #fffbeb;
  border-color: #fde68a;
}

.alert-warning .alert-icon {
  background: #fef3c7;
  color: #d97706;
}

.alert-warning h5 {
  color: #92400e;
}

.alert-warning p {
  color: #b45309;
}

.alert-info-blue {
  background: #eef2ff;
  border-color: #c7d2fe;
}

.alert-info-blue .alert-icon {
  background: #e0e7ff;
  color: #4f46e5;
}

.alert-info-blue h5 {
  color: #3730a3;
}

.alert-info-blue p {
  color: #4338ca;
}

/* Estado vazio */
.alert-empty {
  padding: 30px;
  text-align: center;
  color: #94a3b8;
}

.alert-empty i {
  font-size: 40px;
  opacity: 0.2;
  margin-bottom: 6px;
}

.employees-list {
  gap: 16px;
}

.employee-item {
  position: relative;

  padding: 16px;
  border-radius: 18px;

  background: #ffffff;
  border: 1px solid #f1f5f9;

  transition: all 0.25s ease;
  cursor: pointer;
  overflow: hidden;
}

.employee-item:hover {
  transform: translateY(-4px) scale(1.01);
  border-color: #bfdbfe;

  box-shadow: 0 12px 30px rgba(59, 130, 246, 0.15);
}

/* efeito glow leve */
.employee-item::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;

  background: radial-gradient(circle at top, rgba(59,130,246,0.08), transparent 60%);
  opacity: 0;
  transition: 0.3s;
}

.employee-item:hover::after {
  opacity: 1;
}

/* Avatar */
.employee-avatar {
  width: 52px;
  height: 52px;

  border-radius: 50%;
  font-weight: 700;
  font-size: 14px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #1d4ed8;

  border: 3px solid white;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);

  transition: all 0.3s ease;
}

.employee-item:hover .employee-avatar {
  transform: scale(1.08);
}

/* Nome */
.employee-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

/* Departamento */
.employee-meta {
  font-size: 10px;
  letter-spacing: 0.08em;
  font-weight: 600;
  color: #94a3b8;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.employee-item:hover .employee-avatar {
    transform: scale(1.1);
    background-color: #3b82f6;
    color: white;
}

/* Attendance Card Styles */
.attendance-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: white;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.card-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.card-title h3 {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
}

.card-date {
  font-size: 0.8125rem;
  opacity: 0.8;
  text-transform: capitalize;
}

.manage-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.manage-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateX(4px);
}

.card-body {
  padding: 1.5rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
  to { transform: rotate(360deg); }
}

.summary-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding: 1rem 1.25rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.total-info {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.total-label {
  font-size: 0.8125rem;
  color: #64748b;
  font-weight: 500;
}

.total-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
}

.total-text {
  font-size: 0.875rem;
  color: #64748b;
}

.rate-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 99px;
  font-weight: 700;
  font-size: 0.875rem;
}

.rate-indicator.excellent {
  background: #dcfce7;
  color: #16a34a;
}

.rate-indicator.good {
  background: #dbeafe;
  color: #2563eb;
}

.rate-indicator.warning {
  background: #fef3c7;
  color: #d97706;
}

.rate-indicator.danger {
  background: #fee2e2;
  color: #dc2626;
}

.progress-container {
  margin-bottom: 1.5rem;
}

.progress-track {
  display: flex;
  height: 40px;
  border-radius: 12px;
  overflow: hidden;
  background: #f1f5f9;
}

.progress-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.8125rem;
  font-weight: 700;
  transition: width 1s ease-in-out;
  min-width: 0;
}

.progress-segment span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 0.5rem;
}

.progress-segment.present {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.progress-segment.late {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.progress-segment.absent {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.progress-segment.on-leave {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
}

.progress-legend {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-top: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.legend-item:hover {
  background: #f8fafc;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-dot.present { background: #10b981; }
.legend-dot.late { background: #f59e0b; }
.legend-dot.absent { background: #ef4444; }
.legend-dot.on-leave { background: #6366f1; }

.legend-label {
  font-size: 0.75rem;
  color: #64748b;
  flex: 1;
}

.legend-value {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.quick-stat {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid;
  transition: all 0.2s;
}

.quick-stat:hover {
  transform: translateY(-2px);
}

.quick-stat.success {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.quick-stat.warning {
  background: #fffbeb;
  border-color: #fde68a;
}

.quick-stat.danger {
  background: #fef2f2;
  border-color: #fecaca;
}

.quick-stat.info {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.quick-stat .stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
}

.quick-stat.success .stat-icon {
  background: #dcfce7;
  color: #16a34a;
}

.quick-stat.warning .stat-icon {
  background: #fef3c7;
  color: #d97706;
}

.quick-stat.danger .stat-icon {
  background: #fee2e2;
  color: #dc2626;
}

.quick-stat.info .stat-icon {
  background: #dbeafe;
  color: #2563eb;
}

.quick-stat .stat-content {
  display: flex;
  flex-direction: column;
}

.quick-stat .stat-value {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1;
}

.quick-stat .stat-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}

@media (max-width: 1024px) {
  .progress-legend {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .summary-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .progress-legend {
    grid-template-columns: 1fr 1fr;
  }
  
  .quick-stats {
    grid-template-columns: 1fr 1fr;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .manage-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>