<template>
  <div class="super-admin-layout">
    <aside class="sidebar" :class="{ 'sidebar-collapsed': isCollapsed }">
      <div class="sidebar-header">
        <div class="logo">
          <i class="pi pi-shield"></i>
          <span v-if="!isCollapsed">SYS RH</span>
        </div>
        <button @click="toggleSidebar" class="toggle-btn">
          <i :class="isCollapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-left'"></i>
        </button>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/super-admin/dashboard" class="nav-item">
          <i class="pi pi-home"></i>
          <span v-if="!isCollapsed">Dashboard</span>
        </router-link>
        <router-link to="/super-admin/companies" class="nav-item">
          <i class="pi pi-building"></i>
          <span v-if="!isCollapsed">Empresas</span>
        </router-link>
        <router-link to="/super-admin/plans" class="nav-item">
          <i class="pi pi-list"></i>
          <span v-if="!isCollapsed">Planos & Preços</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-btn">
          <i class="pi pi-sign-out"></i>
          <span v-if="!isCollapsed">Sair</span>
        </button>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-header">
        <div class="page-info">
          <h1>{{ currentPageTitle }}</h1>
        </div>
        <div class="user-profile">
          <div class="user-info">
            <span class="user-name">{{ user?.name }}</span>
            <span class="user-role">Super Admin</span>
          </div>
          <div class="user-avatar">
            {{ user?.name?.charAt(0) }}
          </div>
        </div>
      </header>
      <section class="content">
        <router-view></router-view>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isCollapsed = ref(false)
const user = computed(() => authStore.user)

const currentPageTitle = computed(() => {
  const titles = {
    '/super-admin/dashboard': 'Painel de Controle',
    '/super-admin/companies': 'Gestão de Empresas',
    '/super-admin/plans': 'Planos de Assinatura'
  }
  return titles[route.path] || 'Super Admin'
})

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>

<style scoped>
.super-admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

.sidebar {
  width: 260px;
  background: #0f172a;
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: sticky;
  top: 0;
  height: 100vh;
}

.sidebar-collapsed {
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
  color: #3b82f6;
  font-size: 1.5rem;
}

.toggle-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.sidebar-nav {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-item i {
  font-size: 1.25rem;
  min-width: 1.25rem;
}

.nav-item:hover, .nav-item.router-link-active {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  font-weight: 600;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: #fca5a5;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.top-header {
  height: 70px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 50;
}

.page-info h1 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  text-align: right;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 0.875rem;
}

.user-role {
  font-size: 0.75rem;
  color: #64748b;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.content {
  padding: 2rem;
  flex: 1;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    z-index: 100;
    left: -260px;
  }
  
  .sidebar.sidebar-collapsed {
    left: 0;
    width: 260px;
  }
  
  .main-content {
    margin-left: 0;
  }
}
</style>
