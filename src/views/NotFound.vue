<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1>Página Não Encontrada</h1>
      <p>A página que você está procurando não existe ou foi movida.</p>
      <div class="actions">
        <button @click="goBack" class="btn-secondary">
          <i class="pi pi-arrow-left"></i>
          Voltar
        </button>
        <button @click="goHome" class="btn-primary">
          <i class="pi pi-home"></i>
          Ir para Home
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const goBack = () => {
  router.back()
}

const goHome = () => {
  if (authStore.isSuperAdmin) {
    router.push('/super-admin/dashboard')
  } else if (authStore.isAdmin) {
    router.push('/admin/dashboard')
  } else if (authStore.isAuthenticated) {
    router.push('/employee/dashboard')
  } else {
    router.push('/login')
  }
}
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.not-found-content {
  text-align: center;
  color: white;
}

.error-code {
  font-size: 10rem;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.not-found-content h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem;
}

.not-found-content p {
  font-size: 1.25rem;
  opacity: 0.9;
  margin: 0 0 2rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-primary,
.btn-secondary {
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  transition: transform 0.2s;
}

.btn-primary {
  background: white;
  color: #667eea;
  border: none;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid white;
}

.btn-primary:hover,
.btn-secondary:hover {
  transform: translateY(-2px);
}
</style>