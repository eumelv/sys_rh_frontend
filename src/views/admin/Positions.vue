<template>
    <div class="positions-page">
        <div class="page-header">
            <div class="search-box">
                <i class="pi pi-search"></i>
                <input v-model="searchQuery" type="text" placeholder="Buscar cargos..." @input="debouncedSearch" />
            </div>
            <button @click="openCreateModal" class="btn-primary">
                <i class="pi pi-plus"></i>
                Novo Cargo
            </button>
        </div>

        <Card>
            <div v-if="loading" class="loading-state">
                <Loading message="Carregando cargos..." />
            </div>

            <div v-else-if="positions.length === 0" class="empty-state">
                <i class="pi pi-briefcase"></i>
                <h3>Nenhum cargo encontrado</h3>
                <p>Comece adicionando os cargos da sua empresa</p>
            </div>

            <div v-else>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Código</th>
                            <th>Departamento</th>
                            <th>Salário (Min/Máx)</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="position in positions" :key="position.id">
                            <td>
                                <div class="position-title">{{ position.title }}</div>
                                <div class="position-desc">{{ truncate(position.description, 50) }}</div>
                            </td>
                            <td>{{ position.code || '-' }}</td>
                            <td>{{ position.department?.name || '-' }}</td>
                            <td>
                                <div class="salary-range">
                                    {{ formatCurrency(position.min_salary) }} - {{ formatCurrency(position.max_salary)
                                    }}
                                </div>
                            </td>
                            <td>
                                <span
                                    :class="`status-badge ${position.is_active ? 'status-active' : 'status-inactive'}`">
                                    {{ position.is_active ? 'Ativo' : 'Inativo' }}
                                </span>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <button @click="editPosition(position)" class="btn-icon" title="Editar">
                                        <i class="pi pi-pencil"></i>
                                    </button>
                                    <button @click="deletePosition(position)" class="btn-icon btn-danger"
                                        title="Excluir">
                                        <i class="pi pi-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Card>

        <!-- Modal for Create/Edit Position -->
        <div v-if="showModal" class="modal-overlay" @click="closeModal">
            <div class="modal modal-lg" @click.stop>
                <div class="modal-header">
                    <h3>{{ isEditing ? 'Editar Cargo' : 'Novo Cargo' }}</h3>
                    <button @click="closeModal" class="close-btn">
                        <i class="pi pi-times"></i>
                    </button>
                </div>

                <form @submit.prevent="savePosition" class="modal-body">
                    <div class="form-group">
                        <label>Título do Cargo *</label>
                        <input v-model="form.title" type="text" required />
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label>Departamento</label>
                            <select v-model="form.department_id">
                                <option :value="null">Nenhum</option>
                                <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                                    {{ dept.name }}
                                </option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Código do Cargo</label>
                            <input v-model="form.code" type="text" placeholder="Ex: ENG-01" />
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Descrição</label>
                        <textarea v-model="form.description" rows="3"></textarea>
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label>Salário Mínimo (AOA)</label>
                            <input v-model="form.min_salary" type="number" step="0.01" />
                        </div>
                        <div class="form-group">
                            <label>Salário Máximo (AOA)</label>
                            <input v-model="form.max_salary" type="number" step="0.01" />
                        </div>
                    </div>

                    <div class="form-group checkbox-group">
                        <label>
                            <input type="checkbox" v-model="form.is_active" />
                            Cargo Ativo
                        </label>
                    </div>

                    <div class="modal-footer">
                        <button type="button" @click="closeModal" class="btn-secondary">Cancelar</button>
                        <button type="submit" class="btn-primary" :disabled="saving">
                            {{ saving ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar Cargo') }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/services/api'
import Card from '@/components/common/Card.vue'
import Loading from '@/components/common/Loading.vue'
import { useToast } from 'vue-toastification'
import { debounce } from 'lodash-es'

const toast = useToast()
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const isEditing = ref(false)

const positions = ref([])
const departments = ref([])
const searchQuery = ref('')

const form = reactive({
    id: null,
    title: '',
    code: '',
    description: '',
    department_id: null,
    min_salary: null,
    max_salary: null,
    is_active: true
})

const fetchPositions = async () => {
    loading.value = true
    try {
        const { data } = await api.get('/admin/positions', {
            params: { search: searchQuery.value }
        })
        positions.value = data
    } catch (error) {
        toast.error('Erro ao carregar cargos')
    } finally {
        loading.value = false
    }
}

const fetchDepartments = async () => {
    try {
        const { data } = await api.get('/admin/departments')
        departments.value = data
    } catch (error) {
        console.error('Error fetching departments')
    }
}

const debouncedSearch = debounce(() => {
    fetchPositions()
}, 500)

const openCreateModal = () => {
    isEditing.value = false
    resetForm()
    showModal.value = true
}

const editPosition = (position) => {
    isEditing.value = true
    Object.assign(form, {
        id: position.id,
        title: position.title,
        code: position.code,
        description: position.description,
        department_id: position.department_id,
        min_salary: position.min_salary,
        max_salary: position.max_salary,
        is_active: position.is_active
    })
    showModal.value = true
}

const savePosition = async () => {
    saving.value = true
    try {
        if (isEditing.value) {
            await api.put(`/admin/positions/${form.id}`, form)
            toast.success('Cargo atualizado!')
        } else {
            await api.post('/admin/positions', form)
            toast.success('Cargo criado!')
        }
        closeModal()
        fetchPositions()
    } catch (error) {
        toast.error(error.response?.data?.message || 'Erro ao salvar cargo')
    } finally {
        saving.value = false
    }
}

const deletePosition = async (position) => {
    if (!confirm('Tem certeza que deseja excluir este cargo?')) return

    try {
        await api.delete(`/admin/positions/${position.id}`)
        toast.success('Cargo removido!')
        fetchPositions()
    } catch (error) {
        toast.error(error.response?.data?.message || 'Erro ao remover cargo')
    }
}

const resetForm = () => {
    Object.assign(form, {
        id: null,
        title: '',
        code: '',
        description: '',
        department_id: null,
        min_salary: null,
        max_salary: null,
        is_active: true
    })
}

const closeModal = () => {
    showModal.value = false
}

const formatCurrency = (value) => {
    if (value === null || value === undefined) return '-'
    return new Intl.NumberFormat('pt-AO', {
        style: 'currency',
        currency: 'AOA'
    }).format(value)
}

const truncate = (text, length) => {
    if (!text) return ''
    return text.length > length ? text.substring(0, length) + '...' : text
}

onMounted(() => {
    fetchPositions()
    fetchDepartments()
})
</script>

<style scoped>
.positions-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.search-box {
    position: relative;
    flex: 1;
    max-width: 400px;
}

.search-box i {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
}

.search-box input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 3rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: white;
}

.position-title {
    font-weight: 600;
    color: #1e293b;
}

.position-desc {
    font-size: 0.75rem;
    color: #64748b;
    margin-top: 0.25rem;
}

.salary-range {
    font-size: 0.875rem;
    color: #475569;
}

.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
}

