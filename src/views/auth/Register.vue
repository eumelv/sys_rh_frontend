<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <img src="" alt="Logo" class="auth-logo" />
          <h1>Criar Conta</h1>
          <p>Comece seu teste grátis de 28 dias hoje!</p>
        </div>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label for="company_name">Nome da Empresa</label>
            <input
              id="company_name"
              v-model="form.company_name"
              type="text"
              placeholder="Minha Empresa Lda"
              required
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="name">Seu Nome</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              placeholder="João Silva"
              required
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="joao@minhaempresa.com"
              required
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="password">Senha</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              required
              minlength="8"
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="password_confirmation">Confirmar Senha</label>
            <input
              id="password_confirmation"
              v-model="form.password_confirmation"
              type="password"
              placeholder="Digite a senha novamente"
              required
              :disabled="loading"
            />
          </div>

          <div class="trial-info">
            <i class="pi pi-info-circle"></i>
            <span>Teste grátis de 28 dias. Sem cartão de crédito.</span>
          </div>

          <button type="submit" class="btn-primary" :disabled="loading">
            <span v-if="!loading">Criar Conta</span>
            <span v-else>Criando...</span>
          </button>

          <div class="auth-footer">
            <p>Já tem uma conta?</p>
            <router-link to="/login" class="link">Fazer login</router-link>
          </div>
        </form>
      </div>

      <div class="auth-illustration">
        <h2>Plano Free - 28 dias</h2>
        <p>Experimente gratuitamente todas as funcionalidades básicas:</p>
        <ul class="features-list">
          <li><i class="pi pi-check"></i> Até 5 usuários</li>
          <li><i class="pi pi-check"></i> Até 10 funcionários</li>
          <li><i class="pi pi-check"></i> Gestão básica de RH</li>
          <li><i class="pi pi-check"></i> Controle de presenças</li>
          <li><i class="pi pi-check"></i> Portal do funcionário</li>
        </ul>

        <div class="upgrade-cta">
          <p>Precisa de mais? Atualize a qualquer momento!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const loading = ref(false)
const form = reactive({
  company_name: '',
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const handleRegister = async () => {
  if (form.password !== form.password_confirmation) {
    toast.error('As senhas não coincidem')
    return
  }

  loading.value = true
  
  try {
    await authStore.register(form)

    toast.success('Conta criada com sucesso! Bem-vindo!')
    router.push('/admin/dashboard')
  } catch (error) {
    const message = error.response?.data?.message || 'Erro ao criar conta'
    toast.error(message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Reutiliza os mesmos estilos do Login */
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.auth-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1200px;
  width: 100%;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.auth-card {
  padding: 3rem;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-logo {
  width: 60px;
  height: 60px;
  margin-bottom: 1rem;
}

.auth-header h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem;
}

.auth-header p {
  color: #6b7280;
  font-size: 0.875rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.form-group input {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.trial-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #eff6ff;
  border-radius: 8px;
  color: #1e40af;
  font-size: 0.875rem;
}

.btn-primary {
  padding: 0.875rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.auth-footer p {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0 0 0.5rem;
}

.link {
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.auth-illustration {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.auth-illustration h2 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1rem;
}

.auth-illustration p {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0 0 2rem;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.features-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
}

.features-list i {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}

.upgrade-cta {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.upgrade-cta p {
  margin: 0;
  font-weight: 600;
}

@media (max-width: 768px) {
  .auth-container {
    grid-template-columns: 1fr;
  }
  
  .auth-illustration {
    display: none;
  }
}
</style>