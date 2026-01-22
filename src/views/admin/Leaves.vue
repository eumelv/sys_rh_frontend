<template>
    <div class="leaves-page">
        <div class="page-header">
            <h2>Gestão de Licenças e Férias</h2>
            <button @click="openRequestModal" class="btn-primary">
                <i class="pi pi-plus"></i>
                Novo Pedido
            </button>
        </div>

        <!-- Stats Overview -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon" style="background: #dbeafe;">
                    <i class="pi pi-calendar" style="color: #3b82f6;"></i>
                </div>
                <div class="stat-content">
                    <span class="stat-label">Dias Disponíveis</span>
                    <span class="stat-value">{{ leaveBalance.available || 0 }}</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: #fef3c7;">
                    <i class="pi pi-clock" style="color: #f59e0b;"></i>
                </div>
                <div class="stat-content">
                    <span class="stat-label">Pendentes</span>
                    <span class="stat-value">{{ stats.pending || 0 }}</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: #d1fae5;">
                    <i class="pi pi-check-circle" style="color: #10b981;"></i>
                </div>
                <div class="stat-content">
                    <span class="stat-label">Aprovados</span>
                    <span class="stat-value">{{ stats.approved || 0 }}</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: #fee2e2;">
                    <i class="pi pi-times-circle" style="color: #ef4444;"></i>
                </div>
                <div class="stat-content">
                    <span class="stat-label">Rejeitados</span>
                    <span class="stat-value">{{ stats.rejected || 0 }}</span>
                </div>
            </div>
        </div>

        <!-- Filters -->
        <div class="filters-bar">
            <select v-model="statusFilter" @change="fetchLeaves" class="filter-select">
                <option value="">Todos os Status</option>
                <option value="pending">Pendente</option>
                <option value="approved">Aprovado</option>
                <option value="rejected">Rejeitado</option>
            </select>
        </div>

        <!-- Leaves Table -->
        <Card>
            <div v-if="loading" class="loading-state">
                <Loading message="Carregando licenças..." />
            </div>

            <div v-else-if="leaves.length === 0" class="empty-state">
                <i class="pi pi-calendar"></i>
                <h3>Nenhuma licença encontrada</h3>
                <p>Comece criando um novo pedido de licença</p>
            </div>

            <div v-else>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Funcionário</th>
                            <th>Tipo</th>
                            <th>Período</th>
                            <th>Dias</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="leave in leaves" :key="leave.id">
                            <td>
                                <div class="employee-cell">
                                    <div class="employee-avatar">
                                        {{ leave.employee?.first_name?.charAt(0) }}{{
                                            leave.employee?.last_name?.charAt(0) }}
                                    </div>
                                    <span>{{ leave.employee?.full_name }}</span>
                                </div>
                            </td>
                            <td>{{ leave.leave_type?.name || 'Férias' }}</td>
                            <td>{{ formatDate(leave.start_date) }} - {{ formatDate(leave.end_date) }}</td>
                            <td>{{ leave.days }} dias</td>
                            <td>
                                <span :class="`status-badge status-${leave.status}`">
                                    {{ getStatusLabel(leave.status) }}
                                </span>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <button v-if="leave.status === 'pending'" @click="approveLeave(leave)"
                                        class="btn-icon btn-success" title="Aprovar">
                                        <i class="pi pi-check"></i>
                                    </button>
                                    <button v-if="leave.status === 'pending'" @click="rejectLeave(leave)"
                                        class="btn-icon btn-danger" title="Rejeitar">
                                        <i class="pi pi-times"></i>
                                    </button>
                                    <button @click="viewLeave(leave)" class="btn-icon" title="Ver Detalhes">
                                        <i class="pi pi-eye"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Card>

        <!-- Request Modal -->
        <div v-if="showRequestModal" class="modal-overlay" @click="closeRequestModal">
            <div class="modal" @click.stop>
                <div class="modal-header">
                    <h3>Novo Pedido de Licença</h3>
                    <button @click="closeRequestModal" class="close-btn">
                        <i class="pi pi-times"></i>
                    </button>
                </div>

                <form @submit.prevent="submitRequest" class="modal-body">
                    <div class="form-group">
                        <label>Funcionário *</label>
                        <select v-model="requestForm.employee_id" required>
                            <option value="">Selecione...</option>
                            <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                                {{ emp.full_name }}
                            </option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Tipo de Licença *</label>
                        <select v-model="requestForm.leave_type_id" required>
                            <option value="">Selecione...</option>
                            <option v-for="type in leaveTypes" :key="type.id" :value="type.id">
                                {{ type.name }}
                            </option>
                        </select>
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label>Data Início *</label>
                            <input v-model="requestForm.start_date" type="date" required />
                        </div>
                        <div class="form-group">
                            <label>Data Fim *</label>
                            <input v-model="requestForm.end_date" type="date" required />
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Motivo</label>
                        <textarea v-model="requestForm.reason" rows="3"
                            placeholder="Descreva o motivo do pedido..."></textarea>
                    </div>

                    <div class="modal-footer">
                        <button type="button" @click="closeRequestModal" class="btn-secondary">Cancelar</button>
                        <button type="submit" class="btn-primary" :disabled="saving">
                            {{ saving ? 'Enviando...' : 'Enviar Pedido' }}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- View Details Modal -->
        <div v-if="showDetailsModal && selectedLeave" class="modal-overlay" @click="closeDetailsModal">
            <div class="modal modal-sm" @click.stop>
                <div class="modal-header">
                    <h3>Detalhes da Licença</h3>
                    <button @click="closeDetailsModal" class="close-btn">
                        <i class="pi pi-times"></i>
                    </button>
                </div>

                <div class="modal-body">
                    <div class="detail-group">
                        <label>Funcionário</label>
                        <p>{{ selectedLeave.employee?.full_name }}</p>
                    </div>
                    <div class="detail-group">
                        <label>Tipo</label>
                        <p>{{ selectedLeave.leave_type?.name }}</p>
                    </div>
                    <div class="detail-group">
                        <label>Período</label>
                        <p>{{ formatDate(selectedLeave.start_date) }} até {{ formatDate(selectedLeave.end_date) }}</p>
                    </div>
                    <div class="detail-group">
                        <label>Total de Dias</label>
                        <p>{{ selectedLeave.days }} dias</p>
                    </div>
                    <div class="detail-group">
                        <label>Motivo</label>
                        <p>{{ selectedLeave.reason || '-' }}</p>
                    </div>
                    <div class="detail-group">
                        <label>Status</label>
                        <span :class="`status-badge status-${selectedLeave.status}`">
                            {{ getStatusLabel(selectedLeave.status) }}
                        </span>
                    </div>
                    <div v-if="selectedLeave.rejection_reason" class="detail-group">
                        <label>Motivo da Rejeição</label>
                        <p class="text-danger">{{ selectedLeave.rejection_reason }}</p>
                    </div>
                </div>

                <div class="modal-footer">
                    <button @click="closeDetailsModal" class="btn-secondary">Fechar</button>
                </div>
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
import dayjs from 'dayjs'

