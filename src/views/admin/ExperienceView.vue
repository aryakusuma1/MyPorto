<script setup>
import { ref, onMounted } from 'vue'
import {
  Briefcase,
  Plus,
  Edit3,
  Trash2,
  Calendar,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
} from 'lucide-vue-next'
import { supabase } from '../../lib/supabase'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseBadge from '../../components/ui/BaseBadge.vue'
import ExperienceForm from '../../components/admin/forms/ExperienceForm.vue'

const items = ref([])
const loading = ref(false)
const isModalOpen = ref(false)
const selectedItem = ref(null)
const statusMessage = ref('')
const isReordering = ref(false)

async function fetchWorkList() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .eq('type', 'work')
      .order('sort_order', { ascending: true })
      .order('start_date', { ascending: false })

    if (error) throw error
    items.value = data || []
  } catch (err) {
    console.error('[ExperienceView] Error fetching:', err)
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  selectedItem.value = null
  isModalOpen.value = true
}

function openEditModal(item) {
  selectedItem.value = item
  isModalOpen.value = true
}

function handleSaved() {
  isModalOpen.value = false
  statusMessage.value = 'Data pengalaman kerja berhasil disimpan.'
  setTimeout(() => (statusMessage.value = ''), 4000)
  fetchWorkList()
}

async function handleDelete(item) {
  const confirmed = window.confirm(`Hapus pengalaman "${item.role} di ${item.company}"?`)
  if (!confirmed) return

  try {
    const { error } = await supabase.from('experiences').delete().eq('id', item.id)
    if (error) throw error

    statusMessage.value = 'Data pengalaman berhasil dihapus.'
    setTimeout(() => (statusMessage.value = ''), 4000)
    fetchWorkList()
  } catch (err) {
    alert('Gagal menghapus: ' + err.message)
  }
}

async function moveOrder(currentIndex, direction) {
  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
  if (targetIndex < 0 || targetIndex >= items.value.length || isReordering.value) return

  isReordering.value = true

  // Buat copy array dan tukar posisi
  const updated = [...items.value]
  const [moved] = updated.splice(currentIndex, 1)
  updated.splice(targetIndex, 0, moved)

  // Update optimistik di UI
  items.value = updated

  try {
    // Terapkan sort_order baru: 1, 2, 3...
    for (let i = 0; i < updated.length; i++) {
      const item = updated[i]
      const newOrder = i + 1
      if (item.sort_order !== newOrder) {
        await supabase
          .from('experiences')
          .update({ sort_order: newOrder })
          .eq('id', item.id)
        item.sort_order = newOrder
      }
    }
    statusMessage.value = `Urutan berhasil diperbarui (Dipindah ke posisi #${targetIndex + 1}).`
    setTimeout(() => (statusMessage.value = ''), 3000)
  } catch (err) {
    console.error('[ExperienceView] Gagal update urutan:', err)
    alert('Gagal memperbarui urutan: ' + err.message)
    await fetchWorkList()
  } finally {
    isReordering.value = false
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

function getItemPhotosCount(item) {
  if (Array.isArray(item.photos)) return item.photos.length
  if (item.logo_url) return 1
  return 0
}

onMounted(() => {
  fetchWorkList()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold font-heading text-ink">Kelola Pengalaman Kerja</h1>
        <p class="text-ink-muted text-sm mt-1">
          Daftar riwayat karir profesional, magang, dan proyek freelance. Urutan di bawah menentukan posisi tampilan di web utama.
        </p>
      </div>
      <BaseButton variant="primary" @click="openCreateModal" class="self-start sm:self-auto">
        <Plus class="w-4 h-4 mr-2" />
        Tambah Pengalaman
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

    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div
        v-for="i in 3"
        :key="i"
        class="h-28 rounded-2xl bg-surface-alt border border-border animate-pulse"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="items.length === 0"
      class="bg-surface-alt border border-border rounded-2xl p-12 text-center"
    >
      <div class="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4">
        <Briefcase class="w-6 h-6" />
      </div>
      <h3 class="text-base font-semibold text-ink font-heading">Belum ada pengalaman kerja</h3>
      <p class="text-ink-muted text-sm mt-1 max-w-sm mx-auto">
        Tambahkan pengalaman kerja profesional, magang, atau freelance ke portfolio Anda.
      </p>
      <BaseButton variant="outline" @click="openCreateModal" class="mt-4">
        <Plus class="w-4 h-4 mr-2" />
        Tambah Pengalaman Pertama
      </BaseButton>
    </div>

    <!-- List Items -->
    <div v-else class="space-y-3">
      <div
        v-for="(item, index) in items"
        :key="item.id"
        class="bg-surface-alt border border-border rounded-2xl p-5 hover:border-accent/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group shadow-sm"
      >
        <div class="flex items-start gap-4">
          <!-- Order Number & Move Up/Down Controls -->
          <div class="flex flex-col items-center justify-center gap-1 shrink-0 bg-surface-raised border border-border/80 rounded-xl p-1.5 min-w-[42px]">
            <button
              type="button"
              :disabled="index === 0 || isReordering"
              class="p-1 rounded hover:bg-accent/20 text-ink-muted hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Naikkan ke posisi atas"
              @click="moveOrder(index, 'up')"
            >
              <ArrowUp class="w-3.5 h-3.5" />
            </button>
            <span class="text-xs font-mono font-bold text-accent">#{{ index + 1 }}</span>
            <button
              type="button"
              :disabled="index === items.length - 1 || isReordering"
              class="p-1 rounded hover:bg-accent/20 text-ink-muted hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Turunkan ke posisi bawah"
              @click="moveOrder(index, 'down')"
            >
              <ArrowDown class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Icon -->
          <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-accent/10 border-accent/20 text-accent">
            <Briefcase class="w-5 h-5" />
          </div>

          <!-- Content Details -->
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="font-heading font-semibold text-ink text-base">
                {{ item.role }}
              </h3>
              <BaseBadge variant="accent" size="sm">
                Pekerjaan
              </BaseBadge>
              <span
                v-if="getItemPhotosCount(item) > 0"
                class="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-surface-raised border border-border/60 text-ink-muted"
              >
                <ImageIcon class="w-3 h-3 text-accent" />
                {{ getItemPhotosCount(item) }} Foto
              </span>
            </div>

            <p class="text-sm text-ink-muted mt-0.5 font-medium">
              {{ item.company }}
            </p>

            <div class="flex items-center gap-2 text-xs text-ink-muted/80 mt-2 font-mono">
              <Calendar class="w-3.5 h-3.5 text-accent" />
              <span>{{ formatPeriod(item.start_date, item.end_date) }}</span>
            </div>

            <p v-if="item.description" class="text-xs text-ink-muted mt-2 line-clamp-2 max-w-2xl">
              {{ item.description }}
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            @click="openEditModal(item)"
            class="px-3 py-1.5 rounded-lg border border-border text-ink-muted hover:text-accent hover:border-accent text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer bg-surface-raised"
          >
            <Edit3 class="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
          <button
            @click="handleDelete(item)"
            class="p-2 rounded-lg text-ink-muted hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            title="Hapus Pengalaman"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <ExperienceForm
      v-if="isModalOpen"
      :experience="selectedItem"
      default-type="work"
      @close="isModalOpen = false"
      @saved="handleSaved"
    />
  </div>
</template>
