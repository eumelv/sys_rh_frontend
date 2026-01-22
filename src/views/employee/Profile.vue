<template>
  <div class="profile-page">
    <Card title="Meus Dados">
      <div v-if="loading" class="loading-state">
        <Loading />
      </div>

      <div v-else class="profile-content">
        <div class="profile-header">
          <div class="avatar-section">
            <div class="avatar-large">
              <img v-if="employee?.user?.avatar" :src="employee.user.avatar" alt="Avatar" />
              <div v-else class="avatar-placeholder">
                {{ employee?.first_name?.charAt(0) }}{{ employee?.last_name?.charAt(0) }}
              </div>
            </div>
            <button @click="uploadAvatar" class="btn-upload">
              <i class="pi pi-camera"></i>
              Alterar Foto
            </button>
          </div>

          <div class="info-section">
            <h2>{{ employee?.full_name }}</h2>
            <div class="info-grid">
              <div class="info-item">
                <i class="pi pi-id-card"></i>
                <span>{{ employee?.employee_number }}</span>
              </div>
              <div class="info-item">
                <i class="pi pi-envelope"></i>
                <span>{{ employee?.email }}</span>
              </div>
              <div class="info-item">
                <i class="pi pi-phone"></i>
                <span>{{ employee?.phone || 'Não informado' }}</span>
              </div>
              <div class="info-item">
                <i class="pi pi-briefcase"></i>
                <span>{{ employee?.position?.title || 'Sem cargo' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="details-grid">
          <div class="detail-card">
            <h3>Informações Profissionais</h3>
            <div class="detail-list">
              <div class="detail-row">
                <span class="label">Departamento:</span>
                <span class="value">{{ employee?.department?.name || '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Data de Admissão:</span>
                <span class="value">{{ formatDate(employee?.hire_date) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Tipo de Emprego:</span>
                <span class="value">{{ employee?.employment_type }}</span>
              </div>
            </div>
          </div>

          <div class="detail-card">
            <h3>Informações Pessoais</h3>
            <div class="detail-list">
              <div class="detail-row">
                <span class="label">Data de Nascimento:</span>
                <span class="value">{{ formatDate(employee?.date_of_birth) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Género:</span>
                <span class="value">{{ employee?.gender || '-' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Endereço:</span>
                <span class="value">{{ employee?.address || '-' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="actions-section">
          <button @click="changePassword" class="btn-secondary">
            <i class="pi pi-lock"></i>
            Alterar Senha
          </button>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import Card from '@/components/common/Card.vue'
import Loading from '@/components/common/Loading.vue'
import { useToast } from 'vue-toastification'
import dayjs from 'dayjs'

const toast = useToast()
const loading = ref(true)
const employee = ref(null)

const fetchProfile = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/employee/profile')
    employee.value = data.employee
  } catch (error) {
    toast.error('Erro ao carregar perfil')
  } finally {
    loading.value = false
  }
}

const uploadAvatar = () => {
  // TODO: Implement avatar upload
  toast.info('Funcionalidade em desenvolvimento')
}

const changePassword = () => {
  // TODO: Implement password change modal
  toast.info('Funcionalidade em desenvolvimento')
}

const formatDate = (date) => {
  return date ? dayjs(date).format('DD/MM/YYYY') : '-'
}

onMounted(() => {
  fetchProfile()
})
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-header {
  display: flex;
  gap: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.avatar-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #e5e7eb;
}

.avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 700;
}

.btn-upload {
  padding: 0.5rem 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-upload:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.info-section {
  flex: 1;
}

.info-section h2 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #6b7280;
}

.info-item i {
  color: #9ca3af;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.detail-card {
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 12px;
}

.detail-card h3 {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0 0 1rem;
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
}

.detail-row .label {
  color: #6b7280;
  font-size: 0.875rem;
}

.detail-row .value {
  font-weight: 600;
  color: #111827;
  font-size: 0.875rem;
}

.actions-section {
  display: flex;
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
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-secondary:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.loading-state {
  padding: 4rem 2rem;
  text-align: center;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
  }

  .info-grid,
  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>