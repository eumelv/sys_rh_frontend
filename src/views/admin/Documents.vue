<template>
  <div class="documents-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <i class="pi pi-file"></i>
          <div>
            <h1>Documentos</h1>
            <p class="subtitle">Gerencie documentos e categorias</p>
          </div>
        </div>
        <div class="header-actions">
          <button @click="showCategoryModal = true" class="btn-secondary">
            <i class="pi pi-tag"></i>
            Categorias
          </button>
          <button @click="openUploadModal" class="btn-primary">
            <i class="pi pi-upload"></i>
            Enviar Documento
          </button>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon total">
          <i class="pi pi-file"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total de Documentos</span>
          <span class="stat-value">{{ documents.length }}</span>
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
        <div class="stat-icon categories">
          <i class="pi pi-tag"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Categorias</span>
          <span class="stat-value">{{ categories.length }}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon size">
          <i class="pi pi-database"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Espaço Usado</span>
          <span class="stat-value">{{ totalSize }}</span>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-card">
      <div class="filters-row">
        <div class="filter-group">
          <label>Categoria</label>
          <select v-model="filters.category_id" @change="applyFilters" class="filter-select">
            <option value="">Todas as Categorias</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Status</label>
          <select v-model="filters.is_active" @change="applyFilters" class="filter-select">
            <option value="">Todos</option>
            <option value="true">Ativos</option>
            <option value="false">Inativos</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Buscar</label>
          <div class="search-input">
            <i class="pi pi-search"></i>
            <input 
              v-model="filters.search" 
              @input="debouncedFetch"
              type="text" 
              placeholder="Buscar documentos..."
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <i class="pi pi-spin pi-spinner"></i>
      <p>Carregando documentos...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="documents.length === 0" class="empty-state">
      <i class="pi pi-file"></i>
      <h3>Nenhum documento encontrado</h3>
      <p>Comece enviando documentos para os colaboradores</p>
      <button @click="openUploadModal" class="btn-primary">
        <i class="pi pi-upload"></i>
        Enviar Primeiro Documento
      </button>
    </div>

    <!-- Documents Grid -->
    <div v-else class="documents-grid">
      <div 
        v-for="doc in documents" 
        :key="doc.id"
        class="document-card"
        @click="viewDocument(doc)"
      >
        <div class="document-icon">
          <i :class="getFileIcon(doc.file_type)"></i>
        </div>

        <div class="document-info">
          <h4>{{ doc.title }}</h4>
          <p v-if="doc.description">{{ getPreview(doc.description) }}</p>
          
          <div class="document-meta">
            <span class="category-badge">
              <i class="pi pi-tag"></i>
              {{ doc.category?.name }}
            </span>
            <span class="size-badge">
              <i class="pi pi-file"></i>
              {{ doc.file_size_formatted }}
            </span>
          </div>

          <div class="document-access">
            <i class="pi pi-users"></i>
            <span>{{ getAccessLabel(doc) }}</span>
          </div>
        </div>

        <div class="document-actions" @click.stop>
          <button @click="editDocument(doc)" class="btn-icon" title="Editar">
            <i class="pi pi-pencil"></i>
          </button>
          <button @click="downloadDocument(doc)" class="btn-icon" title="Download">
            <i class="pi pi-download"></i>
          </button>
          <button @click="deleteDocument(doc)" class="btn-icon btn-danger" title="Excluir">
            <i class="pi pi-trash"></i>
          </button>
        </div>

        <div v-if="!doc.is_active" class="inactive-overlay">
          <span>Inativo</span>
        </div>
      </div>
    </div>

    <!-- Modal Upload -->
    <div v-if="showUploadModal" class="modal-overlay" @click="closeUploadModal">
      <div class="modal-content modal-large" @click.stop>
        <div class="modal-header">
          <h2>{{ editingDocument ? 'Editar Documento' : 'Enviar Documento' }}</h2>
          <button class="btn-close" @click="closeUploadModal">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <form @submit.prevent="saveDocument" class="modal-body">
          <div v-if="!editingDocument" class="form-group">
            <label>Arquivo *</label>
            <div class="file-input-wrapper">
              <input 
                ref="fileInput"
                type="file" 
                @change="handleFileChange"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                required
              />
              <div v-if="selectedFile" class="selected-file">
                <i :class="getFileIcon(selectedFile.name.split('.').pop())"></i>
                <span>{{ selectedFile.name }}</span>
                <button type="button" @click="clearFile" class="btn-remove">
                  <i class="pi pi-times"></i>
                </button>
              </div>
            </div>
            <small>Formatos aceitos: PDF, Word, Excel, PowerPoint, Imagens (Max: 10MB)</small>
          </div>

          <div class="form-group">
            <label>Título *</label>
            <input 
              v-model="form.title" 
              type="text" 
              placeholder="Nome do documento..."
              required
              maxlength="255"
            />
          </div>

          <div class="form-group">
            <label>Categoria *</label>
            <select v-model="form.category_id" required>
              <option value="">Selecione uma categoria</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Descrição</label>
            <textarea 
              v-model="form.description" 
              rows="3"
              placeholder="Descrição opcional do documento..."
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Nível de Acesso *</label>
              <select v-model="form.access_level" @change="clearAccessIds" required>
                <option value="all">Todos os Colaboradores</option>
                <option value="department">Departamentos Específicos</option>
                <option value="position">Cargos Específicos</option>
                <option value="specific">Colaboradores Específicos</option>
              </select>
            </div>

            <div class="form-group">
              <label>Status</label>
              <select v-model="form.is_active">
                <option :value="true">Ativo</option>
                <option :value="false">Inativo</option>
              </select>
            </div>
          </div>

          <div v-if="form.access_level === 'department'" class="form-group">
            <label>Selecionar Departamentos *</label>
            <div class="checkbox-group">
              <label v-for="dept in departments" :key="dept.id" class="checkbox-label">
                <input type="checkbox" :value="dept.id" v-model="form.access_ids" />
                <span>{{ dept.name }}</span>
              </label>
            </div>
          </div>

          <div v-if="form.access_level === 'position'" class="form-group">
            <label>Selecionar Cargos *</label>
            <div class="checkbox-group">
              <label v-for="pos in positions" :key="pos.id" class="checkbox-label">
                <input type="checkbox" :value="pos.id" v-model="form.access_ids" />
                <span>{{ pos.title }}</span>
              </label>
            </div>
          </div>

          <div v-if="form.access_level === 'specific'" class="form-group">
            <label>Selecionar Colaboradores *</label>
            <div class="checkbox-group">
              <label v-for="emp in employees" :key="emp.id" class="checkbox-label">
                <input type="checkbox" :value="emp.user_id" v-model="form.access_ids" />
                <span>{{ emp.user?.name }} - {{ emp.department?.name }}</span>
              </label>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeUploadModal" class="btn-secondary" :disabled="uploading">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="uploading">
              <i class="pi" :class="uploading ? 'pi-spin pi-spinner' : 'pi-upload'"></i>
              {{ uploading ? 'Enviando...' : editingDocument ? 'Atualizar' : 'Enviar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Categories -->
    <div v-if="showCategoryModal" class="modal-overlay" @click="showCategoryModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Gerenciar Categorias</h2>
          <button class="btn-close" @click="showCategoryModal = false">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="modal-body">
       <form @submit.prevent="saveCategory" class="category-form">
  <div class="form-group">
    <label>{{ editingCategory ? 'Editar Categoria' : 'Nova Categoria' }}</label>
    <div class="category-inputs">
      <input 
        v-model="categoryForm.name" 
        type="text" 
        placeholder="Nome da categoria..."
        required
        class="category-name-input"
      />
      <input 
        v-model="categoryForm.description" 
        type="text" 
        placeholder="Descrição (opcional)..."
        class="category-desc-input"
      />
      <div class="category-buttons">
        <button type="submit" class="btn-add" :disabled="savingCategory">
          <i class="pi" :class="savingCategory ? 'pi-spin pi-spinner' : editingCategory ? 'pi-check' : 'pi-plus'"></i>
        </button>
        <button 
          v-if="editingCategory" 
          type="button" 
          @click="cancelEditCategory" 
          class="btn-cancel"
        >
          <i class="pi pi-times"></i>
        </button>
      </div>
    </div>
  </div>
</form>

          <div class="categories-list">
            <div v-if="categories.length === 0" class="empty-categories">
              <p>Nenhuma categoria cadastrada</p>
            </div>
            <div 
              v-else
              v-for="cat in categories" 
              :key="cat.id"
              class="category-item"
            >
              <div class="category-info">
                <i class="pi pi-tag"></i>
                <span>{{ cat.name }}</span>
                <span class="category-count">({{ cat.documents_count || 0 }})</span>
              </div>
              <div class="category-actions">
                <button @click="editCategory(cat)" class="btn-icon">
                  <i class="pi pi-pencil"></i>
                </button>
                <button @click="deleteCategory(cat)" class="btn-icon btn-danger">
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal View -->
    <div v-if="showViewModal && selectedDocument" class="modal-overlay" @click="closeViewModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ selectedDocument.title }}</h2>
          <button class="btn-close" @click="closeViewModal">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="doc-preview">
            <div class="doc-icon-large">
              <i :class="getFileIcon(selectedDocument.file_type)"></i>
            </div>
            <h3>{{ selectedDocument.file_name }}</h3>
            <p class="file-size">{{ selectedDocument.file_size_formatted }}</p>
          </div>

          <div v-if="selectedDocument.description" class="doc-description">
            <label>Descrição</label>
            <p>{{ selectedDocument.description }}</p>
          </div>

          <div class="doc-details">
            <div class="detail-item">
              <strong>Categoria:</strong>
              <span>{{ selectedDocument.category?.name }}</span>
            </div>
            <div class="detail-item">
              <strong>Público-Alvo:</strong>
              <span>{{ getAccessLabel(selectedDocument) }}</span>
            </div>
            <div class="detail-item">
              <strong>Status:</strong>
              <span :class="selectedDocument.is_active ? 'text-success' : 'text-muted'">
                {{ selectedDocument.is_active ? 'Ativo' : 'Inativo' }}
              </span>
            </div>
            <div class="detail-item">
              <strong>Enviado por:</strong>
              <span>{{ selectedDocument.uploader?.name }}</span>
            </div>
            <div class="detail-item">
              <strong>Data de Upload:</strong>
              <span>{{ formatDate(selectedDocument.created_at) }}</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeViewModal" class="btn-secondary">Fechar</button>
          <button @click="downloadDocument(selectedDocument)" class="btn-primary">
            <i class="pi pi-download"></i>
            Download
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
const uploading = ref(false)
const savingCategory = ref(false)
const showUploadModal = ref(false)
const showCategoryModal = ref(false)
const showViewModal = ref(false)
const editingDocument = ref(null)
const editingCategory = ref(null)
const selectedDocument = ref(null)
const selectedFile = ref(null)
const fileInput = ref(null)

const documents = ref([])
const categories = ref([])
const departments = ref([])
const positions = ref([])
const employees = ref([])

const filters = reactive({
  category_id: '',
  is_active: '',
  search: ''
})

const form = reactive({
  title: '',
  description: '',
  category_id: '',
  access_level: 'all',
  access_ids: [],
  is_active: true
})

const categoryForm = reactive({
  name: '',
  description: ''
})

// Computed
const activeCount = computed(() => 
  documents.value.filter(d => d.is_active).length
)

const totalSize = computed(() => {
  const bytes = documents.value.reduce((sum, d) => sum + (d.file_size || 0), 0)
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB'
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB'
  if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return bytes + ' bytes'
})

// Debounce search
let searchTimeout
const debouncedFetch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchDocuments()
  }, 500)
}

