<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.store'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')

async function handleLogin() {
  const result = await authStore.signIn(email.value, password.value)
  if (result.success) {
    router.push('/admin/dashboard')
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-surface">
    <div class="w-full max-w-md bg-surface-alt border border-border rounded-lg p-8">
      <h1 class="text-2xl font-bold font-heading text-ink mb-6 text-center">Masuk ke Admin</h1>
      
      <div v-if="authStore.error" class="mb-4 p-3 bg-red-950/50 border border-red-800 text-red-200 text-sm rounded">
        {{ authStore.error }}
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-ink-muted mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-3 py-2 rounded-md bg-surface-raised border border-border text-ink focus:border-accent focus:outline-none"
            placeholder="admin@example.com"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-ink-muted mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-3 py-2 rounded-md bg-surface-raised border border-border text-ink focus:border-accent focus:outline-none"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full py-2.5 px-4 rounded-md bg-accent hover:bg-accent-light text-ink font-medium transition-colors disabled:opacity-50"
        >
          {{ authStore.loading ? 'Memproses...' : 'Masuk' }}
        </button>
      </form>
    </div>
  </div>
</template>
