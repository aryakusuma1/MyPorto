<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Plus,
  Edit3,
  Trash2,
  Sliders,
  Search,
  CheckCircle,
  ArrowUp,
  ArrowDown,
} from 'lucide-vue-next'
import { supabase } from '../../lib/supabase'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseBadge from '../../components/ui/BaseBadge.vue'
import SkillForm from '../../components/admin/forms/SkillForm.vue'

const skills = ref([])
const loading = ref(false)
const isModalOpen = ref(false)
const selectedSkill = ref(null)
const statusMessage = ref('')
const searchQuery = ref('')
const selectedCategory = ref('All')
const isReordering = ref(false)

async function fetchAdminSkills() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error
    skills.value = data || []
  } catch (err) {
    console.error('[SkillsView] Error fetching skills:', err)
  } finally {
    loading.value = false
  }
}

const categories = computed(() => {
  const cats = new Set(skills.value.map((s) => s.category).filter(Boolean))
  return ['All', ...Array.from(cats)]
})

const filteredSkills = computed(() => {
  return skills.value.filter((s) => {
    const matchCat = selectedCategory.value === 'All' || s.category === selectedCategory.value
    const matchQuery =
      !searchQuery.value.trim() ||
      s.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchCat && matchQuery
  })
})

function openCreateModal() {
  selectedSkill.value = null
  isModalOpen.value = true
}

function openEditModal(skill) {
  selectedSkill.value = skill
  isModalOpen.value = true
}

function handleSaved() {
  isModalOpen.value = false
  statusMessage.value = 'Data keahlian berhasil disimpan.'
  setTimeout(() => (statusMessage.value = ''), 4000)
  fetchAdminSkills()
}

async function handleDelete(skill) {
  const confirmed = window.confirm(`Hapus keahlian "${skill.name}"?`)
  if (!confirmed) return

  try {
    const { error } = await supabase.from('skills').delete().eq('id', skill.id)
    if (error) throw error

    statusMessage.value = 'Keahlian berhasil dihapus.'
    setTimeout(() => (statusMessage.value = ''), 4000)
    fetchAdminSkills()
  } catch (err) {
    alert('Gagal menghapus skill: ' + err.message)
  }
}

async function moveOrder(currentIndex, direction) {
  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
  const currentList = filteredSkills.value
  if (targetIndex < 0 || targetIndex >= currentList.length || isReordering.value) return

  isReordering.value = true

  const itemA = currentList[currentIndex]
  const itemB = currentList[targetIndex]

  const globalIdxA = skills.value.findIndex((s) => s.id === itemA.id)
  const globalIdxB = skills.value.findIndex((s) => s.id === itemB.id)

  if (globalIdxA === -1 || globalIdxB === -1) {
    isReordering.value = false
    return
  }

  // Tukar posisi di array skills global
  const updated = [...skills.value]
  const [moved] = updated.splice(globalIdxA, 1)
  updated.splice(globalIdxB, 0, moved)

  skills.value = updated

  try {
    // Terapkan sort_order sekuensial unik 1, 2, 3...
    for (let i = 0; i < updated.length; i++) {
      const item = updated[i]
      const newOrder = i + 1
      if (item.sort_order !== newOrder) {
        await supabase
          .from('skills')
          .update({ sort_order: newOrder })
          .eq('id', item.id)
        item.sort_order = newOrder
      }
    }

    statusMessage.value = `Urutan skill "${itemA.name}" berhasil dipindah (ke #${targetIndex + 1}).`
    setTimeout(() => (statusMessage.value = ''), 3000)
  } catch (err) {
    console.error('[SkillsView] Gagal update urutan:', err)
    alert('Gagal memperbarui urutan skill: ' + err.message)
    await fetchAdminSkills()
  } finally {
    isReordering.value = false
  }
}

