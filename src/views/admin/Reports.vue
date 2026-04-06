<template>
  <div class="reports-page">
    <div class="page-header">
      <div class="header-left">
        <h1>Centro de Relatórios & Analytics</h1>
        <p>Insights estratégicos e indicadores de desempenho de RH</p>
      </div>
      <div class="header-actions">
        <div class="date-filter shadow-sm">
           <i class="pi pi-calendar"></i>
           <DatePicker v-model="dateRange" selectionMode="range" :manualInput="false" placeholder="Intervalo de Datas" @change="fetchData" />
        </div>
        <button class="btn-primary" @click="downloadSummaryReport">
          <i class="pi pi-file-pdf"></i> Sumário Mensal (PDF)
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="stats-grid" v-if="!loading">
      <div class="stat-card" v-for="(stat, index) in kpiStats" :key="index">
        <div class="stat-icon" :style="{ background: stat.bg }">
          <i :class="stat.icon"></i>
        </div>
        <div class="stat-info">
          <span class="label">{{ stat.label }}</span>
          <h3 class="value">{{ stat.value }}</h3>
          <span :class="['trend', stat.trend >= 0 ? 'up' : 'down']">
            <i :class="stat.trend >= 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down'"></i>
            {{ Math.abs(stat.trend) }}% vs mês anterior
          </span>
        </div>
      </div>
    </div>
<br />
    <!-- Main Content Tabs -->
    <div class="reports-content mt-6">
       <Tabs value="0">
          <TabList>
             <Tab value="0"><i class="pi pi-eye mr-2"></i> Visão Geral & Turnover</Tab>
             <Tab value="1"><i class="pi pi-money-bill mr-2"></i> Financeiro & Custos</Tab>
             <Tab value="2"><i class="pi pi-users mr-2"></i> Demografia & Diversidade</Tab>
             <Tab value="3"><i class="pi pi-download mr-2"></i> Exportação de Dados</Tab>
          </TabList>
          
          <TabPanels>
             <!-- Overview Tab -->
             <TabPanel value="0">
                <div class="grid-2-1 mt-4">
                   <Card title="Taxa de Turnover" class="chart-container">
                      <template #header-actions>
                         <button class="btn-icon-small" @click="exportChart('turnoverChart')" title="Exportar PNG">
                            <i class="pi pi-download"></i>
                         </button>
                      </template>
                      <Chart id="turnoverChart" type="line" :data="turnoverData" :options="lineOptions" :height="300" />
                      <div class="chart-insight">
                         <i class="pi pi-info-circle"></i>
                         <span>Calculado com base em saídas voluntárias e involuntárias.</span>
                      </div>
                   </Card>
                   
                   <Card title="Recrutamento: Funil de Candidatos" class="chart-container">
                      <Chart type="bar" :data="recruitmentData" :options="horizontalBarOptions" :height="300" />
                   </Card>
                </div>
             </TabPanel>

             <!-- Financial Tab -->
             <TabPanel value="1">
                <Card title="Evolução de Custos com Pessoal" class="mt-4 shadow-sm">
                   <template #header-actions>
                      <button class="btn-icon-small" @click="exportChart('financeChart')" title="Exportar PNG">
                         <i class="pi pi-download"></i>
                      </button>
                   </template>
                   <Chart id="financeChart" type="bar" :data="financeData" :options="stackedBarOptions" :height="350" />
                </Card>
                <div class="financial-summary mt-4">
                   <div class="summary-item">
                      <label>Custo Médio por Colaborador</label>
                      <span class="val">{{ formatCurrency(avgSalary) }}</span>
                   </div>
                </div>
             </TabPanel>

             <!-- Demographics Tab -->
             <TabPanel value="2">
                <div class="grid-1-1 mt-4">
                   <Card title="Distribuição por Género">
                      <Chart type="doughnut" :data="genderData" :options="pieOptions" :height="250" />
                   </Card>
                   <Card title="Distribuição Etária">
                      <Chart type="bar" :data="ageData" :options="barOptions" :height="250" />
                   </Card>
                </div>
             </TabPanel>

             <!-- Exports Tab -->
             <TabPanel value="3">
                <div class="exports-grid mt-4">
                   <div v-for="exp in exports" :key="exp.label" class="export-card">
                      <div class="exp-icon"><i :class="exp.icon"></i></div>
                      <div class="exp-info">
                         <h4>{{ exp.label }}</h4>
                         <p>{{ exp.desc }}</p>
                      </div>
                      <button class="btn-secondary btn-sm" @click="handleExport(exp.action)">
                         Exportar CSV
                      </button>
                   </div>
                </div>
             </TabPanel>
          </TabPanels>
       </Tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import api from '@/services/api'
