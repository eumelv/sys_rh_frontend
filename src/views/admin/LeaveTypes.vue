<template>
  <div class="leave-types-page">
    <div class="page-header">
      <h2>Tipos de Licença</h2>
      <button @click="showModal = true" class="btn-primary">
        <i class="pi pi-plus"></i>
        Novo Tipo
      </button>
    </div>

    <!-- Listagem -->
    <Card>
      <div v-if="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner"></i>
        Carregando...
      </div>

      <div v-else-if="leaveTypes.length === 0" class="empty-state">
        <i class="pi pi-inbox"></i>
        <p>Nenhum tipo de licença cadastrado</p>
        <button @click="showModal = true" class="btn-primary">
          Criar Primeiro Tipo
        </button>
      </div>

      <div v-else class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Código</th>
              <th>Dias/Ano</th>
              <th>Remunerada</th>
              <th>Aprovação</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="type in leaveTypes" :key="type.id">
              <td>{{ type.name }}</td>
              <td><span class="badge">{{ type.code }}</span></td>
              <td>{{ type.days_per_year }} dias</td>
              <td>
                <span class="badge" :class="type.is_paid ? 'success' : 'warning'">
                  {{ type.is_paid ? 'Sim' : 'Não' }}
                </span>
              </td>
              <td>
                <span class="badge" :class="type.requires_approval ? 'info' : 'secondary'">
                  {{ type.requires_approval ? 'Necessária' : 'Não requer' }}
                </span>
              </td>
              <td>
                <span class="badge" :class="type.is_active ? 'success' : 'danger'">
                  {{ type.is_active ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
              <td>
                <div class="actions">
                  <button @click="editLeaveType(type)" class="btn-icon" title="Editar">
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button @click="deleteLeaveType(type)" class="btn-icon danger" title="Deletar">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <!-- Modal Criar/Editar -->
    <Modal v-if="showModal" @close="closeModal">
      <template #header>
        <h3>{{ editingType ? 'Editar' : 'Novo' }} Tipo de Licença</h3>
      </template>

      <form @submit.prevent="saveLeaveType" class="form">
        <div class="form-row">
          <div class="form-group">
            <label>Nome *</label>
            <input 
              v-model="form.name" 
              type="text" 
              placeholder="Ex: Férias"
              required
            />
          </div>

          <div class="form-group">
            <label>Código *</label>
            <input 
              v-model="form.code" 
              type="text" 
              placeholder="Ex: VACATION"
              required
              :disabled="editingType !== null"
            />
          </div>
        </div>

        <div class="form-group">
          <label>Dias por Ano *</label>
          <input 
            v-model.number="form.days_per_year" 
            type="number" 
            min="0"
            required
          />
        </div>

        <div class="form-row">
          <div class="form-group checkbox">
            <label>
              <input v-model="form.is_paid" type="checkbox" />
              <span>Licença Remunerada</span>
            </label>
          </div>

          <div class="form-group checkbox">
            <label>
              <input v-model="form.requires_approval" type="checkbox" />
              <span>Requer Aprovação</span>
            </label>
          </div>

          <div class="form-group checkbox">
            <label>
              <input v-model="form.is_active" type="checkbox" />
              <span>Ativo</span>
            </label>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" @click="closeModal" class="btn-secondary" :disabled="submitting">
            Cancelar
          </button>
          <button type="submit" class="btn-primary" :disabled="submitting">
            <i class="pi" :class="submitting ? 'pi-spin pi-spinner' : 'pi-check'"></i>
            {{ submitting ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import Card from '@/components/common/Card.vue'
import Modal from '@/components/common/Modal.vue'
import { useToast } from 'vue-toastification'

const toast = useToast()
const loading = ref(false)
const submitting = ref(false)
const showModal = ref(false)
const leaveTypes = ref([])
const editingType = ref(null)

const form = ref({
  name: '',
  code: '',
  description: '', // ✅ ADICIONAR
  default_days: 30, // ✅ CORRIGIDO (era days_per_year)
  is_paid: true,
  requires_approval: true,
  is_active: true,
  color: '#3B82F6', // ✅ ADICIONAR
})

const fetchLeaveTypes = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/admin/leave-types')
    leaveTypes.value = data
  } catch (error) {
    console.error('Erro ao carregar tipos:', error)
    toast.error('Erro ao carregar tipos de licença')
  } finally {
    loading.value = false
  }
}

const saveLeaveType = async () => {
  submitting.value = true
  try {
    // ✅ LOG PARA DEBUG
    console.log('Salvando tipo de licença:', form.value)
    
    if (editingType.value) {
      await api.put(`/admin/leave-types/${editingType.value.id}`, form.value)
      toast.success('Tipo de licença atualizado!')
    } else {
      await api.post('/admin/leave-types', form.value)
      toast.success('Tipo de licença criado!')
    }
    
    closeModal()
    fetchLeaveTypes()
  } catch (error) {
    console.error('Erro ao salvar:', error.response?.data)
    const message = error.response?.data?.message || 'Erro ao salvar'
    toast.error(message)
  } finally {
    submitting.value = false
  }
}

const editLeaveType = (type) => {
  editingType.value = type
  form.value = { ...type }
  showModal.value = true
}

const deleteLeaveType = async (type) => {
  if (!confirm(`Tem certeza que deseja deletar "${type.name}"?`)) return
  
  try {
    await api.delete(`/admin/leave-types/${type.id}`)
    toast.success('Tipo de licença deletado!')
    fetchLeaveTypes()
  } catch (error) {
    console.error('Erro ao deletar:', error)
    toast.error('Erro ao deletar')
  }
}

const closeModal = () => {
  showModal.value = false
  editingType.value = null
  form.value = {
    name: '',
    code: '',
    description: '',
    default_days: 30, // ✅ CORRIGIDO
    is_paid: true,
    requires_approval: true,
    is_active: true,
    color: '#3B82F6',
  }
}

onMounted(() => {
  fetchLeaveTypes()
})
</script>
<style scoped>
.leave-types-page {
  padding: 2rem;
  animation: fadeIn 0.3s;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 1rem;
  background: #f8fafc;
  font-weight: 600;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.badge.success {
  background: #d1fae5;
  color: #065f46;
}

.badge.warning {
  background: #fef3c7;
  color: #92400e;
}

.badge.info {
  background: #dbeafe;
  color: #1e40af;
}

.badge.danger {
  background: #fee2e2;
  color: #991b1b;
}

.badge.secondary {
  background: #f1f5f9;
  color: #64748b;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  padding: 0.5rem;
  border: none;
  background: #f1f5f9;
  color: #475569;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #e2e8f0;
}

.btn-icon.danger {
  color: #dc2626;
}

.btn-icon.danger:hover {
  background: #fee2e2;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
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

.form-group input[type="text"],
.form-group input[type="number"] {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-group.checkbox label {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.form-group.checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
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
</style>