.status-active {
    background: #dcfce7;
    color: #166534;
}

.status-inactive {
    background: #fee2e2;
    color: #991b1b;
}

/* ... existing styles ... */

.btn-primary {
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: transform 0.2s;
}

.btn-primary:hover {
    transform: translateY(-2px);
}

.btn-secondary {
    padding: 0.75rem 1.5rem;
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-secondary:hover {
    border-color: #d1d5db;
    background: #f9fafb;
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
    z-index: 9999;
    padding: 1rem;
}

.modal {
    background: white;
    border-radius: 12px;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: #111827;
}

.close-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: #f3f4f6;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
}

.close-btn:hover {
    background: #e5e7eb;
}

.modal-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
    padding: 0.75rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 0.875rem;
    transition: border-color 0.2s;
    width: 100%;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #3b82f6;
}

.checkbox-group label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
    width: auto;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1.5rem;
    border-top: 1px solid #e5e7eb;
}

.btn-icon {
    width: 32px;
    height: 32px;
    border: none;
    background: #f3f4f6;
    color: #4b5563;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.btn-icon:hover {
    background: #e5e7eb;
    color: #111827;
}

.btn-danger:hover {
    background: #fee2e2;
    color: #dc2626;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
}

.data-table thead {
    background: #f9fafb;
}

.data-table th {
    padding: 1rem;
    text-align: left;
    font-size: 0.75rem;
    font-weight: 700;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.data-table td {
    padding: 1rem;
    border-top: 1px solid #e5e7eb;
    font-size: 0.875rem;
}

.modal-lg {
    max-width: 700px;
}

@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }
}
</style>
