<template>
  <div class="requests-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <i class="pi pi-send"></i>
          <div>
            <h1>Minhas Solicitações</h1>
            <p class="subtitle">Faça solicitações e acompanhe o status</p>
          </div>
        </div>
        <button class="btn-new-request" @click="showNewRequestModal = true">
          <i class="pi pi-plus"></i>
          Nova Solicitação
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card pending">
        <div class="stat-icon">
          <i class="pi pi-clock"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ getCountByStatus('pendente') }}</span>
          <span class="stat-label">Pendentes</span>
        </div>
      </div>

      <div class="stat-card approved">
        <div class="stat-icon">
          <i class="pi pi-check-circle"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ getCountByStatus('aprovado') }}</span>
          <span class="stat-label">Aprovadas</span>
        </div>
      </div>

      <div class="stat-card rejected">
        <div class="stat-icon">
          <i class="pi pi-times-circle"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ getCountByStatus('rejeitado') }}</span>
          <span class="stat-label">Rejeitadas</span>
        </div>
      </div>

      <div class="stat-card analyzing">
        <div class="stat-icon">
          <i class="pi pi-eye"></i>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ getCountByStatus('em_analise') }}</span>
          <span class="stat-label">Em Análise</span>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-card">
      <div class="filter-group">
        <label for="requestType">Tipo de Solicitação</label>
        <select id="requestType" v-model="filters.type" class="filter-select">
          <option value="">Todos os tipos</option>
          <option value="atestado">Atestado Médico</option>
          <option value="declaracao">Declaração</option>
          <option value="adiantamento">Adiantamento Salarial</option>
          <option value="beneficio">Benefício</option>
          <option value="outros">Outros</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="requestStatus">Status</label>
        <select id="requestStatus" v-model="filters.status" class="filter-select">
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="em_analise">Em Análise</option>
          <option value="aprovado">Aprovado</option>
          <option value="rejeitado">Rejeitado</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <i class="pi pi-spin pi-spinner"></i>
      <p>Carregando solicitações...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredRequests.length === 0" class="empty-state">
      <i class="pi pi-inbox"></i>
      <h3>Nenhuma solicitação encontrada</h3>
      <p>Você ainda não fez nenhuma solicitação</p>
      <button class="btn-primary" @click="showNewRequestModal = true">
        <i class="pi pi-plus"></i>
        Criar primeira solicitação
      </button>
    </div>

    <!-- Requests List -->
    <div v-else class="requests-list">
      <div
        v-for="request in filteredRequests"
        :key="request.id"
        class="request-card"
        :class="`status-${request.status}`"
        @click="viewRequest(request)"
      >
        <div class="request-header">
          <div class="request-type">
            <i :class="getRequestIcon(request.type)"></i>
            <span>{{ getRequestTypeLabel(request.type) }}</span>
          </div>
          <span class="request-status" :class="`badge-${request.status}`">
            {{ getStatusLabel(request.status) }}
          </span>
        </div>

        <h3 class="request-subject">{{ request.subject }}</h3>
        <p class="request-description">{{ request.description }}</p>

        <div class="request-footer">
          <span class="request-date">
            <i class="pi pi-calendar"></i>
            {{ formatDate(request.created_at) }}
          </span>
          <span v-if="request.reviewed_at" class="request-reviewed">
            <i class="pi pi-check"></i>
            Analisado em {{ formatDate(request.reviewed_at) }}
          </span>
        </div>

        <div v-if="request.admin_response" class="request-response">
          <strong>Resposta do RH:</strong>
          <p>{{ request.admin_response }}</p>
        </div>
      </div>
    </div>

    <!-- Modal Nova Solicitação -->
    <div v-if="showNewRequestModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Nova Solicitação</h2>
          <button class="btn-close" @click="closeModal">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <form @submit.prevent="submitRequest" class="modal-body">
          <div class="form-group">
            <label for="type">Tipo de Solicitação *</label>
            <select id="type" v-model="newRequest.type" required class="form-control">
              <option value="">Selecione o tipo</option>
              <option value="atestado">Atestado Médico</option>
              <option value="declaracao">Declaração</option>
              <option value="adiantamento">Adiantamento Salarial</option>
              <option value="beneficio">Benefício</option>
              <option value="outros">Outros</option>
            </select>
          </div>

          <div class="form-group">
            <label for="subject">Assunto *</label>
            <input
              id="subject"
              v-model="newRequest.subject"
              type="text"
              placeholder="Ex: Solicitação de declaração de vínculo"
              required
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="description">Descrição *</label>
            <textarea
              id="description"
              v-model="newRequest.description"
              rows="5"
              placeholder="Descreva sua solicitação em detalhes..."
              required
              class="form-control"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="attachments">Anexos (opcional)</label>
            <input
              id="attachments"
              type="file"
              multiple
              @change="handleFileUpload"
              class="form-control-file"
            />
            <small class="form-text">Máximo 5MB por arquivo. Formatos: PDF, JPG, PNG</small>
          </div>

          <div v-if="selectedFiles.length > 0" class="files-list">
            <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
              <i class="pi pi-file"></i>
              <span>{{ file.name }}</span>
              <button type="button" @click="removeFile(index)" class="btn-remove-file">
                <i class="pi pi-times"></i>
              </button>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="closeModal">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              <i class="pi pi-spin pi-spinner" v-if="submitting"></i>
              <i class="pi pi-check" v-else></i>
              {{ submitting ? 'Enviando...' : 'Enviar Solicitação' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Visualizar Solicitação -->
    <div v-if="selectedRequest" class="modal-overlay" @click="selectedRequest = null">
      <div class="modal-content modal-view" @click.stop>
        <div class="modal-header">
          <h2>Detalhes da Solicitação</h2>
          <button class="btn-close" @click="selectedRequest = null">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="request-detail">
            <div class="detail-row">
              <span class="detail-label">Tipo:</span>
              <span class="detail-value">
                <i :class="getRequestIcon(selectedRequest.type)"></i>
                {{ getRequestTypeLabel(selectedRequest.type) }}
              </span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="request-status" :class="`badge-${selectedRequest.status}`">
                {{ getStatusLabel(selectedRequest.status) }}
              </span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Data:</span>
              <span class="detail-value">{{ formatDate(selectedRequest.created_at) }}</span>
            </div>

            <div class="detail-section">
              <strong>Assunto:</strong>
              <p>{{ selectedRequest.subject }}</p>
            </div>

            <div class="detail-section">
              <strong>Descrição:</strong>
              <p>{{ selectedRequest.description }}</p>
            </div>

            <div v-if="selectedRequest.admin_response" class="detail-section response">
              <strong>Resposta do RH:</strong>
              <p>{{ selectedRequest.admin_response }}</p>
              <small v-if="selectedRequest.reviewed_at">
                Respondido em {{ formatDate(selectedRequest.reviewed_at) }}
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { employeeService } from '@/services/employeeService' // ← ADICIONE ESTA LINHA

const requests = ref([])
const loading = ref(false)
const showNewRequestModal = ref(false)
const selectedRequest = ref(null)
const submitting = ref(false)
const selectedFiles = ref([])

const filters = ref({
  type: '',
  status: ''
})

const newRequest = ref({
  type: '',
  subject: '',
  description: '',
  attachments: []
})

const filteredRequests = computed(() => {
  let filtered = requests.value

  if (filters.value.type) {
    filtered = filtered.filter(r => r.type === filters.value.type)
  }

  if (filters.value.status) {
    filtered = filtered.filter(r => r.status === filters.value.status)
  }

  return filtered
})

const getCountByStatus = (status) => {
  return requests.value.filter(r => r.status === status).length
}



const loadRequests = async () => {
  loading.value = true
  try {
    const response = await employeeService.requests.getAll()
    requests.value = response.data
  } catch (error) {
    console.error('Erro ao carregar solicitações:', error)
    alert('Erro ao carregar solicitações')
  } finally {
    loading.value = false
  }
}

const submitRequest = async () => {
  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('type', newRequest.value.type)
    formData.append('subject', newRequest.value.subject)
    formData.append('description', newRequest.value.description)
    
    // Adicionar arquivos
    selectedFiles.value.forEach((file, index) => {
      formData.append(`attachments[${index}]`, file)
    })

    await employeeService.requests.create(formData)
    alert('Solicitação enviada com sucesso!')
    closeModal()
    loadRequests()
  } catch (error) {
    console.error('Erro ao enviar solicitação:', error)
    const message = error.response?.data?.message || 'Erro ao enviar solicitação'
    alert(message)
  } finally {
    submitting.value = false
  }
}

const viewRequest = async (request) => {
  try {
    const response = await employeeService.requests.getById(request.id)
    selectedRequest.value = response
  } catch (error) {
    console.error('Erro ao visualizar solicitação:', error)
  }
}
const handleFileUpload = (event) => {
  const files = Array.from(event.target.files)
  selectedFiles.value = files
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

const closeModal = () => {
  showNewRequestModal.value = false
  newRequest.value = {
    type: '',
    subject: '',
    description: '',
    attachments: []
  }
  selectedFiles.value = []
}


const getRequestIcon = (type) => {
  const icons = {
    atestado: 'pi pi-heart',
    declaracao: 'pi pi-file',
    adiantamento: 'pi pi-money-bill',
    beneficio: 'pi pi-gift',
    outros: 'pi pi-inbox'
  }
  return icons[type] || icons.outros
}

const getRequestTypeLabel = (type) => {
  const labels = {
    atestado: 'Atestado Médico',
    declaracao: 'Declaração',
    adiantamento: 'Adiantamento Salarial',
    beneficio: 'Benefício',
    outros: 'Outros'
  }
  return labels[type] || type
}

const getStatusLabel = (status) => {
  const labels = {
    pendente: 'Pendente',
    em_analise: 'Em Análise',
    aprovado: 'Aprovado',
    rejeitado: 'Rejeitado'
  }
  return labels[status] || status
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
  loadRequests()
})
</script>

<style scoped>
.requests-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;

  .header-title {
    display: flex;
    align-items: center;
    gap: 1rem;

    > i {
      font-size: 3rem;
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

  .btn-new-request {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.5rem;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    border: none;
    border-radius: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
    }

    i {
      font-size: 1.125rem;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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

  &.pending {
    border-color: #f59e0b;

    .stat-icon {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      i { color: #f59e0b; }
    }
    .stat-value { color: #f59e0b; }
  }

  &.approved {
    border-color: #10b981;

    .stat-icon {
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
      i { color: #10b981; }
    }
    .stat-value { color: #10b981; }
  }

  &.rejected {
    border-color: #ef4444;

    .stat-icon {
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
      i { color: #ef4444; }
    }
    .stat-value { color: #ef4444; }
  }

  &.analyzing {
    border-color: #3b82f6;

    .stat-icon {
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      i { color: #3b82f6; }
    }
    .stat-value { color: #3b82f6; }
  }
}

.filters-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.filter-group {
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
      border-color: #3b82f6;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
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
    margin: 0 0 1.5rem 0;
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.5rem;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    border: none;
    border-radius: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
    }
  }
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.request-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid #e2e8f0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  &.status-pendente {
    border-left-color: #f59e0b;
  }

  &.status-em_analise {
    border-left-color: #3b82f6;
  }

  &.status-aprovado {
    border-left-color: #10b981;
  }

  &.status-rejeitado {
    border-left-color: #ef4444;
  }

  .request-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    .request-type {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #64748b;
      font-weight: 600;
      font-size: 0.9375rem;

      i {
        font-size: 1.125rem;
      }
    }

    .request-status {
      padding: 0.375rem 0.875rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;

      &.badge-pendente {
        background: #fef3c7;
        color: #f59e0b;
      }

      &.badge-em_analise {
        background: #dbeafe;
        color: #3b82f6;
      }

      &.badge-aprovado {
        background: #d1fae5;
        color: #10b981;
      }

      &.badge-rejeitado {
        background: #fee2e2;
        color: #ef4444;
      }
    }
  }

  .request-subject {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 0.75rem 0;
  }

  .request-description {
    color: #64748b;
    line-height: 1.6;
    margin: 0 0 1rem 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .request-footer {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    font-size: 0.875rem;
    color: #94a3b8;

    span {
      display: flex;
      align-items: center;
      gap: 0.375rem;

      i {
        font-size: 0.875rem;
      }
    }

    .request-reviewed {
      color: #10b981;
    }
  }

  .request-response {
    margin-top: 1rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 0.75rem;
    border-left: 3px solid #10b981;

    strong {
      display: block;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }

    p {
      color: #64748b;
      margin: 0;
      font-size: 0.9375rem;
    }
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
}

.modal-content {
  background: white;
  border-radius: 1rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

  &.modal-view {
    max-width: 700px;
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

    &:hover {
      background: #ef4444;
      color: white;
    }
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
  }

  .form-control {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    font-size: 1rem;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    }
  }

  textarea.form-control {
    resize: vertical;
    font-family: inherit;
  }

  .form-control-file {
    padding: 0.5rem;
  }

  .form-text {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #94a3b8;
  }
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;

  .file-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: #f8fafc;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;

    i {
      color: #3b82f6;
    }

    span {
      flex: 1;
      font-size: 0.9375rem;
      color: #475569;
    }

    .btn-remove-file {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: #ef4444;
      cursor: pointer;
      border-radius: 0.25rem;
      transition: background 0.2s ease;

      &:hover {
        background: #fee2e2;
      }
    }
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;

  button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
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

  .btn-primary {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
  }
}

.request-detail {
  .detail-row {
    display: flex;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #f1f5f9;

    .detail-label {
      font-weight: 600;
      color: #64748b;
      min-width: 120px;
    }

    .detail-value {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #1e293b;
    }
  }

  .detail-section {
    padding: 1.5rem 1rem;
    border-bottom: 1px solid #f1f5f9;

    strong {
      display: block;
      color: #475569;
      margin-bottom: 0.75rem;
      font-size: 0.9375rem;
    }

    p {
      color: #1e293b;
      line-height: 1.6;
      margin: 0;
    }

    small {
      display: block;
      margin-top: 0.5rem;
      color: #94a3b8;
      font-size: 0.875rem;
    }

    &.response {
      background: #f0fdf4;
      border-radius: 0.75rem;
      border-left: 3px solid #10b981;
    }
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;

    .btn-new-request {
      width: 100%;
      justify-content: center;
    }
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }
}
</style>