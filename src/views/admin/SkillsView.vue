<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Edit3, Trash2, Sliders, Search, Layers, CheckCircle } from 'lucide-vue-next'
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

async function fetchAdminSkills() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('category', { ascending: true })
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
  statusMessage.value = 'Data skill berhasil disimpan.'
  setTimeout(() => (statusMessage.value = ''), 4000)
  fetchAdminSkills()
}

async function handleDelete(skill) {
  const confirmed = window.confirm(`Apakah Anda yakin ingin menghapus skill "${skill.name}"?`)
  if (!confirmed) return

  try {
    const { error } = await supabase.from('skills').delete().eq('id', skill.id)
    if (error) throw error

    statusMessage.value = `Skill "${skill.name}" berhasil dihapus.`
    setTimeout(() => (statusMessage.value = ''), 4000)
    fetchAdminSkills()
  } catch (err) {
    alert('Gagal menghapus skill: ' + err.message)
  }
}

onMounted(() => {
  fetchAdminSkills()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header Page -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold font-heading text-ink">Kelola Skills</h1>
        <p class="text-ink-muted text-sm mt-1">
          Daftar kompetensi teknis, kategori, dan persentase kemahiran untuk halaman portfolio.
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
      class="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-center gap-2 animate-fade-in"
    >
      <CheckCircle class="w-4 h-4 shrink-0" />
      <span>{{ statusMessage }}</span>
    </div>

    <!-- Filters & Search -->
    <div class="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
      <!-- Category Filter Pills -->
      <div class="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="selectedCategory = cat"
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          :class="
            selectedCategory === cat
              ? 'bg-accent text-canvas shadow-sm font-semibold'
              : 'bg-canvas-card border border-canvas-subtle/40 text-ink-muted hover:text-ink hover:border-canvas-subtle'
          "
        >
          {{ cat === 'All' ? 'Semua Kategori' : cat }}
        </button>
      </div>

      <!-- Search Input -->
      <div class="relative min-w-[220px]">
        <Search class="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari skill..."
          class="w-full pl-9 pr-4 py-2 bg-canvas-card border border-canvas-subtle/40 rounded-xl text-sm text-ink placeholder-ink-muted focus:outline-none focus:border-accent transition-colors"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="i in 6"
        :key="i"
        class="h-28 rounded-2xl bg-canvas-card border border-canvas-subtle/20 animate-pulse p-4"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredSkills.length === 0"
      class="bg-canvas-card border border-canvas-subtle/30 rounded-2xl p-12 text-center"
    >
      <div class="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4">
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

    <!-- Skills Grid/Table -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="skill in filteredSkills"
        :key="skill.id"
        class="bg-canvas-card border border-canvas-subtle/30 rounded-2xl p-5 hover:border-canvas-subtle/70 transition-all flex flex-col justify-between group"
      >
        <div>
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-canvas-subtle/20 flex items-center justify-center text-accent text-xs font-mono font-bold">
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

            <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                @click="openEditModal(skill)"
                title="Edit Skill"
                class="p-1.5 rounded-lg text-ink-muted hover:text-accent hover:bg-canvas-subtle/20 transition-colors"
              >
                <Edit3 class="w-4 h-4" />
              </button>
              <button
                @click="handleDelete(skill)"
                title="Hapus Skill"
                class="p-1.5 rounded-lg text-ink-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Progress Bar Kemahiran -->
          <div class="mt-4">
            <div class="flex justify-between items-center text-xs mb-1.5">
              <span class="text-ink-muted text-[11px] uppercase tracking-wider">Kemahiran</span>
              <span class="font-mono font-semibold text-accent text-xs">{{ skill.level }}%</span>
            </div>
            <div class="h-2 w-full bg-canvas rounded-full overflow-hidden">
              <div
                class="h-full bg-accent rounded-full transition-all duration-500"
                :style="{ width: `${skill.level}%` }"
              />
            </div>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-canvas-subtle/20 flex items-center justify-between text-[11px] text-ink-muted/70 font-mono">
          <span>Sort: #{{ skill.sort_order }}</span>
          <span v-if="skill.icon_url" class="truncate max-w-[120px]" :title="skill.icon_url">
            Icon set
          </span>
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
</template>\n