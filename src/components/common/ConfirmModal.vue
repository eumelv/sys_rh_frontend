<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-container" :class="`modal-${size}`">
          <div class="modal-body text-center">
            <div class="icon-circle" :class="variant">
              <i :class="icon"></i>
            </div>
            
            <h3 class="modal-title">{{ title }}</h3>
            <p class="modal-message">{{ message }}</p>
            
            <div class="modal-actions">
              <button 
                type="button" 
                class="btn-cancel" 
                @click="$emit('close')"
                :disabled="loading"
              >
                {{ cancelText }}
              </button>
              <button 
                type="button" 
                class="btn-confirm" 
                :class="variant"
                @click="$emit('confirm')"
                :disabled="loading"
              >
                <i v-if="loading" class="pi pi-spin pi-spinner mr-2"></i>
                {{ confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: 'primary' // primary, danger, warning, success
  },
  icon: {
    type: String,
    default: 'pi pi-exclamation-triangle'
  },
  confirmText: {
    type: String,
    default: 'Confirmar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  },
  loading: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'sm'
  }
})

defineEmits(['close', 'confirm'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  overflow: hidden;
  animation: modal-slide-up 0.3s ease-out;
}

.modal-sm { max-width: 400px; }
.modal-md { max-width: 500px; }

.modal-body {
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
}

.icon-circle.primary { background: #eff6ff; color: #3b82f6; }
.icon-circle.danger { background: #fef2f2; color: #ef4444; }
.icon-circle.warning { background: #fffbeb; color: #f59e0b; }
.icon-circle.success { background: #f0fdf4; color: #10b981; }

.modal-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 0.75rem;
}

.modal-message {
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 2rem;
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.modal-actions button {
  flex: 1;
  padding: 0.875rem;
  border-radius: 0.75rem;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-cancel {
  background: #f1f5f9;
  color: #475569;
}

.btn-cancel:hover { background: #e2e8f0; }

.btn-confirm.primary { background: #3b82f6; color: white; }
.btn-confirm.primary:hover { background: #2563eb; }

.btn-confirm.danger { background: #ef4444; color: white; }
.btn-confirm.danger:hover { background: #dc2626; }

.btn-confirm.warning { background: #f59e0b; color: white; }
.btn-confirm.warning:hover { background: #d97706; }

.btn-confirm.success { background: #10b981; color: white; }
.btn-confirm.success:hover { background: #059669; }

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mr-2 { margin-right: 0.5rem; }

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@keyframes modal-slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
