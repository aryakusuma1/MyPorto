<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  FolderGit2,
  Award,
  Sliders,
  Briefcase,
  Mail,
  Plus,
  ArrowRight,
  ExternalLink,
  Clock,
  Sparkles,
} from 'lucide-vue-next'
import { supabase } from '../../lib/supabase'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseBadge from '../../components/ui/BaseBadge.vue'

const router = useRouter()

const loading = ref(true)
const stats = ref({
  projectsCount: 0,
  certificatesCount: 0,
  skillsCount: 0,
  experiencesCount: 0,
  unreadMessagesCount: 0,
})

const recentProjects = ref([])
const recentMessages = ref([])

async function fetchDashboardData() {
  loading.value = true
  try {
    // 1. Projects Count & Recent
    const { data: projects, count: pCount } = await supabase
      .from('projects')
      .select('id, title, category, status, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(4)

    // 2. Certificates Count
    const { count: cCount } = await supabase
      .from('certificates')
      .select('*', { count: 'exact', head: true })

    // 3. Skills Count
    const { count: sCount } = await supabase
      .from('skills')
      .select('*', { count: 'exact', head: true })

    // 4. Experiences Count
    const { count: eCount } = await supabase
      .from('experiences')
      .select('*', { count: 'exact', head: true })

    // 5. Unread Messages Count & Recent
    const { data: messages, count: mCount } = await supabase
      .from('contact_messages')
      .select('id, name, email, message, is_read, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(4)

    stats.value = {
      projectsCount: pCount || 0,
      certificatesCount: cCount || 0,
      skillsCount: sCount || 0,
      experiencesCount: eCount || 0,
      unreadMessagesCount: messages ? messages.filter((m) => !m.is_read).length : 0,
    }

    recentProjects.value = projects || []
    recentMessages.value = messages || []
  } catch (err) {
    console.error('[DashboardView] Error loading metrics:', err)
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Welcome Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-canvas-card via-canvas-card to-accent/5 border border-canvas-subtle/30">
      <div>
        <div class="flex items-center gap-2 text-accent text-xs font-mono font-semibold uppercase tracking-wider mb-1">
          <Sparkles class="w-4 h-4" />
          <span>Admin Control Center</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold font-heading text-ink">
          Selamat Datang, Arya
        </h1>
        <p class="text-ink-muted text-sm mt-1">
          Kelola seluruh konten, proyek, dan respon pesan portfolio Anda dari satu tempat.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <a href="/" target="_blank" class="inline-flex">
          <BaseButton variant="outline" size="sm">
            <ExternalLink class="w-4 h-4 mr-1.5" />
            Kunjungi Website
          </BaseButton>
        </a>
      </div>
    </div>

    <!-- Stat Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Card Proyek -->
      <router-link
        to="/admin/projects"
        class="bg-canvas-card border border-canvas-subtle/30 rounded-2xl p-5 hover:border-accent/40 transition-all group flex flex-col justify-between"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-ink-muted uppercase tracking-wider">Total Proyek</span>
          <div class="p-2.5 rounded-xl bg-accent/10 text-accent group-hover:scale-110 transition-transform">
            <FolderGit2 class="w-5 h-5" />
          </div>
        </div>
        <div class="mt-4">
          <span class="text-3xl font-heading font-bold text-ink">
            {{ loading ? '...' : stats.projectsCount }}
          </span>
          <div class="flex items-center text-xs text-accent mt-2 font-medium">
            <span>Kelola Proyek</span>
            <ArrowRight class="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </router-link>

      <!-- Card Sertifikat -->
      <router-link
        to="/admin/certificates"
        class="bg-canvas-card border border-canvas-subtle/30 rounded-2xl p-5 hover:border-accent/40 transition-all group flex flex-col justify-between"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-ink-muted uppercase tracking-wider">Sertifikat</span>
          <div class="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
            <Award class="w-5 h-5" />
          </div>
        </div>
        <div class="mt-4">
          <span class="text-3xl font-heading font-bold text-ink">
            {{ loading ? '...' : stats.certificatesCount }}
          </span>
          <div class="flex items-center text-xs text-amber-400 mt-2 font-medium">
            <span>Kelola Sertifikat</span>
            <ArrowRight class="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </router-link>

      <!-- Card Skills -->
      <router-link
        to="/admin/skills"
        class="bg-canvas-card border border-canvas-subtle/30 rounded-2xl p-5 hover:border-accent/40 transition-all group flex flex-col justify-between"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-ink-muted uppercase tracking-wider">Keahlian (Skills)</span>
          <div class="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
            <Sliders class="w-5 h-5" />
          </div>
        </div>
        <div class="mt-4">
          <span class="text-3xl font-heading font-bold text-ink">
            {{ loading ? '...' : stats.skillsCount }}
          </span>
          <div class="flex items-center text-xs text-cyan-400 mt-2 font-medium">
            <span>Kelola Skills</span>
            <ArrowRight class="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </router-link>

      <!-- Card Pesan Masuk -->
      <router-link
        to="/admin/messages"
        class="bg-canvas-card border rounded-2xl p-5 transition-all group flex flex-col justify-between"
        :class="stats.unreadMessagesCount > 0 ? 'border-accent/40 bg-accent/[0.02]' : 'border-canvas-subtle/30 hover:border-accent/40'"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-ink-muted uppercase tracking-wider">Pesan Baru</span>
          <div class="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
            <Mail class="w-5 h-5" />
          </div>
        </div>
        <div class="mt-4">
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-heading font-bold text-ink">
              {{ loading ? '...' : stats.unreadMessagesCount }}
            </span>
            <span v-if="stats.unreadMessagesCount > 0" class="text-xs text-accent font-semibold animate-pulse">
              Unread
            </span>
          </div>
          <div class="flex items-center text-xs text-emerald-400 mt-2 font-medium">
            <span>Buka Kotak Masuk</span>
            <ArrowRight class="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </router-link>
    </div>

    <!-- Quick Actions & Recent Tables -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Proyek Terbaru -->
      <div class="bg-canvas-card border border-canvas-subtle/30 rounded-2xl p-6 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-heading font-semibold text-ink text-base flex items-center gap-2">
              <FolderGit2 class="w-4 h-4 text-accent" />
              Proyek Terbaru
            </h3>
            <router-link to="/admin/projects" class="text-xs text-accent hover:underline font-medium">
              Lihat Semua
            </router-link>
          </div>

          <div v-if="loading" class="space-y-3">
            <div v-for="i in 3" :key="i" class="h-12 bg-canvas rounded-xl animate-pulse" />
          </div>

          <div v-else-if="recentProjects.length === 0" class="text-center py-8 text-ink-muted text-sm">
            Belum ada proyek yang ditambahkan.
          </div>

          <div v-else class="space-y-2.5">
            <div
              v-for="p in recentProjects"
              :key="p.id"
              class="flex items-center justify-between p-3 rounded-xl bg-canvas border border-canvas-subtle/20"
            >
              <div>
                <h4 class="text-sm font-medium text-ink">{{ p.title }}</h4>
                <span class="text-xs text-ink-muted">{{ p.category || 'Portfolio' }}</span>
              </div>
              <BaseBadge :variant="p.status === 'completed' ? 'accent' : 'neutral'" size="sm">
                {{ p.status }}
              </BaseBadge>
            </div>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-canvas-subtle/20">
          <router-link to="/admin/projects" class="w-full block">
            <BaseButton variant="outline" class="w-full justify-center">
              <Plus class="w-4 h-4 mr-1.5" />
              Tambah Proyek Baru
            </BaseButton>
          </router-link>
        </div>
      </div>

      <!-- Pesan Masuk Terbaru -->
      <div class="bg-canvas-card border border-canvas-subtle/30 rounded-2xl p-6 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-heading font-semibold text-ink text-base flex items-center gap-2">
              <Mail class="w-4 h-4 text-accent" />
              Pesan Masuk Terbaru
            </h3>
            <router-link to="/admin/messages" class="text-xs text-accent hover:underline font-medium">
              Lihat Semua
            </router-link>
          </div>

          <div v-if="loading" class="space-y-3">
            <div v-for="i in 3" :key="i" class="h-12 bg-canvas rounded-xl animate-pulse" />
          </div>

          <div v-else-if="recentMessages.length === 0" class="text-center py-8 text-ink-muted text-sm">
            Kotak masuk masih kosong.
          </div>

          <div v-else class="space-y-2.5">
            <router-link
              v-for="m in recentMessages"
              :key="m.id"
              to="/admin/messages"
              class="flex items-center justify-between p-3 rounded-xl bg-canvas border border-canvas-subtle/20 hover:border-accent/40 transition-all block"
            >
              <div class="min-w-0 pr-3">
                <div class="flex items-center gap-2">
                  <span
                    v-if="!m.is_read"
                    class="w-2 h-2 rounded-full bg-accent shrink-0"
                  />
                  <h4 class="text-sm font-medium text-ink truncate">{{ m.name }}</h4>
                </div>
                <p class="text-xs text-ink-muted truncate mt-0.5">{{ m.message }}</p>
              </div>
              <span class="text-[11px] font-mono text-ink-muted/80 shrink-0">
                {{ formatDate(m.created_at) }}
              </span>
            </router-link>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-canvas-subtle/20">
          <router-link to="/admin/messages" class="w-full block">
            <BaseButton variant="outline" class="w-full justify-center">
              Lihat Kotak Masuk
            </BaseButton>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>\n