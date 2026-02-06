<template>
  <div class="announcements-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <i class="pi pi-megaphone"></i>
          <div>
            <h1>Comunicados</h1>
            <p class="subtitle">Fique por dentro das novidades da empresa</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card total">
        <div class="stat-icon">
          <i class="pi pi-inbox"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ announcements.length }}</span>
          <span class="stat-label">Total</span>
        </div>
      </div>

      <div class="stat-card unread">
        <div class="stat-icon">
          <i class="pi pi-bell"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ unreadCount }}</span>
          <span class="stat-label">Não Lidos</span>
        </div>
      </div>

      <div class="stat-card urgent">
        <div class="stat-icon">
          <i class="pi pi-exclamation-triangle"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ urgentCount }}</span>
          <span class="stat-label">Urgentes</span>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-card">
      <div class="filter-group">
        <label for="priority">Prioridade</label>
        <select id="priority" v-model="filters.priority" class="filter-select">
          <option value="">Todas as prioridades</option>
          <option value="urgente">Urgente</option>
          <option value="alta">Alta</option>
          <option value="media">Média</option>
          <option value="baixa">Baixa</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="readStatus">Status de Leitura</label>
        <select id="readStatus" v-model="filters.read" class="filter-select">
          <option value="">Todos</option>
          <option value="unread">Não Lidos</option>
          <option value="read">Lidos</option>
        </select>
      </div>

      <div class="filter-actions">
        <button 
          v-if="unreadCount > 0" 
          @click="markAllAsRead" 
          class="btn-mark-all"
        >
          <i class="pi pi-check-circle"></i>
          Marcar Todos como Lidos
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <i class="pi pi-spin pi-spinner"></i>
      <p>Carregando comunicados...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredAnnouncements.length === 0" class="empty-state">
      <i class="pi pi-inbox"></i>
      <h3>Nenhum comunicado encontrado</h3>
      <p>Não há comunicados disponíveis no momento</p>
    </div>

    <!-- Announcements List -->
    <div v-else class="announcements-list">
      <div
        v-for="announcement in filteredAnnouncements"
        :key="announcement.id"
        class="announcement-card"
        :class="[
          `priority-${announcement.priority}`,
          { 'unread': !announcement.is_read }
        ]"
        @click="viewAnnouncement(announcement)"
      >
        <div class="announcement-indicator" v-if="!announcement.is_read">
          <span class="unread-dot"></span>
        </div>

        <div class="announcement-icon" :class="`priority-${announcement.priority}`">
          <i :class="getPriorityIcon(announcement.priority)"></i>
        </div>

        <div class="announcement-content">
          <div class="announcement-header">
            <div class="announcement-meta">
              <span class="announcement-priority" :class="`badge-${announcement.priority}`">
                {{ getPriorityLabel(announcement.priority) }}
              </span>
              <span class="announcement-date">
                <i class="pi pi-calendar"></i>
                {{ formatDate(announcement.created_at) }}
              </span>
            </div>
          </div>

          <h3 class="announcement-title">{{ announcement.title }}</h3>
          <p class="announcement-preview">{{ announcement.content }}</p>

          <div class="announcement-footer">
            <span class="announcement-author">
              <i class="pi pi-user"></i>
              {{ announcement.author }}
            </span>
            <span v-if="announcement.valid_until" class="announcement-validity">
              <i class="pi pi-clock"></i>
              Válido até {{ formatDate(announcement.valid_until) }}
            </span>
          </div>
        </div>

        <div class="announcement-arrow">
          <i class="pi pi-chevron-right"></i>
        </div>
      </div>
    </div>

    <!-- Modal Visualizar Comunicado -->
    <div v-if="selectedAnnouncement" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-title-section">
            <span class="announcement-priority" :class="`badge-${selectedAnnouncement.priority}`">
              {{ getPriorityLabel(selectedAnnouncement.priority) }}
            </span>
            <h2>{{ selectedAnnouncement.title }}</h2>
          </div>
          <button class="btn-close" @click="closeModal">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="announcement-detail">
            <div class="detail-meta">
              <div class="meta-item">
                <i class="pi pi-user"></i>
                <span>Publicado por: <strong>{{ selectedAnnouncement.author }}</strong></span>
              </div>
              <div class="meta-item">
                <i class="pi pi-calendar"></i>
                <span>{{ formatDate(selectedAnnouncement.created_at) }}</span>
              </div>
              <div v-if="selectedAnnouncement.valid_until" class="meta-item">
                <i class="pi pi-clock"></i>
                <span>Válido até: {{ formatDate(selectedAnnouncement.valid_until) }}</span>
              </div>
            </div>

            <div class="detail-content">
              <p>{{ selectedAnnouncement.content }}</p>
            </div>

            <div v-if="selectedAnnouncement.attachments && selectedAnnouncement.attachments.length > 0" class="detail-attachments">
              <h4>Anexos</h4>
              <div class="attachments-list">
                
                  v-for="(attachment, index) in selectedAnnouncement.attachments"
                  :key="index"
                  href="#"
                  class="attachment-item"
                  @click.prevent="downloadAttachment(attachment)"
                <a>
                  <i class="pi pi-file"></i>
                  <span>{{ attachment.name }}</span>
                  <i class="pi pi-download"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-primary" @click="closeModal">
            <i class="pi pi-check"></i>
            Entendido
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { employeeService } from '@/services/employeeService' // ← ADICIONE ESTA LINHA

