<template>
  <div class="expired-page">
    <div class="expired-card">
      <!-- Icon animado -->
      <div class="expired-icon">
        <i class="pi pi-lock"></i>
      </div>

      <h1>Licença Expirada</h1>
      <p class="expired-subtitle">
        O período de acesso da sua empresa ao <strong>SYS RH</strong> terminou.
        Para continuar a utilizar o sistema, renove a sua licença.
      </p>

      <div class="expired-actions">
        <router-link to="/admin/subscription" class="btn-renew">
          <i class="pi pi-credit-card"></i>
          Ver Informações de Renovação
        </router-link>
        <button @click="logout" class="btn-logout">
          <i class="pi pi-sign-out"></i>
          Sair
        </button>
      </div>

      <div class="support-info">
        <p>Precisa de ajuda? Contacte-nos:</p>
        <a href="https://wa.me/244938378065" target="_blank" class="support-link">
          <svg viewBox="0 0 32 32" width="18" height="18" fill="currentColor">
            <path d="M16.004 2.003C8.268 2.003 2.003 8.268 2.003 16.004c0 2.467.644 4.877 1.868 6.998L2 30l7.168-1.88A13.94 13.94 0 0016.004 30c7.736 0 13.996-6.265 13.996-14S23.74 2.003 16.004 2.003zm6.36 19.683c-.348-.174-2.063-1.018-2.383-1.134-.32-.116-.553-.174-.786.174-.232.348-.9 1.134-1.104 1.367-.203.232-.406.26-.754.087-.348-.174-1.47-.542-2.8-1.727-1.034-.922-1.733-2.06-1.937-2.41-.203-.347-.022-.535.153-.708.157-.156.348-.406.522-.61.174-.203.232-.347.348-.58.116-.231.058-.435-.03-.609-.087-.174-.785-1.893-1.076-2.592-.283-.68-.57-.588-.786-.6-.203-.01-.435-.012-.668-.012s-.61.087-.93.435c-.32.348-1.22 1.192-1.22 2.91s1.25 3.375 1.424 3.607c.174.232 2.46 3.754 5.96 5.265.832.36 1.483.574 1.99.735.837.266 1.598.228 2.2.138.67-.1 2.063-.843 2.354-1.658.29-.814.29-1.512.203-1.658-.087-.145-.32-.232-.668-.406z"/>
          </svg>
          +244 938 378 065
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.expired-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  padding: 2rem;
}

.expired-card {
  background: white;
  border-radius: 24px;
  padding: 3rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 40px 80px rgba(0,0,0,0.4);
  animation: slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

.expired-icon {
  width: 96px;
  height: 96px;
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2.5rem;
  color: #dc2626;
  animation: pulse-icon 2s infinite;
}

@keyframes pulse-icon {
  0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.2); }
  50% { box-shadow: 0 0 0 16px rgba(220,38,38,0); }
}

h1 {
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 1rem;
}

.expired-subtitle {
  color: #64748b;
  line-height: 1.7;
  margin: 0 0 2rem;
  font-size: 0.95rem;
}

.expired-subtitle strong { color: #0f172a; }

.expired-actions {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  margin-bottom: 2rem;
}

.btn-renew {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #2dd4a8 0%, #0f4c81 100%);
  color: white;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-renew:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(45,212,168,0.35);
}

.btn-logout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 1rem 1.5rem;
  background: white;
  border: 2px solid #e2e8f0;
  color: #64748b;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.btn-logout:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: #fef2f2;
}

.support-info {
  border-top: 1px solid #f1f5f9;
  padding-top: 1.5rem;
}

.support-info p {
  color: #94a3b8;
  font-size: 0.85rem;
  margin: 0 0 0.75rem;
}

.support-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #25D366;
  font-weight: 700;
  text-decoration: none;
  font-size: 0.95rem;
  transition: opacity 0.2s;
}

.support-link:hover { opacity: 0.8; }
</style>
