<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="logo">
          <i class="pi pi-lock"></i>
          <h1>Nova Senha</h1>
        </div>
        <p>Introduza e confirme a sua nova senha para recuperar o acesso à sua conta.</p>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <!-- Password Field -->
        <div class="form-group">
          <label for="password">Nova Senha</label>
          <div class="input-wrapper">
            <i class="pi pi-key"></i>
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              v-model="form.password" 
              placeholder="Mínimo 8 caracteres" 
              required
              :disabled="loading"
            >
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
            </button>
          </div>
        </div>

        <!-- Confirm Password Field -->
        <div class="form-group">
          <label for="password_confirmation">Confirmar Nova Senha</label>
          <div class="input-wrapper">
            <i class="pi pi-key"></i>
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password_confirmation" 
              v-model="form.password_confirmation" 
              placeholder="Repita a nova senha" 
              required
              :disabled="loading"
            >
          </div>
        </div>

        <button type="submit" class="auth-btn" :disabled="loading">
          <span v-if="!loading">Redefinir Senha</span>
          <i v-else class="pi pi-spin pi-spinner"></i>
        </button>

        <div class="auth-footer">
          <router-link to="/login" class="back-link">
            Cancelar e voltar ao Login
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const loading = ref(false)
const showPassword = ref(false)

const form = ref({
  token: '',
  email: '',
  password: '',
  password_confirmation: ''
})

onMounted(() => {
  // Capture token and email from URL query params
  form.value.token = route.query.token || ''
  form.value.email = route.query.email || ''

  if (!form.value.token || !form.value.email) {
    toast.error('Link de recuperação inválido ou expirado.')
    router.push('/forgot-password')
  }
})

const handleSubmit = async () => {
  if (form.value.password !== form.value.password_confirmation) {
    toast.error('As senhas não coincidem.')
    return
  }

  if (form.value.password.length < 8) {
    toast.error('A senha deve ter pelo menos 8 caracteres.')
    return
  }

  loading.value = true
  try {
    const response = await authStore.resetPassword(form.value)
    toast.success(response.message || 'Senha redefinida com sucesso!')
    
    // Redirect to login after success
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error) {
    console.error('Error:', error)
    const message = error.response?.data?.message || 'Erro ao redefinir a senha'
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

.input-wrapper i.pi-key {
  position: absolute;
  left: 1rem;
  color: #94a3b8;
}

.input-wrapper input {
  width: 100%;
  padding: 0.875rem 3rem 0.875rem 2.75rem;
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

.toggle-password {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-password:hover {
  color: #10b981;
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

.auth-footer {
  text-align: center;
  margin-top: 1.5rem;
}

.back-link {
  color: #64748b;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.back-link:hover {
  color: #10b981;
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