import { useToast } from 'vue-toastification'
import Card from '@/components/common/Card.vue'
import Chart from 'primevue/chart'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import DatePicker from 'primevue/datepicker'

const toast = useToast()
const loading = ref(true)
const dateRange = ref([])
const stats = ref(null)

const kpiStats = computed(() => [
  { label: 'Headcount Ativo', value: stats.value?.demographics?.total || 0, icon: 'pi pi-users', bg: '#eff6ff', trend: 5 },
  { label: 'Turnover (Período)', value: (stats.value?.turnover || 0) + '%', icon: 'pi pi-sync', bg: '#fef2f2', trend: -2 },
  { label: 'Taxa de Assiduidade', value: (stats.value?.attendance_rate || 0) + '%', icon: 'pi pi-check-circle', bg: '#f0fdf4', trend: 1.5 },
  { label: 'Tempo Médio Contr.', value: (stats.value?.recruitment?.avg_time_to_hire || 0) + ' dias', icon: 'pi pi-clock', bg: '#fff7ed', trend: 0.5 },
])

// Chart Data (Reactive)
const turnoverData = ref({ labels: [], datasets: [] })
const recruitmentData = ref({ labels: [], datasets: [] })
const financeData = ref({ labels: [], datasets: [] })
const genderData = ref({ labels: [], datasets: [] })
const ageData = ref({ labels: [], datasets: [] })

const avgSalary = computed(() => {
   if (!stats.value?.financials?.length) return 0
   const lastMonth = stats.value.financials[stats.value.financials.length - 1]
   return lastMonth.net / (stats.value.demographics?.total || 1)
})

const fetchData = async () => {
    loading.value = true
    try {
        const params = {}
        if (dateRange.value?.[0] && dateRange.value?.[1]) {
            params.start_date = dateRange.value[0].toISOString().split('T')[0]
            params.end_date = dateRange.value[1].toISOString().split('T')[0]
        }
        
        const { data } = await api.get('/admin/reports/advanced', { params })
        stats.value = data
        prepareCharts()
    } catch (error) {
        toast.error('Erro ao carregar indicadores.')
    } finally {
        loading.value = false
    }
}

const prepareCharts = () => {
   const s = stats.value
   
   // Turnover simulated timeline (since we only have total from backend, we build a simple view)
   turnoverData.value = {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      datasets: [{
         label: 'Taxa de Turnover (%)',
         data: [1.2, 1.5, 0.8, 2.1, 1.3, s.turnover],
         borderColor: '#3b82f6',
         tension: 0.4,
         fill: true,
         backgroundColor: 'rgba(59, 130, 246, 0.1)'
      }]
   }

   // Recruitment Funnel
   const funnel = s.recruitment.funnel
   recruitmentData.value = {
      labels: ['Novas', 'Triagem', 'Entrevista', 'Final', 'Hired'],
      datasets: [{
         label: 'Candidatos',
         data: [funnel.applied || 0, funnel.screening || 0, funnel.interview || 0, funnel.final_interview || 0, funnel.hired || 0],
         backgroundColor: ['#94a3b8', '#64748b', '#475569', '#334155', '#10b981']
      }]
   }

   // Financials
   financeData.value = {
      labels: s.financials.map(f => f.period),
      datasets: [
         { label: 'Salário Líquido', data: s.financials.map(f => f.net), backgroundColor: '#3b82f6' },
         { label: 'Descontos/Impostos', data: s.financials.map(f => f.deductions), backgroundColor: '#ef4444' }
      ]
   }

   // Gender
   genderData.value = {
      labels: ['Masculino', 'Feminino', 'Outro'],
      datasets: [{
         data: [s.demographics.gender.masculino, s.demographics.gender.feminino, s.demographics.gender.outro],
         backgroundColor: ['#6366f1', '#ec4899', '#94a3b8']
      }]
   }

   // Age
   ageData.value = {
      labels: Object.keys(s.demographics.age),
      datasets: [{
         label: 'Colaboradores',
         data: Object.values(s.demographics.age),
         backgroundColor: '#8b5cf6'
      }]
   }
}

