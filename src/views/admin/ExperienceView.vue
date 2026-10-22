<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Edit3, Trash2, Briefcase, GraduationCap, Calendar, CheckCircle } from 'lucide-vue-next'
import { supabase } from '../../lib/supabase'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseBadge from '../../components/ui/BaseBadge.vue'
import ExperienceForm from '../../components/admin/forms/ExperienceForm.vue'

const experiences = ref([])
const loading = ref(false)
const isModalOpen = ref(false)
const selectedExp = ref(null)
const statusMessage = ref('')
const activeTab = ref('all') // 'all', 'work', 'education'

async function fetchAdminExperiences() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .order('start_date', { ascending: false })

    if (error) throw error
    experiences.value = data || []
  } catch (err) {
    console.error('[ExperienceView] Error fetching:', err)
  } finally {
    loading.value = false
  }
}

const filteredExperiences = computed(() => {
  if (activeTab.value === 'all') return experiences.value
  return experiences.value.filter((e) => e.type === activeTab.value)
})

function openCreateModal() {
  selectedExp.value = null
  isModalOpen.value = true
}

function openEditModal(exp) {
  selectedExp.value = exp
  isModalOpen.value = true
}

function handleSaved() {
  isModalOpen.value = false
  statusMessage.value = 'Riwayat berhasil disimpan.'
  setTimeout(() => (statusMessage.value = ''), 4000)
  fetchAdminExperiences()
}

async function handleDelete(exp) {
  const confirmed = window.confirm(`Hapus riwayat "${exp.role} di ${exp.company}"?`)
  if (!confirmed) return

  try {
    const { error } = await supabase.from('experiences').delete().eq('id', exp.id)
    if (error) throw error

    statusMessage.value = `Riwayat berhasil dihapus.`
    setTimeout(() => (statusMessage.value = ''), 4000)
    fetchAdminExperiences()
  } catch (err) {
    alert('Gagal menghapus: ' + err.message)
  }
}

function formatPeriod(startDate, endDate) {
  if (!startDate) return '-'
  const dStart = new Date(startDate)
  const startStr = isNaN(dStart.getTime())
    ? startDate
    : dStart.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })

  if (!endDate) return `${startStr} — Sekarang`

  const dEnd = new Date(endDate)
  const endStr = isNaN(dEnd.getTime())
    ? endDate
    : dEnd.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })

  return `${startStr} — ${endStr}`
}

onMounted(() => {
  fetchAdminExperiences()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold font-heading text-ink">Kelola Experience & Education</h1>
        <p class="text-ink-muted text-sm mt-1">
          Daftar riwayat karir profesional dan latar belakang pendidikan formal.
        </p>
      </div>
      <BaseButton variant="primary" @click="openCreateModal" class="self-start sm:self-auto">
        <Plus class="w-4 h-4 mr-2" />
        Tambah Riwayat
      </BaseButton>
    </div>

    <!-- Feedback Banner -->
    <div
      v-if="statusMessage"
      class="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-center gap-2 animate-fade-in"
    >
      <CheckCircle class="w-4 h-4 shrink-0" />
      <span>{{ statusMessage }}</span>
    </div>

    <!-- Tabs Filter -->
    <div class="flex items-center gap-2 border-b border-canvas-subtle/30 pb-2">
      <button
        @click="activeTab = 'all'"
        class="px-4 py-2 text-sm font-medium rounded-lg transition-all"
        :class="
          activeTab === 'all'
            ? 'bg-canvas-card text-accent border border-canvas-subtle/60 shadow-sm'
            : 'text-ink-muted hover:text-ink'
        "
      >
        Semua ({{ experiences.length }})
      </button>

      <button
        @click="activeTab = 'work'"
        class="px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2"
        :class="
          activeTab === 'work'
            ? 'bg-canvas-card text-accent border border-canvas-subtle/60 shadow-sm'
            : 'text-ink-muted hover:text-ink'
        "
      >
        <Briefcase class="w-4 h-4" />
        Pekerjaan ({{ experiences.filter((e) => e.type === 'work').length }})
      </button>

      <button
        @click="activeTab = 'education'"
        class="px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2"
        :class="
          activeTab === 'education'
            ? 'bg-canvas-card text-accent border border-canvas-subtle/60 shadow-sm'
            : 'text-ink-muted hover:text-ink'
        "
      >
        <GraduationCap class="w-4 h-4" />
        Pendidikan ({{ experiences.filter((e) => e.type === 'education').length }})
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div
        v-for="i in 3"
        :key="i"
        class="h-28 rounded-2xl bg-canvas-card border border-canvas-subtle/20 animate-pulse"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredExperiences.length === 0"
      class="bg-canvas-card border border-canvas-subtle/30 rounded-2xl p-12 text-center"
    >
      <div class="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4">
        <component :is="activeTab === 'education' ? GraduationCap : Briefcase" class="w-6 h-6" />
      </div>
      <h3 class="text-base font-semibold text-ink font-heading">Belum ada riwayat tercatat</h3>
      <p class="text-ink-muted text-sm mt-1 max-w-sm mx-auto">
        Tambahkan pengalaman kerja atau pendidikan untuk ditampilkan pada timeline portfolio Anda.
      </p>
      <BaseButton variant="outline" @click="openCreateModal" class="mt-4">
        <Plus class="w-4 h-4 mr-2" />
        Tambah Riwayat Pertama
      </BaseButton>
    </div>

    <!-- List Experiences -->
    <div v-else class="space-y-3">
      <div
        v-for="exp in filteredExperiences"
        :key="exp.id"
        class="bg-canvas-card border border-canvas-subtle/30 rounded-2xl p-5 hover:border-canvas-subtle/70 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
      >
        <div class="flex items-start gap-4">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
            :class="
              exp.type === 'work'
                ? 'bg-accent/10 border-accent/20 text-accent'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            "
          >
            <component :is="exp.type === 'work' ? Briefcase : GraduationCap" class="w-5 h-5" />
          </div>

          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="font-heading font-semibold text-ink text-base">
                {{ exp.role }}
              </h3>
              <BaseBadge :variant="exp.type === 'work' ? 'accent' : 'neutral'" size="sm">
                {{ exp.type === 'work' ? 'Pekerjaan' : 'Pendidikan' }}
              </BaseBadge>
            </div>

            <p class="text-sm text-ink-muted mt-0.5 font-medium">
              {{ exp.company }}
            </p>

            <div class="flex items-center gap-2 text-xs text-ink-muted/80 mt-2 font-mono">
              <Calendar class="w-3.5 h-3.5" />
              <span>{{ formatPeriod(exp.start_date, exp.end_date) }}</span>
            </div>

            <p v-if="exp.description" class="text-xs text-ink-muted mt-2 line-clamp-2 max-w-2xl">
              {{ exp.description }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            @click="openEditModal(exp)"
            class="px-3 py-1.5 rounded-lg border border-canvas-subtle/40 text-ink-muted hover:text-accent hover:border-accent text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Edit3 class="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
          <button
            @click="handleDelete(exp)"
            class="p-2 rounded-lg text-ink-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Hapus Riwayat"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <ExperienceForm
      v-if="isModalOpen"
      :experience="selectedExp"
      @close="isModalOpen = false"
      @saved="handleSaved"
    />
  </div>
</template>\n