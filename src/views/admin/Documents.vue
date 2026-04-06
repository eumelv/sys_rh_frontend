<template>
  <div class="documents-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title">
          <i class="pi pi-file"></i>
          <div>
            <h1>Centro de Documentação</h1>
            <p class="subtitle">Gestão centralizada de arquivos, contratos e conformidade</p>
          </div>
        </div>
        <div class="header-actions">
           <div class="pending-badge" v-if="stats.pending > 0" title="Documentos aguardando revisão">
            <i class="pi pi-info-circle"></i>
            {{ stats.pending }} Pendentes
          </div>
          <button @click="showTypeModal = true" class="btn-secondary">
            <i class="pi pi-tag"></i>
            Tipos
          </button>
          <button @click="openUploadModal" class="btn-primary">
            <i class="pi pi-upload"></i>
            Novo Documento
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Analytics -->
    <div class="stats-grid">
      <div class="stat-card" @click="filterByStatus('')">
        <div class="stat-icon total">
          <i class="pi pi-file"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total de Arquivos</span>
          <span class="stat-value">{{ stats.total }}</span>
        </div>
      </div>

      <div class="stat-card" @click="filterByStatus('active')">
        <div class="stat-icon active">
          <i class="pi pi-check-circle"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Documentos Ativos</span>
          <span class="stat-value">{{ stats.active }}</span>
        </div>
      </div>

      <div class="stat-card warning" @click="filterByStatus('expiring_soon')">
        <div class="stat-icon expiring">
          <i class="pi pi-clock"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Vencimento Próximo</span>
          <span class="stat-value">{{ stats.expiring_soon }}</span>
        </div>
      </div>

      <div class="stat-card danger" @click="filterByStatus('expired')">
        <div class="stat-icon expired">
          <i class="pi pi-exclamation-triangle"></i>
        </div>
        <div class="stat-info">
          <span class="stat-label">Documentos Expirados</span>
          <span class="stat-value">{{ stats.expired }}</span>
        </div>
      </div>
    </div>

    <div class="main-layout">
      <!-- Sidebar Filters (Professional File Explorer feel) -->
      <aside class="doc-sidebar">
        <div class="sidebar-section">
          <h3>Categorias</h3>
          <ul class="category-list">
            <li :class="{ active: !filters.category_id }" @click="selectCategory('')">
              <i class="pi pi-folder"></i> Todos os Documentos
            </li>
            <li v-for="cat in categories" :key="cat.id" 
                :class="{ active: filters.category_id === cat.id }"
                @click="selectCategory(cat.id)">
              <i class="pi pi-folder-open"></i> {{ cat.name }}
            </li>
          </ul>
        </div>

        <div class="sidebar-section">
          <h3>Filtros Rápidos</h3>
          <div class="quick-filters">
            <div class="q-filter" :class="{ active: filters.status === 'pending' }" @click="filterByStatus('pending')">
               <i class="pi pi-clock"></i> Pendentes de Revisão
            </div>
             <div class="q-filter" :class="{ active: filters.visibility === 'private' }" @click="toggleVisibilityFilter('private')">
               <i class="pi pi-lock"></i> Acesso Restrito
            </div>
          </div>
        </div>
      </aside>

      <!-- Content Area -->
      <main class="doc-content">
        <div class="content-header">
           <div class="search-box">
             <i class="pi pi-search"></i>
             <input v-model="filters.search" @input="debouncedFetch" placeholder="Pesquisar por nome, funcionário ou tipo..." />
           </div>
        </div>

        <div v-if="loading" class="loading-area">
          <Loading />
        </div>

        <div v-else-if="documents.length === 0" class="empty-area">
          <i class="pi pi-file-o"></i>
          <h3>Nenhum arquivo encontrado</h3>
          <p>Tente ajustar os filtros ou pesquisar por outro termo.</p>
        </div>

        <div v-else class="documents-grid">
          <div v-for="doc in documents" :key="doc.id" class="doc-item-card" :class="{ 'is-pending': doc.status === 'pending' }">
             <div class="doc-item-header">
                <div class="doc-type-icon">
                  <i :class="getFileIcon(doc.file_type)"></i>
                </div>
                <div class="doc-status">
                   <span :class="statusBadgeClass(doc.status)">{{ getStatusLabel(doc.status) }}</span>
                </div>
             </div>
             
             <div class="doc-item-body">
                <h4 :title="doc.title">{{ truncate(doc.title, 40) }}</h4>
                <div class="doc-metadata">
                   <span class="meta-tag">{{ doc.type?.name || 'Geral' }}</span>
                   <span class="meta-size">{{ doc.file_size_formatted }}</span>
                </div>
                <p v-if="doc.employee" class="doc-owner">
                  <i class="pi pi-user"></i> {{ doc.employee.full_name }}
                </p>
                <div v-if="doc.expiration_date" class="doc-timer" :class="expiryClass(doc)">
                   <i class="pi pi-calendar"></i> {{ formatDate(doc.expiration_date) }}
                </div>
             </div>

             <div class="doc-item-footer">
                <div class="visibility-info">
                   <i :class="getVisibilityIcon(doc.visibility)"></i>
                   <small>{{ getVisibilityLabel(doc.visibility) }}</small>
                </div>
                <div class="item-actions">
                   <button @click="viewDocument(doc)" class="btn-icon" title="Ver Detalhes"><i class="pi pi-eye"></i></button>
                   <button @click="downloadDocument(doc)" class="btn-icon primary" title="Download"><i class="pi pi-download"></i></button>
                   <button @click="editDocument(doc)" class="btn-icon" title="Editar"><i class="pi pi-pencil"></i></button>
                   <button @click="deleteDocument(doc)" class="btn-icon danger" title="Eliminar"><i class="pi pi-trash"></i></button>
                </div>
             </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination-bar" v-if="pagination.last_page > 1">
           <button :disabled="pagination.current_page === 1" @click="changePage(pagination.current_page - 1)">Ant</button>
           <span>{{ pagination.current_page }} / {{ pagination.last_page }}</span>
           <button :disabled="pagination.current_page === pagination.last_page" @click="changePage(pagination.current_page + 1)">Próx</button>
        </div>
      </main>
    </div>

    <!-- Multi-step Upload Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
       <div class="modal modal-lg" @click.stop>
          <div class="modal-header">
             <h2>{{ editingDocument ? 'Editar Propriedades' : 'Carregar Novo Documento' }}</h2>
             <button @click="closeModal" class="close-btn"><i class="pi pi-times"></i></button>
          </div>
          
          <form @submit.prevent="saveDocument" class="modal-body">
             <div class="upload-form-grid">
                <div class="form-section">
                   <label>Arquivo do Documento *</label>
                   <div class="file-dropzone" @click="$refs.fileInput.click()">
                      <input type="file" ref="fileInput" @change="handleFileSelect" hidden />
                      <div v-if="form.file" class="file-info-selected">
                         <i class="pi pi-file-pdf"></i>
                         <span>{{ form.file.name }}</span>
                         <small>{{ formatFileSize(form.file.size) }}</small>
                      </div>
                      <div v-else class="file-prompt">
                         <i class="pi pi-cloud-upload"></i>
                         <p>Clique ou arraste o arquivo aqui</p>
                         <small>Suporta PDF, DOCX, XLSX e Imagens (máx 10MB)</small>
                      </div>
                   </div>
                </div>

                <div class="fields-section">
                   <div class="field-row">
                      <div class="input-group">
                        <label>Título Informativo *</label>
                        <input v-model="form.title" type="text" placeholder="Ex: Contrato de Trabalho - [Nome]" required />
                      </div>
                   </div>

                   <div class="field-row double">
                      <div class="input-group">
                        <label>Categoria</label>
                        <select v-model="form.category_id">
                           <option value="">Selecione...</option>
                           <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                        </select>
                      </div>
                      <div class="input-group">
                        <label>Tipo de Documento</label>
                        <select v-model="form.type_id">
                           <option value="">Selecione...</option>
                           <option v-for="t in types" :key="t.id" :value="t.id">{{ t.name }}</option>
                        </select>
                      </div>
                   </div>

                   <div class="field-row double">
                      <div class="input-group">
                        <label>Colaborador Associado</label>
                        <select v-model="form.employee_id">
                           <option value="">Documento Geral da Empresa</option>
                           <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.full_name }}</option>
                        </select>
                      </div>
                      <div class="input-group">
                        <label>Visibilidade</label>
                        <select v-model="form.visibility">
                           <option value="internal">Interno (RH + Colaborador)</option>
                           <option value="hr">Apenas RH</option>
                           <option value="manager">Gestores e RH</option>
                           <option value="private">Privado (Administrador)</option>
                        </select>
                      </div>
                   </div>

                   <div class="field-row">
                      <div class="input-group">
                        <label>Data de Vencimento (se aplicável)</label>
                        <input v-model="form.expiration_date" type="date" />
                      </div>
                   </div>
                </div>
             </div>

             <div class="modal-footer">
                <button type="button" @click="closeModal" class="btn-secondary">Cancelar</button>
                <button type="submit" class="btn-primary" :disabled="saving">
                   <i v-if="saving" class="pi pi-spin pi-spinner"></i>
                   {{ editingDocument ? 'Atualizar Metadados' : 'Concluir Envio' }}
                </button>
             </div>
          </form>
       </div>
    </div>

    <!-- View Modal (with expanded details) -->
    <div v-if="showViewModal && selectedDocument" class="modal-overlay" @click="closeViewModal">
        <div class="modal modal-md" @click.stop>
            <div class="modal-header">
                <h3>Visualizar Documento</h3>
                <button @click="closeViewModal" class="close-btn"><i class="pi pi-times"></i></button>
            </div>
            <div class="modal-body doc-view-body">
                <div class="doc-icon-large">
                   <i :class="getFileIcon(selectedDocument.file_type)"></i>
                </div>
                <h2>{{ selectedDocument.title }}</h2>
                <div class="doc-details-list">
                    <div class="detail-item"><strong>Proprietário:</strong> {{ selectedDocument.employee?.full_name || 'Empresa' }}</div>
                    <div class="detail-item"><strong>Tamanho:</strong> {{ selectedDocument.file_size_formatted }}</div>
                    <div class="detail-item"><strong>Data de Envio:</strong> {{ formatDate(selectedDocument.created_at) }}</div>
                    <div class="detail-item"><strong>Vencimento:</strong> {{ formatDate(selectedDocument.expiration_date) || 'Permanente' }}</div>
                    <div class="detail-item"><strong>Visibilidade:</strong> {{ getVisibilityLabel(selectedDocument.visibility) }}</div>
                </div>
                
                <div v-if="selectedDocument.status === 'pending'" class="approval-strip">
                   <i class="pi pi-info-circle"></i>
                   <p>Este documento foi enviado pelo colaborador e aguarda aprovação oficial.</p>
                   <button @click="approveDocument(selectedDocument)" class="btn-approve">Validar Agora</button>
                </div>
            </div>
            <div class="modal-footer">
                <button @click="downloadDocument(selectedDocument)" class="btn-primary">
                  <i class="pi pi-download"></i> Baixar Arquivo
                </button>
            </div>
        </div>
    </div>

    <!-- Document Types Modal -->
    <div v-if="showTypeModal" class="modal-overlay" @click="showTypeModal = false">
        <div class="modal modal-lg" @click.stop>
            <div class="modal-header">
                <h2>Gerenciar Tipos de Documento</h2>
                <button @click="showTypeModal = false" class="close-btn"><i class="pi pi-times"></i></button>
            </div>
            
            <div class="modal-body doc-type-manager">
                <div class="type-editor-grid">
                    <!-- List of Types -->
                    <div class="types-list-panel">
                        <h3>Tipos Cadastrados</h3>
                        <div v-if="types.length === 0" class="empty-state-mini">
                            <p>Nenhum tipo cadastrado.</p>
                        </div>
                        <ul class="types-list">
                            <li v-for="t in types" :key="t.id">
                                <div class="type-info">
                                    <span class="type-name">{{ t.name }}</span>
                                    <small v-if="t.requires_expiration" class="badge-req">Requer Expiração</small>
                                </div>
                                <div class="type-actions">
                                    <button @click="deleteType(t)" class="btn-icon danger"><i class="pi pi-trash"></i></button>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <!-- Add New Type -->
                    <div class="type-form-panel">
                        <h3>Novo Tipo</h3>
                        <div class="type-form">
                            <div class="input-group">
                                <label>Nome do Tipo *</label>
                                <input v-model="typeForm.name" type="text" placeholder="Ex: Passaporte, Diploma..." required />
                            </div>
                            <div class="input-group">
                                <label>Descrição (Opcional)</label>
                                <textarea v-model="typeForm.description" rows="3" placeholder="Breve explicação do uso deste tipo..."></textarea>
                            </div>
                            <div class="checkbox-group">
                                <input v-model="typeForm.requires_expiration" type="checkbox" id="req_exp" />
                                <label for="req_exp">Exigir data de validade/vencimento</label>
                            </div>
                            <button @click="saveType" class="btn-primary w-full" :disabled="typeSaving">
                                <i v-if="typeSaving" class="pi pi-spin pi-spinner"></i>
                                Adicionar Tipo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { adminService } from '@/services/adminService'
