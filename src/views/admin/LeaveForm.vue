<template>
    <div class="leave-form-page" :key="key">
        <div class="page-header">
            <div class="header-left">
                <button @click="goBack" class="back-btn">
                    <i class="pi pi-arrow-left"></i>
                </button>
                <div>
                    <h2>{{ isEditing ? 'Editar Licença' : 'Nova Licença' }}</h2>
                    <p class="subtitle">{{ isEditing ? 'Atualize os dados da licença' : 'Crie uma nova solicitação de licença' }}</p>
                </div>
            </div>
        </div>

        <Card>
            <div v-if="loading" class="loading-state">
                <i class="pi pi-spin pi-spinner"></i>
                <p>Carregando dados...</p>
            </div>

            <form v-else @submit.prevent="submitForm" class="form">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Funcionário *</label>
                        <select v-model="form.employee_id" required :disabled="isEditing">
                            <option value="">Selecione o funcionário</option>
                            <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                                {{ emp.full_name }}
                            </option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Tipo de Licença *</label>
                        <select v-model="form.leave_type_id" required :disabled="isEditing">
                            <option value="">Selecione o tipo</option>
                            <option v-for="type in leaveTypes" :key="type.id" :value="type.id">
                                {{ type.name }}
                            </option>
                        </select>
                    </div>
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label>Data de Início *</label>
                        <input v-model="form.start_date" type="date" required :disabled="isEditing" />
                    </div>

                    <div class="form-group">
                        <label>Data de Fim *</label>
                        <input v-model="form.end_date" type="date" required :disabled="isEditing" />
                    </div>
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label>Dias Solicitados</label>
                        <input type="text" :value="calculatedDays + ' dias'" disabled class="input-disabled" />
                    </div>

                    <div class="form-group" v-if="isEditing">
                        <label>Status</label>
                        <select v-model="form.status">
                            <option value="pending">Pendente</option>
                            <option value="approved">Aprovado</option>
                            <option value="rejected">Rejeitado</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label>Motivo/Observações</label>
                    <textarea v-model="form.reason" rows="4" placeholder="Motivo da licença..." :disabled="isEditing && form.status === 'approved'"></textarea>
                </div>

                <div class="form-actions">
                    <button type="button" @click="goBack" class="btn-secondary">
                        Cancelar
                    </button>
                    <button type="submit" class="btn-primary" :disabled="saving">
                        <i class="pi" :class="saving ? 'pi-spin pi-spinner' : 'pi-check'"></i>
                        {{ saving ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar Licença') }}
                    </button>
                </div>
            </form>
        </Card>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/services/api'
import Card from '@/components/common/Card.vue'
import { useToast } from 'vue-toastification'
import dayjs from 'dayjs'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const saving = ref(false)
const loading = ref(false)
const employees = ref([])
const leaveTypes = ref([])

const isEditing = computed(() => !!route.params.id)

const form = reactive({
    employee_id: '',
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: '',
    status: 'pending'
})

const calculatedDays = computed(() => {
    if (!form.start_date || !form.end_date) return 0
    const start = dayjs(form.start_date)
    const end = dayjs(form.end_date)
    return end.diff(start, 'day') + 1
})

const goBack = () => {
    router.push('/admin/leaves')
}

const resetForm = () => {
    form.employee_id = ''
    form.leave_type_id = ''
    form.start_date = ''
    form.end_date = ''
    form.reason = ''
    form.status = 'pending'
}

const fetchEmployees = async () => {
    try {
        const { data } = await api.get('/admin/employees')
        employees.value = data.data || data
    } catch (error) {
        toast.error('Erro ao carregar funcionários')
    }
}

const fetchLeaveTypes = async () => {
    try {
        const { data } = await api.get('/admin/leave-types')
        leaveTypes.value = data.data || data
    } catch (error) {
        toast.error('Erro ao carregar tipos de licença')
    }
}

const loadLeave = async () => {
    if (!isEditing.value) return
    
    try {
        const { data } = await api.get(`/admin/leaves/${route.params.id}`)
        form.employee_id = data.employee_id
        form.leave_type_id = data.leave_type_id
        form.start_date = data.start_date
        form.end_date = data.end_date
        form.reason = data.reason || ''
        form.status = data.status
    } catch (error) {
        toast.error('Erro ao carregar licença')
        router.push('/admin/leaves')
    }
}

const submitForm = async () => {
    saving.value = true
    try {
        if (isEditing.value) {
            await api.put(`/admin/leaves/${route.params.id}`, form)
            toast.success('Licença atualizada com sucesso!')
        } else {
            const { data } = await api.post('/admin/leaves', form)
            toast.success(data.message || 'Licença criada com sucesso!')
        }
        router.push('/admin/leaves')
    } catch (error) {
        const msg = error.response?.data?.message || 'Erro ao salvar licença'
        toast.error(msg)
    } finally {
        saving.value = false
    }
}

const key = computed(() => route.fullPath)

onMounted(async () => {
    loading.value = true
    await Promise.all([fetchEmployees(), fetchLeaveTypes()])
    loading.value = false
    
    if (isEditing.value) {
        await loadLeave()
    }
})
</script>

<style scoped>
.leave-form-page {
    max-width: 800px;
    margin: 0 auto;
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    color: #64748b;
}

.loading-state i {
    font-size: 2.5rem;
    color: #3b82f6;
    margin-bottom: 1rem;
}

.loading-state p {
    font-size: 1rem;
    margin: 0;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
}

.header-left {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
}

.back-btn {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    background: white;
    color: #64748b;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.back-btn:hover {
    background: #f1f5f9;
    color: #3b82f6;
    border-color: #3b82f6;
}

.header-left h2 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 0.25rem 0;
}

.subtitle {
    color: #64748b;
    font-size: 0.95rem;
    margin: 0;
}

.form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
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
    font-size: 0.9375rem;
    transition: border-color 0.2s;
    background: white;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #3b82f6;
}

.form-group input:disabled,
.form-group select:disabled,
.form-group textarea:disabled {
    background: #f9fafb;
    color: #6b7280;
    cursor: not-allowed;
}

.input-disabled {
    background: #f3f4f6 !important;
    color: #6b7280 !important;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
}

.btn-secondary {
    padding: 0.75rem 1.5rem;
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-weight: 600;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-secondary:hover {
    background: #f9fafb;
    border-color: #d1d5db;
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
    transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

@media (max-width: 768px) {
    .form-grid {
        grid-template-columns: 1fr;
    }
}
</style>
