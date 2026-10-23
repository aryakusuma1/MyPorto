<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth.store'

const authStore = useAuthStore()

onMounted(() => {
  if (typeof window !== 'undefined') {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    // Jika halaman di-refresh di root '/' dan terdapat hash lama, bersihkan hash dan reset scroll ke top
    if (window.location.pathname === '/' && window.location.hash) {
      window.history.replaceState(null, '', '/')
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }
  authStore.initAuth()
})
</script>

<template>
  <RouterView />
</template>