onMounted(() => {
  fetchAdminSkills()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold font-heading text-ink">Kelola Keahlian (Skills)</h1>
        <p class="text-ink-muted text-sm mt-1">
          Daftar teknologi, bahasa pemrograman, dan tools. Urutan baris di bawah menentukan posisi tampilan di web utama.
        </p>
      </div>
      <BaseButton variant="primary" @click="openCreateModal" class="self-start sm:self-auto cursor-pointer">
        <Plus class="w-4 h-4 mr-2" />
        Tambah Skill
      </BaseButton>
    </div>

    <!-- Feedback Banner -->
    <div
      v-if="statusMessage"
      class="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-center justify-between animate-fade-in"
    >
      <div class="flex items-center gap-2">
        <CheckCircle class="w-4 h-4 shrink-0" />
        <span>{{ statusMessage }}</span>
      </div>
      <button class="text-xs hover:underline cursor-pointer" @click="statusMessage = ''">Tutup</button>
    </div>

    <!-- Filter & Search Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <!-- Category Tabs -->
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="selectedCategory = cat"
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
          :class="
            selectedCategory === cat
              ? 'bg-accent/15 border border-accent text-accent font-semibold shadow-sm'
              : 'bg-surface-alt border border-border/80 text-ink-muted hover:text-ink hover:bg-surface-raised'
          "
        >
          {{ cat === 'All' ? 'Semua Kategori' : cat }}
        </button>
      </div>

      <!-- Search Input -->
      <div class="relative min-w-[220px]">
        <Search class="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari skill..."
          class="w-full pl-9 pr-4 py-2 bg-surface-alt border border-border/80 rounded-xl text-sm text-ink placeholder-ink-muted focus:outline-none focus:border-accent transition-colors"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-surface-alt border border-border/80 rounded-2xl overflow-hidden divide-y divide-border/60">
      <div
        v-for="i in 6"
        :key="i"
        class="h-16 px-5 flex items-center gap-4 animate-pulse bg-surface-alt"
      >
        <div class="w-20 h-8 rounded-lg bg-surface-raised" />
        <div class="w-9 h-9 rounded-xl bg-surface-raised shrink-0" />
        <div class="w-44 h-5 rounded bg-surface-raised" />
        <div class="flex-1 h-2 rounded-full bg-surface-raised" />
        <div class="w-16 h-8 rounded-lg bg-surface-raised" />
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredSkills.length === 0"
      class="bg-surface-alt border border-border/80 rounded-2xl p-12 text-center"
    >
      <div class="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4 border border-accent/20">
        <Sliders class="w-6 h-6" />
      </div>
      <h3 class="text-base font-semibold text-ink font-heading">Tidak ada skill ditemukan</h3>
      <p class="text-ink-muted text-sm mt-1 max-w-sm mx-auto">
        {{ searchQuery || selectedCategory !== 'All' ? 'Tidak ada skill yang cocok dengan kriteria pencarian.' : 'Belum ada data skill di database. Tambahkan sekarang.' }}
      </p>
      <BaseButton v-if="!searchQuery && selectedCategory === 'All'" variant="outline" @click="openCreateModal" class="mt-4 cursor-pointer">
        <Plus class="w-4 h-4 mr-2" />
        Tambah Skill Pertama
      </BaseButton>
    </div>

    <!-- Skills List View -->
    <div v-else class="bg-surface-alt border border-border/80 rounded-2xl overflow-hidden shadow-sm">
      <!-- List Header (Desktop) -->
      <div class="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-border/80 bg-surface-raised/50 text-[11px] font-mono uppercase tracking-wider text-ink-muted">
        <div class="col-span-2 flex items-center justify-center">Urutan</div>
        <div class="col-span-4">Skill & Kategori</div>
        <div class="col-span-4">Tingkat Kemahiran</div>
        <div class="col-span-2 text-right">Aksi</div>
      </div>

      <!-- List Rows -->
      <div class="divide-y divide-border/60">
        <div
          v-for="(skill, index) in filteredSkills"
          :key="skill.id"
          class="px-4 sm:px-5 py-3 hover:bg-surface-raised/40 transition-colors flex flex-col md:grid md:grid-cols-12 md:items-center gap-3 md:gap-4 group"
        >
          <!-- Col 1: Urutan & Controls -->
          <div class="md:col-span-2 flex items-center justify-between md:justify-center gap-2">
            <div class="flex items-center gap-1 bg-surface-raised border border-border/80 rounded-lg p-1">
              <button
                type="button"
                :disabled="index === 0 || isReordering"
                class="p-1 rounded hover:bg-accent/20 text-ink-muted hover:text-accent disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Naikkan ke posisi atas"
                @click="moveOrder(index, 'up')"
              >
                <ArrowUp class="w-3.5 h-3.5" />
              </button>
              <span class="text-xs font-mono font-bold text-accent min-w-[32px] text-center">
                #{{ skill.sort_order || (index + 1) }}
              </span>
              <button
                type="button"
                :disabled="index === filteredSkills.length - 1 || isReordering"
                class="p-1 rounded hover:bg-accent/20 text-ink-muted hover:text-accent disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Turunkan ke posisi bawah"
                @click="moveOrder(index, 'down')"
              >
                <ArrowDown class="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Mobile Actions (visible only on small screens) -->
            <div class="flex items-center gap-1 md:hidden">
              <button
                @click="openEditModal(skill)"
                title="Edit Skill"
                class="p-1.5 rounded-lg text-ink-muted hover:text-accent hover:bg-surface-raised transition-colors cursor-pointer"
              >
                <Edit3 class="w-4 h-4" />
              </button>
              <button
                @click="handleDelete(skill)"
                title="Hapus Skill"
                class="p-1.5 rounded-lg text-ink-muted hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Col 2: Skill & Kategori -->
          <div class="md:col-span-4 flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-xl bg-surface-raised border border-border/80 flex items-center justify-center text-accent text-xs font-mono font-bold shrink-0 overflow-hidden p-1">
              <img
                v-if="skill.icon_url && !skill.icon_url.startsWith('file:')"
                :src="skill.icon_url"
                :alt="skill.name"
                class="w-full h-full object-contain"
                @error="$event.target.style.display = 'none'"
              />
              <span v-else>{{ skill.name.slice(0, 2).toUpperCase() }}</span>
            </div>
            <div class="min-w-0">
              <h4 class="font-semibold text-ink text-sm truncate group-hover:text-accent transition-colors">
                {{ skill.name }}
              </h4>
              <div class="mt-0.5">
                <BaseBadge variant="neutral" size="sm">
                  {{ skill.category }}
                </BaseBadge>
              </div>
            </div>
          </div>

          <!-- Col 3: Tingkat Kemahiran -->
          <div class="md:col-span-4 flex flex-col justify-center">
            <div class="flex justify-between items-center text-xs font-mono text-ink-muted mb-1">
              <span>Kemahiran</span>
              <span class="text-ink font-semibold">{{ skill.level }}%</span>
            </div>
            <div class="w-full h-2 bg-surface-raised rounded-full overflow-hidden border border-border/40">
              <div
                class="h-full bg-accent transition-all duration-300 rounded-full"
                :style="{ width: `${skill.level}%` }"
              />
            </div>
          </div>

          <!-- Col 4: Desktop Actions -->
          <div class="hidden md:flex md:col-span-2 items-center justify-end gap-1.5">
            <button
              @click="openEditModal(skill)"
              title="Edit Skill"
              class="p-1.5 rounded-lg text-ink-muted hover:text-accent hover:bg-surface-raised border border-transparent hover:border-border/80 transition-colors cursor-pointer"
            >
              <Edit3 class="w-4 h-4" />
            </button>
            <button
              @click="handleDelete(skill)"
              title="Hapus Skill"
              class="p-1.5 rounded-lg text-ink-muted hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-900/50 transition-colors cursor-pointer"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <SkillForm
      v-if="isModalOpen"
      :skill="selectedSkill"
      @close="isModalOpen = false"
      @saved="handleSaved"
    />
  </div>
</template>