// Methods
const fetchDocuments = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.category_id) params.category_id = filters.category_id
    if (filters.is_active !== '') params.is_active = filters.is_active
    if (filters.search) params.search = filters.search

    const { data } = await adminService.documents.getAll(params)
    documents.value = data.data || data
  } catch (error) {
    console.error('Erro ao carregar documentos:', error)
    toast.error('Erro ao carregar documentos')
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const { data } = await adminService.documents.getCategories()
    categories.value = data
  } catch (error) {
    console.error('Erro ao carregar categorias:', error)
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

const fetchEmployees = async () => {
  try {
    const { data } = await adminService.employees.getAll()
    employees.value = data.data || data
  } catch (error) {
    console.error('Erro ao carregar colaboradores:', error)
  }
}

const openUploadModal = () => {
  editingDocument.value = null
  resetForm()
  showUploadModal.value = true
}

const closeUploadModal = () => {
  showUploadModal.value = false
  editingDocument.value = null
  selectedFile.value = null
  resetForm()
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 10 * 1024 * 1024) {
    toast.error('Arquivo muito grande. Máximo: 10MB')
    event.target.value = ''
    return
  }

  selectedFile.value = file
}

const clearFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const saveDocument = async () => {
  if (!editingDocument.value && !selectedFile.value) {
    toast.error('Selecione um arquivo')
    return
  }

  if ((form.access_level !== 'all') && form.access_ids.length === 0) {
    toast.error('Selecione pelo menos um item de acesso')
    return
  }

  uploading.value = true
  try {
    if (editingDocument.value) {
      // Update
      const { data } = await adminService.documents.update(editingDocument.value.id, form)
      toast.success(data.message || 'Documento atualizado!')
    } else {
      // Create
      const formData = new FormData()
      formData.append('file', selectedFile.value)
      formData.append('title', form.title)
      formData.append('category_id', form.category_id)
      formData.append('access_level', form.access_level)
      formData.append('is_active', form.is_active ? '1' : '0')
      
      if (form.description) {
        formData.append('description', form.description)
      }
      
      if (form.access_level !== 'all' && form.access_ids.length > 0) {
        form.access_ids.forEach((id, index) => {
          formData.append(`access_ids[${index}]`, id)
        })
      }

      const { data } = await adminService.documents.create(formData)
      toast.success(data.message || 'Documento enviado!')
    }

    closeUploadModal()
    fetchDocuments()
  } catch (error) {
    console.error('Erro ao salvar:', error)
    toast.error(error.response?.data?.message || 'Erro ao salvar documento')
  } finally {
    uploading.value = false
  }
}

