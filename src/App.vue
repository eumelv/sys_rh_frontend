<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useTheme } from '@/composables/useTheme'
import api from '@/services/api'

const { initTheme } = useTheme()

onMounted(async () => {
  // 1. Inicializar tema do localStorage primeiro (para não dar flash)
  initTheme()
  
  // 2. Tentar carregar preferências salvas do backend
  try {
    const token = localStorage.getItem('token')
    if (token) {
      const { data } = await api.get('/employee/settings')
      
      if (data.settings?.theme) {
        const { setTheme } = useTheme()
        setTheme(data.settings.theme)
      }
    }
  } catch (error) {
    console.log('Settings não carregadas (usuário não autenticado ou erro)')
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  min-height: 100vh;
  background: var(--bg-page);
  color: var(--text-primary);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Prevent flash of unstyled content */
html:not(.dark-mode):not(.light-mode) {
  opacity: 0;
}

html.dark-mode,
html.light-mode {
  opacity: 1;
  transition: opacity 0.3s ease;
}
</style>