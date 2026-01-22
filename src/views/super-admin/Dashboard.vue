<template>
  <div class="dashboard">
    <div class="stats-grid">
      <StatCard
        label="Total de Empresas"
        :value="stats.total_companies"
        icon="pi pi-building"
        color="#3b82f6"
        :change="12"
      />
      <StatCard
        label="Empresas Ativas"
        :value="stats.active_companies"
        icon="pi pi-check-circle"
        color="#10b981"
        :change="8"
      />
      <StatCard
        label="Usuários Totais"
        :value="stats.total_users"
        icon="pi pi-users"
        color="#8b5cf6"
        :change="15"
      />
      <StatCard
        label="Assinaturas Ativas"
        :value="stats.active_subscriptions"
        icon="pi pi-star-fill"
        color="#f59e0b"
        :change="5"
      />
    </div>

    <div class="content-grid">
      <Card title="Empresas Recentes" class="recent-companies">
        <div v-if="loading" class="loading-state">
          <Loading message="Carregando dados..." />
        </div>
        <div v-else-if="recentCompanies.length === 0" class="empty-state">
          <i class="pi pi-inbox"></i>
          <p>Nenhuma empresa encontrada</p>
        </div>
        <div v-else class="companies-list">
          <div 
            v-for="company in recentCompanies" 
            :key="company.id"
            class="company-item"
          >
            <div class="company-info">
              <div class="company-logo">
                <img v-if="company.logo" :src="company.logo" :alt="company.name" />
                <div v-else class="logo-placeholder">
                  {{ company.name.charAt(0) }}
                </div>
              </div>
              <div>
                <div class="company-name">{{ company.name }}</div>
                <div class="company-email">{{ company.email }}</div>
              </div>
            </div>
            <div class="company-meta">
              <span class="plan-badge">{{ company.subscription?.plan?.name }}</span>
              <span :class="`status-badge status-${company.status}`">
                {{ company.status }}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Receita por Plano">
        <div class="revenue-chart">
          <!-- Chart component here -->
          <div class="revenue-list">
            <div 
              v-for="(revenue, plan) in revenueByPlan" 
              :key="plan"
              class="revenue-item"
            >
              <div class="plan-name">{{ plan }}</div>
              <div class="plan-stats">
                <span class="plan-count">{{ revenue.count }} empresas</span>
                <span class="plan-revenue">{{ formatCurrency(revenue.revenue) }}</span>
              </div>
            </div>
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
  total_companies: 0,
  active_companies: 0,
  total_users: 0,
  active_subscriptions: 0,
})

const recentCompanies = ref([])
const revenueByPlan = ref({})

const fetchDashboard = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/super-admin/dashboard')
    stats.value = data.stats
    recentCompanies.value = data.recent_companies
    revenueByPlan.value = data.revenue_by_plan
  } catch (error) {
    toast.error('Erro ao carregar dashboard')
  } finally {
    loading.value = false
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
  }).format(value / 100)
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

.loading-state,
.empty-state {
  padding: 3rem;
  text-align: center;
  color: #6b7280;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.companies-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.company-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
}

.company-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.company-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.company-logo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
}

.company-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
}

.company-name {
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.company-email {
  font-size: 0.875rem;
  color: #6b7280;
}

.company-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.plan-badge {
  background: #eff6ff;
  color: #1e40af;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-suspended {
  background: #fee2e2;
  color: #991b1b;
}

.revenue-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.revenue-item {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.plan-name {
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}

.plan-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.plan-count {
  color: #6b7280;
}

.plan-revenue {
  color: #10b981;
  font-weight: 600;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>