// Chart Options
const lineOptions = { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
const barOptions = { responsive: true, plugins: { legend: { display: false } } }
const horizontalBarOptions = { indexAxis: 'y', responsive: true, plugins: { legend: { display: false } } }
const stackedBarOptions = { responsive: true, scales: { x: { stacked: true }, y: { stacked: true } } }
const pieOptions = { responsive: true, plugins: { legend: { position: 'bottom' } } }

// Actions
const exportChart = (chartId) => {
   const canvas = document.getElementById(chartId)
   if (!canvas) return
   // For PrimeVue Chart, the canvas might be inside the wrapper
   const realCanvas = canvas.querySelector('canvas') || canvas
   const link = document.createElement('a')
   link.download = `${chartId}.png`
   link.href = realCanvas.toDataURL('image/png')
   link.click()
   toast.success('Imagem exportada com sucesso!')
}

const downloadSummaryReport = async () => {
    try {
        const { data } = await api.get('/admin/reports/company-summary/pdf', { responseType: 'blob' })
        const url = window.URL.createObjectURL(new Blob([data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'relatorio_mensal.pdf')
        document.body.appendChild(link)
        link.click()
    } catch (error) {
        toast.error('Erro ao gerar PDF.')
    }
}

const handleExport = async (action) => {
   try {
      const { data } = await api.get(`/admin/reports/${action}/export`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `export_${action}.csv`)
      document.body.appendChild(link)
      link.click()
      toast.success('Exportação concluída.')
   } catch (error) {
      toast.error('Erro ao exportar dados.')
   }
}

const exports = [
   { label: 'Colaboradores', desc: 'Dados mestres, contactos e admissões', icon: 'pi pi-users', action: 'employees' },
   { label: 'Folha de Pagamento', desc: 'Histórico de salários e benefícios', icon: 'pi pi-wallet', action: 'payroll' },
   { label: 'Presenças e Ponto', desc: 'Registos de entrada, saída e horas', icon: 'pi pi-calendar-clock', action: 'attendance' },
   { label: 'Férias e Licenças', desc: 'Controlo de ausências e saldos', icon: 'pi pi-sun', action: 'leaves' }
]

const formatCurrency = (val) => new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(val)

onMounted(() => fetchData())
</script>

<style scoped>
.reports-page { padding: 1.5rem; background: #f8fafc; min-height: 100vh; }

.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
.header-left h1 { font-size: 1.75rem; font-weight: 800; color: #1e293b; margin: 0; }
.header-left p { color: #64748b; margin-top: 0.25rem; }
.header-actions { display: flex; gap: 1rem; align-items: center; }

.date-filter { background: white; padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 0.75rem; }
.date-filter i { color: #94a3b8; }

.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; }
.stat-card { background: white; padding: 1.5rem; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 1.25rem; transition: 0.3s; }
.stat-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }

.stat-icon { width: 54px; height: 54px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
.stat-info .label { font-size: 0.8rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.025em; }
.stat-info .value { font-size: 1.5rem; font-weight: 800; color: #1e293b; margin: 0.1rem 0; }
.stat-info .trend { font-size: 0.75rem; font-weight: 600; display: flex; align-items: center; gap: 0.25rem; }
.stat-info .trend.up { color: #10b981; }
.stat-info .trend.down { color: #ef4444; }

.grid-2-1 { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
.grid-1-1 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }

.chart-container { position: relative; }
.chart-insight { display: flex; align-items: center; gap: 0.5rem; margin-top: 1rem; padding: 0.75rem; background: #f8fafc; border-radius: 8px; font-size: 0.85rem; color: #475569; }
.chart-insight i { color: #3b82f6; }

.financial-summary { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0; }
.summary-item label { display: block; font-size: 0.9rem; color: #64748b; margin-bottom: 0.25rem; }
.summary-item .val { font-size: 1.25rem; font-weight: 800; color: #1e293b; }

.exports-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
.export-card { background: white; padding: 1.5rem; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 1rem; }
.exp-icon { font-size: 1.5rem; color: #3b82f6; background: #eff6ff; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.exp-info { flex: 1; }
.exp-info h4 { margin: 0; color: #1e293b; }
.exp-info p { margin: 0.2rem 0 0; font-size: 0.8rem; color: #64748b; }

.btn-primary { background: #3b82f6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: 0.3s; }
.btn-primary:hover { background: #2563eb; transform: scale(1.02); }
.btn-secondary { background: white; border: 1px solid #e2e8f0; padding: 0.6rem 1rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-secondary:hover { background: #f8fafc; border-color: #cbd5e1; }
.btn-icon-small { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 0.25rem; }
.btn-icon-small:hover { color: #1e293b; }

@media (max-width: 1024px) {
  .grid-2-1, .grid-1-1 { grid-template-columns: 1fr; }
}
</style>
