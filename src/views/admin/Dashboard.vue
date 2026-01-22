<template>
  <div class="dashboard">
    <div class="stats-grid">
      <StatCard
        label="Total de Funcionários"
        :value="stats.total_employees"
        icon="pi pi-users"
        color="#3b82f6"
      />
      <StatCard
        label="Funcionários Ativos"
        :value="stats.active_employees"
        icon="pi pi-check-circle"
        color="#10b981"
      />
      <StatCard
        label="Utilizadores"
        :value="stats.total_users"
        icon="pi pi-user"
        color="#8b5cf6"
      />
      <StatCard
        label="Departamentos"
        :value="stats.total_departments"
        icon="pi pi-sitemap"
        color="#f59e0b"
      />
    </div>

    <div class="content-grid">
      <Card title="Presenças Hoje" class="attendance-card">
        <div v-if="loading">
          <Loading message="Carregando..." />
        </div>
        <div v-else class="attendance-summary">
          <div class="attendance-stat">
            <div class="stat-circle" style="background: #6b7280">
              <span>{{ attendanceToday.not_checked }}</span>
            </div>
            <div class="stat-label">Sem registo</div>
          </div>
        </div>
      </Card>

      <Card title="Licenças Pendentes">
        <div v-if="pendingLeaves === 0" class="empty-state-small">
          <i class="pi pi-check-circle"></i>
          <p>Nenhuma licença pendente</p>
        </div>
        <div v-else class="pending-count">
          <span class="count-number">{{ pendingLeaves }}</span>
          <span class="count-label">licenças aguardando aprovação</span>
          <button class="btn-link" @click="$router.push('/admin/leaves')">
            Ver todas
          </button>
        </div>
      </Card>
    </div>

    <div class="recent-section">
      <Card title="Funcionários Recentes">
        <div class="employees-list">
          <div 
            v-for="employee in recentEmployees" 
            :key="employee.id"
            class="employee-item"
          >
            <div class="employee-info">
              <div class="employee-avatar">
                {{ employee.first_name.charAt(0) }}{{ employee.last_name.charAt(0) }}
              </div>
              <div>
                <div class="employee-name">{{ employee.full_name }}</div>
                <div class="employee-meta">
                  {{ employee.department?.name || 'Sem departamento' }} • 
                  {{ employee.position?.title || 'Sem cargo' }}
                </div>
              </div>
            </div>
            <span class="employee-number">{{ employee.employee_number }}</span>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import Card from '@/components/common/Card.vue'
import StatCard from '@/components/common/StatCard.vue'
import Loading from '@/components/common/Loading.vue'
import { useToast } from 'vue-toastification'

const toast = useToast()
const loading = ref(true)

const stats = ref({
  total_employees: 0,
  active_employees: 0,
  total_users: 0,
  total_departments: 0,
})

const attendanceToday = ref({
  present: 0,
  absent: 0,
  not_checked: 0,
})

const pendingLeaves = ref(0)
const recentEmployees = ref([])

const fetchDashboard = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/admin/dashboard')
    stats.value = data.stats
    attendanceToday.value = data.attendance_today
    pendingLeaves.value = data.pending_leaves
    recentEmployees.value = data.recent_employees
  } catch (error) {
    toast.error('Erro ao carregar dashboard')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboard()
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.attendance-summary {
  display: flex;
  justify-content: space-around;
  padding: 2rem 0;
}

.attendance-stat {
  text-align: center;
}

.stat-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.75rem;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.empty-state-small {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.empty-state-small i {
  font-size: 2rem;
  color: #10b981;
  margin-bottom: 0.5rem;
}

.pending-count {
  text-align: center;
  padding: 2rem;
}

.count-number {
  display: block;
  font-size: 3rem;
  font-weight: 700;
  color: #f59e0b;
  margin-bottom: 0.5rem;
}

.count-label {
  display: block;
  color: #6b7280;
  margin-bottom: 1rem;
}

.btn-link {
  background: none;
  border: none;
  color: #3b82f6;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}

.employees-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.employee-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
}

.employee-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.employee-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 700;
}

.employee-name {
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.employee-meta {
  font-size: 0.875rem;
  color: #6b7280;
}

.employee-number {
  font-size: 0.875rem;
  color: #6b7280;
  font-family: monospace;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>