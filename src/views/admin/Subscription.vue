<template>
  <div class="subscription-page">

    <!-- Loading -->
    <div v-if="loading" class="loading-center">
      <i class="pi pi-spin pi-spinner" style="font-size:2rem; color:#2dd4a8"></i>
      <p>Carregando informações da assinatura...</p>
    </div>

    <template v-else-if="subscription">
      <!-- Status Banner -->
      <div class="status-banner" :class="bannerClass">
        <div class="banner-icon">
          <i :class="bannerIcon"></i>
        </div>
        <div class="banner-content">
          <h2>{{ bannerTitle }}</h2>
          <p>{{ bannerMessage }}</p>
        </div>
        <div class="banner-days" v-if="subscription.days_remaining > 0">
          <span class="days-number">{{ subscription.days_remaining }}</span>
          <span class="days-label">dias restantes</span>
        </div>
      </div>

      <!-- Cards de Info -->
      <div class="info-grid">
        <div class="info-card">
          <div class="info-icon">
            <i class="pi pi-calendar"></i>
          </div>
          <div class="info-body">
            <span class="info-label">Início da Licença</span>
            <span class="info-value">{{ formatDate(subscription.start_date) }}</span>
          </div>
        </div>
        <div class="info-card">
          <div class="info-icon expiry" :class="expiryIconClass">
            <i class="pi pi-calendar-times"></i>
          </div>
          <div class="info-body">
            <span class="info-label">Expiração</span>
            <span class="info-value" :class="expiryIconClass">{{ formatDate(subscription.end_date) }}</span>
          </div>
        </div>
        <div class="info-card">
          <div class="info-icon plan">
            <i class="pi pi-star"></i>
          </div>
          <div class="info-body">
            <span class="info-label">Plano Atual</span>
            <span class="info-value">{{ subscription.plan }}</span>
          </div>
        </div>
        <div class="info-card">
          <div class="info-icon amount">
            <i class="pi pi-money-bill"></i>
          </div>
          <div class="info-body">
            <span class="info-label">Valor Mensal</span>
            <span class="info-value">{{ formatAmount(subscription.amount) }} {{ subscription.currency }}</span>
          </div>
        </div>
      </div>

      <!-- Progress bar de dias -->
      <div class="progress-section" v-if="subscription.start_date && subscription.end_date">
        <div class="progress-header">
          <span>Período de uso</span>
          <span>{{ subscription.days_remaining }} dias restantes</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }" :class="progressClass"></div>
        </div>
        <div class="progress-labels">
          <span>{{ formatDate(subscription.start_date) }}</span>
          <span>{{ formatDate(subscription.end_date) }}</span>
        </div>
      </div>
    </template>

    <!-- Sem assinatura -->
    <div v-else-if="!loading" class="no-subscription">
      <i class="pi pi-exclamation-triangle"></i>
      <h3>Sem Licença Activa</h3>
      <p>Contacte o suporte para activar a sua licença.</p>
    </div>

    <!-- Dados de Pagamento -->
    <div class="payment-section">
      <div class="payment-header">
        <i class="pi pi-credit-card"></i>
        <h3>Como Renovar a Sua Licença</h3>
      </div>
      <p class="payment-intro">
        Para renovar ou adquirir uma licença, efectue uma transferência bancária com os dados abaixo
        e envie o comprovativo de pagamento para a nossa equipa.
      </p>

      <div class="bank-card">
        <div class="bank-card-header">
          <i class="pi pi-building-columns"></i>
          <span>Dados Bancários</span>
        </div>
        <div class="bank-details">
          <div class="bank-row">
            <span class="bank-label">Banco</span>
            <span class="bank-value">{{ paymentInfo.bank_name }}</span>
          </div>
          <div class="bank-row">
            <span class="bank-label">Titular</span>
            <span class="bank-value">{{ paymentInfo.account_holder }}</span>
          </div>
          <div class="bank-row">
            <span class="bank-label">IBAN</span>
            <div class="bank-value-copy">
              <span class="bank-value mono">{{ paymentInfo.iban }}</span>
              <button class="copy-btn" @click="copy(paymentInfo.iban, 'IBAN')" title="Copiar">
                <i class="pi pi-copy"></i>
              </button>
            </div>
          </div>
          <div class="bank-row">
            <span class="bank-label">Nº Conta</span>
            <div class="bank-value-copy">
              <span class="bank-value mono">{{ paymentInfo.account_number }}</span>
              <button class="copy-btn" @click="copy(paymentInfo.account_number, 'Número de conta')" title="Copiar">
                <i class="pi pi-copy"></i>
              </button>
            </div>
          </div>
          <div class="bank-row">
            <span class="bank-label">SWIFT</span>
            <span class="bank-value mono">{{ paymentInfo.swift }}</span>
          </div>
          <div class="bank-row highlight">
            <span class="bank-label">Referência</span>
            <div class="bank-value-copy">
              <span class="bank-value mono ref">{{ paymentInfo.reference }}</span>
              <button class="copy-btn" @click="copy(paymentInfo.reference, 'Referência')" title="Copiar">
                <i class="pi pi-copy"></i>
              </button>
            </div>
          </div>
          <div class="bank-row highlight-amount">
            <span class="bank-label">Valor</span>
            <span class="bank-value amount-val">{{ paymentInfo.amount }}</span>
          </div>
        </div>
      </div>

      <div class="payment-instructions">
        <i class="pi pi-info-circle"></i>
        <p>{{ paymentInfo.instructions }}</p>
      </div>

      <div class="contact-actions">
        <a :href="`https://wa.me/244938378065?text=Olá, sou da empresa ${companyName}, quero renovar a minha licença SYS RH. Referência: ${paymentInfo.reference}`"
           target="_blank" class="btn-whatsapp">
          <svg viewBox="0 0 32 32" width="20" height="20" fill="currentColor">
            <path d="M16.004 2.003C8.268 2.003 2.003 8.268 2.003 16.004c0 2.467.644 4.877 1.868 6.998L2 30l7.168-1.88A13.94 13.94 0 0016.004 30c7.736 0 13.996-6.265 13.996-14S23.74 2.003 16.004 2.003zm6.36 19.683c-.348-.174-2.063-1.018-2.383-1.134-.32-.116-.553-.174-.786.174-.232.348-.9 1.134-1.104 1.367-.203.232-.406.26-.754.087-.348-.174-1.47-.542-2.8-1.727-1.034-.922-1.733-2.06-1.937-2.41-.203-.347-.022-.535.153-.708.157-.156.348-.406.522-.61.174-.203.232-.347.348-.58.116-.231.058-.435-.03-.609-.087-.174-.785-1.893-1.076-2.592-.283-.68-.57-.588-.786-.6-.203-.01-.435-.012-.668-.012s-.61.087-.93.435c-.32.348-1.22 1.192-1.22 2.91s1.25 3.375 1.424 3.607c.174.232 2.46 3.754 5.96 5.265.832.36 1.483.574 1.99.735.837.266 1.598.228 2.2.138.67-.1 2.063-.843 2.354-1.658.29-.814.29-1.512.203-1.658-.087-.145-.32-.232-.668-.406z"/>
          </svg>
          Enviar comprovativo via WhatsApp
        </a>
        <!-- <a href="mailto:suporte@sysrh.ao" class="btn-email">
          <i class="pi pi-envelope"></i>
          suporte@sysrh.ao
        </a> -->
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import { useToast } from 'vue-toastification'