import { useToast } from 'vue-toastification'
import Loading from '@/components/common/Loading.vue'
import dayjs from 'dayjs'
import _ from 'lodash'

const toast = useToast()
const loading = ref(true)
const saving = ref(false)
const documents = ref([])
const categories = ref([])
const types = ref([])
const employees = ref([])
const stats = ref({ total: 0, active: 0, expired: 0, expiring_soon: 0, pending: 0 })
const pagination = ref({ current_page: 1, last_page: 1, total: 0 })

const filters = reactive({
  category_id: '',
  status: '',
  visibility: '',
  search: '',
  page: 1
})

const showModal = ref(false)
const showViewModal = ref(false)
const showTypeModal = ref(false)
const typeSaving = ref(false)
const editingDocument = ref(null)
const selectedDocument = ref(null)

const typeForm = reactive({
  name: '',
  description: '',
  requires_expiration: false
})

const form = reactive({
  title: '',
  category_id: '',
  type_id: '',
  employee_id: '',
  visibility: 'internal',
  expiration_date: '',
  file: null
})

const fetchStats = async () => {
  try {
    const { data } = await adminService.documents.getStats()
    stats.value = data
  } catch (e) {}
}

const fetchDocuments = async () => {
  loading.value = true
  try {
    const { data } = await adminService.documents.getAll(filters)
    documents.value = data.data || []
    pagination.value = {
      current_page: data.current_page,
      last_page: data.last_page,
      total: data.total
    }
  } catch (e) {
    toast.error('Erro ao carregar documentos.')
  } finally {
    loading.value = false
  }
}

