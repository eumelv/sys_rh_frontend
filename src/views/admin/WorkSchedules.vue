<template>
  <div class="work-schedules-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <i class="pi pi-calendar-clock"></i>
          <div>
            <h1>Horários de Trabalho</h1>
            <p class="subtitle">Gerencie turnos e escalas de trabalho da equipe</p>
          </div>
        </div>
        <button @click="openCreateModal" class="btn-primary">
          <i class="pi pi-plus"></i>
          Novo Horário
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon total">
          <i class="pi pi-list"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total de Horários</span>
          <span class="stat-value">{{ schedules.length }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon active">
          <i class="pi pi-check-circle"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Ativos</span>
          <span class="stat-value">{{ activeCount }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon inactive">
          <i class="pi pi-times-circle"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Inativos</span>
          <span class="stat-value">{{ inactiveCount }}</span>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <i class="pi pi-spin pi-spinner"></i>
      <p>Carregando horários...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="schedules.length === 0" class="empty-state">
      <i class="pi pi-calendar-clock"></i>
      <h3>Nenhum horário cadastrado</h3>
      <p>Crie seu primeiro horário de trabalho para a equipe</p>
      <button @click="openCreateModal" class="btn-primary">
        <i class="pi pi-plus"></i>
        Criar Primeiro Horário
      </button>
    </div>

    <!-- Schedules Grid -->
    <div v-else class="schedules-grid">
      <div 
        v-for="schedule in schedules" 
        :key="schedule.id" 
        class="schedule-card"
        :class="{ inactive: !schedule.is_active }"
      >
        <div class="card-header">
          <div class="header-left">
            <div class="schedule-icon">
              <i class="pi pi-clock"></i>
            </div>
            <div class="schedule-info">
              <h3>{{ schedule.name }}</h3>
              <span class="schedule-type">{{ getTypeLabel(schedule.type) }}</span>
            </div>
          </div>
          <div class="status-badge" :class="{ active: schedule.is_active }">
            <span class="status-dot"></span>
            {{ schedule.is_active ? 'Ativo' : 'Inativo' }}
          </div>
        </div>

        <div class="card-body">
          <div class="schedule-time">
            <div class="time-box start">
              <span class="time-label">Entrada</span>
              <span class="time-value">{{ formatTime(schedule.start_time) }}</span>
            </div>
            <div class="time-separator">
              <i class="pi pi-arrow-right"></i>
            </div>
            <div class="time-box end">
              <span class="time-label">Saída</span>
              <span class="time-value">{{ formatTime(schedule.end_time) }}</span>
            </div>
          </div>

          <div class="schedule-details">
            <div class="detail-item">
              <i class="pi pi-calendar"></i>
              <span>{{ formatDays(schedule.days) }}</span>
            </div>
            <div class="detail-item">
              <i class="pi pi-hourglass"></i>
              <span>Tolerância: {{ schedule.late_tolerance }} min</span>
            </div>
          </div>

          <div v-if="schedule.break_duration" class="detail-item break">
            <i class="pi pi-pause"></i>
            <span>Intervalo: {{ schedule.break_duration }} min</span>
          </div>
        </div>

        <div class="card-footer">
          <button @click="toggleStatus(schedule)" class="btn-toggle" :title="schedule.is_active ? 'Desativar' : 'Ativar'">
            <i :class="schedule.is_active ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
          </button>
          <button @click="editSchedule(schedule)" class="btn-edit" title="Editar">
            <i class="pi pi-pencil"></i>
          </button>
          <button @click="handleDelete(schedule)" class="btn-delete" title="Excluir">
            <i class="pi pi-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ editingId ? 'Editar Horário' : 'Novo Horário' }}</h2>
          <button class="btn-close" @click="closeModal">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveSchedule" class="modal-body">
          <div class="form-group">
            <label>Nome do Horário *</label>
            <input 
              v-model="form.name" 
              type="text" 
              placeholder="Ex: Turno Manhã, Horário Comercial..."
              required 
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Tipo de Horário *</label>
              <select v-model="form.type" required>
                <option value="fixed">Fixo</option>
                <option value="flexible">Flexível</option>
                <option value="shift">Turno</option>
              </select>
            </div>

            <div class="form-group">
              <label>Tolerância de Atraso (min) *</label>
              <input 
                v-model.number="form.late_tolerance" 
                type="number" 
                min="0" 
                max="60"
                required 
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Hora de Entrada *</label>
              <input v-model="form.start_time" type="time" required />
            </div>
            <div class="form-group">
              <label>Hora de Saída *</label>
              <input v-model="form.end_time" type="time" required />
            </div>
          </div>

          <div class="form-group">
            <label>Dias da Semana *</label>
            <div class="days-selector">
              <label 
                v-for="(label, key) in dayLabels" 
                :key="key" 
                class="day-checkbox"
                :class="{ selected: form.days.includes(key) }"
              >
                <input type="checkbox" :value="key" v-model="form.days" />
                <span>{{ label }}</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.has_break" />
              <span>Este horário tem intervalo</span>
            </label>
          </div>

          <div v-if="form.has_break" class="form-group">
            <label>Duração do Intervalo (minutos)</label>
            <input 
              v-model.number="form.break_duration" 
              type="number" 
              min="0" 
              placeholder="Ex: 60"
            />
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.is_active" />
              <span>Horário ativo</span>
            </label>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn-secondary" :disabled="saving">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="saving">
              <i class="pi" :class="saving ? 'pi-spin pi-spinner' : 'pi-check'"></i>
              {{ saving ? 'Salvando...' : editingId ? 'Atualizar' : 'Criar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import api from '@/services/api'
import { useToast } from 'vue-toastification'

const toast = useToast()

const schedules = ref([])
const loading = ref(true)
const showModal = ref(false)
const editingId = ref(null)
const saving = ref(false)

const dayLabels = {
  mon: 'Seg',
  tue: 'Ter',
  wed: 'Qua',
  thu: 'Qui',
  fri: 'Sex',
  sat: 'Sáb',
  sun: 'Dom'
}

const form = reactive({
  name: '',
  type: 'fixed',
  days: ['mon', 'tue', 'wed', 'thu', 'fri'],
  start_time: '08:00',
  end_time: '17:00',
  late_tolerance: 10,
  has_break: false,
  break_duration: 60,
  is_active: true
})

// Computed
const activeCount = computed(() => schedules.value.filter(s => s.is_active).length)
const inactiveCount = computed(() => schedules.value.filter(s => !s.is_active).length)

// Methods
const fetchSchedules = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/admin/work-schedules')
    schedules.value = data
  } catch (error) {
    console.error('Erro ao carregar:', error)
    toast.error('Erro ao carregar horários')
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  editingId.value = null
  Object.assign(form, {
    name: '',
    type: 'fixed',
    days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    start_time: '08:00',
    end_time: '17:00',
    late_tolerance: 10,
    has_break: false,
    break_duration: 60,
    is_active: true
  })
  showModal.value = true
}

const editSchedule = (schedule) => {
  editingId.value = schedule.id
  Object.assign(form, {
    ...schedule,
    has_break: !!schedule.break_duration
  })
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingId.value = null
}

const saveSchedule = async () => {
  if (form.days.length === 0) {
    toast.error('Selecione pelo menos um dia da semana')
    return
  }

  saving.value = true
  try {
    const payload = {
      ...form,
      break_duration: form.has_break ? form.break_duration : null
    }

    if (editingId.value) {
      await api.put(`/admin/work-schedules/${editingId.value}`, payload)
      toast.success('Horário atualizado com sucesso!')
    } else {
      await api.post('/admin/work-schedules', payload)
      toast.success('Horário criado com sucesso!')
    }

    await fetchSchedules()
    closeModal()
  } catch (error) {
    console.error('Erro ao salvar:', error)
    toast.error(error.response?.data?.message || 'Erro ao salvar horário')
  } finally {
    saving.value = false
  }
}

const toggleStatus = async (schedule) => {
  try {
    await api.put(`/admin/work-schedules/${schedule.id}`, {
      ...schedule,
      is_active: !schedule.is_active
    })
    toast.success(`Horário ${!schedule.is_active ? 'ativado' : 'desativado'}!`)
    await fetchSchedules()
  } catch (error) {
    toast.error('Erro ao alterar status')
  }
}

const handleDelete = async (schedule) => {
  if (!confirm(`Tem certeza que deseja excluir o horário "${schedule.name}"?`)) return

  try {
    await api.delete(`/admin/work-schedules/${schedule.id}`)
    toast.success('Horário excluído com sucesso!')
    await fetchSchedules()
  } catch (error) {
    console.error('Erro ao excluir:', error)
    toast.error('Erro ao excluir horário')
  }
}

const formatDays = (days) => {
  if (!days || !days.length) return 'Nenhum dia'
  return days.map(d => dayLabels[d] || d).join(', ')
}

const formatTime = (time) => {
  if (!time) return '-'
  return time.substring(0, 5)
}

const getTypeLabel = (type) => {
  const labels = {
    fixed: 'Fixo',
    flexible: 'Flexível',
    shift: 'Turno'
  }
  return labels[type] || type
}

onMounted(fetchSchedules)
</script>

<style scoped>
.work-schedules-page {
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
  gap: 1rem;
  flex-wrap: wrap;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-title > i {
  font-size: 3rem;
  color: #8b5cf6;
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
  padding: 1rem;
  border-radius: 1rem;
}

.header-title h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.subtitle {
  color: #64748b;
  font-size: 1rem;
  margin: 0.25rem 0 0 0;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
}

.stat-icon.total {
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
  color: #7c3aed;
}

.stat-icon.active {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #059669;
}

.stat-icon.inactive {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #dc2626;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
}

/* Loading & Empty */
.loading-state,
.empty-state {
  background: white;
  padding: 4rem 2rem;
  text-align: center;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.loading-state i {
  font-size: 3rem;
  color: #8b5cf6;
  margin-bottom: 1rem;
}

.empty-state i {
  font-size: 4rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: #475569;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #94a3b8;
  margin: 0 0 1.5rem 0;
}

/* Schedules Grid */
.schedules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
}

.schedule-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  border: 2px solid transparent;
}

.schedule-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #8b5cf6;
}

.schedule-card.inactive {
  opacity: 0.7;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.schedule-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7c3aed;
  font-size: 1.5rem;
}

.schedule-info h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.schedule-type {
  font-size: 0.8125rem;
  color: #64748b;
  font-weight: 500;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.875rem;
  border-radius: 1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  background: #fee2e2;
  color: #dc2626;
}

.status-badge.active {
  background: #d1fae5;
  color: #059669;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.card-body {
  margin-bottom: 1rem;
}

.schedule-time {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%);
  border-radius: 0.75rem;
}

.time-box {
  flex: 1;
  text-align: center;
}

.time-label {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.time-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #7c3aed;
}

.time-separator {
  color: #cbd5e1;
  font-size: 1.25rem;
}

.schedule-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  color: #475569;
}