const toast = useToast()
const loading = ref(false)
const saving = ref(false)
const showRequestModal = ref(false)
const showDetailsModal = ref(false)
const selectedLeave = ref(null)
const statusFilter = ref('')

const leaves = ref([])
const employees = ref([])
const leaveTypes = ref([])
const leaveBalance = ref({ available: 0, used: 0, total: 0 })
const stats = ref({ pending: 0, approved: 0, rejected: 0 })

const requestForm = reactive({
    employee_id: '',
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: ''
})

const fetchLeaves = async () => {
    loading.value = true
    try {
        const { data } = await api.get('/admin/leaves', {
            params: { status: statusFilter.value }
        })
        leaves.value = data.data || data
        calculateStats()
    } catch (error) {
        toast.error('Erro ao carregar licenças')
    } finally {
        loading.value = false
    }
}

const fetchEmployees = async () => {
    try {
        const { data } = await api.get('/admin/employees')
        employees.value = data.data || data
    } catch (error) {
        console.error('Error fetching employees')
    }
}

const fetchLeaveTypes = async () => {
    try {
        const { data } = await api.get('/admin/leave-types')
        leaveTypes.value = data.data || data
    } catch (error) {
        console.error('Error fetching leave types', error)
        toast.error('Erro ao carregar tipos de licença')
    }
}

