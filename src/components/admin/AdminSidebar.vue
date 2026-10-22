<script setup>
import { computed } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import {
  LayoutDashboard,
  FolderGit2,
  Award,
  Wrench,
  Briefcase,
  MessageSquare,
  LogOut,
  ExternalLink,
  Shield,
} from 'lucide-vue-next'
import { useAuthStore } from '../../stores/auth.store'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const navLinks = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Projects', path: '/admin/projects', icon: FolderGit2 },
  { name: 'Certificates', path: '/admin/certificates', icon: Award },
  { name: 'Skills', path: '/admin/skills', icon: Wrench },
  { name: 'Experience', path: '/admin/experience', icon: Briefcase },
  { name: 'Pesan Masuk', path: '/admin/messages', icon: MessageSquare },
]

const userEmail = computed(() => authStore.user?.email || 'admin@portfolio')

async function handleSignOut() {
  const confirmed = window.confirm('Apakah Anda yakin ingin keluar dari panel admin?')
  if (confirmed) {
    await authStore.signOut()
    router.push('/admin/login')
  }
}
</script>

<template>
  <aside class="w-full md:w-64 bg-surface-alt border-r border-border flex flex-col shrink-0">
    <!-- Brand Header -->
    <div class="h-16 flex items-center px-6 border-b border-border/80 gap-2.5">
      <div class="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-accent">
        <Shield class="w-4 h-4" />
      </div>
      <div>
        <h2 class="font-heading font-bold text-ink text-base tracking-tight">Admin Panel</h2>
        <span class="text-[10px] text-ink-muted uppercase tracking-wider block">Portofolio Arya</span>
      </div>
    </div>

    <!-- Navigation List -->
    <nav class="flex-1 p-4 space-y-1.5 overflow-y-auto">
      <RouterLink
        v-for="item in navLinks"
        :key="item.name"
        :to="item.path"
        :class="[
          'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors select-none',
          route.path === item.path
            ? 'bg-accent/15 text-accent border border-accent/30 font-semibold'
            : 'text-ink-muted hover:text-ink hover:bg-surface-raised',
        ]"
      >
        <component :is="item.icon" class="w-4 h-4 shrink-0" />
        <span>{{ item.name }}</span>
      </RouterLink>
    </nav>

    <!-- Footer Area (User info & Logout) -->
    <div class="p-4 border-t border-border/80 space-y-2">
      <div class="px-3.5 py-2 rounded-lg bg-surface-raised border border-border/60">
        <span class="text-[10px] text-ink-muted uppercase tracking-wider block">Akun Masuk</span>
        <span class="text-xs text-ink font-medium truncate block" :title="userEmail">
          {{ userEmail }}
        </span>
      </div>

      <a
        href="/"
        target="_blank"
        class="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-ink-muted hover:text-ink hover:bg-surface-raised transition-colors"
      >
        <span class="inline-flex items-center gap-2">
          <ExternalLink class="w-3.5 h-3.5" />
          Lihat Web Utama
        </span>
      </a>

      <button
        type="button"
        class="w-full flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors cursor-pointer select-none"
        @click="handleSignOut"
      >
        <LogOut class="w-3.5 h-3.5" />
        <span>Keluar (Logout)</span>
      </button>
    </div>
  </aside>
</template>