const announcements = ref([])
const loading = ref(false)
const selectedAnnouncement = ref(null)

const filters = ref({
  priority: '',
  read: ''
})

const unreadCount = computed(() => {
  return announcements.value.filter(a => !a.is_read).length
})

const urgentCount = computed(() => {
  return announcements.value.filter(a => a.priority === 'urgente').length
})

const filteredAnnouncements = computed(() => {
  let filtered = announcements.value

  if (filters.value.priority) {
    filtered = filtered.filter(a => a.priority === filters.value.priority)
  }

  if (filters.value.read === 'read') {
    filtered = filtered.filter(a => a.is_read)
  } else if (filters.value.read === 'unread') {
    filtered = filtered.filter(a => !a.is_read)
  }

  return filtered
})

const loadAnnouncements = async () => {
  loading.value = true
  try {
    const response = await employeeService.announcements.getAll({
      priority: filters.value.priority
    })
    
    announcements.value = response.data.map(announcement => ({
      ...announcement,
      author: announcement.creator?.name || 'Sistema'
    }))
  } catch (error) {
    console.error('Erro ao carregar comunicados:', error)
    alert('Erro ao carregar comunicados')
  } finally {
    loading.value = false
  }
}

const viewAnnouncement = async (announcement) => {
  selectedAnnouncement.value = announcement
  
  // Marcar como lido
  if (!announcement.is_read) {
    try {
      await employeeService.announcements.markAsRead(announcement.id)
      announcement.is_read = true
      // Atualizar contador
      loadUnreadCount()
    } catch (error) {
      console.error('Erro ao marcar como lido:', error)
    }
  }
}

const loadUnreadCount = async () => {
  try {
    const response = await employeeService.announcements.getUnreadCount()
    // Atualizar o contador no componente
  } catch (error) {
    console.error('Erro ao carregar contador:', error)
  }
}


const closeModal = () => {
  selectedAnnouncement.value = null
}

const markAllAsRead = async () => {
  try {
    const unreadAnnouncements = announcements.value.filter(a => !a.is_read)
    
    await Promise.all(
      unreadAnnouncements.map(a => 
        employeeService.announcements.markAsRead(a.id)
      )
    )
    
    announcements.value.forEach(a => {
      a.is_read = true
    })
    
    alert('Todos os comunicados foram marcados como lidos!')
  } catch (error) {
    console.error('Erro ao marcar todos como lidos:', error)
    alert('Erro ao marcar comunicados como lidos')
  }
}
const downloadAttachment = (attachment) => {
  console.log('Baixando anexo:', attachment.name)
  alert(`Download iniciado: ${attachment.name}`)
}

const getPriorityIcon = (priority) => {
  const icons = {
    urgente: 'pi pi-exclamation-circle',
    alta: 'pi pi-exclamation-triangle',
    media: 'pi pi-info-circle',
    baixa: 'pi pi-minus-circle'
  }
  return icons[priority] || icons.media
}

const getPriorityLabel = (priority) => {
  const labels = {
    urgente: 'Urgente',
    alta: 'Alta',
    media: 'Média',
    baixa: 'Baixa'
  }
  return labels[priority] || priority
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadAnnouncements()
})
</script>

