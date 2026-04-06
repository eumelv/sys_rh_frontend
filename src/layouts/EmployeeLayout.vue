<template>
  <div class="employee-layout">
    <!-- Mobile Overlay -->
    <div v-if="isMobileMenuOpen" class="sidebar-overlay" @click="isMobileMenuOpen = false"></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'collapsed': isCollapsed, 'mobile-open': isMobileMenuOpen }">
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
  
      <router-link to="/employee/financial" class="nav-item">
        <i class="pi pi-wallet"></i>
        <span v-if="!isCollapsed">Financeiro</span>
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

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const isCollapsed = ref(false)
const isMobileMenuOpen = ref(false)

// Close mobile menu on route change
watch(() => route.path, () => {
  isMobileMenuOpen.value = false
})

const currentPageTitle = computed(() => {
  const titles = {
    'EmployeeDashboard': 'Dashboard do Colaborador',
    'EmployeeProfile': 'Meu Perfil',
    'EmployeeAttendance': 'Registo de Presenças',
    'EmployeeLeaves': 'Minhas Férias & Licenças',
     'EmployeeFinancial': 'Meus Holerites',
    'EmployeeDocuments': 'Meus Documentos',
    'EmployeeRequests': 'Solicitações',
    'EmployeeAnnouncements': 'Comunicados',
    'EmployeeSettings': 'Definições',
  }
  return titles[route.name] || 'Portal do Colaborador'
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

.mobile-menu-btn {
  display: none;
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
@media (max-width: 1024px) {
  .sidebar {
    width: 80px;
  }
  .sidebar span, .sidebar .toggle-btn {
    display: none;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 0 1rem;
  }

  .mobile-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f5f9;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    font-size: 1.25rem;
    color: #0f172a;
    cursor: pointer;
    margin-right: 1rem;
    transition: all 0.2s;
  }

  .mobile-menu-btn:hover {
    background: #e2e8f0;
  }

  .header-right .user-info {
    display: none;
  }

  .sidebar {
    position: fixed;
    z-index: 1000;
    left: -260px;
    width: 260px !important;
    box-shadow: 10px 0 15px rgba(0,0,0,0.1);
  }

  .sidebar span, .sidebar .toggle-btn {
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
/* Logout Modal Styles */
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