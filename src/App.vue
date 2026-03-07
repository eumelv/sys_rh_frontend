<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // Aplicar tema salvo ao carregar app
  const savedTheme = localStorage.getItem('app-theme')
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark-mode')
  }
})
</script>

<style>
/* Reset global */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  min-height: 100vh;
  background: var(--bg-page);
  color: var(--text-primary);
}
</style>