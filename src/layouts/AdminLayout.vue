<template>
  <div class="admin-layout">
    <!-- Mobile Overlay -->
    <div v-if="isMobileMenuOpen" class="sidebar-overlay" @click="isMobileMenuOpen = false"></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'collapsed': isCollapsed, 'mobile-open': isMobileMenuOpen }">
      <div class="sidebar-header">
        <div class="logo">
          <img src="/images/contentlogo_branco.png" alt="Logo" class="auth-logo" />
          
        </div>
       <!-- 
         <button class="toggle-btn" @click="isCollapsed = !isCollapsed">
          <i :class="isCollapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-left'"></i>
        </button> -->
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
  
  <router-link v-if="!isFinance" to="/admin/departments" class="nav-item">
    <i class="pi pi-sitemap"></i>
    <span v-if="!isCollapsed">Departamentos</span>
  </router-link>
  
  <router-link v-if="!isFinance" to="/admin/positions" class="nav-item">
    <i class="pi pi-briefcase"></i>
    <span v-if="!isCollapsed">Cargos</span>
  </router-link>

  <!-- Submenu Licenças -->
  <div v-if="!isFinance" class="nav-group">
    <div class="nav-item-parent" @click="toggleSubmenu('leaves')">
      <div class="nav-item-content">
        <i class="pi pi-calendar"></i>
        <span v-if="!isCollapsed">Licenças</span>
      </div>
      <i v-if="!isCollapsed" class="pi pi-chevron-down submenu-icon" :class="{ rotated: openSubmenus.leaves }"></i>
    </div>
    
    <div v-if="openSubmenus.leaves" class="submenu">
      <router-link to="/admin/leave-types" class="nav-item submenu-item">
        <i class="pi pi-tags"></i>
        <span v-if="!isCollapsed">Tipos de Licença</span>
      </router-link>
      <router-link to="/admin/leaves" class="nav-item submenu-item">
        <i class="pi pi-calendar-plus"></i>
        <span v-if="!isCollapsed">Gerir Licenças</span>
      </router-link>
    </div>
  </div>

  <router-link v-if="!isFinance && !isHR" to="/admin/announcements" class="nav-item">
    <i class="pi pi-megaphone"></i>
    <span v-if="!isCollapsed">Comunicados</span>
  </router-link>

  <router-link v-if="!isFinance" to="/admin/documents" class="nav-item">
    <i class="pi pi-file"></i>
    <span v-if="!isCollapsed">Documentos</span>
  </router-link>
  
  <router-link v-if="!isFinance && !isHR" to="/admin/users" class="nav-item">
    <i class="pi pi-user-plus"></i>
    <span v-if="!isCollapsed">Utilizadores</span>
  </router-link>
  
  <router-link to="/admin/payroll" class="nav-item">
    <i class="pi pi-money-bill"></i>
    <span v-if="!isCollapsed">Folha Salarial</span>
  </router-link>
  
  <router-link v-if="!isFinance" to="/admin/recruitment" class="nav-item">
    <i class="pi pi-search-plus"></i>
    <span v-if="!isCollapsed">Recrutamento</span>
  </router-link>

  <router-link v-if="!isFinance" to="/admin/reports" class="nav-item">
    <i class="pi pi-chart-bar"></i>
    <span v-if="!isCollapsed">Relatórios</span>
  </router-link>

  <!-- ✅ MODIFICAR ESTA SEÇÃO - Adicionar submenu -->
  <div v-if="isAttendanceEnabled" class="nav-group">
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
      <router-link to="/admin/attendance/map" class="nav-item submenu-item">
        <i class="pi pi-calendar"></i>
        <span v-if="!isCollapsed">Mapa de Faltas</span>
      </router-link>
    </div>
  </div>

  <router-link v-if="!isFinance" to="/admin/work-schedules" class="nav-item">
    <i class="pi pi-calendar-clock"></i>
    <span v-if="!isCollapsed">Horários</span>
  </router-link>
  
  <router-link v-if="!isFinance && !isHR" to="/admin/settings" class="nav-item">
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
          <button class="mobile-menu-btn" @click="isMobileMenuOpen = true">
            <i class="pi pi-bars"></i>
          </button>
          <h2>{{ currentPageTitle }}</h2>
        </div>
        <div class="header-right">
          <NotificationBell />
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
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <!-- Logout Confirmation Modal -->
    <div v-if="showLogoutModal" class="modal-overlay" @click="showLogoutModal = false">
      <div class="modal-content logout-modal" @click.stop>
        <div class="modal-icon">
          <i class="pi pi-exclamation-triangle"></i>
        </div>
        <h3>Confirmar Saída</h3>
        <p>Tem a certeza que deseja encerrar a sua sessão no sistema?</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showLogoutModal = false">Cancelar</button>
          <button class="btn-confirm" @click="confirmLogout">
            <i class="pi pi-sign-out"></i>
            Sair Agora
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NotificationBell from '@/components/layout/NotificationBell.vue'
import { adminService } from '@/services/adminService'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const isAttendanceEnabled = computed(() => {
  return authStore.company?.attendance_enabled !== false
})


