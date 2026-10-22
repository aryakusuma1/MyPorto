<script setup>
import { ref } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { Lock, Mail, ArrowLeft, AlertCircle } from 'lucide-vue-next'
import { useAuthStore } from '../../stores/auth.store'
import BaseButton from '../../components/ui/BaseButton.vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const errorMessage = ref('')

async function handleLogin() {
  errorMessage.value = ''
  if (!email.value || !password.value) {
    errorMessage.value = 'Silakan isi email dan kata sandi.'
    return
  }

  const result = await authStore.signIn(email.value, password.value)
  if (result.success) {
    const redirectPath = route.query.redirect || '/admin/dashboard'
    router.push(redirectPath)
  } else {
    errorMessage.value = result.error || 'Autentikasi gagal. Periksa kembali email dan password Anda.'
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md px-4">
      <!-- Back to site link -->
      <RouterLink
        to="/"
        class="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-accent transition-colors mb-6"
      >
        <ArrowLeft class="w-3.5 h-3.5" />
        Kembali ke Web Portofolio
      </RouterLink>

      <div class="text-center mb-8">
        <div class="w-12 h-12 rounded-xl bg-surface-raised border border-border flex items-center justify-center text-accent mx-auto mb-3 shadow-md">
          <Lock class="w-6 h-6" />
        </div>
        <h1 class="text-2xl font-bold font-heading text-ink">
          Selamat Datang
        </h1>
        <p class="text-xs text-ink-muted mt-1">
          Masuk dengan akun Terdaftar untuk mengelola Akun.
        </p>
      </div>

      <!-- Login Card -->
      <div class="bg-surface-alt border border-border rounded-xl p-6 sm:p-8 shadow-xl">
        <div
          v-if="errorMessage || authStore.error"
          class="mb-5 p-3.5 rounded-lg bg-red-950/40 border border-red-800/80 text-red-200 text-xs sm:text-sm flex items-start gap-2.5"
        >
          <AlertCircle class="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{{ errorMessage || authStore.error }}</span>
        </div>

        <form class="space-y-5" @submit.prevent="handleLogin">
          <div>
            <label class="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5">
              Email Admin
            </label>
            <div class="relative">
              <input
                v-model="email"
                type="email"
                required
                autocomplete="email"
                class="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-surface-raised border border-border text-ink text-sm placeholder:text-ink-subtle focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all"
                placeholder="admin@domain.com"
              />
              <Mail class="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5">
              Kata Sandi
            </label>
            <div class="relative">
              <input
                v-model="password"
                type="password"
                required
                autocomplete="current-password"
                class="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-surface-raised border border-border text-ink text-sm placeholder:text-ink-subtle focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all"
                placeholder="••••••••••••"
              />
              <Lock class="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
            </div>
          </div>

          <BaseButton
            type="submit"
            variant="primary"
            size="md"
            :loading="authStore.loading"
            class="w-full mt-2"
          >
            Masuk
          </BaseButton>
        </form>
      </div>
    </div>
  </div>
</template>