const fetchAuxiliary = async () => {
  try {
    const [catRes, typeRes, empRes] = await Promise.all([
      adminService.documents.getCategories(),
      adminService.documents.getTypes(),
      adminService.employees.getAll()
    ])
    categories.value = catRes.data || []
    types.value = typeRes.data || []
    employees.value = empRes.data.data || empRes.data || []
  } catch (e) {}
}

const debouncedFetch = _.debounce(() => {
  filters.page = 1
  fetchDocuments()
}, 500)

const selectCategory = (id) => {
  filters.category_id = id
  filters.page = 1
  fetchDocuments()
}

const filterByStatus = (status) => {
  filters.status = status
  filters.page = 1
  fetchDocuments()
}

const toggleVisibilityFilter = (v) => {
  filters.visibility = filters.visibility === v ? '' : v
  fetchDocuments()
}

const changePage = (p) => {
  filters.page = p
  fetchDocuments()
}

const handleFileSelect = (e) => {
  form.file = e.target.files[0]
  if (form.file && !form.title) {
    form.title = form.file.name.split('.').slice(0, -1).join('.')
  }
}

const openUploadModal = () => {
  editingDocument.value = null
  resetForm()
  showModal.value = true
}

const editDocument = (doc) => {
  editingDocument.value = doc
  form.title = doc.title
  form.category_id = doc.category_id || ''
  form.type_id = doc.type_id || ''
  form.employee_id = doc.employee_id || ''
  form.visibility = doc.visibility || 'internal'
  form.expiration_date = doc.expiration_date || ''
  form.file = null
  showModal.value = true
}

