<template>
  <div class="documents-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <i class="pi pi-file"></i>
          <div>
            <h1>Meus Documentos</h1>
            <p class="subtitle">Acesse seus holerites, contratos e declarações</p>
          </div>
        </div>
      </div>
    </div>

    <div class="filters-card">
      <div class="filter-group">
        <label for="docType">Tipo de Documento</label>
        <select 
          id="docType" 
          v-model="filters.type" 
          @change="loadDocuments(1)" 
          class="filter-select"
        >
          <option value="">Todos os documentos</option>
          <option value="holerite">Holerites</option>
          <option value="contrato">Contratos</option>
          <option value="declaracao">Declarações</option>
          <option value="outros">Outros</option>
        </select>
      </div>

      <div class="filter-stats">
        <div class="stat-item">
          <i class="pi pi-file"></i>
          <div>
            <span class="stat-value">{{ pagination.total || 0 }}</span>
            <span class="stat-label">Documentos</span>
          </div>
        </div>
        <div class="stat-item unread" v-if="unreadCount > 0">
          <i class="pi pi-bell"></i>
          <div>
            <span class="stat-value">{{ unreadCount }}</span>
            <span class="stat-label">Não lidos</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <i class="pi pi-spin pi-spinner"></i>
      <p>Carregando documentos...</p>
    </div>

    <div v-else-if="documents.length === 0" class="empty-state">
      <i class="pi pi-inbox"></i>
      <h3>Nenhum documento encontrado</h3>
      <p>{{ filters.type ? 'Não há documentos deste tipo no momento' : 'Você ainda não possui documentos' }}</p>
    </div>

    <div v-else class="documents-grid">
      <div
        v-for="doc in documents"
        :key="doc.id"
        class="document-card"
        :class="{ 'unread': !doc.is_read }"
        @click="viewDocument(doc)"
      >
        <div class="doc-status" v-if="!doc.is_read">
          <span class="status-badge">Novo</span>
        </div>

        <div class="doc-icon" :class="`type-${doc.type}`">
          <i :class="getDocumentIcon(doc.type)"></i>
        </div>

        <div class="doc-content">
          <h3 class="doc-title">{{ doc.title }}</h3>
          <p class="doc-description" v-if="doc.description">{{ doc.description }}</p>
          
          <div class="doc-meta">
            <span class="doc-type-label">
              <i class="pi pi-tag"></i>
              {{ getDocumentTypeLabel(doc.type) }}
            </span>
            <span class="doc-date">
              <i class="pi pi-calendar"></i>
              {{ formatDate(doc.created_at) }}
            </span>
          </div>
        </div>

        <div class="doc-actions">
          <button 
            @click.stop="downloadDocument(doc)" 
            class="action-btn download"
            title="Baixar documento"
          >
            <i class="pi pi-download"></i>
          </button>
        </div>
      </div>
    </div>

    <div v-if="pagination.last_page > 1" class="pagination">
      <button
        @click="changePage(pagination.current_page - 1)"
        :disabled="pagination.current_page === 1"
        class="pagination-btn"
      >
        <i class="pi pi-chevron-left"></i>
        Anterior
      </button>
      
      <div class="pagination-info">
        <span class="current-page">{{ pagination.current_page }}</span>
        <span class="separator">/</span>
        <span class="total-pages">{{ pagination.last_page }}</span>
      </div>
      
      <button
        @click="changePage(pagination.current_page + 1)"
        :disabled="pagination.current_page === pagination.last_page"
        class="pagination-btn"
      >
        Próxima
        <i class="pi pi-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const documents = ref([])
const loading = ref(false)
const filters = ref({
  type: ''
})
const pagination = ref({
  current_page: 1,
  last_page: 1,
  total: 0
})

const unreadCount = computed(() => {
  return documents.value.filter(doc => !doc.is_read).length
})

const loadDocuments = async (page = 1) => {
  loading.value = true
  try {
    const response = await employeeService.documents.getAll({
      ...filters.value,
      page
    })
    
    documents.value = response.data
    pagination.value = {
      current_page: response.current_page,
      last_page: response.last_page,
      total: response.total
    }
  } catch (error) {
    console.error('Erro ao carregar documentos:', error)
    // Opcional: adicionar toast de erro
  } finally {
    loading.value = false
  }
}