const toast = useToast()
const loading = ref(true)
const subscription = ref(null)
const companyName = ref('')
const paymentInfo = ref({
  bank_name: '',
  account_holder: '',
  iban: '',
  account_number: '',
  swift: '',
  reference: '',
  amount: '',
  instructions: ''
})

const fetchSubscription = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/admin/subscription')
    subscription.value = data.subscription
    companyName.value = data.company?.name || ''
    paymentInfo.value = data.payment_info
  } catch (error) {
    toast.error('Erro ao carregar informações da assinatura')
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })
}

const formatAmount = (amount) => {
  if (!amount) return '9.900'
  return new Intl.NumberFormat('pt-AO').format(amount)
}

const bannerClass = computed(() => {
  if (!subscription.value) return 'banner-expired'
  if (subscription.value.is_expired) return 'banner-expired'
  if (subscription.value.days_remaining <= 7) return 'banner-warning'
  return 'banner-active'
})

const bannerIcon = computed(() => {
  if (!subscription.value || subscription.value.is_expired) return 'pi pi-times-circle'
  if (subscription.value.days_remaining <= 7) return 'pi pi-exclamation-triangle'
  return 'pi pi-check-circle'
})

const bannerTitle = computed(() => {
  if (!subscription.value || subscription.value.is_expired) return 'Licença Expirada'
  if (subscription.value.days_remaining <= 7) return 'Licença a Expirar Brevemente'
  return 'Licença Activa'
})

