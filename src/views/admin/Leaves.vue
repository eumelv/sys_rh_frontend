<template>
    <div class="leaves-page">
        <div class="page-header">
            <div class="header-left">
                <h2>Gestão de Licenças e Férias</h2>
                <p class="subtitle">Gerencie solicitações e acompanhe o saldo dos colaboradores</p>
            </div>
            <div class="header-actions">
                <button @click="goToLeaveTypes" class="btn-secondary">
                    <i class="pi pi-cog"></i>
                    Tipos de Licença
                </button>
                <button @click="goToCreate" class="btn-primary">
                    <i class="pi pi-plus"></i>
                    Nova Solicitação
                </button>
            </div>
        </div>

        <!-- Professional Balance Cards -->
        <div class="stats-grid">
            <div class="stat-card primary">
                <div class="stat-icon">
                    <i class="pi pi-calendar-plus"></i>
                </div>
                <div class="stat-content">
                    <span class="stat-label">Total Acumulado</span>
                    <span class="stat-value">{{ leaveBalance.total || 0 }}</span>
                    <small>Dias este ano</small>
                </div>
            </div>
            <div class="stat-card success">
                <div class="stat-icon">
                    <i class="pi pi-check-circle"></i>
                </div>
                <div class="stat-content">
                    <span class="stat-label">Dias Gozados</span>
                    <span class="stat-value">{{ leaveBalance.used || 0 }}</span>
                    <small>Aprovados</small>
                </div>
            </div>
            <div class="stat-card warning">
                <div class="stat-icon">
                    <i class="pi pi-clock"></i>
                </div>
                <div class="stat-content">
                    <span class="stat-label">Em Aprovação</span>
                    <span class="stat-value">{{ stats.pending || 0 }}</span>
                    <small>Pedidos pendentes</small>
                </div>
            </div>
            <div class="stat-card info">
                <div class="stat-icon">
                    <i class="pi pi-info-circle"></i>
                </div>
                <div class="stat-content">
                    <span class="stat-label">Saldo Disponível</span>
                    <span class="stat-value highlight">{{ leaveBalance.remaining || 0 }}</span>
                    <small>Dias restantes</small>
                </div>
            </div>
        </div>

        <!-- Filters & View Toggle -->
        <Card class="filters-card">
            <div class="filters-bar">
                <div class="filter-group">
                    <label>Status:</label>
                    <select v-model="statusFilter" @change="fetchLeaves" class="filter-select">
                        <option value="">Todos os Status</option>
                        <option value="pending">Pendente</option>
                        <option value="approved">Aprovado</option>
                        <option value="rejected">Rejeitado</option>
                    </select>
                </div>
                <div class="view-toggle">
                     <button :class="{ active: view === 'list' }" @click="view = 'list'">
                        <i class="pi pi-list"></i> Lista
                     </button>
                     <button :class="{ active: view === 'team' }" @click="view = 'team'">
                        <i class="pi pi-users"></i> Equipa
                     </button>
                </div>
            </div>
        </Card>

        <!-- Leaves Table -->
        <Card v-if="view === 'list'">
            <div v-if="loading" class="loading-state">
                <Loading message="Carregando licenças..." />
            </div>

            <div v-else-if="leaves.length === 0" class="empty-state">
                <i class="pi pi-calendar"></i>
                <h3>Nenhuma licença encontrada</h3>
                <p>{{ statusFilter ? 'Nenhuma licença com este status' : 'Comece criando um novo pedido de licença' }}</p>
                <button v-if="!statusFilter && leaveTypes.length > 0" @click="goToCreate" class="btn-primary">
                    <i class="pi pi-plus"></i>
                    Criar Primeira Solicitação
                </button>
            </div>

            <div v-else class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Funcionário</th>
                            <th>Tipo</th>
                            <th>Período</th>
                            <th>Dias Úteis</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="leave in leaves" :key="leave.id">
                            <td>
                                <div class="employee-cell">
                                    <div class="employee-avatar">
                                        {{ leave.employee?.first_name?.charAt(0) }}{{ leave.employee?.last_name?.charAt(0) }}
                                    </div>
                                    <span>{{ leave.employee?.full_name }}</span>
                                </div>
                            </td>
                            <td>{{ leave.leave_type?.name || 'Férias' }}</td>
                            <td>{{ formatDate(leave.start_date) }} - {{ formatDate(leave.end_date) }}</td>
                            <td>
                                <span class="days-pill">
                                    {{ leave.days }} <small>dias</small>
                                </span>
                            </td>
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

        <!-- Team View (Who is away today) -->
        <Card v-if="view === 'team'">
             <div class="team-grid">
                <div v-for="leave in currentLeaves" :key="leave.id" class="team-leave-card">
                    <div class="employee-cell">
                        <div class="employee-avatar">
                            {{ leave.employee?.first_name?.charAt(0) }}
                        </div>
                        <div class="employee-info">
                            <strong>{{ leave.employee?.full_name }}</strong>
                            <p>{{ leave.leave_type?.name }}</p>
                        </div>
                    </div>
                    <div class="leave-period">
                        Até {{ formatDate(leave.end_date) }}
                    </div>
                </div>
                <div v-if="currentLeaves.length === 0" class="empty-team">
                    Nenhum colaborador ausente hoje.
                </div>
             </div>
        </Card>

        <!-- Modals and Tooltips -->
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
                        <label>Total de Dias Úteis</label>
                        <p>{{ selectedLeave.days }} dias</p>
                    </div>
                    <div class="detail-group">
                        <label>Motivo</label>
                        <p>{{ selectedLeave.reason || 'Não informado' }}</p>
                    </div>
                    <div class="detail-group">
                        <label>Status</label>
                        <span :class="`status-badge status-${selectedLeave.status}`">
                            {{ getStatusLabel(selectedLeave.status) }}
                        </span>
                    </div>
                </div>

                <div class="modal-footer">
                    <button @click="closeDetailsModal" class="btn-secondary">Fechar</button>
                </div>
            </div>
        </div>

        <!-- Confirm Modal -->
        <ConfirmModal
            :show="showConfirmModal"
            :title="confirmModalState.title"
            :message="confirmModalState.message"
            :variant="confirmModalState.variant"
            :icon="confirmModalState.icon"
            :confirmText="confirmModalState.confirmText"
            :cancelText="confirmModalState.cancelText"
            :loading="confirmModalState.loading"
            @close="closeConfirmModal"
            @confirm="confirmModalState.action"
        />

        <!-- Rejection Modal -->
        <div v-if="showRejectModal" class="modal-overlay" @click="closeRejectModal">
            <div class="reject-modal" @click.stop>
                <div class="reject-modal-header">
                    <div class="reject-modal-icon">
                        <i class="pi pi-times-circle"></i>
                    </div>
                    <div>
                        <h3>Rejeitar Pedido</h3>
                        <p class="reject-subtitle">{{ rejectLeaveData?.employee?.full_name }}</p>
                    </div>
                </div>

                <div class="reject-modal-body">
                    <label for="reject-reason">Motivo da rejeição *</label>
                    <textarea
                        id="reject-reason"
                        v-model="rejectReason"
                        placeholder="Informe o motivo para o colaborador..."
                        rows="4"
                    ></textarea>
                </div>

                <div class="reject-modal-footer">
                    <button @click="closeRejectModal" class="btn-cancel" :disabled="rejectSubmitting">Cancelar</button>
                    <button @click="confirmReject" class="btn-reject" :disabled="rejectSubmitting || !rejectReason.trim()">
                        <i v-if="rejectSubmitting" class="pi pi-spin pi-spinner"></i>
                        {{ rejectSubmitting ? 'Processando...' : 'Rejeitar Pedido' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { adminService } from '@/services/adminService'
import Card from '@/components/common/Card.vue'
import Loading from '@/components/common/Loading.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import { useToast } from 'vue-toastification'
import dayjs from 'dayjs'

const router = useRouter()
const toast = useToast()
const loading = ref(false)
const showDetailsModal = ref(false)
const selectedLeave = ref(null)
const statusFilter = ref('')
const view = ref('list')

// Modal de confirmação
const showConfirmModal = ref(false)
const confirmModalState = reactive({
    title: '',
    message: '',
    variant: 'primary',
    icon: 'pi pi-check',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    loading: false,
    action: null
})

// Modal de rejeição
const showRejectModal = ref(false)
const rejectReason = ref('')
const rejectLeaveData = ref(null)
const rejectSubmitting = ref(false)

const openConfirmModal = (title, message, variant, icon, confirmText, action) => {
    confirmModalState.title = title
    confirmModalState.message = message
    confirmModalState.variant = variant
    confirmModalState.icon = icon
    confirmModalState.confirmText = confirmText
    confirmModalState.loading = false
    confirmModalState.action = action
    showConfirmModal.value = true
}

const closeConfirmModal = () => {
    showConfirmModal.value = false
    confirmModalState.action = null
}

const leaves = ref([])
const leaveTypes = ref([])
const leaveBalance = ref({ remaining: 0, used: 0, total: 0 })
const stats = ref({ pending: 0, approved: 0, rejected: 0 })

const currentLeaves = computed(() => {
    const today = dayjs()
    return leaves.value.filter(l => 
        l.status === 'approved' && 
        today.isAfter(dayjs(l.start_date).subtract(1, 'day')) && 
        today.isBefore(dayjs(l.end_date).add(1, 'day'))
    )
})

const goToLeaveTypes = () => router.push('/admin/leave-types')
const goToCreate = () => router.push('/admin/leaves/create')

const fetchLeaves = async () => {
    loading.value = true
    try {
        const { data } = await adminService.leaves.getAll({ status: statusFilter.value })
        leaves.value = data.data || data
        calculateStats()
        // Mocking balance for first employee to show the refined UI
        if (leaves.value.length > 0) {
            const { data: balanceData } = await adminService.leaves.getEmployeeBalance(leaves.value[0].employee_id)
            const vacationBalance = balanceData.balance.find(b => strContainsFérias(b.leave_type))
            if (vacationBalance) {
                leaveBalance.value = {
                    remaining: vacationBalance.remaining_days,
                    used: vacationBalance.used_days,
                    total: vacationBalance.total_days
                }
            }
        }
    } catch (error) {
        toast.error('Erro ao carregar licenças')
    } finally {
        loading.value = false
    }
}

const strContainsFérias = (str) => {
    return str.toLowerCase().includes('férias') || str.toLowerCase().includes('vacation')
}

const calculateStats = () => {
    stats.value = {
        pending: leaves.value.filter(l => l.status === 'pending').length,
        approved: leaves.value.filter(l => l.status === 'approved').length,
        rejected: leaves.value.filter(l => l.status === 'rejected').length
    }
}

const approveLeave = async (leave) => {
    openConfirmModal(
        'Aprovar Solicitação',
        `Deseja aprovar o pedido de ${leave.employee?.full_name}? Os dias serão descontados do saldo.`,
        'success',
        'pi pi-check',
        'Aprovar Agora',
        async () => {
            confirmModalState.loading = true
            try {
                await adminService.leaves.approve(leave.id)
                toast.success('Pedido aprovado com sucesso!')
                closeConfirmModal()
                fetchLeaves()
            } catch (error) {
                toast.error('Erro ao processar aprovação')
            } finally {
                confirmModalState.loading = false
            }
        }
    )
}

const rejectLeave = (leave) => {
    rejectLeaveData.value = leave
    rejectReason.value = ''
    showRejectModal.value = true
}

const closeRejectModal = () => {
    showRejectModal.value = false
    rejectLeaveData.value = null
}

const confirmReject = async () => {
    rejectSubmitting.value = true
    try {
        await adminService.leaves.reject(rejectLeaveData.value.id, { rejection_reason: rejectReason.value })
        toast.success('Pedido rejeitado.')
        closeRejectModal()
        fetchLeaves()
    } catch (error) {
        toast.error('Erro ao rejeitar')
    } finally {
        rejectSubmitting.value = false
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

const formatDate = (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-'

const getStatusLabel = (status) => {
    const map = { pending: 'Pendente', approved: 'Aprovado', rejected: 'Rejeitado' }
    return map[status] || status
}

onMounted(() => fetchLeaves())
</script>

<style scoped>
.leaves-page {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-left h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.25rem;
}

.subtitle {
    color: #64748b;
    font-size: 0.9rem;
}

.header-actions {
    display: flex;
    gap: 1rem;
}

.filter-select {
  appearance: none;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #111827;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236b7280'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1.25rem;
}

.filter-select:hover {
  border-color: #9ca3af;
}

.filter-select:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.filter-select:disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-primary, .btn-secondary {
    padding: 0.6rem 1.2rem;
    border-radius: 8px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-primary {
    background: #3b82f6;
    color: white;
    border: none;
}

.btn-secondary {
    background: white;
    border: 1px solid #e2e8f0;
    color: #475569;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
}

.stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    display: flex;
    gap: 1rem;
}

.stat-icon {
    width: 48px;
    height: 48px;
    background: #f1f5f9;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
}

.stat-card.primary .stat-icon { background: #dbeafe; color: #2563eb; }
.stat-card.success .stat-icon { background: #dcfce7; color: #16a34a; }
.stat-card.warning .stat-icon { background: #fef9c3; color: #ca8a04; }
.stat-card.info .stat-icon { background: #f0f9ff; color: #0891b2; }

.stat-content {
    display: flex;
    flex-direction: column;
}

.stat-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
}

.stat-value.highlight {
    color: #2563eb;
}

.filters-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.view-toggle {
    display: flex;
    background: #f1f5f9;
    padding: 0.25rem;
    border-radius: 8px;
}

.view-toggle button {
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: #64748b;
    font-size: 0.85rem;
    cursor: pointer;
}

.view-toggle button.active {
    background: white;
    color: #1e293b;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.data-table {
    width: 100%;
    border-collapse: collapse;
}

.data-table th {
    text-align: left;
    padding: 1rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    color: #64748b;
    border-bottom: 2px solid #f1f5f9;
}

.data-table td {
    padding: 1rem;
    border-bottom: 1px solid #f8fafc;
}

.employee-cell {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.employee-avatar {
    width: 32px;
    height: 32px;
    background: #e2e8f0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.75rem;
}

.days-pill {
    background: #f8fafc;
    padding: 0.2rem 0.5rem;
    border-radius: 6px;
    font-weight: 600;
}

.status-badge {
    padding: 0.2rem 0.6rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
}

.status-pending { background: #fef3c7; color: #92400e; }
.status-approved { background: #dcfce7; color: #16a34a; }
.status-rejected { background: #fee2e2; color: #991b1b; }

.action-buttons {
    display: flex;
    gap: 0.5rem;
}

.btn-icon {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-icon.btn-success { color: #16a34a; }
.btn-icon.btn-danger { color: #dc2626; }

.team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
}

.team-leave-card {
    padding: 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.employee-info p {
    font-size: 0.8rem;
    color: #64748b;
    margin: 0;
}

.leave-period {
    font-size: 0.75rem;
    color: #94a3b8;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
}

.modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    justify-content: space-between;
}

.modal-body {
    padding: 1.5rem;
}

.detail-group {
    margin-bottom: 1rem;
}

.detail-group label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
}

.modal-footer {
    padding: 1rem 1.5rem;
    background: #f8fafc;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    display: flex;
    justify-content: flex-end;
}

.reject-modal {
    background: white;
    border-radius: 12px;
    width: 400px;
    padding: 1.5rem;
}

.reject-modal-header {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.reject-modal-icon {
    font-size: 2rem;
    color: #dc2626;
}

.reject-modal-body textarea {
    width: 100%;
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    margin-top: 0.5rem;
}

.reject-modal-footer {
    margin-top: 1.5rem;
    display: flex;
    gap: 1rem;
}

.btn-reject {
    flex: 1;
    background: #dc2626;
    color: white;
    border: none;
    padding: 0.75rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
}
</style>