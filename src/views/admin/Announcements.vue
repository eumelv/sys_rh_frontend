<template>
  <div class="announcements-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <i class="pi pi-megaphone"></i>
          <div>
            <h1>Comunicados</h1>
            <p class="subtitle">Crie e gerencie comunicados para os colaboradores</p>
          </div>
        </div>
        <button @click="openCreateModal" class="btn-primary">
          <i class="pi pi-plus"></i>
          Novo Comunicado
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
          <span class="stat-label">Total</span>
          <span class="stat-value">{{ announcements.length }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon published">
          <i class="pi pi-check-circle"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Publicados</span>
          <span class="stat-value">{{ publishedCount }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon draft">
          <i class="pi pi-file"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Rascunhos</span>
          <span class="stat-value">{{ draftCount }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon urgent">
          <i class="pi pi-exclamation-triangle"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Urgentes</span>
          <span class="stat-value">{{ urgentCount }}</span>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-card">
      <div class="filters-row">
        <div class="filter-group">
          <label>Status</label>
          <select v-model="filters.is_published" @change="applyFilters" class="filter-select">
            <option value="">Todos</option>
            <option value="true">Publicados</option>
            <option value="false">Rascunhos</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Prioridade</label>
          <select v-model="filters.priority" @change="applyFilters" class="filter-select">
            <option value="">Todas</option>
            <option value="normal">Normal</option>
            <option value="important">Importante</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>

        <button @click="clearFilters" class="btn-clear">
          <i class="pi pi-filter-slash"></i>
          Limpar
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <i class="pi pi-spin pi-spinner"></i>
      <p>Carregando comunicados...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="announcements.length === 0" class="empty-state">
      <i class="pi pi-megaphone"></i>
      <h3>Nenhum comunicado encontrado</h3>
      <p>Crie seu primeiro comunicado para informar os colaboradores</p>
      <!-- <button @click="openCreateModal" class="btn-primary">
        <i class="pi pi-plus"></i>
        Criar Primeiro Comunicado
      </button> -->
    </div>

    <!-- Announcements List -->
    <div v-else class="announcements-list">
      <div 
        v-for="announcement in announcements" 
        :key="announcement.id"
        class="announcement-card"
        :class="'priority-' + announcement.priority"
      >
        <div class="announcement-header">
          <div class="announcement-meta">
            <span class="priority-badge" :class="'badge-' + announcement.priority">
              <i :class="getPriorityIcon(announcement.priority)"></i>
              {{ getPriorityLabel(announcement.priority) }}
            </span>
            <span v-if="announcement.is_published" class="status-badge published">
              <i class="pi pi-check"></i>
              Publicado
            </span>
            <span v-else class="status-badge draft">
              <i class="pi pi-file"></i>
              Rascunho
            </span>
          </div>

          <div class="announcement-actions">
            <button @click="viewAnnouncement(announcement)" class="btn-icon" title="Ver">
              <i class="pi pi-eye"></i>
            </button>
            <button @click="editAnnouncement(announcement)" class="btn-icon" title="Editar">
              <i class="pi pi-pencil"></i>
            </button>
            <button 
              v-if="!announcement.is_published" 
              @click="publishAnnouncement(announcement)" 
              class="btn-icon btn-success" 
              title="Publicar"
            >
              <i class="pi pi-send"></i>
            </button>
            <button 
              v-else 
              @click="unpublishAnnouncement(announcement)" 
              class="btn-icon btn-warning" 
              title="Despublicar"
            >
              <i class="pi pi-ban"></i>
            </button>
            <button @click="deleteAnnouncement(announcement)" class="btn-icon btn-danger" title="Excluir">
              <i class="pi pi-trash"></i>
            </button>
          </div>
        </div>

        <div class="announcement-body">
          <h3>{{ announcement.title }}</h3>
          <p class="announcement-preview">{{ getPreview(announcement.content) }}</p>
          
          <div class="announcement-target">
            <i class="pi pi-users"></i>
            <span>{{ getTargetLabel(announcement) }}</span>
          </div>
        </div>

        <div class="announcement-footer">
          <div class="announcement-author">
            <div class="author-avatar">
              {{ announcement.creator?.name?.charAt(0) }}
            </div>
            <div class="author-info">
              <span>{{ announcement.creator?.name }}</span>
              <small>{{ formatDate(announcement.created_at) }}</small>
            </div>
          </div>

          <button v-if="announcement.is_published" @click="viewStats(announcement)" class="btn-stats">
            <i class="pi pi-chart-bar"></i>
            Ver Estatísticas
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Create/Edit -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content modal-large" @click.stop>
        <div class="modal-header">
          <h2>{{ editingAnnouncement ? 'Editar Comunicado' : 'Novo Comunicado' }}</h2>
          <button class="btn-close" @click="closeModal">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveAnnouncement" class="modal-body">
          <div class="form-group">
            <label>Título *</label>
            <input 
              v-model="form.title" 
              type="text" 
              placeholder="Título do comunicado..."
              required
              maxlength="255"
            />
          </div>

          <div class="form-group">
            <label>Conteúdo *</label>
            <textarea 
              v-model="form.content" 
              rows="8"
              placeholder="Escreva o conteúdo do comunicado..."
              required
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Prioridade *</label>
              <select v-model="form.priority" required>
                <option value="normal">Normal</option>
                <option value="important">Importante</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div class="form-group">
              <label>Público-Alvo *</label>
              <select v-model="form.target" @change="clearTargetIds" required>
                <option value="all">Todos os Colaboradores</option>
                <option value="department">Departamento Específico</option>
                <option value="position">Cargo Específico</option>
              </select>
            </div>
          </div>

          <div v-if="form.target === 'department'" class="form-group">
            <label>Selecionar Departamentos *</label>
            <div class="checkbox-group">
              <label v-for="dept in departments" :key="dept.id" class="checkbox-label">
                <input 
                  type="checkbox" 
                  :value="dept.id" 
                  v-model="form.target_ids"
                />
                <span>{{ dept.name }}</span>
              </label>
            </div>
          </div>

          <div v-if="form.target === 'position'" class="form-group">
            <label>Selecionar Cargos *</label>
            <div class="checkbox-group">
              <label v-for="pos in positions" :key="pos.id" class="checkbox-label">
                <input 
                  type="checkbox" 
                  :value="pos.id" 
                  v-model="form.target_ids"
                />
                <span>{{ pos.title }}</span>
              </label>
            </div>
          </div>

          <div class="form-group checkbox">
            <label>
              <input type="checkbox" v-model="form.is_published" />
              <span>Publicar Imediatamente</span>
            </label>
            <small>Se desmarcado, será salvo como rascunho</small>
          </div>

          <div class="form-group checkbox">
            <label>
              <input type="checkbox" v-model="form.send_email" />
              <span>Enviar por E-mail</span>
            </label>
            <small>Envia uma notificação por e-mail para os colaboradores selecionados</small>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn-secondary" :disabled="saving">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="saving">
              <i class="pi" :class="saving ? 'pi-spin pi-spinner' : 'pi-check'"></i>
              {{ saving ? 'Salvando...' : editingAnnouncement ? 'Atualizar' : 'Criar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal View -->
    <div v-if="showViewModal && selectedAnnouncement" class="modal-overlay" @click="closeViewModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ selectedAnnouncement.title }}</h2>
          <button class="btn-close" @click="closeViewModal">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="view-meta">
            <span class="priority-badge" :class="'badge-' + selectedAnnouncement.priority">
              <i :class="getPriorityIcon(selectedAnnouncement.priority)"></i>
              {{ getPriorityLabel(selectedAnnouncement.priority) }}
            </span>
            <span v-if="selectedAnnouncement.is_published" class="status-badge published">
              Publicado
            </span>
            <span v-else class="status-badge draft">
              Rascunho
            </span>
          </div>

          <div class="view-content">
            <p>{{ selectedAnnouncement.content }}</p>
          </div>

          <div class="view-details">
            <div class="detail-item">
              <strong>Público-Alvo:</strong>
              <span>{{ getTargetLabel(selectedAnnouncement) }}</span>
            </div>
            <div class="detail-item">
              <strong>Criado por:</strong>
              <span>{{ selectedAnnouncement.creator?.name }}</span>
            </div>
            <div class="detail-item">
              <strong>Data de Criação:</strong>
              <span>{{ formatDate(selectedAnnouncement.created_at) }}</span>
            </div>
            <div v-if="selectedAnnouncement.published_at" class="detail-item">
              <strong>Data de Publicação:</strong>
              <span>{{ formatDate(selectedAnnouncement.published_at) }}</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeViewModal" class="btn-secondary">Fechar</button>
          <button @click="editAnnouncement(selectedAnnouncement)" class="btn-primary">
            <i class="pi pi-pencil"></i>
            Editar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Stats -->
    <div v-if="showStatsModal && statsData" class="modal-overlay" @click="closeStatsModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Estatísticas do Comunicado</h2>
          <button class="btn-close" @click="closeStatsModal">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="stats-overview">
            <div class="stat-item">
              <div class="stat-icon" style="background: #dbeafe; color: #3b82f6;">
                <i class="pi pi-users"></i>
              </div>
              <div class="stat-content">
                <span class="stat-label">Total de Destinatários</span>
                <span class="stat-value">{{ statsData.stats.total_target_users }}</span>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon" style="background: #d1fae5; color: #10b981;">
                <i class="pi pi-eye"></i>
              </div>
              <div class="stat-content">
                <span class="stat-label">Visualizações</span>
                <span class="stat-value">{{ statsData.stats.total_reads }}</span>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon" style="background: #fef3c7; color: #f59e0b;">
                <i class="pi pi-percentage"></i>
              </div>
              <div class="stat-content">
                <span class="stat-label">Taxa de Leitura</span>
                <span class="stat-value">{{ statsData.stats.read_percentage }}%</span>
              </div>
            </div>
          </div>

          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: statsData.stats.read_percentage + '%' }"
            ></div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeStatsModal" class="btn-secondary">Fechar</button>
        </div>
      </div>
    </div>

    <!-- Modal Publish Confirmation -->
    <div v-if="showPublishModal" class="modal-overlay" @click="closePublishModal">
      <div class="modal-content modal-confirm" @click.stop>
        <div class="confirm-icon publish">
          <i class="pi pi-send"></i>
        </div>
        <h3>Publicar Comunicado</h3>
        <p>Tem certeza que deseja publicar o comunicado <strong>"{{ actionAnnouncement?.title }}"</strong>?</p>
        <p class="confirm-subtitle">Este comunicado ficará visível para os colaboradores selecionados.</p>
        <div class="confirm-actions">
          <button @click="closePublishModal" class="btn-secondary">Cancelar</button>
          <button @click="confirmPublish" class="btn-primary" :disabled="actionLoading">
            <i class="pi" :class="actionLoading ? 'pi-spin pi-spinner' : 'pi-check'"></i>
            {{ actionLoading ? 'Publicando...' : 'Publicar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Unpublish Confirmation -->
    <div v-if="showUnpublishModal" class="modal-overlay" @click="closeUnpublishModal">
      <div class="modal-content modal-confirm" @click.stop>
        <div class="confirm-icon unpublish">
          <i class="pi pi-ban"></i>
        </div>
        <h3>Despublicar Comunicado</h3>
        <p>Tem certeza que deseja despublicar o comunicado <strong>"{{ actionAnnouncement?.title }}"</strong>?</p>
        <p class="confirm-subtitle">Este comunicado não ficará mais visível para os colaboradores.</p>
        <div class="confirm-actions">
          <button @click="closeUnpublishModal" class="btn-secondary">Cancelar</button>
          <button @click="confirmUnpublish" class="btn-warning" :disabled="actionLoading">
            <i class="pi" :class="actionLoading ? 'pi-spin pi-spinner' : 'pi-ban'"></i>
            {{ actionLoading ? 'Despublicando...' : 'Despublicar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Delete Confirmation -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content modal-confirm" @click.stop>
        <div class="confirm-icon delete">
          <i class="pi pi-trash"></i>
        </div>
        <h3>Excluir Comunicado</h3>
        <p>Tem certeza que deseja excluir o comunicado <strong>"{{ actionAnnouncement?.title }}"</strong>?</p>
        <p class="confirm-subtitle text-danger">Esta ação não pode ser desfeita.</p>
        <div class="confirm-actions">
          <button @click="closeDeleteModal" class="btn-secondary">Cancelar</button>
          <button @click="confirmDelete" class="btn-danger" :disabled="actionLoading">
            <i class="pi" :class="actionLoading ? 'pi-spin pi-spinner' : 'pi-trash'"></i>
            {{ actionLoading ? 'Excluindo...' : 'Excluir' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { adminService } from '@/services/adminService'
import { useToast } from 'vue-toastification'
import dayjs from 'dayjs'

const toast = useToast()

const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)
const showViewModal = ref(false)
const showStatsModal = ref(false)
const showPublishModal = ref(false)
const showUnpublishModal = ref(false)
const showDeleteModal = ref(false)
const actionAnnouncement = ref(null)
const actionLoading = ref(false)
const editingAnnouncement = ref(null)
const selectedAnnouncement = ref(null)
const statsData = ref(null)

const announcements = ref([])
const departments = ref([])
const positions = ref([])

const filters = reactive({
  is_published: '',
  priority: ''
})

const form = reactive({
  title: '',
  content: '',
  priority: 'normal',
  target: 'all',
  target_ids: [],
  is_published: false,
  send_email: true
})

// Computed
const publishedCount = computed(() => 
  announcements.value.filter(a => a.is_published).length
)

const draftCount = computed(() => 
  announcements.value.filter(a => !a.is_published).length
)

const urgentCount = computed(() => 
  announcements.value.filter(a => a.priority === 'urgent').length
)

// Methods
const fetchAnnouncements = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.is_published !== '') params.is_published = filters.is_published
    if (filters.priority) params.priority = filters.priority

    const { data } = await adminService.announcements.getAll(params)
    announcements.value = data.data || data
  } catch (error) {
    console.error('Erro ao carregar comunicados:', error)
    toast.error('Erro ao carregar comunicados')
  } finally {
    loading.value = false
  }
}

const fetchDepartments = async () => {
  try {
    const { data } = await adminService.departments.getAll()
    departments.value = data.data || data
  } catch (error) {
    console.error('Erro ao carregar departamentos:', error)
  }
}

const fetchPositions = async () => {
  try {
    const { data } = await adminService.positions.getAll()
    positions.value = data.data || data
  } catch (error) {
    console.error('Erro ao carregar cargos:', error)
  }
}

const openCreateModal = () => {
  editingAnnouncement.value = null
  resetForm()
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingAnnouncement.value = null
  resetForm()
}

const editAnnouncement = (announcement) => {
  editingAnnouncement.value = announcement
  
  form.title = announcement.title
  form.content = announcement.content
  form.priority = announcement.priority
  form.target = announcement.target
  form.target_ids = announcement.target_ids || []
  form.is_published = announcement.is_published
  form.send_email = announcement.send_email ?? true
  
  closeViewModal()
  showModal.value = true
}

const saveAnnouncement = async () => {
  // Validar target_ids
  if ((form.target === 'department' || form.target === 'position') && form.target_ids.length === 0) {
    toast.error('Selecione pelo menos um item do público-alvo')
    return
  }

  saving.value = true
  try {
    const payload = {
      title: form.title,
      content: form.content,
      priority: form.priority,
      target: form.target,
      target_ids: form.target === 'all' ? null : form.target_ids,
      is_published: form.is_published,
      send_email: form.send_email
    }

    if (editingAnnouncement.value) {
      const { data } = await adminService.announcements.update(editingAnnouncement.value.id, payload)
      toast.success(data.message || 'Comunicado atualizado!')
    } else {
      const { data } = await adminService.announcements.create(payload)
      toast.success(data.message || 'Comunicado criado!')
    }

    closeModal()
    fetchAnnouncements()
  } catch (error) {
    console.error('Erro ao salvar:', error)
    toast.error(error.response?.data?.message || 'Erro ao salvar comunicado')
  } finally {
    saving.value = false
  }
}

const publishAnnouncement = (announcement) => {
  actionAnnouncement.value = announcement
  showPublishModal.value = true
}

const closePublishModal = () => {
  showPublishModal.value = false
  actionAnnouncement.value = null
}

const confirmPublish = async () => {
  if (!actionAnnouncement.value) return
  actionLoading.value = true
  try {
    const { data } = await adminService.announcements.publish(actionAnnouncement.value.id)
    toast.success(data.message || 'Comunicado publicado!')
    closePublishModal()
    fetchAnnouncements()
  } catch (error) {
    console.error('Erro ao publicar:', error)
    toast.error('Erro ao publicar comunicado')
  } finally {
    actionLoading.value = false
  }
}

const unpublishAnnouncement = (announcement) => {
  actionAnnouncement.value = announcement
  showUnpublishModal.value = true
}

const closeUnpublishModal = () => {
  showUnpublishModal.value = false
  actionAnnouncement.value = null
}

const confirmUnpublish = async () => {
  if (!actionAnnouncement.value) return
  actionLoading.value = true
  try {
    const { data } = await adminService.announcements.unpublish(actionAnnouncement.value.id)
    toast.success(data.message || 'Comunicado despublicado')
    closeUnpublishModal()
    fetchAnnouncements()
  } catch (error) {
    console.error('Erro ao despublicar:', error)
    toast.error('Erro ao despublicar comunicado')
  } finally {
    actionLoading.value = false
  }
}

const deleteAnnouncement = (announcement) => {
  actionAnnouncement.value = announcement
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  actionAnnouncement.value = null
}

const confirmDelete = async () => {
  if (!actionAnnouncement.value) return
  actionLoading.value = true
  try {
    const { data } = await adminService.announcements.delete(actionAnnouncement.value.id)
    toast.success(data.message || 'Comunicado excluído!')
    closeDeleteModal()
    fetchAnnouncements()
  } catch (error) {
    console.error('Erro ao excluir:', error)
    toast.error('Erro ao excluir comunicado')
  } finally {
    actionLoading.value = false
  }
}

const viewAnnouncement = (announcement) => {
  selectedAnnouncement.value = announcement
  showViewModal.value = true
}

const closeViewModal = () => {
  showViewModal.value = false
  selectedAnnouncement.value = null
}

const viewStats = async (announcement) => {
  try {
    const { data } = await adminService.announcements.getById(announcement.id)
    statsData.value = data
    showStatsModal.value = true
  } catch (error) {
    console.error('Erro ao carregar stats:', error)
    toast.error('Erro ao carregar estatísticas')
  }
}

const closeStatsModal = () => {
  showStatsModal.value = false
  statsData.value = null
}

const clearTargetIds = () => {
  form.target_ids = []
}

const resetForm = () => {
  form.title = ''
  form.content = ''
  form.priority = 'normal'
  form.target = 'all'
  form.target_ids = []
  form.is_published = false
  form.send_email = true
}

const applyFilters = () => {
  fetchAnnouncements()
}

const clearFilters = () => {
  filters.is_published = ''
  filters.priority = ''
  fetchAnnouncements()
}

const getPreview = (content) => {
  if (!content) return ''
  return content.length > 150 ? content.substring(0, 150) + '...' : content
}

const getTargetLabel = (announcement) => {
  if (announcement.target === 'all') return 'Todos os Colaboradores'
  if (announcement.target === 'department') {
    const count = announcement.target_ids?.length || 0
    return `${count} Departamento${count !== 1 ? 's' : ''}`
  }
  if (announcement.target === 'position') {
    const count = announcement.target_ids?.length || 0
    return `${count} Cargo${count !== 1 ? 's' : ''}`
  }
  return '-'
}

const getPriorityLabel = (priority) => {
  const labels = {
    normal: 'Normal',
    important: 'Importante',
    urgent: 'Urgente'
  }
  return labels[priority] || priority
}

const getPriorityIcon = (priority) => {
  const icons = {
    normal: 'pi pi-info-circle',
    important: 'pi pi-exclamation-circle',
    urgent: 'pi pi-exclamation-triangle'
  }
  return icons[priority] || 'pi pi-info-circle'
}

const formatDate = (date) => {
  return date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-'
}

onMounted(() => {
  fetchAnnouncements()
  fetchDepartments()
  fetchPositions()
})
</script>

<style scoped>
.announcements-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
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
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1rem;

  > i {
    font-size: 2rem;
    color: #3b82f6;
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
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

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Stats Grid */
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
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #2563eb;
}

.stat-icon.published {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #059669;
}

.stat-icon.draft {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
}

.stat-icon.urgent {
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

/* Filters */
.filters-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.filters-row {
  display: flex;
  gap: 1rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;

  label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #475569;
  }
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 0.95rem;
  transition: all 0.2s;
  background: white;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-clear {
  padding: 0.75rem 1.5rem;
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-clear:hover {
  background: #e2e8f0;
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
  color: #3b82f6;
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

/* Announcements List */
.announcements-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.announcement-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #cbd5e1;
  transition: all 0.2s;
}

.announcement-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.announcement-card.priority-urgent {
  border-left-color: #ef4444;
}

.announcement-card.priority-important {
  border-left-color: #f59e0b;
}

.announcement-card.priority-normal {
  border-left-color: #3b82f6;
}

.announcement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.announcement-meta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.priority-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.875rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.priority-badge.badge-normal {
  background: #dbeafe;
  color: #1e40af;
}

.priority-badge.badge-important {
  background: #fef3c7;
  color: #92400e;
}

.priority-badge.badge-urgent {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.875rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.status-badge.published {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.draft {
  background: #f3f4f6;
  color: #4b5563;
}

.announcement-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
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
  color: #475569;
}

.btn-icon:hover {
  background: #e2e8f0;
  transform: scale(1.05);
}

.btn-icon.btn-success:hover {
  background: #d1fae5;
  color: #059669;
}

.btn-icon.btn-warning:hover {
  background: #fef3c7;
  color: #d97706;
}

.btn-icon.btn-danger:hover {
  background: #fee2e2;
  color: #dc2626;
}

.announcement-body {
  margin-bottom: 1rem;
}

.announcement-body h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.75rem 0;
}

.announcement-preview {
  color: #475569;
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.announcement-target {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.875rem;

  i {
    font-size: 1rem;
  }
}

.announcement-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.announcement-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;

  span {
    font-size: 0.95rem;
    font-weight: 600;
    color: #1e293b;
  }

  small {
    font-size: 0.8rem;
    color: #64748b;
  }
}

.btn-stats {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-stats:hover {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
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

.modal-content.modal-large {
  max-width: 800px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
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
    font-size: 0.9375rem;
  }

  input,
  select,
  textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    font-size: 1rem;
    font-family: inherit;
    transition: all 0.2s;
  }

  input:focus,
  select:focus,
  textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  }

  textarea {
    resize: vertical;
    line-height: 1.6;
  }

  small {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #64748b;
  }
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    cursor: pointer;

    input[type="checkbox"] {
      width: auto;
      margin: 0;
    }
  }
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  max-height: 200px;
  overflow-y: auto;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: white;
    border-radius: 0.5rem;
  }

  input[type="checkbox"] {
    width: auto;
    margin: 0;
  }

  span {
    font-size: 0.9375rem;
    color: #1e293b;
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;

  button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .btn-secondary {
    background: #f1f5f9;
    color: #475569;

    &:hover:not(:disabled) {
      background: #e2e8f0;
    }
  }
}

/* View Modal */
.view-meta {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.view-content {
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;

  p {
    line-height: 1.8;
    color: #1e293b;
    margin: 0;
    white-space: pre-wrap;
  }
}

.view-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }

  strong {
    color: #64748b;
    font-size: 0.875rem;
  }

  span {
    color: #1e293b;
    font-weight: 500;
  }
}

/* Stats Modal */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.75rem;

  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }

  .stat-content {
    display: flex;
    flex-direction: column;

    .stat-label {
      font-size: 0.8rem;
    }

    .stat-value {
      font-size: 1.5rem;
    }
  }
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: #f1f5f9;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #10b981 100%);
  transition: width 0.5s ease;
}

/* Confirmation Modals */
.modal-confirm {
  max-width: 420px;
  text-align: center;
  padding: 2rem;
}

.confirm-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2rem;
}

.confirm-icon.publish {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #2563eb;
}

.confirm-icon.unpublish {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
}

.confirm-icon.delete {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #dc2626;
}

.modal-confirm h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1rem 0;
}

.modal-confirm p {
  color: #475569;
  margin: 0 0 0.5rem 0;
  line-height: 1.6;
}

.modal-confirm p strong {
  color: #1e293b;
}

.confirm-subtitle {
  font-size: 0.875rem;
  color: #64748b !important;
  margin-bottom: 1.5rem !important;
}

.confirm-subtitle.text-danger {
  color: #dc2626 !important;
}

.confirm-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
}

.confirm-actions .btn-secondary,
.confirm-actions .btn-primary,
.confirm-actions .btn-warning,
.confirm-actions .btn-danger {
  min-width: 120px;
  justify-content: center;
}

.btn-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.btn-warning:hover {
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.btn-danger:hover {
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

@media (max-width: 768px) {
  .announcements-page {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .filters-row {
    flex-direction: column;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .checkbox-group {
    grid-template-columns: 1fr;
  }

  .announcement-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .announcement-footer {
    flex-direction: column;
    gap: 1rem;
  }

  .btn-stats {
    width: 100%;
    justify-content: center;
  }
}
</style>