const bannerMessage = computed(() => {
  if (!subscription.value || subscription.value.is_expired) return 'A sua licença expirou. Renove para continuar a usar o sistema.'
  if (subscription.value.days_remaining <= 7) return `Atenção: restam apenas ${subscription.value.days_remaining} dias. Renove brevemente para não perder o acesso.`
  return `A sua licença está activa até ${formatDate(subscription.value.end_date)}.`
})

const expiryIconClass = computed(() => {
  if (!subscription.value) return ''
  if (subscription.value.is_expired || subscription.value.days_remaining <= 0) return 'color-danger'
  if (subscription.value.days_remaining <= 7) return 'color-warning'
  return 'color-success'
})

const progressPercent = computed(() => {
  if (!subscription.value?.start_date || !subscription.value?.end_date) return 0
  const start = new Date(subscription.value.start_date).getTime()
  const end = new Date(subscription.value.end_date).getTime()
  const now = Date.now()
  const total = end - start
  const elapsed = now - start
  const pct = 100 - Math.round((elapsed / total) * 100)
  return Math.max(0, Math.min(100, pct))
})

const progressClass = computed(() => {
  const p = progressPercent.value
  if (p <= 10) return 'fill-danger'
  if (p <= 25) return 'fill-warning'
  return 'fill-success'
})

const copy = async (text, label) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(`${label} copiado!`)
  } catch {
    toast.error('Não foi possível copiar')
  }
}

onMounted(fetchSubscription)
</script>