.detail-item i {
  color: #7c3aed;
  font-size: 1.125rem;
}

.detail-item.break {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
}

.detail-item.break i {
  color: #f59e0b;
}

.card-footer {
  display: flex;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 2px solid #f1f5f9;
}

.btn-toggle,
.btn-edit,
.btn-delete {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
  background: #f1f5f9;
  color: #475569;
}

.btn-toggle:hover {
  background: #fef3c7;
  color: #f59e0b;
  transform: scale(1.05);
}

.btn-edit:hover {
  background: #dbeafe;
  color: #3b82f6;
  transform: scale(1.05);
}

.btn-delete:hover {
  background: #fee2e2;
  color: #dc2626;
  transform: scale(1.05);
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
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 1rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.btn-close {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #ef4444;
  color: white;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #475569;
  font-size: 0.9375rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.days-selector {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.day-checkbox {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 0.5rem;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.day-checkbox input[type="checkbox"] {
  display: none;
}

.day-checkbox span {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #64748b;
}

.day-checkbox.selected {
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
  border-color: #8b5cf6;
}

.day-checkbox.selected span {
  color: #7c3aed;
}

.day-checkbox:hover {
  border-color: #8b5cf6;
  transform: translateY(-2px);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  cursor: pointer;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .schedules-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .days-selector {
    grid-template-columns: repeat(4, 1fr);
  }

  .schedule-time {
    flex-direction: column;
  }

  .time-separator {
    transform: rotate(90deg);
  }
}
</style>