const saveDocument = async () => {
  if (!form.file && !editingDocument.value) {
    return toast.warning('Selecione um arquivo.')
  }
  
  saving.value = true
  try {
    const fd = new FormData()
    Object.keys(form).forEach(key => {
       if (form[key]) fd.append(key, form[key])
    })
    
    if (editingDocument.value) {
      await adminService.documents.update(editingDocument.value.id, fd)
      toast.success('Alterações salvas.')
    } else {
      await adminService.documents.create(fd)
      toast.success('Documento arquivado com sucesso.')
    }
    closeModal()
    fetchDocuments()
    fetchStats()
  } catch (e) {
    toast.error('Erro ao salvar documento.')
  } finally {
    saving.value = false
  }
}

const saveType = async () => {
  if (!typeForm.name) return toast.warning('Nome é obrigatório.')
  
  typeSaving.value = true
  try {
    await adminService.documents.createType(typeForm)
    toast.success('Tipo de documento adicionado.')
    typeForm.name = ''
    typeForm.description = ''
    typeForm.requires_expiration = false
    fetchAuxiliary()
  } catch (e) {
    toast.error('Erro ao salvar tipo.')
  } finally {
    typeSaving.value = false
  }
}

const deleteType = async (type) => {
  if (!confirm(`Eliminar "${type.name}"?`)) return
  try {
    await adminService.documents.deleteType(type.id)
    toast.success('Tipo removido.')
    fetchAuxiliary()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Erro ao remover tipo.')
  }
}

