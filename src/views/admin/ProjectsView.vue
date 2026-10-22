<script setup>
import { ref, onMounted } from 'vue'
import { Plus, Edit3, Trash2, ExternalLink, FolderGit2 } from 'lucide-vue-next'
import { supabase } from '../../lib/supabase'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseBadge from '../../components/ui/BaseBadge.vue'
import ProjectForm from '../../components/admin/forms/ProjectForm.vue'

const projects = ref([])
const loading = ref(false)
const isModalOpen = ref(false)
const selectedProject = ref(null)
const statusMessage = ref('')

async function fetchAdminProjects() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*, project_details(*)')
      .order('created_at', { ascending: false })

    if (error) throw error
    projects.value = data || []
  } catch (err) {
    console.error('[ProjectsView] Error fetching projects:', err)
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  selectedProject.value = null
  isModalOpen.value = true
}

function openEditModal(project) {
  selectedProject.value = project
  isModalOpen.value = true
}

function handleSaved() {
  isModalOpen.value = false
  statusMessage.value = 'Proyek berhasil disimpan.'
  setTimeout(() => (statusMessage.value = ''), 4000)
  fetchAdminProjects()
}

async function handleDelete(project) {
  const confirmed = window.confirm(`Apakah Anda yakin ingin menghapus proyek "${project.title}" secara permanen?`)
  if (!confirmed) return

  try {
    const { error } = await supabase.from('projects').delete().eq('id', project.id)
    if (error) throw error

    statusMessage.value = `Proyek "${project.title}" berhasil dihapus.`
    setTimeout(() => (statusMessage.value = ''), 4000)
    fetchAdminProjects()
  } catch (err) {
    alert('Gagal menghapus proyek: ' + err.message)
  }
}

onMounted(() => {
  fetchAdminProjects()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
      <div>
        <h1 class="text-2xl font-bold font-heading text-ink">Manajemen Proyek</h1>
        <p class="text-xs text-ink-muted mt-1">
          Tambah, perbarui, dan hapus data proyek portofolio serta konten detailnya.
        </p>
      </div>
      <BaseButton variant="primary" size="md" @click="openCreateModal">
        <Plus class="w-4 h-4 mr-1.5" />
        Tambah Proyek Baru
      </BaseButton>
    </div>

    <!-- Alert status notification -->
    <div
      v-if="statusMessage"
      class="p-3 bg-accent/15 border border-accent/30 text-accent text-xs rounded-lg flex items-center justify-between"
    >
      <span>{{ statusMessage }}</span>
      <button class="text-xs hover:underline cursor-pointer" @click="statusMessage = ''">Tutup</button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12 text-ink-muted text-sm">
      Memuat daftar proyek...
    </div>

    <!-- Projects Table -->
    <div
      v-else-if="projects.length > 0"
      class="bg-surface-alt border border-border rounded-xl overflow-hidden shadow-lg"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-surface-raised border-b border-border text-xs text-ink-muted uppercase">
            <tr>
              <th class="px-5 py-3.5">Proyek</th>
              <th class="px-5 py-3.5">Kategori</th>
              <th class="px-5 py-3.5">Status</th>
              <th class="px-5 py-3.5">Slug</th>
              <th class="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border/60">
            <tr
              v-for="proj in projects"
              :key="proj.id"
              class="hover:bg-surface-raised/40 transition-colors"
            >
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded bg-surface-raised overflow-hidden shrink-0 border border-border/60">
                    <img
                      v-if="proj.cover_url"
                      :src="proj.cover_url"
                      :alt="proj.title"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center text-accent/60">
                      <FolderGit2 class="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <span class="font-heading font-semibold text-ink block">
                      {{ proj.title }}
                    </span>
                    <span v-if="proj.featured" class="text-[10px] text-accent font-medium">
                      ★ Unggulan
                    </span>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4 text-ink-muted text-xs">
                {{ proj.category || '-' }}
              </td>
              <td class="px-5 py-4">
                <BaseBadge variant="default" class="text-[11px]">
                  {{ proj.status }}
                </BaseBadge>
              </td>
              <td class="px-5 py-4 font-mono text-xs text-ink-muted">
                /projects/{{ proj.slug }}
              </td>
              <td class="px-5 py-4 text-right space-x-2">
                <button
                  type="button"
                  class="p-1.5 rounded text-ink-muted hover:text-accent hover:bg-surface-raised transition-colors cursor-pointer"
                  title="Edit Proyek"
                  @click="openEditModal(proj)"
                >
                  <Edit3 class="w-4 h-4" />
                </button>
                <button
                  type="button"
                  class="p-1.5 rounded text-ink-muted hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                  title="Hapus Proyek"
                  @click="handleDelete(proj)"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="text-center py-16 bg-surface-alt border border-border rounded-xl p-8"
    >
      <FolderGit2 class="w-12 h-12 text-ink-muted mx-auto mb-3 opacity-60" />
      <h3 class="font-heading font-semibold text-ink text-lg">Belum Ada Proyek</h3>
      <p class="text-xs text-ink-muted mt-1 max-w-sm mx-auto mb-4">
        Mulai tambahkan proyek pertama Anda agar tampil di halaman portofolio utama.
      </p>
      <BaseButton variant="primary" size="sm" @click="openCreateModal">
        <Plus class="w-4 h-4 mr-1" /> Tambah Proyek Sekarang
      </BaseButton>
    </div>

    <!-- Project Form Modal -->
    <ProjectForm
      v-if="isModalOpen"
      :project="selectedProject"
      @close="isModalOpen = false"
      @saved="handleSaved"
    />
  </div>
</template>
