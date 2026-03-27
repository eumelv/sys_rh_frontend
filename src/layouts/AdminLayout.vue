<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'collapsed': isCollapsed }">
      <div class="sidebar-header">
        <div class="logo">
          <i class="pi pi-briefcase"></i>
          <span v-if="!isCollapsed">SYS RH</span>
        </div>
        <button class="toggle-btn" @click="isCollapsed = !isCollapsed">
          <i :class="isCollapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-left'"></i>
        </button>
      </div>

<nav class="sidebar-nav">
  <router-link to="/admin/dashboard" class="nav-item">
    <i class="pi pi-home"></i>
    <span v-if="!isCollapsed">Dashboard</span>
  </router-link>
  
  <router-link to="/admin/employees" class="nav-item">
    <i class="pi pi-users"></i>
    <span v-if="!isCollapsed">Funcionários</span>
  </router-link>
  
  <router-link to="/admin/departments" class="nav-item">
    <i class="pi pi-sitemap"></i>
    <span v-if="!isCollapsed">Departamentos</span>
  </router-link>
  
  <router-link to="/admin/positions" class="nav-item">
    <i class="pi pi-briefcase"></i>
    <span v-if="!isCollapsed">Cargos</span>
  </router-link>

  <router-link to="/admin/requests" class="nav-item">
    <i class="pi pi-inbox"></i>
    <span v-if="!isCollapsed">Solicitações</span>
  </router-link>
  
  <router-link to="/admin/leaves" class="nav-item">
    <i class="pi pi-calendar"></i>
    <span v-if="!isCollapsed">Licenças</span>
  </router-link>

  <router-link to="/admin/announcements" class="nav-item">
    <i class="pi pi-megaphone"></i>
    <span v-if="!isCollapsed">Comunicados</span>
  </router-link>

  <router-link to="/admin/documents" class="nav-item">
    <i class="pi pi-file"></i>
    <span v-if="!isCollapsed">Documentos</span>
  </router-link>
  
  <router-link to="/admin/users" class="nav-item">
    <i class="pi pi-user-plus"></i>
    <span v-if="!isCollapsed">Utilizadores</span>
  </router-link>
  
  <router-link to="/admin/payroll" class="nav-item">
    <i class="pi pi-money-bill"></i>
    <span v-if="!isCollapsed">Folha Salarial</span>
  </router-link>
  
  <router-link to="/admin/recruitment" class="nav-item">
    <i class="pi pi-search-plus"></i>
    <span v-if="!isCollapsed">Recrutamento</span>
  </router-link>

  <!-- ✅ MODIFICAR ESTA SEÇÃO - Adicionar submenu -->
  <div class="nav-group">
    <div class="nav-item-parent" @click="toggleSubmenu('attendance')">
      <div class="nav-item-content">
        <i class="pi pi-clock"></i>
        <span v-if="!isCollapsed">Presenças</span>
      </div>
      <i v-if="!isCollapsed" class="pi pi-chevron-down submenu-icon" :class="{ rotated: openSubmenus.attendance }"></i>
    </div>
    
    <div v-if="openSubmenus.attendance" class="submenu">
      <router-link to="/admin/attendance" class="nav-item submenu-item">
        <i class="pi pi-list"></i>
        <span v-if="!isCollapsed">Registros</span>
      </router-link>
      <router-link to="/admin/attendance/justifications" class="nav-item submenu-item">
        <i class="pi pi-file-check"></i>
        <span v-if="!isCollapsed">Justificativas</span>
        <span v-if="pendingJustifications > 0 && !isCollapsed" class="badge">{{ pendingJustifications }}</span>
      </router-link>
    </div>
  </div>

  <router-link to="/admin/work-schedules" class="nav-item">
    <i class="pi pi-calendar-clock"></i>
    <span v-if="!isCollapsed">Horários</span>
  </router-link>
  
  <router-link to="/admin/settings" class="nav-item">
    <i class="pi pi-cog"></i>
    <span v-if="!isCollapsed">Configurações</span>
  </router-link>
</nav>

      <div class="sidebar-footer">
        <button class="nav-item logout-btn" @click="logout">
          <i class="pi pi-sign-out"></i>
          <span v-if="!isCollapsed">Sair</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <header class="header">
        <div class="header-left">
          <h2>{{ currentPageTitle }}</h2>
        </div>
        <div class="header-right">
          <a href="/careers" target="_blank" class="careers-link" title="Portal de Vagas">
            <i class="pi pi-external-link"></i>
            <span>Portal Público</span>
          </a>
          <div class="company-badge" v-if="authStore.company">
            {{ authStore.company.name }}
          </div>
          <div class="user-profile">
            <div class="user-avatar">
              {{ authStore.user?.name?.charAt(0) }}
            </div>
            <div class="user-info">
              <span class="user-name">{{ authStore.user?.name }}</span>
              <span class="user-role">{{ getRoleLabel }}</span>
            </div>
          </div>
        </div>
      </header>

      <div class="content-body">
        <slot>
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </slot>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { adminService } from '@/services/adminService'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()


