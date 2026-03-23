import { ref, watch, onMounted } from 'vue'

const isDarkMode = ref(false)

export function useTheme() {
  const initTheme = () => {
    // Carregar tema salvo do localStorage ou user settings
    const savedTheme = localStorage.getItem('app-theme')
    
    if (savedTheme) {
      isDarkMode.value = savedTheme === 'dark'
    } else {
      // Se não tiver salvo, usar preferência do sistema
      isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    
    applyTheme()
  }

  const applyTheme = () => {
    const html = document.documentElement
    
    if (isDarkMode.value) {
      html.classList.add('dark-mode')
      html.classList.remove('light-mode')
      localStorage.setItem('app-theme', 'dark')
    } else {
      html.classList.add('light-mode')
      html.classList.remove('dark-mode')
      localStorage.setItem('app-theme', 'light')
    }
  }

  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value
    applyTheme()
  }

  const setTheme = (theme) => {
    if (theme === 'dark') {
      isDarkMode.value = true
    } else if (theme === 'light') {
      isDarkMode.value = false
    } else if (theme === 'auto') {
      isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme()
  }

  // Watch para aplicar mudanças automaticamente
  watch(isDarkMode, () => {
    applyTheme()
  })

  return {
    isDarkMode,
    initTheme,
    toggleTheme,
    setTheme,
    applyTheme
  }
}