const downloadDocument = async (doc) => {
  try {
     const res = await adminService.documents.download(doc.id)
     const url = window.URL.createObjectURL(new Blob([res.data]))
     const link = document.createElement('a')
     link.href = url
     link.setAttribute('download', doc.file_name)
     document.body.appendChild(link)
     link.click()
  } catch (e) {
     toast.error('Erro ao descarregar ficheiro.')
  }
}

const approveDocument = async (doc) => {
  try {
     await adminService.documents.update(doc.id, { status: 'active' })
     toast.success('Documento validado e ativado.')
     closeViewModal()
     fetchDocuments()
     fetchStats()
  } catch (e) {
     toast.error('Erro ao aprovar.')
  }
}

const deleteDocument = async (doc) => {
  if (!confirm(`Confirmar eliminação permanente de "${doc.title}"?`)) return
  try {
    await adminService.documents.delete(doc.id)
    toast.success('Documento removido.')
    fetchDocuments()
    fetchStats()
  } catch (e) {}
}

const viewDocument = (doc) => {
  selectedDocument.value = doc
  showViewModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingDocument.value = null
}

const closeViewModal = () => {
  showViewModal.value = false
  selectedDocument.value = null
}

const resetForm = () => {
  form.title = ''
  form.category_id = ''
  form.type_id = ''
  form.employee_id = ''
  form.visibility = 'internal'
  form.expiration_date = ''
  form.file = null
}