<style scoped>
.subscription-page { display: flex; flex-direction: column; gap: 1.5rem; max-width: 860px; }
.loading-center { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 4rem; color: #64748b; }

/* Banner */
.status-banner { display: flex; align-items: center; gap: 1.5rem; padding: 1.5rem 2rem; border-radius: 16px; flex-wrap: wrap; }
.status-banner.banner-active { background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 2px solid #86efac; }
.status-banner.banner-warning { background: linear-gradient(135deg, #fffbeb, #fef3c7); border: 2px solid #fcd34d; }
.status-banner.banner-expired { background: linear-gradient(135deg, #fef2f2, #fee2e2); border: 2px solid #fca5a5; }
.banner-icon { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; flex-shrink: 0; }
.banner-active .banner-icon { background: #dcfce7; color: #16a34a; }
.banner-warning .banner-icon { background: #fef3c7; color: #d97706; }
.banner-expired .banner-icon { background: #fee2e2; color: #dc2626; }
.banner-content { flex: 1; }
.banner-content h2 { margin: 0 0 0.35rem; font-size: 1.25rem; font-weight: 700; color: #1e293b; }
.banner-content p { margin: 0; color: #475569; font-size: 0.9rem; }
.banner-days { text-align: center; }
.days-number { display: block; font-size: 2.5rem; font-weight: 900; color: #1e293b; line-height: 1; }
.days-label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }

/* Info Grid */
.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
.info-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
.info-icon { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, rgba(45,212,168,0.1), rgba(15,76,129,0.1)); color: #0f4c81; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
.info-icon.plan { background: linear-gradient(135deg, rgba(245,158,11,0.1), rgba(234,179,8,0.1)); color: #d97706; }
.info-icon.amount { background: linear-gradient(135deg, rgba(34,197,94,0.1), rgba(16,185,129,0.1)); color: #16a34a; }
.info-icon.expiry { background: linear-gradient(135deg, rgba(239,68,68,0.1), rgba(220,38,38,0.1)); }
.info-body { display: flex; flex-direction: column; gap: 0.2rem; }
.info-label { font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
.info-value { font-size: 0.95rem; font-weight: 700; color: #1e293b; }
.color-danger { color: #dc2626 !important; }
.color-warning { color: #d97706 !important; }
.color-success { color: #16a34a !important; }

/* Progress */
.progress-section { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
.progress-header { display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.875rem; font-weight: 600; color: #475569; }
.progress-bar { height: 10px; background: #f1f5f9; border-radius: 9999px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 9999px; transition: width 0.6s ease; }
.fill-success { background: linear-gradient(90deg, #2dd4a8, #16a34a); }
.fill-warning { background: linear-gradient(90deg, #fbbf24, #d97706); }
.fill-danger { background: linear-gradient(90deg, #f87171, #dc2626); }
.progress-labels { display: flex; justify-content: space-between; margin-top: 0.5rem; font-size: 0.75rem; color: #94a3b8; }

/* No subscription */
.no-subscription { text-align: center; padding: 3rem; background: #fef9f0; border: 2px dashed #fbbf24; border-radius: 16px; color: #92400e; }
.no-subscription i { font-size: 3rem; margin-bottom: 1rem; }
.no-subscription h3 { margin: 0 0 0.5rem; }

/* Payment */
.payment-section { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 2rem; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
.payment-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
.payment-header i { font-size: 1.4rem; color: #0f4c81; }
.payment-header h3 { margin: 0; font-size: 1.15rem; font-weight: 700; color: #1e293b; }
.payment-intro { color: #64748b; margin: 0 0 1.5rem; line-height: 1.6; font-size: 0.9rem; }
.bank-card { border: 2px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 1.25rem; }
.bank-card-header { background: linear-gradient(135deg, #0f4c81, #1e40af); color: white; padding: 0.875rem 1.25rem; display: flex; align-items: center; gap: 0.75rem; font-weight: 700; font-size: 0.95rem; }
.bank-details { padding: 0.5rem 0; }
.bank-row { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1.25rem; gap: 1rem; }
.bank-row:not(:last-child) { border-bottom: 1px solid #f1f5f9; }
.bank-row.highlight { background: #f0fdf4; }
.bank-row.highlight-amount { background: linear-gradient(135deg, #f0fdf4, #dcfce7); }
.bank-label { font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; flex-shrink: 0; min-width: 90px; }
.bank-value { font-weight: 600; color: #1e293b; font-size: 0.9rem; }
.bank-value.mono { font-family: 'Courier New', monospace; letter-spacing: 0.02em; }
.bank-value.ref { color: #0f4c81; font-weight: 800; }
.amount-val { font-size: 1.1rem; font-weight: 800; color: #16a34a; }
.bank-value-copy { display: flex; align-items: center; gap: 0.5rem; }
.copy-btn { padding: 0.25rem 0.5rem; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 5px; cursor: pointer; color: #64748b; font-size: 0.8rem; transition: all 0.2s; }
.copy-btn:hover { background: #2dd4a8; color: white; border-color: #2dd4a8; }
.payment-instructions { display: flex; gap: 0.75rem; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 1.5rem; }
.payment-instructions i { color: #2563eb; font-size: 1rem; flex-shrink: 0; margin-top: 2px; }
.payment-instructions p { margin: 0; color: #1e40af; font-size: 0.875rem; line-height: 1.6; }
.contact-actions { display: flex; gap: 1rem; flex-wrap: wrap; }
.btn-whatsapp { display: flex; align-items: center; gap: 0.6rem; padding: 0.875rem 1.5rem; background: #25D366; color: white; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 0.9rem; transition: all 0.2s; }
.btn-whatsapp:hover { background: #1da855; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37,211,102,0.35); }
.btn-email { display: flex; align-items: center; gap: 0.6rem; padding: 0.875rem 1.5rem; background: white; border: 2px solid #e2e8f0; color: #475569; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 0.9rem; transition: all 0.2s; }
.btn-email:hover { border-color: #0f4c81; color: #0f4c81; }
@media (max-width: 640px) {
  .status-banner { flex-direction: column; text-align: center; }
  .banner-days { margin-top: 0.5rem; }
  .contact-actions { flex-direction: column; }
  .btn-whatsapp, .btn-email { justify-content: center; }
}
</style>
