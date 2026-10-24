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
      .order('category', { ascending: true })

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

  // Salin dan tukar posisi di array skills
  const idxA = skills.value.findIndex((s) => s.id === itemA.id)
  const idxB = skills.value.findIndex((s) => s.id === itemB.id)

  if (idxA !== -1 && idxB !== -1) {
    const tempOrder = itemA.sort_order
    itemA.sort_order = itemB.sort_order
    itemB.sort_order = tempOrder

    // Normalisasi jika nilainya sama atau belum terurut
    if (itemA.sort_order === itemB.sort_order) {
      itemA.sort_order = targetIndex + 1
      itemB.sort_order = currentIndex + 1
    }
  }

  try {
    // Simpan perubahan ke Supabase
    await supabase.from('skills').update({ sort_order: itemA.sort_order }).eq('id', itemA.id)
    await supabase.from('skills').update({ sort_order: itemB.sort_order }).eq('id', itemB.id)

    statusMessage.value = `Urutan skill "${itemA.name}" berhasil dipindah.`
    setTimeout(() => (statusMessage.value = ''), 3000)
    await fetchAdminSkills()
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
          Daftar teknologi, bahasa pemrograman, dan tools. Urutan kartu di bawah menentukan posisi tampilan di web utama.
        </p>
      </div>
      <BaseButton variant="primary" @click="openCreateModal" class="self-start sm:self-auto">
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
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="i in 6"
        :key="i"
        class="h-28 rounded-2xl bg-surface-alt border border-border/60 animate-pulse p-4"
      />
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
      <BaseButton v-if="!searchQuery && selectedCategory === 'All'" variant="outline" @click="openCreateModal" class="mt-4">
        <Plus class="w-4 h-4 mr-2" />
        Tambah Skill Pertama
      </BaseButton>
    </div>

    <!-- Skills Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="(skill, index) in filteredSkills"
        :key="skill.id"
        class="bg-surface-alt border border-border/80 rounded-2xl p-4 sm:p-5 hover:border-accent/60 transition-all flex flex-col justify-between group shadow-sm"
      >
        <div>
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-2.5">
              <!-- Order Controls -->
              <div class="flex flex-col items-center justify-center gap-0.5 bg-surface-raised border border-border/80 rounded-lg p-1 min-w-[34px] shrink-0">
                <button
                  type="button"
                  :disabled="index === 0 || isReordering"
                  class="p-0.5 rounded hover:bg-accent/20 text-ink-muted hover:text-accent disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Naikkan ke posisi atas"
                  @click="moveOrder(index, 'up')"
                >
                  <ArrowUp class="w-3.5 h-3.5" />
                </button>
                <span class="text-[10px] font-mono font-bold text-accent">#{{ index + 1 }}</span>
                <button
                  type="button"
                  :disabled="index === filteredSkills.length - 1 || isReordering"
                  class="p-0.5 rounded hover:bg-accent/20 text-ink-muted hover:text-accent disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  title="Turunkan ke posisi bawah"
                  @click="moveOrder(index, 'down')"
                >
                  <ArrowDown class="w-3.5 h-3.5" />
                </button>
              </div>

              <!-- Tech Initials Box -->
              <div class="w-9 h-9 rounded-xl bg-surface-raised border border-border flex items-center justify-center text-accent text-xs font-mono font-bold shrink-0">
                {{ skill.name.slice(0, 2).toUpperCase() }}
              </div>

              <div>
                <h4 class="font-medium text-ink text-sm group-hover:text-accent transition-colors">
                  {{ skill.name }}
                </h4>
                <div class="mt-0.5">
                  <BaseBadge variant="neutral" size="sm">
                    {{ skill.category }}
                  </BaseBadge>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
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
        </div>

        <!-- Proficiency Progress Bar -->
        <div class="mt-2 pt-3 border-t border-border/50">
          <div class="flex justify-between text-xs text-ink-muted font-mono mb-1.5">
            <span>Tingkat Kemahiran</span>
            <span class="text-ink font-medium">{{ skill.level }}%</span>
          </div>
          <div class="w-full h-1.5 bg-surface-raised rounded-full overflow-hidden">
            <div
              class="h-full bg-accent transition-all duration-500 rounded-full"
              :style="{ width: `${skill.level}%` }"
            />
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