const viewDocument = async (doc) => {
  try {
    await employeeService.documents.getById(doc.id)
    doc.is_read = true
  } catch (error) {
    console.error('Erro ao visualizar documento:', error)
  }
}

const downloadDocument = async (doc) => {
  try {
    const response = await employeeService.documents.download(doc.id)
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', doc.file_name)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Erro ao baixar documento:', error)
    alert('Erro ao baixar documento. Tente novamente.')
  }
}

const getDocumentIcon = (type) => {
  const icons = {
    holerite: 'pi pi-money-bill',
    contrato: 'pi pi-file-edit',
    declaracao: 'pi pi-file',
    outros: 'pi pi-paperclip'
  }
  return icons[type] || icons.outros
}

const getDocumentTypeLabel = (type) => {
  const labels = {
    holerite: 'Holerite',
    contrato: 'Contrato',
    declaracao: 'Declaração',
    outros: 'Outros'
  }
  return labels[type] || type
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    loadDocuments(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

onMounted(() => {
  loadDocuments()
})
</script>

<style scoped>
.documents-page {
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
      color: #10b981;
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
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

.filters-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.filter-group {
  flex: 1;
  min-width: 250px;

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

    &:hover {
      border-color: #cbd5e1;
    }

    &:focus {
      outline: none;
      border-color: #10b981;
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
    }
  }
}

.filter-stats {
  display: flex;
  gap: 1rem;

  .stat-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 0.75rem;
    min-width: 140px;

    > i {
      font-size: 2rem;
      color: #64748b;
    }

    .stat-value {
      display: block;
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e293b;
      line-height: 1;
    }

    .stat-label {
      display: block;
      font-size: 0.8125rem;
      color: #64748b;
      font-weight: 500;
      margin-top: 0.25rem;
    }

    &.unread {
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);

      > i {
        color: #ef4444;
      }

      .stat-value {
        color: #ef4444;
      }
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
    display: block;
  }

  h3 {
    font-size: 1.5rem;
    color: #475569;
    margin: 0 0 0.5rem 0;
  }

  p {
    color: #94a3b8;
    font-size: 1rem;
    margin: 0;
  }
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.document-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1.25rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: #10b981;
  }

  &.unread {
    background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: linear-gradient(180deg, #10b981 0%, #059669 100%);
      border-radius: 1rem 0 0 1rem;
    }
  }

  .doc-status {
    position: absolute;
    top: 1rem;
    right: 1rem;

    .status-badge {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 0.375rem 0.875rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
    }
  }

  .doc-icon {
    width: 56px;
    height: 56px;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

    i {
      font-size: 1.75rem;
      color: white;
    }

    &.type-holerite {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    &.type-contrato {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    &.type-declaracao {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    }
  }

  .doc-content {
    flex: 1;
    min-width: 0;

    .doc-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 0.5rem 0;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
    }

    .doc-description {
      font-size: 0.9375rem;
      color: #64748b;
      margin: 0 0 1rem 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.5;
    }

    .doc-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      font-size: 0.875rem;

      span {
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }

      .doc-type-label {
        color: #10b981;
        font-weight: 600;

        i {
          font-size: 0.75rem;
        }
      }

      .doc-date {
        color: #94a3b8;

        i {
          font-size: 0.75rem;
        }
      }
    }
  }

  .doc-actions {
    display: flex;
    align-items: flex-start;

    .action-btn {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 2px solid #e2e8f0;
      border-radius: 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        font-size: 1.125rem;
        color: #475569;
        transition: color 0.2s ease;
      }

      &:hover {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        border-color: #10b981;
        transform: scale(1.05);

        i {
          color: white;
        }
      }
    }
  }
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 2rem 0;

  .pagination-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    color: #475569;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      background: #10b981;
      border-color: #10b981;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  .pagination-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;

    .current-page {
      color: #10b981;
    }

    .separator {
      color: #cbd5e1;
    }

    .total-pages {
      color: #64748b;
    }
  }
}

@media (max-width: 768px) {
  .documents-page {
    padding: 0;
  }

  .filters-card {
    flex-direction: column;
    align-items: stretch;
  }

  .documents-grid {
    grid-template-columns: 1fr;
  }

  .pagination {
    flex-direction: column;
    gap: 1rem;
  }

  .header-content .header-title {
    flex-direction: column;
    text-align: center;
  }
}
</style>
