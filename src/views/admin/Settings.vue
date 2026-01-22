<template>
    <div class="settings-page">
        <div class="page-header">
            <h2>Configurações da Empresa</h2>
        </div>

        <div class="settings-container">
            <div class="settings-tabs">
                <button v-for="tab in tabs" :key="tab.id" :class="['tab-btn', { active: currentTab === tab.id }]"
                    @click="currentTab = tab.id">
                    <i :class="tab.icon"></i>
                    {{ tab.label }}
                </button>
            </div>

            <div class="settings-content">
                <!-- General Settings -->
                <div v-if="currentTab === 'general'" class="tab-pane">
                    <Card title="Informações Gerais">
                        <form @submit.prevent="saveGeneralSettings" class="settings-form">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>Nome da Empresa</label>
                                    <input v-model="form.name" type="text" />
                                </div>
                                <div class="form-group">
                                    <label>Email de Contato</label>
                                    <input v-model="form.email" type="email" />
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Website</label>
                                <input v-model="form.website" type="url" />
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn-primary" :disabled="saving">
                                    Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>

                <!-- Localization Settings -->
                <div v-if="currentTab === 'localization'" class="tab-pane">
                    <Card title="Localização">
                        <form @submit.prevent="" class="settings-form">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>País</label>
                                    <select v-model="form.country">
                                        <option value="AO">Angola</option>
                                        <option value="PT">Portugal</option>
                                        <option value="BR">Brasil</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Cidade</label>
                                    <input v-model="form.city" type="text" />
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Morada</label>
                                <input v-model="form.address" type="text" />
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn-primary">Salvar Localização</button>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import Card from '@/components/common/Card.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const authStore = useAuthStore()
const toast = useToast()
const saving = ref(false)
const currentTab = ref('general')

const tabs = [
    { id: 'general', label: 'Geral', icon: 'pi pi-cog' },
    { id: 'localization', label: 'Localização', icon: 'pi pi-map-marker' },
    { id: 'notifications', label: 'Notificações', icon: 'pi pi-bell' },
]

const form = reactive({
    name: '',
    email: '',
    website: '',
    country: 'AO',
    city: '',
    address: ''
})

const saveGeneralSettings = async () => {
    saving.value = true
    // Simulate API call
    setTimeout(() => {
        toast.success('Configurações atualizadas com sucesso!')
        saving.value = false
    }, 1000)
}

onMounted(() => {
    if (authStore.company) {
        Object.assign(form, {
            name: authStore.company.name,
            email: authStore.company.email,
            website: authStore.company.website,
            // ... populate other fields
        })
    }
})
</script>

<style scoped>
.settings-page {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.settings-container {
    display: grid;
    grid-template-columns: 250px 1fr;
    gap: 2rem;
    align-items: start;
}

.settings-tabs {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
}

.tab-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    border: none;
    background: white;
    color: #64748b;
    cursor: pointer;
    text-align: left;
    font-weight: 500;
    border-bottom: 1px solid #f1f5f9;
    transition: all 0.2s;
}

.tab-btn:hover {
    background: #f8fafc;
    color: #1e293b;
}

.tab-btn.active {
    background: #eff6ff;
    color: #3b82f6;
    border-left: 3px solid #3b82f6;
}

.tab-btn i {
    font-size: 1.1rem;
}

.settings-form {
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
    font-weight: 600;
    font-size: 0.875rem;
    color: #374151;
}

.form-group input,
.form-group select {
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
    outline: none;
    border-color: #3b82f6;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
}

.btn-primary {
    padding: 0.75rem 1.5rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
}

.btn-primary:hover {
    background: #2563eb;
}

@media (max-width: 1024px) {
    .settings-container {
        grid-template-columns: 1fr;
    }
}
</style>
