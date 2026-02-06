<template>
  <div class="employee-layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'collapsed': isCollapsed }">
      <div class="sidebar-header">
        <div class="logo">
          <i class="pi pi-user"></i>
          <span v-if="!isCollapsed">Portal Colaborador</span>
        </div>
        <button class="toggle-btn" @click="isCollapsed = !isCollapsed">
          <i :class="isCollapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-left'"></i>
        </button>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/employee/dashboard" class="nav-item">
          <i class="pi pi-home"></i>
          <span v-if="!isCollapsed">Início</span>
        </router-link>
        <router-link to="/employee/profile" class="nav-item">
          <i class="pi pi-id-card"></i>
          <span v-if="!isCollapsed">Meu Perfil</span>
        </router-link>
        <router-link to="/employee/attendance" class="nav-item">
          <i class="pi pi-clock"></i>
          <span v-if="!isCollapsed">Presenças</span>
        </router-link>
        <router-link to="/employee/leaves" class="nav-item">
          <i class="pi pi-calendar"></i>
          <span v-if="!isCollapsed">Férias & Licenças</span>
        </router-link>
        
        <!-- Novos itens adicionados -->
        <router-link to="/employee/documents" class="nav-item">
          <i class="pi pi-file"></i>
          <span v-if="!isCollapsed">Documentos</span>
        </router-link>
        <router-link to="/employee/requests" class="nav-item">
          <i class="pi pi-send"></i>
          <span v-if="!isCollapsed">Solicitações</span>
        </router-link>
        <router-link to="/employee/announcements" class="nav-item">
          <i class="pi pi-megaphone"></i>
          <span v-if="!isCollapsed">Comunicados</span>
        </router-link>
        <router-link to="/employee/settings" class="nav-item">
          <i class="pi pi-cog"></i>
          <span v-if="!isCollapsed">Definições</span>
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
          <div class="user-profile">
            <div class="user-avatar">
              {{ authStore.user?.name?.charAt(0) }}
            </div>
            <div class="user-info">
              <span class="user-name">{{ authStore.user?.name }}</span>
              <span class="user-role">Colaborador</span>
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

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const isCollapsed = ref(false)

const currentPageTitle = computed(() => {
  const titles = {
    'EmployeeDashboard': 'Dashboard do Colaborador',
    'EmployeeProfile': 'Meu Perfil',
    'EmployeeAttendance': 'Registo de Presenças',
    'EmployeeLeaves': 'Minhas Férias & Licenças',
    'EmployeeDocuments': 'Meus Documentos',
    'EmployeeRequests': 'Solicitações',
    'EmployeeAnnouncements': 'Comunicados',
    'EmployeeSettings': 'Definições',
  }
  return titles[route.name] || 'Portal do Colaborador'
})

const logout = async () => {
  if (confirm('Tem certeza que deseja sair?')) {
    await authStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
/* Reuse styles from AdminLayout with minor adjustments */
.employee-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
}

.sidebar {
  width: 260px;
  background-color: #0f172a; /* Darker blue for employee portal */
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: sticky;
  top: 0;
  height: 100vh;
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
  color: #10b981; /* Emerald color for employee portal logo */
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
  overflow-y: auto; /* Adiciona scroll se necessário */
}

/* Estilização da scrollbar */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
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
  font-size: 0.9375rem;
}

.nav-item i {
  font-size: 1.25rem;
  min-width: 24px;
}

.nav-item:hover, .nav-item.router-link-active {
  background-color: rgba(255, 255, 255, 0.05);
  color: white;
}

.nav-item.router-link-active {
  color: white;
  background-color: #10b981;
  position: relative;
}

.nav-item.router-link-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: white;
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

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #10b981;
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

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    z-index: 1000;
  }
  
  .sidebar.collapsed {
    transform: translateX(-100%);
  }
  
  .header {
    padding: 0 1rem;
  }
  
  .content-body {
    padding: 1rem;
  }
}
</style>