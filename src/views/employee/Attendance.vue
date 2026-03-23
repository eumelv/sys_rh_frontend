<template>
  <div class="attendance-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <i class="pi pi-clock"></i>
          <div>
            <h1>Registro de Ponto</h1>
            <p class="subtitle">Registre sua entrada e saída diariamente</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Clock Card -->
    <div class="clock-card">
      <div class="clock-display">
        <div class="time-section">
          <span class="current-time">{{ currentTime }}</span>
          <span class="current-date">{{ currentDate }}</span>
        </div>
      </div>

      <div class="today-attendance">
        <h3>Registro de Hoje</h3>
        
        <div v-if="todayAttendance" class="attendance-grid">
          <div class="attendance-item" :class="{ filled: todayAttendance.check_in }">
            <i class="pi pi-sign-in"></i>
            <div class="item-info">
              <span class="label">Entrada</span>
              <span class="value">{{ todayAttendance.formatted_check_in || '--:--' }}</span>
            </div>
          </div>

          <div class="attendance-item" :class="{ filled: todayAttendance.check_out }">
            <i class="pi pi-sign-out"></i>
            <div class="item-info">
              <span class="label">Saída</span>
              <span class="value">{{ todayAttendance.formatted_check_out || '--:--' }}</span>
            </div>
          </div>

          <div class="attendance-item" :class="{ filled: todayAttendance.work_hours }">
            <i class="pi pi-hourglass"></i>
            <div class="item-info">
              <span class="label">Horas Trabalhadas</span>
              <span class="value">{{ todayAttendance.work_hours || '0.0' }}h</span>
            </div>
          </div>

          <div v-if="todayAttendance.late_minutes > 0" class="attendance-item late">
            <i class="pi pi-exclamation-triangle"></i>
            <div class="item-info">
              <span class="label">Atraso</span>
              <span class="value">{{ todayAttendance.late_minutes }} min</span>
            </div>
          </div>
        </div>

        <div v-else class="attendance-grid">
          <div class="attendance-item">
            <i class="pi pi-sign-in"></i>
            <div class="item-info">
              <span class="label">Entrada</span>
              <span class="value">--:--</span>
            </div>
          </div>

          <div class="attendance-item">
            <i class="pi pi-sign-out"></i>
            <div class="item-info">
              <span class="label">Saída</span>
              <span class="value">--:--</span>
            </div>
          </div>

          <div class="attendance-item">
            <i class="pi pi-hourglass"></i>
            <div class="item-info">
              <span class="label">Horas Trabalhadas</span>
              <span class="value">0.0h</span>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button 
            v-if="canCheckIn"
            @click="checkIn" 
            :disabled="checking"
            class="btn-action btn-check-in"
          >
            <i class="pi" :class="checking ? 'pi-spin pi-spinner' : 'pi-sign-in'"></i>
            <span>{{ checking ? 'Registrando...' : 'Registrar Entrada' }}</span>
          </button>

          <button 
            v-if="canCheckOut"
            @click="checkOut" 
            :disabled="checking"
            class="btn-action btn-check-out"
          >
            <i class="pi" :class="checking ? 'pi-spin pi-spinner' : 'pi-sign-out'"></i>
            <span>{{ checking ? 'Registrando...' : 'Registrar Saída' }}</span>
          </button>

          <div v-if="!canCheckIn && !canCheckOut && todayAttendance" class="completed-badge">
            <i class="pi pi-check-circle"></i>
            <span>Ponto completo registrado hoje!</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon present">
          <i class="pi pi-check"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ monthStats.present }}</span>
          <span class="stat-label">Dias Presentes</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon late">
          <i class="pi pi-clock"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ monthStats.late }}</span>
          <span class="stat-label">Atrasos</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon absent">
          <i class="pi pi-times"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ monthStats.absent }}</span>
          <span class="stat-label">Faltas</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon hours">
          <i class="pi pi-hourglass"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ monthStats.totalHours }}h</span>
          <span class="stat-label">Horas Trabalhadas</span>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-section">
      <div class="tabs-header">
        <button 
          @click="activeTab = 'history'" 
          class="tab-btn" 
          :class="{ active: activeTab === 'history' }"
        >
          <i class="pi pi-list"></i>
          <span>Histórico</span>
        </button>
        <button 
          @click="activeTab = 'justifications'" 
          class="tab-btn" 
          :class="{ active: activeTab === 'justifications' }"
        >
          <i class="pi pi-file-edit"></i>
          <span>Justificativas</span>
          <span v-if="pendingJustifications > 0" class="badge">{{ pendingJustifications }}</span>
        </button>
      </div>

      <!-- History Tab -->
      <div v-show="activeTab === 'history'" class="tab-content">
        <div class="content-header">
          <h3>Histórico de Registros</h3>
          <div class="filters">
            <select v-model="filters.month" @change="loadAttendances">
              <option v-for="(month, index) in months" :key="index" :value="index + 1">
                {{ month }}
              </option>
            </select>
            <select v-model="filters.year" @change="loadAttendances">
              <option v-for="year in years" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
        </div>

        <div v-if="loadingHistory" class="loading-state">
          <i class="pi pi-spin pi-spinner"></i>
          <p>Carregando histórico...</p>
        </div>

        <div v-else-if="attendances.length === 0" class="empty-state">
          <i class="pi pi-calendar"></i>
          <p>Nenhum registro encontrado para este período</p>
        </div>

        <div v-else class="history-table">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Entrada</th>
                <th>Saída</th>
                <th>Horas</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="att in attendances" :key="att.id" :class="`status-${att.status}`">
                <td>
                  <div class="date-cell">
                    <span class="day">{{ formatDateShort(att.date) }}</span>
                  </div>
                </td>
                <td>{{ att.formatted_check_in || '-' }}</td>
                <td>{{ att.formatted_check_out || '-' }}</td>
                <td>
                  <strong>{{ att.work_hours || '0.0' }}h</strong>
                  <span v-if="att.late_minutes > 0" class="late-text">
                    ({{ att.late_minutes }}min atrasado)
                  </span>
                </td>
                <td>
                  <span class="status-badge" :class="`badge-${att.status}`">
                    {{ att.status_label }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Justifications Tab -->
      <div v-show="activeTab === 'justifications'" class="tab-content">
        <div class="content-header">
          <h3>Justificativas</h3>
          <button @click="openJustificationModal" class="btn-primary">
            <i class="pi pi-plus"></i>
            <span>Nova Justificativa</span>
          </button>
        </div>

        <div v-if="loadingJustifications" class="loading-state">
          <i class="pi pi-spin pi-spinner"></i>
          <p>Carregando justificativas...</p>
        </div>

        <div v-else-if="justifications.length === 0" class="empty-state">
          <i class="pi pi-file-edit"></i>
          <p>Nenhuma justificativa enviada</p>
        </div>

        <div v-else class="justifications-list">
          <div 
            v-for="just in justifications" 
            :key="just.id"
            class="justification-card"
          >
            <div class="just-header">
              <div class="just-type">
                <i :class="getJustificationIcon(just.type)"></i>
                <span>{{ just.type_label }}</span>
              </div>
              <span class="status-badge" :class="`badge-${just.status}`">
                {{ just.status_label }}
              </span>
            </div>
            
            <div class="just-body">
              <p class="just-reason">{{ just.reason }}</p>
              
              <div class="just-info">
                <div class="info-item">
                  <i class="pi pi-calendar"></i>
                  <span>{{ formatDate(just.start_date) }} - {{ formatDate(just.end_date) }}</span>
                </div>
                
                <div v-if="just.file_path" class="info-item">
                  <i class="pi pi-paperclip"></i>
                  <a :href="just.file_url" target="_blank">Ver Anexo</a>
                </div>
              </div>

              <div v-if="just.status !== 'pending'" class="just-review">
                <div class="review-status">
                  <i :class="just.status === 'approved' ? 'pi pi-check' : 'pi pi-times'"></i>
                  <span>{{ just.status === 'approved' ? 'Aprovada' : 'Rejeitada' }}</span>
                </div>
                <p v-if="just.review_notes">{{ just.review_notes }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showJustificationModal" class="modal-overlay" @click="closeJustificationModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Nova Justificativa</h2>
          <button class="btn-close" @click="closeJustificationModal">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <form @submit.prevent="submitJustification" class="modal-body">
          <div class="form-group">
            <label>Tipo *</label>
            <select v-model="justificationForm.type" required>
              <option value="">Selecione</option>
              <option value="late">Atraso</option>
              <option value="absence">Falta</option>
              <option value="early_leave">Saída Antecipada</option>
              <option value="medical">Atestado Médico</option>
              <option value="other">Outro</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Data Início *</label>
              <input v-model="justificationForm.start_date" type="date" required />
            </div>
            <div class="form-group">
              <label>Data Fim *</label>
              <input v-model="justificationForm.end_date" type="date" required />
            </div>
          </div>

          <div class="form-group">
            <label>Motivo *</label>
            <textarea 
              v-model="justificationForm.reason" 
              rows="4"
              placeholder="Descreva o motivo..."
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label>Anexo (PDF, JPG, PNG - Máx 5MB)</label>
            <input @change="handleFileUpload" type="file" accept=".pdf,.jpg,.jpeg,.png" />
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeJustificationModal" class="btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              <i class="pi" :class="submitting ? 'pi-spin pi-spinner' : 'pi-check'"></i>
              <span>{{ submitting ? 'Enviando...' : 'Enviar' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { employeeService } from '@/services/employeeService'
import { useToast } from 'vue-toastification'

const toast = useToast()

const currentTime = ref('')
const currentDate = ref('')
const loadingHistory = ref(false)
const loadingJustifications = ref(false)
const checking = ref(false)
const submitting = ref(false)
const showJustificationModal = ref(false)
const activeTab = ref('history')

const todayAttendance = ref(null)
const canCheckIn = ref(false)
const canCheckOut = ref(false)
const attendances = ref([])
const justifications = ref([])

const filters = reactive({
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear()
})

const justificationForm = reactive({
  type: '',
  reason: '',
  start_date: '',
  end_date: '',
  file: null
})

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const years = computed(() => {
  const currentYear = new Date().getFullYear()
  return [currentYear - 1, currentYear, currentYear + 1]
})

const monthStats = computed(() => {
  const stats = {
    present: 0,
    late: 0,
    absent: 0,
    totalHours: 0
  }

  attendances.value.forEach(att => {
    if (att.status === 'present') stats.present++
    if (att.status === 'late') stats.late++
    if (att.status === 'absent') stats.absent++
    if (att.work_hours) stats.totalHours += parseFloat(att.work_hours)
  })

  stats.totalHours = stats.totalHours.toFixed(1)
  return stats
})

const pendingJustifications = computed(() => {
  return justifications.value.filter(j => j.status === 'pending').length
})

// Methods
const updateCurrentTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('pt-PT', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
  currentDate.value = now.toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

const loadTodayAttendance = async () => {
  try {
    const { data } = await employeeService.attendance.getToday()
    console.log('🔍 Resposta do backend:', data)
    console.log('📋 Attendance:', data.attendance)
    console.log('✅ can_check_in:', data.can_check_in)
    console.log('❌ can_check_out:', data.can_check_out)

    todayAttendance.value = data.attendance
    canCheckIn.value = data.can_check_in
    canCheckOut.value = data.can_check_out
  } catch (error) {
    console.error('Erro ao carregar ponto de hoje:', error)
  }
}

const loadAttendances = async () => {
  loadingHistory.value = true
  try {
    const { data } = await employeeService.attendance.getAll(filters)
    attendances.value = data
  } catch (error) {
    console.error('Erro ao carregar histórico:', error)
    toast.error('Erro ao carregar histórico')
  } finally {
    loadingHistory.value = false
  }
}

const loadJustifications = async () => {
  loadingJustifications.value = true
  try {
    const { data } = await employeeService.attendance.getJustifications()
    justifications.value = data
  } catch (error) {
    console.error('Erro ao carregar justificativas:', error)
  } finally {
    loadingJustifications.value = false
  }
}

const checkIn = async () => {
  checking.value = true
  try {
    const { data } = await employeeService.attendance.checkIn()
    toast.success(data.message)
    await loadTodayAttendance()
    await loadAttendances()
  } catch (error) {
    console.error('Erro ao registrar entrada:', error)
    toast.error(error.response?.data?.message || 'Erro ao registrar entrada')
  } finally {
    checking.value = false
  }
}

const checkOut = async () => {
  checking.value = true
  try {
    const { data } = await employeeService.attendance.checkOut()
    toast.success(data.message)
    await loadTodayAttendance()
    await loadAttendances()
  } catch (error) {
    console.error('Erro ao registrar saída:', error)
    toast.error(error.response?.data?.message || 'Erro ao registrar saída')
  } finally {
    checking.value = false
  }
}

const openJustificationModal = () => {
  justificationForm.type = ''
  justificationForm.reason = ''
  justificationForm.start_date = new Date().toISOString().split('T')[0]
  justificationForm.end_date = new Date().toISOString().split('T')[0]
  justificationForm.file = null
  showJustificationModal.value = true
}

const closeJustificationModal = () => {
  showJustificationModal.value = false
}

const handleFileUpload = (event) => {
  justificationForm.file = event.target.files[0]
}

const submitJustification = async () => {
  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('type', justificationForm.type)
    formData.append('reason', justificationForm.reason)
    formData.append('start_date', justificationForm.start_date)
    formData.append('end_date', justificationForm.end_date)
    if (justificationForm.file) {
      formData.append('file', justificationForm.file)
    }

    const { data } = await employeeService.attendance.requestJustification(formData)
    toast.success(data.message)
    closeJustificationModal()
    await loadJustifications()
  } catch (error) {
    console.error('Erro ao enviar justificativa:', error)
    toast.error(error.response?.data?.message || 'Erro ao enviar justificativa')
  } finally {
    submitting.value = false
  }
}

const getJustificationIcon = (type) => {
  const icons = {
    late: 'pi pi-clock',
    absence: 'pi pi-times-circle',
    early_leave: 'pi pi-sign-out',
    medical: 'pi pi-heart',
    other: 'pi pi-file'
  }
  return icons[type] || 'pi pi-file'
}

const formatDateShort = (dateString) => {
  if (!dateString) return '-'
  
  try {
    // Adicionar o timezone para evitar problemas de fuso horário
    const date = new Date(dateString + 'T00:00:00')
    
    return date.toLocaleDateString('pt-PT', { 
      day: '2-digit',
      month: 'short'
    })
  } catch (error) {
    console.error('Erro ao formatar data:', dateString, error)
    return '-'
  }
}
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

// Lifecycle
let timeInterval = null

onMounted(() => {
  updateCurrentTime()
  timeInterval = setInterval(updateCurrentTime, 1000)
  loadTodayAttendance()
  loadAttendances()
  loadJustifications()
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.attendance-page {
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-title > i {
  font-size: 2.5rem;
  color: #3b82f6;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  padding: 1rem;
  border-radius: 1rem;
}

.header-title h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.subtitle {
  color: #64748b;
  font-size: 0.9375rem;
  margin: 0.25rem 0 0 0;
}

/* Clock Card */
.clock-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  overflow: hidden;
}

.clock-display {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  padding: 2rem;
  color: white;
}

.time-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.current-time {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1;
}

.current-date {
  font-size: 1rem;
  opacity: 0.9;
  text-transform: capitalize;
}

.today-attendance {
  padding: 2rem;
}

.today-attendance h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1.5rem 0;
}

.attendance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.attendance-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  border: 2px solid #e2e8f0;
  transition: all 0.2s;

  i {
    font-size: 1.5rem;
    color: #94a3b8;
  }

  &.filled {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    border-color: #3b82f6;

    i {
      color: #3b82f6;
    }

    .value {
      color: #1e40af;
    }
  }

  &.late {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border-color: #f59e0b;

    i {
      color: #f59e0b;
    }
  }
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  font-size: 0.8125rem;
  color: #64748b;
  font-weight: 500;
}

.value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 200px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  i {
    font-size: 1.25rem;
  }
}

.btn-check-in {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
  }
}

.btn-check-out {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
  }
}

.completed-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-radius: 0.75rem;
  color: #065f46;
  font-weight: 600;

  i {
    font-size: 1.5rem;
  }
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-icon.present {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #059669;
}

.stat-icon.late {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
}

.stat-icon.absent {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #dc2626;
}

.stat-icon.hours {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #2563eb;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
}

/* Tabs */
.tabs-section {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tabs-header {
  display: flex;
  border-bottom: 2px solid #f1f5f9;
  background: #f8fafc;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    background: #f1f5f9;
    color: #3b82f6;
  }

  &.active {
    color: #3b82f6;
    background: white;

    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 2px;
      background: #3b82f6;
    }
  }

  .badge {
    background: #ef4444;
    color: white;
    padding: 0.125rem 0.5rem;
    border-radius: 1rem;
    font-size: 0.75rem;
  }
}