const isCollapsed = ref(false)
const isMobileMenuOpen = ref(false)
const openSubmenus = ref({
  attendance: route.path.startsWith('/admin/attendance'),
  leaves: route.path.startsWith('/admin/leaves')
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
    'AdminReports': 'Relatórios & Analytics',
  }
  return titles[route.name] || 'HR System'
})
const getRoleLabel = computed(() => {
  const role = authStore.user?.roles?.[0]?.name
  
  const labels = {
    'super-admin': 'Super Admin',
    'admin': 'Administrador',
    'manager': 'Gestor',
    'finance': 'Financeiro',
    'hr': 'Recursos Humanos',
    'employee': 'Colaborador'
  }

  return labels[role] || 'Utilizador'
})

const isFinance = computed(() => {
  // O cargo no DB é 'finance'
  const roles = authStore.user?.roles || []
  return roles.some(role => role.name === 'finance')
})

const isHR = computed(() => {
  // O cargo no DB é 'hr'
  const roles = authStore.user?.roles || []
  return roles.some(role => role.name === 'hr')
})

// Close mobile menu on route change
watch(() => route.path, (path) => {
  isMobileMenuOpen.value = false
  if (path.startsWith('/admin/attendance')) {
    openSubmenus.value.attendance = true
  }
})


const showLogoutModal = ref(false)

const logout = () => {
  showLogoutModal.value = true
}

const confirmLogout = async () => {
  await authStore.logout()
  router.push('/login')
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
  min-height: 70px;
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

.auth-logo{
  width: 160px;
  height: 50px;
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

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #1e293b;
  cursor: pointer;
  margin-right: 1rem;
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

@media (max-width: 1024px) {
  .sidebar {
    width: 80px;
  }
  .sidebar span, .sidebar .submenu-icon, .sidebar .toggle-btn {
    display: none;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 0 1rem;
  }

  .header-right .careers-link span,
  .header-right .user-info {
    display: none;
  }

  .mobile-menu-btn {
    display: block;
  }

  .sidebar {
    position: fixed;
    z-index: 1000;
    left: -260px;
    width: 260px !important;
    box-shadow: 10px 0 15px rgba(0,0,0,0.1);
  }

  .sidebar span, .sidebar .submenu-icon, .sidebar .toggle-btn {
    display: inline;
  }

  .sidebar.mobile-open {
    left: 0;
  }

  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 999;
    backdrop-filter: blur(2px);
  }

  .content-body {
    padding: 1rem;
  }
}
/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1.5rem;
  animation: fadeIn 0.2s ease-out;
}

.logout-modal {
  background: white;
  padding: 2.5rem;
  border-radius: 1.5rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-icon {
  width: 64px;
  height: 64px;
  background: #fef2f2;
  color: #ef4444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  margin: 0 auto 1.5rem;
  border: 4px solid #fff1f2;
}

.logout-modal h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.75rem;
}

.logout-modal p {
  color: #64748b;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 1rem;
}

.modal-actions button {
  flex: 1;
  padding: 0.875rem;
  border-radius: 0.75rem;
  font-weight: 600;
  transition: all 0.2s;
  cursor: pointer;
}

.btn-cancel {
  background: #f1f5f9;
  border: none;
  color: #475569;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

.btn-confirm {
  background: #ef4444;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-confirm:hover {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    transform: translateY(20px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}
</style>