const calculateStats = () => {
    stats.value = {
        pending: leaves.value.filter(l => l.status === 'pending').length,
        approved: leaves.value.filter(l => l.status === 'approved').length,
        rejected: leaves.value.filter(l => l.status === 'rejected').length
    }
}

const openRequestModal = () => {
    resetForm()
    showRequestModal.value = true
}

const closeRequestModal = () => {
    showRequestModal.value = false
}

const submitRequest = async () => {
    saving.value = true
    try {
        await api.post('/admin/leaves', requestForm)
        toast.success('Pedido de licença enviado com sucesso!')
        closeRequestModal()
        fetchLeaves()
    } catch (error) {
        const msg = error.response?.data?.message || 'Erro ao enviar pedido'
        toast.error(msg)
    } finally {
        saving.value = false
    }
}

const approveLeave = async (leave) => {
    if (!confirm(`Aprovar licença de ${leave.employee?.full_name}?`)) return

    try {
        await api.post(`/admin/leaves/${leave.id}/approve`)
        toast.success('Licença aprovada!')
        fetchLeaves()
    } catch (error) {
        toast.error('Erro ao aprovar licença')
    }
}

const rejectLeave = async (leave) => {
    const reason = prompt('Motivo da rejeição:')
    if (!reason) return

    try {
        await api.post(`/admin/leaves/${leave.id}/reject`, { reason })
        toast.success('Licença rejeitada')
        fetchLeaves()
    } catch (error) {
        toast.error('Erro ao rejeitar licença')
    }
}

const viewLeave = (leave) => {
    selectedLeave.value = leave
    showDetailsModal.value = true
}

const closeDetailsModal = () => {
    showDetailsModal.value = false
    selectedLeave.value = null
}

const resetForm = () => {
    Object.assign(requestForm, {
        employee_id: '',
        leave_type_id: '',
        start_date: '',
        end_date: '',
        reason: ''
    })
}

const formatDate = (date) => {
    if (!date) return '-'
    return dayjs(date).format('DD/MM/YYYY')
}

const getStatusLabel = (status) => {
    const labels = {
        pending: 'Pendente',
        approved: 'Aprovado',
        rejected: 'Rejeitado'
    }
    return labels[status] || status
}

onMounted(() => {
    fetchLeaves()
    fetchEmployees()
    fetchLeaveTypes()
})
</script>

<style scoped>
.leaves-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.stat-card {
    background: white;
    padding: 1.25rem;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
}

.stat-content {
    display: flex;
    flex-direction: column;
}

.stat-label {
    font-size: 0.75rem;
    color: #64748b;
    font-weight: 600;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
}

.filters-bar {
    display: flex;
    gap: 1rem;
}

.filter-select {
    padding: 0.75rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 0.875rem;
    cursor: pointer;
}

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

.loading-state,
.empty-state {
    padding: 4rem 2rem;
    text-align: center;
}

.empty-state i {
    font-size: 4rem;
    color: #d1d5db;
    margin-bottom: 1rem;
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
}

.data-table td {
    padding: 1rem;
    border-top: 1px solid #e5e7eb;
    font-size: 0.875rem;
}

.employee-cell {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.employee-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.75rem;
}

.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
}

.status-pending {
    background: #fef3c7;
    color: #92400e;
}

.status-approved {
    background: #d1fae5;
    color: #065f46;
}

.status-rejected {
    background: #fee2e2;
    color: #991b1b;
}

.action-buttons {
    display: flex;
    gap: 0.5rem;
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
}

.btn-success:hover {
    background: #d1fae5;
    color: #10b981;
}

.btn-danger:hover {
    background: #fee2e2;
    color: #dc2626;
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
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-sm {
    max-width: 500px;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
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
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #3b82f6;
}

.detail-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.detail-group label {
    font-size: 0.75rem;
    color: #64748b;
    font-weight: 600;
}

.detail-group p {
    margin: 0;
    color: #1e293b;
    font-weight: 500;
}

.text-danger {
    color: #ef4444;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1.5rem;
    border-top: 1px solid #e5e7eb;
}

.btn-secondary {
    padding: 0.75rem 1.5rem;
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
}

.btn-secondary:hover {
    background: #f9fafb;
}

@media (max-width: 768px) {
    .form-grid {
        grid-template-columns: 1fr;
    }
}
</style>
