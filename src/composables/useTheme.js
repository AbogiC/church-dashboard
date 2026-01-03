import { ref, computed, onMounted, watch } from 'vue'

const theme = ref('light')

export function useTheme() {
  const isDark = computed(() => theme.value === 'dark')

  const setTheme = (newTheme) => {
    theme.value = newTheme
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  onMounted(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
  })

  watch(theme, (newTheme) => {
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-bs-theme', newTheme)
  })

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  }
}