const isCollapsed = ref(false)
const openSubmenus = ref({
  attendance: false
})
const pendingJustifications = ref(0)

// Toggle sidebar
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

// Toggle submenu
const toggleSubmenu = (menu) => {
  openSubmenus.value[menu] = !openSubmenus.value[menu]
}

// Carregar contagem de justificativas pendentes
const loadPendingJustifications = async () => {
  try {
    const { data } = await adminService.attendanceJustifications.getStats()
    pendingJustifications.value = data.pending || 0
  } catch (error) {
    console.error('Erro ao carregar justificativas pendentes:', error)
  }
}
const currentPageTitle = computed(() => {
  const titles = {
    'AdminDashboard': 'Dashboard',
    'Employees': 'Gestão de Funcionários',
    'EmployeeDetail': 'Detalhes do Funcionário',
    'Departments': 'Departamentos',
    'Positions': 'Cargos',
    'AdminRequests': 'Solicitações dos Colaboradores',
    'AdminLeaves': 'Gestão de Licenças e Férias',
    'AdminLeaveTypes': 'Tipos de Licença',
    'AdminAnnouncements': 'Comunicados',
    'AdminDocuments': 'Documentos',
    'Users': 'Gestão de Utilizadores',
    'Payroll': 'Processamento Salarial',
    'Recruitment': 'Recrutamento & Seleção',
    'Leaves': 'Gestão de Licenças',
    'Attendance': 'Gestão de Presenças',
    'AttendanceJustifications': 'Justificativas de Ponto', 
    'WorkSchedules': 'Horários de Trabalho',
    'Settings': 'Configurações da Empresa',
  }
  return titles[route.name] || 'HR System'
})
const getRoleLabel = computed(() => {
  if (authStore.isSuperAdmin) return 'Super Admin'
  if (authStore.isAdmin) return 'Administrador'
  return 'Utilizador'
})


const logout = async () => {
  if (confirm('Tem certeza que deseja sair?')) {
    await authStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
}

.sidebar {
  width: 260px;
  background-color: #1e293b;
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: sticky;
  top: 0;
  height: 100vh;
}.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow-y: auto; /* ✅ ADICIONAR SCROLL */
  overflow-x: hidden;
}

/* ✅ ESTILIZAR SCROLLBAR */
.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  font-size: 1.25rem;
}

.logo i {
  font-size: 1.5rem;
  color: #3b82f6;
}

.toggle-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
}

.toggle-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  color: #94a3b8;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
}

.nav-item i {
  font-size: 1.25rem;
  min-width: 24px;
}

.nav-item:hover,
.nav-item.router-link-active {
  background-color: rgba(255, 255, 255, 0.05);
  color: white;
}
/* Submenu */
.nav-group {
  display: flex;
  flex-direction: column;
}

.nav-item-parent {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 0.5rem;
  margin: 0.125rem 0.5rem;
}

.nav-item-parent:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.nav-item-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.submenu-icon {
  font-size: 0.875rem;
  transition: transform 0.3s;
}

.submenu-icon.rotated {
  transform: rotate(180deg);
}

.submenu {
  display: flex;
  flex-direction: column;
  padding-left: 1rem;
  margin-bottom: 0.5rem;
}

.submenu-item {
  padding: 0.625rem 1rem 0.625rem 2.5rem !important;
  font-size: 0.9375rem;
  position: relative;
}

.submenu-item::before {
  content: '';
  position: absolute;
  left: 1.5rem;
  top: 50%;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.5;
}

.submenu-item.router-link-active::before {
  width: 6px;
  height: 6px;
  opacity: 1;
}

.badge {
  background: #ef4444;
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  margin-left: auto;
}
.nav-item.router-link-active {
  color: white;
  background-color: #3b82f6;
}

.sidebar-footer {
  padding: 1rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  color: #ef4444;
}

.logout-btn:hover {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.header {
  height: 70px;
  background-color: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.company-badge {
  background-color: #f1f5f9;
  color: #475569;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.careers-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  transition: transform 0.2s;
}

.careers-link:hover {
  transform: translateY(-2px);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}

.user-role {
  font-size: 0.75rem;
  color: #64748b;
}

.content-body {
  padding: 2rem;
  flex: 1;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    z-index: 100;
    left: -260px;
  }

  .sidebar.mobile-open {
    left: 0;
  }
}
</style>
