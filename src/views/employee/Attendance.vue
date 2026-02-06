<template>
  <div class="employee-attendance-page">
    <div class="page-header">
      <h2>Registo de Ponto</h2>
      <p class="text-muted">{{ currentDate }}</p>
    </div>

    <div class="content-grid">
      <!-- Clock Card -->
      <Card class="clock-card">
        <div class="digital-clock">
          <span class="time">{{ currentTime }}</span>
          <span class="seconds">{{ currentSeconds }}</span>
        </div>

        <div class="attendance-actions">
          <!-- Sem entrada ainda -->
          <div v-if="!todayAttendance || !todayAttendance.check_in" class="action-box">
            <button 
              @click="handleCheckIn" 
              :disabled="loading" 
              class="clock-btn in"
              :class="{ 'loading': loading }"
            >
              <i class="pi pi-sign-in"></i>
              <span>{{ loading ? 'Registando...' : 'Bater Entrada' }}</span>
            </button>
            <p v-if="schedule" class="schedule-info">
              <i class="pi pi-clock"></i>
              Horário: {{ schedule.start_time }} - {{ schedule.end_time }}
            </p>
            <p v-else class="schedule-info warning">
              <i class="pi pi-exclamation-triangle"></i>
              Sem horário de trabalho definido
            </p>
          </div>

          <!-- Com entrada, aguardando saída -->
          <div v-else-if="!todayAttendance.check_out" class="action-box">
            <div class="status-badge" :class="todayAttendance.status">
              <i class="pi" :class="{
                'pi-check-circle': todayAttendance.status === 'present',
                'pi-clock': todayAttendance.status === 'late'
              }"></i>
              {{ todayAttendance.status === 'late' ? 'Entrada com Atraso' : 'Entrada Registada' }}
            </div>

            <div class="info-grid">
              <div class="info-item">
                <span class="label">Entrada</span>
                <span class="value">{{ formatTime(todayAttendance.check_in) }}</span>
              </div>
              <div v-if="todayAttendance.late_minutes > 0" class="info-item">
                <span class="label">Atraso</span>
                <span class="value warning">{{ todayAttendance.late_minutes }} min</span>
              </div>
            </div>

            <button 
              @click="handleCheckOut" 
              :disabled="loading" 
              class="clock-btn out"
              :class="{ 'loading': loading }"
            >
              <i class="pi pi-sign-out"></i>
              <span>{{ loading ? 'Registando...' : 'Bater Saída' }}</span>
            </button>

            <div class="work-timer">
              <i class="pi pi-stopwatch"></i>
              Tempo de trabalho: <strong>{{ workingTime }}</strong>
            </div>
          </div>

          <!-- Jornada completa -->
          <div v-else class="action-box finished">
            <i class="pi pi-check-circle success-icon"></i>
            <h3>Jornada Concluída!</h3>
            
            <div class="summary-grid">
              <div class="summary-item">
                <i class="pi pi-clock"></i>
                <div>
                  <span class="label">Entrada</span>
                  <span class="value">{{ formatTime(todayAttendance.check_in) }}</span>
                </div>
              </div>
              <div class="summary-item">
                <i class="pi pi-sign-out"></i>
                <div>
                  <span class="label">Saída</span>
                  <span class="value">{{ formatTime(todayAttendance.check_out) }}</span>
                </div>
              </div>
              <div class="summary-item highlight">
                <i class="pi pi-calendar-clock"></i>
                <div>
                  <span class="label">Total Horas</span>
                  <span class="value">{{ formatWorkHours(todayAttendance.work_hours) }}</span>
                </div>
              </div>
              <div v-if="todayAttendance.overtime_hours > 0" class="summary-item">
                <i class="pi pi-bolt"></i>
                <div>
                  <span class="label">Horas Extras</span>
                  <span class="value success">{{ formatWorkHours(todayAttendance.overtime_hours) }}</span>
                </div>
              </div>
              <div v-if="todayAttendance.late_minutes > 0" class="summary-item">
                <i class="pi pi-exclamation-triangle"></i>
                <div>
                  <span class="label">Atraso</span>
                  <span class="value warning">{{ todayAttendance.late_minutes }} min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <!-- Sidebar com ações e resumo -->
      <div class="side-column">
        <!-- Resumo Mensal -->
        <Card class="summary-card">
          <h3>
            <i class="pi pi-chart-bar"></i>
            Resumo do Mês
          </h3>
          <div v-if="monthlySummary" class="monthly-stats">
            <div class="stat-item">
              <span class="stat-label">Dias Trabalhados</span>
              <span class="stat-value">{{ monthlySummary.present || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Faltas</span>
              <span class="stat-value">{{ monthlySummary.absent || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Atrasos</span>
              <span class="stat-value">{{ monthlySummary.late || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Total Horas</span>
              <span class="stat-value">{{ formatWorkHours(monthlySummary.total_hours || 0) }}</span>
            </div>
          </div>
        </Card>

        <!-- Ações Rápidas -->
        <Card class="actions-card">
          <h3>
            <i class="pi pi-bolt"></i>
            Acções Rápidas
          </h3>
          <div class="quick-actions">
            <button @click="showJustifyModal = true" class="action-btn">
              <i class="pi pi-file-edit"></i>
              <span>Justificar Falta/Atraso</span>
            </button>
            <button @click="viewHistory" class="action-btn">
              <i class="pi pi-history"></i>
              <span>Ver Histórico</span>
            </button>
            <button @click="fetchData" class="action-btn">
              <i class="pi pi-refresh"></i>
              <span>Actualizar</span>
            </button>
          </div>
        </Card>
      </div>
    </div>

    <!-- Modal de Justificação -->
    <Modal v-if="showJustifyModal" @close="showJustifyModal = false">
      <template #header>
        <h3>
          <i class="pi pi-file-edit"></i>
          Submeter Justificação
        </h3>
      </template>

      <form @submit.prevent="submitJustification" class="justification-form">
        <div class="form-group">
          <label>Tipo de Ausência *</label>
          <select v-model="justification.type" required>
            <option value="medical">Baixa Médica</option>
            <option value="family">Motivos Familiares</option>
            <option value="personal">Assuntos Pessoais</option>
            <option value="other">Outros</option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Data de Início *</label>
            <input type="date" v-model="justification.start_date" required />
          </div>
          <div class="form-group">
            <label>Data de Fim *</label>
            <input type="date" v-model="justification.end_date" required />
          </div>
        </div>

        <div class="form-group">
          <label>Motivo *</label>
          <textarea 
            v-model="justification.reason" 
            rows="4" 
            required
            placeholder="Descreva brevemente o motivo da ausência..."
          ></textarea>
        </div>

        <div class="form-group">
          <label>Anexar Documento <span class="optional">(opcional)</span></label>
          <div class="file-upload">
            <input 
              type="file" 
              id="file-input"
              @change="handleFileUpload" 
              accept=".pdf,.jpg,.jpeg,.png"
              ref="fileInput"
            />
            <label for="file-input" class="file-label">
              <i class="pi pi-cloud-upload"></i>
              <span v-if="!justification.file">Escolher ficheiro</span>
              <span v-else>{{ justification.file.name }}</span>
            </label>
            <small>Formatos aceites: PDF, JPG, PNG (máx. 5MB)</small>
          </div>
        </div>

        <div class="modal-actions">
          <button 
            type="button" 
            @click="closeJustifyModal" 
            class="btn-secondary"
            :disabled="submitting"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            class="btn-primary"
            :disabled="submitting"
          >
            <i class="pi" :class="submitting ? 'pi-spin pi-spinner' : 'pi-send'"></i>
            {{ submitting ? 'Enviando...' : 'Enviar Justificação' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import api from '@/services/api'
import Card from '@/components/common/Card.vue'
import Modal from '@/components/common/Modal.vue'
import { useToast } from 'vue-toastification'
import dayjs from 'dayjs'
import 'dayjs/locale/pt'

dayjs.locale('pt')

const toast = useToast()
const loading = ref(false)
const submitting = ref(false)
const showJustifyModal = ref(false)

const currentTime = ref('')
const currentSeconds = ref('')
const currentDate = ref(dayjs().format('dddd, D [de] MMMM [de] YYYY'))

const todayAttendance = ref(null)
const schedule = ref(null)
const monthlySummary = ref(null)
const fileInput = ref(null)

const justification = ref({
  type: 'medical',
  reason: '',
  start_date: dayjs().format('YYYY-MM-DD'),
  end_date: dayjs().format('YYYY-MM-DD'),
  file: null
})

let timer = null
let workingTimer = null

const workingTime = computed(() => {
  if (!todayAttendance.value?.check_in || todayAttendance.value?.check_out) {
    return '00:00'
  }
  
  const start = dayjs(todayAttendance.value.check_in)
  const now = dayjs()
  const diff = now.diff(start, 'minute')
  const hours = Math.floor(diff / 60)
  const minutes = diff % 60
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
})

const updateClock = () => {
  const now = dayjs()
  currentTime.value = now.format('HH:mm')
  currentSeconds.value = now.format(':ss')
}

const fetchData = async () => {
  await Promise.all([
    fetchTodayData(),
    fetchEmployeeInfo(),
    fetchMonthlySummary()
  ])
}

const fetchTodayData = async () => {
  try {
    const { data } = await api.get('/employee/attendance/today')
    todayAttendance.value = data
  } catch (error) {
    console.error('Erro ao carregar presença de hoje:', error)
  }
}

const fetchEmployeeInfo = async () => {
  try {
    const { data } = await api.get('/employee/profile')
    schedule.value = data.work_schedule
  } catch (error) {
    console.error('Erro ao carregar informações do colaborador:', error)
  }
}

const fetchMonthlySummary = async () => {
  try {
    const { data } = await api.get('/employee/attendance/summary')
    monthlySummary.value = data
  } catch (error) {
    console.error('Erro ao carregar resumo mensal:', error)
  }
}

const handleCheckIn = async () => {
  loading.value = true
  try {
    const { data } = await api.post('/employee/attendance/check-in')
    todayAttendance.value = data
    
    if (data.status === 'late') {
      toast.warning(`Entrada registada com ${data.late_minutes} minutos de atraso`)
    } else {
      toast.success('Entrada registada com sucesso!')
    }
    
    await fetchMonthlySummary()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Erro ao registar entrada')
  } finally {
    loading.value = false
  }
}

const handleCheckOut = async () => {
  loading.value = true
  try {
    const { data } = await api.post('/employee/attendance/check-out')
    todayAttendance.value = data
    
    if (data.overtime_hours > 0) {
      toast.success(`Saída registada! ${formatWorkHours(data.overtime_hours)} de horas extras`)
    } else {
      toast.success('Saída registada com sucesso!')
    }
    
    await fetchMonthlySummary()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Erro ao registar saída')
  } finally {
    loading.value = false
  }
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  
  if (file) {
    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('O ficheiro não pode exceder 5MB')
      event.target.value = ''
      return
    }
    
    justification.value.file = file
  }
}

const submitJustification = async () => {
  submitting.value = true
  const formData = new FormData()
  
  formData.append('type', justification.value.type)
  formData.append('reason', justification.value.reason)
  formData.append('start_date', justification.value.start_date)
  formData.append('end_date', justification.value.end_date)
  
  if (justification.value.file) {
    formData.append('file', justification.value.file)
  }

  try {
    await api.post('/employee/attendance/justify', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    toast.success('Justificação enviada com sucesso! Aguarde aprovação.')
    closeJustifyModal()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Erro ao enviar justificação')
  } finally {
    submitting.value = false
  }
}

const closeJustifyModal = () => {
  showJustifyModal.value = false
  justification.value = {
    type: 'medical',
    reason: '',
    start_date: dayjs().format('YYYY-MM-DD'),
    end_date: dayjs().format('YYYY-MM-DD'),
    file: null
  }
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const viewHistory = () => {
  // Implementar navegação para página de histórico
  toast.info('Funcionalidade em desenvolvimento')
}

const formatTime = (time) => {
  return dayjs(time).format('HH:mm')
}

const formatWorkHours = (hours) => {
  if (!hours) return '0h 00m'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h ${String(m).padStart(2, '0')}m`
}

onMounted(() => {
  updateClock()
  timer = setInterval(updateClock, 1000)
  workingTimer = setInterval(() => {
    // Força reatividade do computed workingTime
    if (todayAttendance.value?.check_in && !todayAttendance.value?.check_out) {
      todayAttendance.value = { ...todayAttendance.value }
    }
  }, 60000) // Atualiza a cada minuto
  
  fetchData()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (workingTimer) clearInterval(workingTimer)
})
</script>

<style scoped>
.employee-attendance-page {
  animation: fadeIn 0.4s ease-out;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.text-muted {
  color: #64748b;
  font-size: 1rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
}

.clock-card {
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.digital-clock {
  font-family: 'Inter', -apple-system, sans-serif;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 3rem;
}

.digital-clock .time {
  font-size: 5rem;
  letter-spacing: -2px;
}

.digital-clock .seconds {
  font-size: 2.5rem;
  color: #94a3b8;
  margin-left: 0.25rem;
}

.attendance-actions {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-box {
  width: 100%;
}

.clock-btn {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  border: none;
  font-size: 1.25rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin: 0 auto 1.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.clock-btn i {
  font-size: 2.5rem;
}

.clock-btn.in {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.clock-btn.out {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.clock-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 25px 30px -5px rgba(0, 0, 0, 0.15);
}

.clock-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.clock-btn.loading {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.schedule-info {
  text-align: center;
  color: #64748b;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.schedule-info.warning {
  color: #f59e0b;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-weight: 600;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.status-badge.present {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.late {
  background: #fef3c7;
  color: #92400e;
}

.info-grid {
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item .label {
  font-size: 0.875rem;
  color: #64748b;
}

.info-item .value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.info-item .value.warning {
  color: #f59e0b;
}

.work-timer {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  color: #475569;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.work-timer strong {
  color: #1e293b;
  font-size: 1.1rem;
}

.finished {
  padding: 2rem;
}

.success-icon {
  font-size: 4rem;
  color: #10b981;
  margin-bottom: 1rem;
}

.finished h3 {
  font-size: 1.5rem;
  color: #1e293b;
  margin-bottom: 2rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
}

.summary-item.highlight {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.summary-item i {
  font-size: 1.5rem;
  color: #64748b;
}

.summary-item .label {
  font-size: 0.75rem;
  color: #64748b;
  display: block;
}

.summary-item .value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  display: block;
}

.summary-item .value.success {
  color: #10b981;
}

.summary-item .value.warning {
  color: #f59e0b;
}

.side-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.summary-card,
.actions-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.summary-card h3,
.actions-card h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1.25rem;
}

.monthly-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-btn {
  padding: 1rem;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 12px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f8fafc;
  border-color: #3b82f6;
  color: #3b82f6;
}

.action-btn i {
  font-size: 1.1rem;
}

/* Modal Styles */
.justification-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #334155;
  font-size: 0.9rem;
}

.form-group .optional {
  font-weight: 400;
  color: #94a3b8;
  font-size: 0.85rem;
}

.form-group select,
.form-group input,
.form-group textarea {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.form-group select:focus,
.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.file-upload {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-upload input[type="file"] {
  display: none;
}

.file-label {
  padding: 1rem;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
}

.file-label:hover {
  border-color: #3b82f6;
  background: #f8fafc;
}

.file-label i {
  font-size: 1.5rem;
}

.file-upload small {
  color: #94a3b8;
  font-size: 0.8rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-secondary,
.btn-primary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .digital-clock .time {
    font-size: 4rem;
  }
  
  .clock-btn {
    width: 200px;
    height: 200px;
  }
}

@media (max-width: 640px) {
  .employee-attendance-page {
    padding: 1rem;
  }
  
  .digital-clock .time {
    font-size: 3rem;
  }
  
  .digital-clock .seconds {
    font-size: 1.5rem;
  }
  
  .clock-btn {
    width: 180px;
    height: 180px;
    font-size: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>