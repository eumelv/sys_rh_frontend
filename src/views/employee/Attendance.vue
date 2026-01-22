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
          <div v-if="!todayAttendance?.check_in" class="action-box">
            <button @click="handleCheckIn" :loading="loading" class="clock-btn in">
              <i class="pi pi-sign-in"></i>
              Bater Entrada
            </button>
            <p v-if="schedule" class="schedule-info">
              Horário: {{ schedule.start_time }} - {{ schedule.end_time }}
            </p>
          </div>

          <div v-else-if="!todayAttendance?.check_out" class="action-box">
            <div class="info-row">
              <span class="label">Entrada registada:</span>
              <span class="value">{{ formatTime(todayAttendance.check_in) }}</span>
            </div>
            <button @click="handleCheckOut" :loading="loading" class="clock-btn out">
              <i class="pi pi-sign-out"></i>
              Bater Saída
            </button>
          </div>

          <div v-else class="action-box finished">
            <i class="pi pi-check-circle success-icon"></i>
            <h3>Jornada Concluída</h3>
            <div class="summary-stats">
              <div class="stat">
                <span class="label">Total Horas:</span>
                <span class="value">{{ todayAttendance.work_hours }}h</span>
              </div>
              <div v-if="todayAttendance.late_minutes > 0" class="stat">
                <span class="label">Atraso:</span>
                <span class="value text-warning">{{ todayAttendance.late_minutes }}m</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <!-- History & Justification -->
      <div class="side-column">
        <Card title="Acções Rápidas">
          <button @click="showJustifyModal = true" class="btn-outline w-full mb-3">
            <i class="pi pi-file-edit"></i>
            Justificar Falta/Atraso
          </button>
          <button class="btn-outline w-full">
            <i class="pi pi-calendar-history"></i>
            Ver Histórico Completo
          </button>
        </Card>
      </div>
    </div>

    <!-- Justification Modal -->
    <Modal v-if="showJustifyModal" title="Submeter Justificação" @close="showJustifyModal = false">
      <form @submit.prevent="submitJustification" class="justification-form">
        <div class="form-group">
          <label>Tipo de Ausência</label>
          <select v-model="justification.type" required>
            <option value="medical">Baixa Médica</option>
            <option value="family">Motivos Familiares</option>
            <option value="personal">Assuntos Pessoais</option>
            <option value="other">Outros</option>
          </select>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>Data de Início</label>
            <input type="date" v-model="justification.start_date" required />
          </div>
          <div class="form-group">
            <label>Data de Fim</label>
            <input type="date" v-model="justification.end_date" required />
          </div>
        </div>
        <div class="form-group">
          <label>Motivo</label>
          <textarea v-model="justification.reason" rows="3" required
            placeholder="Descreva brevemente o motivo..."></textarea>
        </div>
        <div class="form-group">
          <label>Anexo (PDF/Imagem)</label>
          <input type="file" @change="handleFileUpload" accept=".pdf,.jpg,.png" />
        </div>
        <div class="modal-actions">
          <button type="button" @click="showJustifyModal = false" class="btn-secondary">Cancelar</button>
          <button type="submit" :loading="submitting" class="btn-primary">Enviar Justificação</button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import api from '@/services/api'
import Card from '@/components/common/Card.vue'
import Modal from '@/components/common/Modal.vue'
import { useToast } from 'vue-toastification'
import dayjs from 'dayjs'

const toast = useToast()
const loading = ref(false)
const submitting = ref(false)
const showJustifyModal = ref(false)

const currentTime = ref('')
const currentSeconds = ref('')
const currentDate = ref(dayjs().format('dddd, D [de] MMMM [de] YYYY'))

const todayAttendance = ref(null)
const schedule = ref(null)

const justification = ref({
  type: 'medical',
  reason: '',
  start_date: dayjs().format('YYYY-MM-DD'),
  end_date: dayjs().format('YYYY-MM-DD'),
  file: null
})

let timer = null

const updateClock = () => {
  const now = dayjs()
  currentTime.value = now.format('HH:mm')
  currentSeconds.value = now.format(':ss')
}

const fetchTodayData = async () => {
  try {
    const { data } = await api.get('/employee/attendance/today')
    todayAttendance.value = data
  } catch (error) {
    console.error('Error fetching today attendance')
  }
}

const fetchEmployeeInfo = async () => {
  try {
    const { data } = await api.get('/employee/profile')
    schedule.value = data.work_schedule
  } catch (error) {
    console.error('Error fetching employee info')
  }
}

const handleCheckIn = async () => {
  loading.value = true
  try {
    const { data } = await api.post('/employee/attendance/check-in')
    todayAttendance.value = data
    toast.success('Entrada registada com sucesso!')
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
    toast.success('Saída registada com sucesso!')
  } catch (error) {
    toast.error(error.response?.data?.message || 'Erro ao registar saída')
  } finally {
    loading.value = false
  }
}

const handleFileUpload = (event) => {
  justification.value.file = event.target.files[0]
}

const submitJustification = async () => {
  submitting.value = true
  const formData = new FormData()
  Object.keys(justification.value).forEach(key => {
    if (justification.value[key]) formData.append(key, justification.value[key])
  })

  try {
    await api.post('/employee/attendance/justify', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    toast.success('Justificação enviada com sucesso!')
    showJustifyModal.value = false
    // Reset form
  } catch (error) {
    toast.error('Erro ao enviar justificação')
  } finally {
    submitting.value = false
  }
}

const formatTime = (time) => dayjs(time).format('HH:mm')

onMounted(() => {
  updateClock()
  timer = setInterval(updateClock, 1000)
  fetchTodayData()
  fetchEmployeeInfo()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.employee-attendance-page {
  animation: fadeIn 0.4s ease-out;
}

.clock-card {
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 24px;
}

.digital-clock {
  font-family: 'Inter', sans-serif;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 2.5rem;
}

.digital-clock .time {
  font-size: 5rem;
  letter-spacing: -2px;
}

.digital-clock .seconds {
  font-size: 2rem;
  color: #94a3b8;
}

.clock-btn {
  width: 240px;
  height: 240px;
  border-radius: 50%;
  border: 12px solid #f1f5f9;
  font-size: 1.5rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 0 auto;
}

.clock-btn.in {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 20px 25px -5px rgba(16, 185, 129, 0.2);
}

.clock-btn.out {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 20px 25px -5px rgba(239, 68, 68, 0.2);
}

.clock-btn:hover {
  transform: scale(1.05);
}

.finished {
  padding: 2rem;
}

.success-icon {
  font-size: 4rem;
  color: #10b981;
  margin-bottom: 1rem;
}

.summary-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1.5rem;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat .label {
  font-size: 0.875rem;
  color: #64748b;
}

.stat .value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

.side-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.w-full {
  width: 100%;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.btn-outline {
  padding: 1rem;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 12px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-outline:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 2rem;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