.tab-content {
  padding: 1.5rem;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h3 {
    font-size: 1.125rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }
}

.filters {
  display: flex;
  gap: 0.75rem;

  select {
    padding: 0.5rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.5rem;
    font-size: 0.9375rem;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: #3b82f6;
    }
  }
}

/* Loading & Empty */
.loading-state,
.empty-state {
  padding: 3rem;
  text-align: center;
}

.loading-state i {
  font-size: 2.5rem;
  color: #3b82f6;
  margin-bottom: 1rem;
}

.empty-state i {
  font-size: 3rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #94a3b8;
  margin: 0;
}

/* History Table */
.history-table {
  overflow-x: auto;

  table {
    width: 100%;
    border-collapse: collapse;

    thead {
      background: #f8fafc;

      th {
        padding: 0.75rem 1rem;
        text-align: left;
        font-size: 0.8125rem;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    tbody {
      tr {
        border-top: 1px solid #f1f5f9;
        transition: all 0.2s;

        &:hover {
          background: #f8fafc;
        }

        &.status-late {
          background: rgba(251, 191, 36, 0.05);
        }

        &.status-absent {
          background: rgba(239, 68, 68, 0.05);
        }

        td {
          padding: 1rem;
          font-size: 0.9375rem;
          color: #475569;
        }
      }
    }
  }
}

.date-cell {
  font-weight: 600;
  color: #1e293b;
}

.late-text {
  display: block;
  font-size: 0.75rem;
  color: #f59e0b;
  margin-top: 0.25rem;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.badge-present {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.badge-late {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.badge-absent {
  background: #fee2e2;
  color: #991b1b;
}

/* Justifications */
.justifications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.justification-card {
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  border-left: 4px solid #cbd5e1;
}

.justification-card .status-badge.badge-pending {
  background: #fef3c7;
  color: #92400e;
}

.justification-card .status-badge.badge-approved {
  background: #d1fae5;
  color: #065f46;
}

.justification-card .status-badge.badge-rejected {
  background: #fee2e2;
  color: #991b1b;
}

.just-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.just-type {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  color: #1e293b;

  i {
    color: #3b82f6;
    font-size: 1.125rem;
  }
}

.just-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.just-reason {
  color: #475569;
  line-height: 1.6;
  margin: 0;
}

.just-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;

  i {
    color: #3b82f6;
  }

  a {
    color: #3b82f6;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.just-review {
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  margin-top: 0.5rem;
}

.review-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;

  i {
    font-size: 1.125rem;
  }
}

.review-status i.pi-check {
  color: #10b981;
}

.review-status i.pi-times {
  color: #ef4444;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.btn-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #ef4444;
    color: white;
  }
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;

  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #475569;
    font-size: 0.875rem;
  }

  input,
  select,
  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.5rem;
    font-size: 0.9375rem;
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: #3b82f6;
    }
  }

  textarea {
    resize: vertical;
  }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e2e8f0;
  }
}

@media (max-width: 768px) {
  .current-time {
    font-size: 2rem;
  }

  .attendance-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>