<style scoped>
.announcements-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  .header-title {
    display: flex;
    align-items: center;
    gap: 1rem;

    > i {
      font-size: 3rem;
      color: #8b5cf6;
      background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
      padding: 1rem;
      border-radius: 1rem;
    }

    h1 {
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
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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
  gap: 1.25rem;
  border-left: 4px solid;

  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;

    i {
      font-size: 1.75rem;
      color: white;
    }
  }

  .stat-content {
    display: flex;
    flex-direction: column;

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #64748b;
      margin-top: 0.25rem;
    }
  }

  &.total {
    border-color: #8b5cf6;

    .stat-icon {
      background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
      i { color: #8b5cf6; }
    }
    .stat-value { color: #8b5cf6; }
  }

  &.unread {
    border-color: #3b82f6;

    .stat-icon {
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      i { color: #3b82f6; }
    }
    .stat-value { color: #3b82f6; }
  }

  &.urgent {
    border-color: #ef4444;

    .stat-icon {
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
      i { color: #ef4444; }
    }
    .stat-value { color: #ef4444; }
  }
}

.filters-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-group {
  flex: 1;
  min-width: 200px;

  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #475569;
    font-size: 0.9375rem;
  }

  .filter-select {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    font-size: 1rem;
    color: #1e293b;
    background: white;
    cursor: pointer;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: #8b5cf6;
      box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
    }
  }
}

.filter-actions {
  .btn-mark-all {
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
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
    }
  }
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 5rem 2rem;
  background: white;
  border-radius: 1rem;

  i {
    font-size: 4rem;
    color: #cbd5e1;
    margin-bottom: 1.5rem;
  }

  h3 {
    font-size: 1.5rem;
    color: #475569;
    margin: 0 0 0.5rem 0;
  }

  p {
    color: #94a3b8;
    margin: 0;
  }
}

.announcements-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.announcement-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid #e2e8f0;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  &.unread {
    background: linear-gradient(135deg, #ffffff 0%, #faf5ff 100%);
    border-left-color: #8b5cf6;

    &::before {
      content: '';
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      width: 10px;
      height: 10px;
      background: #3b82f6;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
  }

  &.priority-urgente {
    border-left-color: #ef4444;
  }

  &.priority-alta {
    border-left-color: #f59e0b;
  }

  &.priority-media {
    border-left-color: #3b82f6;
  }

  &.priority-baixa {
    border-left-color: #64748b;
  }

  .announcement-indicator {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
  }

  .announcement-icon {
    width: 56px;
    height: 56px;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    i {
      font-size: 1.75rem;
      color: white;
    }

    &.priority-urgente {
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
      i { color: #ef4444; }
    }

    &.priority-alta {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      i { color: #f59e0b; }
    }

    &.priority-media {
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      i { color: #3b82f6; }
    }

    &.priority-baixa {
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      i { color: #64748b; }
    }
  }

  .announcement-content {
    flex: 1;
    min-width: 0;

    .announcement-header {
      margin-bottom: 0.75rem;

      .announcement-meta {
        display: flex;
        gap: 1rem;
        align-items: center;
        flex-wrap: wrap;

        .announcement-priority {
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;

          &.badge-urgente {
            background: #fee2e2;
            color: #ef4444;
          }

          &.badge-alta {
            background: #fef3c7;
            color: #f59e0b;
          }

          &.badge-media {
            background: #dbeafe;
            color: #3b82f6;
          }

          &.badge-baixa {
            background: #f1f5f9;
            color: #64748b;
          }
        }

        .announcement-date {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.875rem;
          color: #94a3b8;

          i {
            font-size: 0.875rem;
          }
        }
      }
    }

    .announcement-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 0.75rem 0;
    }

    .announcement-preview {
      color: #64748b;
      line-height: 1.6;
      margin: 0 0 1rem 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .announcement-footer {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
      font-size: 0.875rem;

      span {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        color: #94a3b8;

        i {
          font-size: 0.875rem;
        }
      }

      .announcement-validity {
        color: #f59e0b;
        font-weight: 500;
      }
    }
  }

  .announcement-arrow {
    display: flex;
    align-items: center;

    i {
      font-size: 1.25rem;
      color: #cbd5e1;
      transition: transform 0.2s ease;
    }
  }

  &:hover .announcement-arrow i {
    transform: translateX(4px);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
  max-width: 800px;
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
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;

  .modal-title-section {
    flex: 1;

    .announcement-priority {
      display: inline-block;
      margin-bottom: 0.75rem;
    }

    h2 {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
      line-height: 1.3;
    }
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
    transition: all 0.2s ease;
    flex-shrink: 0;
    margin-left: 1rem;

    &:hover {
      background: #ef4444;
      color: white;
    }
  }
}

.modal-body {
  padding: 1.5rem;
}

.announcement-detail {
  .detail-meta {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 0.75rem;
    margin-bottom: 1.5rem;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #64748b;
      font-size: 0.9375rem;

      i {
        font-size: 1.125rem;
        color: #8b5cf6;
      }

      strong {
        color: #1e293b;
      }
    }
  }

  .detail-content {
    margin-bottom: 1.5rem;

    p {
      color: #475569;
      line-height: 1.8;
      font-size: 1rem;
      margin: 0;
      white-space: pre-wrap;
    }
  }

  .detail-attachments {
    h4 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 1rem 0;
    }

    .attachments-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .attachment-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem;
        background: #f8fafc;
        border: 2px solid #e2e8f0;
        border-radius: 0.75rem;
        text-decoration: none;
        transition: all 0.2s ease;

        i:first-child {
          color: #8b5cf6;
          font-size: 1.25rem;
        }

        span {
          flex: 1;
          color: #475569;
          font-weight: 500;
        }

        i:last-child {
          color: #94a3b8;
          font-size: 1.125rem;
        }

        &:hover {
          background: white;
          border-color: #8b5cf6;
          transform: translateX(4px);

          i:last-child {
            color: #8b5cf6;
          }
        }
      }
    }
  }
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;

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
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
    }
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filters-card {
    flex-direction: column;
    align-items: stretch;
  }

  .announcement-card {
    flex-direction: column;

    .announcement-arrow {
      display: none;
    }
  }

  .modal-content {
    margin: 0.5rem;
    max-height: calc(100vh - 1rem);
  }

  .modal-header .modal-title-section h2 {
    font-size: 1.25rem;
  }
}
</style>