const truncate = (str, n) => str?.length > n ? str.substr(0, n - 1) + '...' : str
const formatDate = (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-'
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (type) => {
  const map = { pdf: 'pi pi-file-pdf', doc: 'pi pi-file-word', docx: 'pi pi-file-word', xls: 'pi pi-file-excel', xlsx: 'pi pi-file-excel', jpg: 'pi pi-image', png: 'pi pi-image' }
  return map[type?.toLowerCase()] || 'pi pi-file'
}

const getStatusLabel = (s) => {
  const map = { active: 'Ativo', pending: 'Revisão', expired: 'Expirado', archived: 'Arquivo' }
  return map[s] || s
}

const statusBadgeClass = (s) => `status-badge s-${s}`

const getVisibilityLabel = (v) => {
  const map = { internal: 'Colaborador', hr: 'Privado (RH)', manager: 'Gestão', private: 'Admins' }
  return map[v] || v
}

const getVisibilityIcon = (v) => v === 'private' || v === 'hr' ? 'pi pi-lock' : 'pi pi-users'

const expiryClass = (doc) => {
  if (dayjs(doc.expiration_date).isBefore(dayjs())) return 'text-danger'
  if (dayjs(doc.expiration_date).isBefore(dayjs().add(30, 'days'))) return 'text-warning'
  return 'text-success'
}

onMounted(() => {
  fetchDocuments()
  fetchStats()
  fetchAuxiliary()
})
</script>

<style scoped>
.documents-page { padding: 2rem; display: flex; flex-direction: column; gap: 2rem; background: #f8fafc; min-height: 100vh; }

.page-header .header-content { display: flex; justify-content: space-between; align-items: center; }
.header-title { display: flex; align-items: center; gap: 1rem; }
.header-title i { font-size: 2rem; color: #3b82f6; }
.header-title h1 { font-size: 1.75rem; font-weight: 800; color: #1e293b; margin: 0; }
.subtitle { color: #64748b; margin: 0; }

.header-actions { display: flex; align-items: center; gap: 1rem; }
.pending-badge { background: #fee2e2; color: #b91c1c; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; border: 1px solid #fecaca; }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
.stat-card { background: white; padding: 1.5rem; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 1rem; cursor: pointer; transition: all 0.3s; }
.stat-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
.stat-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
.stat-icon.total { background: #eff6ff; color: #3b82f6; }
.stat-icon.active { background: #f0fdf4; color: #16a34a; }
.stat-icon.expiring { background: #fffbeb; color: #d97706; }
.stat-icon.expired { background: #fef2f2; color: #dc2626; }
.stat-label { display: block; font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase; }
.stat-value { font-size: 1.5rem; font-weight: 800; color: #1e293b; }

.main-layout { display: grid; grid-template-columns: 280px 1fr; gap: 2rem; }

.doc-sidebar { background: white; border-radius: 16px; padding: 1.5rem; border: 1px solid #e2e8f0; height: fit-content; }
.sidebar-section h3 { font-size: 0.85rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 1rem; }
.category-list { list-style: none; padding: 0; margin-bottom: 2rem; }
.category-list li { padding: 0.75rem 1rem; border-radius: 8px; cursor: pointer; color: #475569; display: flex; align-items: center; gap: 0.75rem; transition: 0.2s; }
.category-list li:hover { background: #f1f5f9; color: #1e293b; }
.category-list li.active { background: #3b82f6; color: white; }

.quick-filters { display: flex; flex-direction: column; gap: 0.5rem; }
.q-filter { padding: 0.75rem; border-radius: 8px; border: 1px solid #f1f5f9; cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem; }
.q-filter.active { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }

.content-header { margin-bottom: 1.5rem; }
.search-box { position: relative; width: 100%; max-width: 500px; }
.search-box i { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.search-box input { width: 100%; padding: 0.8rem 1rem 0.8rem 2.8rem; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 1rem; transition: 0.3s; }
.search-box input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }

.documents-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
.doc-item-card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 1.25rem; transition: 0.3s; position: relative; }
.doc-item-card:hover { border-color: #3b82f6; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.doc-item-card.is-pending { border-left: 4px solid #f59e0b; }

.doc-item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.doc-type-icon { font-size: 2rem; color: #64748b; }
.status-badge { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
.s-active { background: #dcfce7; color: #16a34a; }
.s-pending { background: #fef3c7; color: #92400e; }
.s-expired { background: #fee2e2; color: #ef4444; }

.doc-item-body h4 { margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.doc-metadata { display: flex; gap: 1rem; margin-bottom: 1rem; }
.meta-tag { background: #f1f5f9; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.75rem; color: #475569; }
.meta-size { font-size: 0.75rem; color: #94a3b8; }
.doc-owner { font-size: 0.85rem; color: #64748b; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem; }
.doc-timer { font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 0.4rem; }

.doc-item-footer { border-top: 1px solid #f1f5f9; padding-top: 1rem; margin-top: 1rem; display: flex; justify-content: space-between; align-items: center; }
.visibility-info { display: flex; align-items: center; gap: 0.4rem; color: #94a3b8; }
.item-actions { display: flex; gap: 0.4rem; }
.btn-icon { width: 30px; height: 30px; border-radius: 8px; border: 1px solid #f1f5f9; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; color: #64748b; transition: 0.2s; }
.btn-icon:hover { background: #f8fafc; color: #1e293b; border-color: #cbd5e1; }
.btn-icon.primary { color: #3b82f6; }
.btn-icon.danger { color: #dc2626; }

.pagination-bar { margin-top: 2rem; display: flex; align-items: center; gap: 1rem; justify-content: center; }
.pagination-bar button { padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid #e2e8f0; background: white; cursor: pointer; }

/* Modals */
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.modal { background: white; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow: hidden; }
.modal-lg { width: 800px; }
.modal-md { width: 450px; }
.modal-header { padding: 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
.modal-header h2 { font-size: 1.25rem; font-weight: 800; color: #1e293b; margin: 0; }
.close-btn { background: none; border: none; font-size: 1.25rem; color: #94a3b8; cursor: pointer; }

.upload-form-grid { display: grid; grid-template-columns: 250px 1fr; gap: 2rem; padding: 2rem; }
.file-dropzone { height: 100%; border: 2px dashed #cbd5e1; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; padding: 1rem; text-align: center; }
.file-dropzone:hover { border-color: #3b82f6; background: #f0f9ff; }
.file-dropzone i { font-size: 2.5rem; color: #3b82f6; margin-bottom: 1rem; }
.file-info-selected { color: #1e293b; }

.fields-section { display: flex; flex-direction: column; gap: 1.25rem; }
.input-group label { display: block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 0.5rem; }
.input-group input, .input-group select { width: 100%; padding: 0.75rem 1rem; border-radius: 10px; border: 1px solid #e2e8f0; }
.field-row.double { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

.modal-footer { padding: 1.5rem; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 1rem; }
.btn-primary { background: #3b82f6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; }
.btn-secondary { background: white; border: 1px solid #e2e8f0; color: #475569; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; }

.approval-strip { background: #fff7ed; padding: 1.5rem; border-radius: 12px; border: 1px solid #ffedd5; margin-top: 2rem; text-align: center; }
.approval-strip i { font-size: 1.5rem; color: #f59e0b; margin-bottom: 0.5rem; }
.btn-approve { background: #16a34a; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 8px; font-weight: 700; margin-top: 1rem; cursor: pointer; }

.doc-details-list { display: flex; flex-direction: column; gap: 0.75rem; margin: 1.5rem 0; }

/** Estilo do modal */
/* Overlay */
/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 0.5px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 15px;
  font-weight: 500;
  margin: 0;
}

.close-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 0.5px solid #d1d5db;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: background 0.15s;
}

.close-btn:hover {
  background: #f3f4f6;
}

/* Body */
.modal-body.doc-view-body {
  padding: 1.5rem 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

/* Ícone do documento */
.doc-icon-large {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #185FA5;
}

.doc-view-body h2 {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  text-align: center;
}

/* Lista de detalhes */
.doc-details-list {
  width: 100%;
  background: #f9fafb;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 6px 0;
  border-bottom: 0.5px solid #e5e7eb;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item strong {
  color: #6b7280;
  font-weight: 400;
}

/* Faixa de aprovação */
.approval-strip {
  width: 100%;
  border-radius: 8px;
  border: 0.5px solid #fbbf24;
  background: #fffbeb;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.approval-strip .pi-info-circle {
  font-size: 14px;
  color: #b45309;
}

.approval-strip p {
  font-size: 12px;
  color: #92400e;
  margin: 0;
  line-height: 1.5;
}

.btn-approve {
  align-self: flex-start;
  font-size: 12px;
  font-weight: 500;
  padding: 5px 14px;
  border-radius: 8px;
  border: 0.5px solid #b45309;
  background: transparent;
  color: #92400e;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-approve:hover {
  background: #fef3c7;
}

/* Footer */
.modal-footer {
  padding: 0.875rem 1.25rem;
  border-top: 0.5px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}



/* Type Manager Styling */
.type-editor-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; padding: 2rem; }
.types-list-panel h3, .type-form-panel h3 { font-size: 1rem; color: #1e293b; margin-bottom: 1.5rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.5rem; }
.types-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.75rem; max-height: 400px; overflow-y: auto; }
.types-list li { background: #f8fafc; padding: 1rem; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
.type-name { font-weight: 700; color: #1e293b; display: block; }
.badge-req { background: #fee2e2; color: #b91c1c; font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 600; }
.type-form { display: flex; flex-direction: column; gap: 1.25rem; }
.checkbox-group { display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem; color: #475569; }
.checkbox-group input { width: 1.2rem; height: 1.2rem; }
.w-full { width: 100%; }
.empty-state-mini { text-align: center; color: #94a3b8; padding: 2rem; }
</style>