const editDocument = (doc) => {
  editingDocument.value = doc
  
  form.title = doc.title
  form.description = doc.description || ''
  form.category_id = doc.category_id
  form.access_level = doc.access_level
  form.access_ids = doc.access_ids || []
  form.is_active = doc.is_active
  
  showUploadModal.value = true
}

const deleteDocument = async (doc) => {
  if (!confirm(`Tem certeza que deseja excluir "${doc.title}"?`)) return

  try {
    const { data } = await adminService.documents.delete(doc.id)
    toast.success(data.message || 'Documento excluído!')
    fetchDocuments()
  } catch (error) {
    console.error('Erro ao excluir:', error)
    toast.error('Erro ao excluir documento')
  }
}

const downloadDocument = (doc) => {
  window.open(doc.file_url, '_blank')
}

const viewDocument = (doc) => {
  selectedDocument.value = doc
  showViewModal.value = true
}

const closeViewModal = () => {
  showViewModal.value = false
  selectedDocument.value = null
}

const saveCategory = async () => {
  
  if (!categoryForm.name.trim()) {
    toast.error('Informe o nome da categoria')
    return
  }

  savingCategory.value = true
  try {
    if (editingCategory.value) {
      const { data } = await adminService.documents.updateCategory(editingCategory.value.id, categoryForm)
      toast.success(data.message || 'Categoria atualizada!')
    } else {
      const { data } = await adminService.documents.createCategory(categoryForm)
      toast.success(data.message || 'Categoria criada!')
    }

    categoryForm.name = ''
    categoryForm.description = ''
    editingCategory.value = null
    fetchCategories()
  } catch (error) {
    console.error('Erro ao salvar categoria:', error)
    toast.error('Erro ao salvar categoria')
  } finally {
    savingCategory.value = false
  }
}

