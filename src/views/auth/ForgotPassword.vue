<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="logo">
          <i class="pi pi-shield"></i>
          <h1>Recuperar Senha</h1>
        </div>
        <p>Introduza o seu e-mail e enviaremos um link para redefinir a sua senha.</p>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form" v-if="!submitted">
        <div class="form-group">
          <label for="email">Seu e-mail</label>
          <div class="input-wrapper">
            <i class="pi pi-envelope"></i>
            <input 
              type="email" 
              id="email" 
              v-model="email" 
              placeholder="exemplo@empresa.com" 
              required
              :disabled="loading"
            >
          </div>
        </div>

        <button type="submit" class="auth-btn" :disabled="loading">
          <span v-if="!loading">Enviar Link de Recuperação</span>
          <i v-else class="pi pi-spin pi-spinner"></i>
        </button>

        <div class="auth-footer">
          <router-link to="/login" class="back-link">
            <i class="pi pi-arrow-left"></i>
            Voltar ao Login
          </router-link>
        </div>
      </form>

      <div v-else class="success-state">
        <div class="success-icon">
          <i class="pi pi-check"></i>
        </div>
        <h2>Link Enviado!</h2>
        <p>Enviamos um e-mail para <strong>{{ email }}</strong> com instruções para redefinir a sua senha.</p>
        <p class="verification-note">Verifique a sua pasta de spam se não receber o e-mail em alguns minutos.</p>
        <button class="auth-btn secondary" @click="submitted = false">Tentar outro e-mail</button>
        <router-link to="/login" class="back-link">Voltar ao Login</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const authStore = useAuthStore()
const toast = useToast()

const email = ref('')
const loading = ref(false)
const submitted = ref(false)

const handleSubmit = async () => {
  loading.value = true
  try {
    await authStore.forgotPassword(email.value)
    submitted.value = true
    toast.success('Link enviado com sucesso!')
  } catch (error) {
    console.error('Error:', error)
    const message = error.response?.data?.message || 'Erro ao enviar link de recuperação'
    toast.error(message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.75)), url('/images/auth-bg.png');
  background-size: cover;
  background-position: center;
  padding: 1.5rem;
}

.auth-card {
  background: white;
  width: 100%;
  max-width: 450px;
  padding: 3rem;
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.5s ease-out;
}

.auth-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.logo i {
  font-size: 2.5rem;
  color: #10b981;
}

.logo h1 {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.025em;
  margin: 0;
}

.auth-header p {
  color: #64748b;
  font-size: 1rem;
  line-height: 1.5;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper i {
  position: absolute;
  left: 1rem;
  color: #94a3b8;
}

.input-wrapper input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 1rem;
  transition: all 0.2s;
  background: #f8fafc;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #10b981;
  background: white;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.auth-btn {
  background: #10b981;
  color: white;
  padding: 0.875rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-btn:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.auth-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-btn.secondary {
  background: #f1f5f9;
  color: #475569;
  margin-top: 1.5rem;
}

.auth-btn.secondary:hover {
  background: #e2e8f0;
  box-shadow: none;
  transform: none;
}

.auth-footer {
  text-align: center;
  margin-top: 1.5rem;
}

.back-link {
  color: #64748b;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s;
}

.back-link:hover {
  color: #10b981;
}

.success-state {
  text-align: center;
  padding: 1rem 0;
}

.success-icon {
  width: 64px;
  height: 64px;
  background: #d1fae5;
  color: #059669;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 1.5rem;
}

.success-state h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
}

.success-state p {
  color: #64748b;
  line-height: 1.6;
}

.verification-note {
  font-size: 0.875rem;
  margin: 1.5rem 0 2rem;
  font-style: italic;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 480px) {
  .auth-card {
    padding: 2rem;
  }
}
</style>