const editCategory = (cat) => {
  editingCategory.value = cat
  categoryForm.name = cat.name
  categoryForm.description = cat.description || ''
}

const cancelEditCategory = () => {
  editingCategory.value = null
  categoryForm.name = ''
  categoryForm.description = ''
}

const deleteCategory = async (cat) => {
  if (cat.documents_count > 0) {
    toast.error('Não é possível excluir categoria com documentos')
    return
  }

  if (!confirm(`Excluir categoria "${cat.name}"?`)) return

  try {
    const { data } = await adminService.documents.deleteCategory(cat.id)
    toast.success(data.message || 'Categoria excluída!')
    fetchCategories()
  } catch (error) {
    console.error('Erro ao excluir:', error)
    toast.error(error.response?.data?.message || 'Erro ao excluir categoria')
  }
}

const clearAccessIds = () => {
  form.access_ids = []
}

const resetForm = () => {
  form.title = ''
  form.description = ''
  form.category_id = ''
  form.access_level = 'all'
  form.access_ids = []
  form.is_active = true
}

const applyFilters = () => {
  fetchDocuments()
}

const getPreview = (text) => {
  if (!text) return ''
  return text.length > 100 ? text.substring(0, 100) + '...' : text
}

const getAccessLabel = (doc) => {
  if (doc.access_level === 'all') return 'Todos os Colaboradores'
  if (doc.access_level === 'department') {
    const count = doc.access_ids?.length || 0
    return `${count} Departamento${count !== 1 ? 's' : ''}`
  }
  if (doc.access_level === 'position') {
    const count = doc.access_ids?.length || 0
    return `${count} Cargo${count !== 1 ? 's' : ''}`
  }
  if (doc.access_level === 'specific') {
    const count = doc.access_ids?.length || 0
    return `${count} Colaborador${count !== 1 ? 'es' : ''}`
  }
  return '-'
}

const getFileIcon = (fileType) => {
  const icons = {
    pdf: 'pi pi-file-pdf',
    doc: 'pi pi-file-word',
    docx: 'pi pi-file-word',
    xls: 'pi pi-file-excel',
    xlsx: 'pi pi-file-excel',
    ppt: 'pi pi-file',
    pptx: 'pi pi-file',
    jpg: 'pi pi-image',
    jpeg: 'pi pi-image',
    png: 'pi pi-image',
    gif: 'pi pi-image'
  }
  return icons[fileType?.toLowerCase()] || 'pi pi-file'
}

const formatDate = (date) => {
  return date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-'
}

onMounted(() => {
  fetchDocuments()
  fetchCategories()
  fetchDepartments()
  fetchPositions()
  fetchEmployees()
})
</script>

<style scoped>
.documents-page {
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

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: white;
  color: #475569;
  border: 2px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
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

.stat-icon.active {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #059669;
}

.stat-icon.categories {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
}

.stat-icon.size {
  background: linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%);
  color: #9333ea;
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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

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

.search-input {
  position: relative;

  i {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
  }

  input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.75rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    font-size: 0.95rem;
    transition: all 0.2s;
  }

  input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
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

/* Documents Grid */
.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.document-card {
  position: relative;
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.document-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.document-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #3b82f6;
  margin-bottom: 0.5rem;
}

.document-info {
  flex: 1;
}

.document-info h4 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.document-info p {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 0.75rem 0;
  line-height: 1.5;
}

.document-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.category-badge,
.size-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
}

.category-badge {
  background: #fef3c7;
  color: #92400e;
}

.size-badge {
  background: #f1f5f9;
  color: #475569;
}

.document-access {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.875rem;

  i {
    font-size: 1rem;
  }
}

.document-actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
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

.btn-icon.btn-danger:hover {
  background: #fee2e2;
  color: #dc2626;
}

.inactive-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.125rem;
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

.file-input-wrapper {
  position: relative;

  input[type="file"] {
    width: 100%;
  }
}

.selected-file {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  margin-top: 0.75rem;

  i {
    font-size: 1.5rem;
    color: #3b82f6;
  }

  span {
    flex: 1;
    font-size: 0.95rem;
    color: #1e293b;
  }
}

.btn-remove {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #dc2626;
    color: white;
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
}

/* Category Modal */
.category-form {
  margin-bottom: 1.5rem;
}

.input-group {
  display: flex;
  gap: 0.5rem;

  input {
    flex: 1;
  }
}

.btn-add,
.btn-cancel {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add {
  background: #3b82f6;
  color: white;

  &:hover:not(:disabled) {
    background: #2563eb;
  }
}

.btn-cancel {
  background: #f1f5f9;
  color: #475569;

  &:hover {
    background: #ef4444;
    color: white;
  }
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.empty-categories {
  padding: 2rem;
  text-align: center;
  color: #94a3b8;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
  }
}

.category-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;

  i {
    font-size: 1.25rem;
    color: #f59e0b;
  }

  span {
    font-weight: 600;
    color: #1e293b;
  }
}
.category-form {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #f1f5f9;
}

.category-form .form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #1e293b;
  font-size: 0.95rem;
}

.category-inputs {
  display: grid;
  grid-template-columns: 1fr 1.5fr auto;
  gap: 0.75rem;
  align-items: center;
}

.category-name-input,
.category-desc-input {
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 1rem;
  transition: all 0.2s;
}

.category-name-input:focus,
.category-desc-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.category-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-add,
.btn-cancel {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add {
  background: #3b82f6;
  color: white;
}

.btn-add:hover:not(:disabled) {
  background: #2563eb;
  transform: scale(1.05);
}

.btn-add:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background: #f1f5f9;
  color: #475569;
}

.btn-cancel:hover {
  background: #ef4444;
  color: white;
}
.category-count {
  color: #64748b !important;
  font-weight: 400 !important;
  font-size: 0.875rem !important;
}

.category-actions {
  display: flex;
  gap: 0.5rem;
}

/* View Modal */
.doc-preview {
  text-align: center;
  padding: 2rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
}

.doc-icon-large {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: #3b82f6;
}

.doc-preview h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.file-size {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
}

.doc-description {
  margin-bottom: 1.5rem;

  label {
    display: block;
    font-weight: 600;
    color: #475569;
    margin-bottom: 0.5rem;
  }

  p {
    background: #f8fafc;
    padding: 1rem;
    border-radius: 0.75rem;
    line-height: 1.6;
    margin: 0;
  }
}

.doc-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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

.text-success {
  color: #059669 !important;
}

.text-muted {
  color: #94a3b8 !important;
}

@media (max-width: 768px) {
  .documents-page {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    width: 100%;

    button {
      flex: 1;
    }
  }

  .documents-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .checkbox-group {
    grid-template-columns: 1fr;
  }
}
</style>