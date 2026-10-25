<script setup>
import { ref, onMounted } from 'vue'
import {
  Plus,
  Edit3,
  Trash2,
  Award,
  ArrowUp,
  ArrowDown,
  CheckCircle,
} from 'lucide-vue-next'
import { supabase } from '../../lib/supabase'
import BaseButton from '../../components/ui/BaseButton.vue'
import BaseBadge from '../../components/ui/BaseBadge.vue'
import CertificateForm from '../../components/admin/forms/CertificateForm.vue'

const certificates = ref([])
const loading = ref(false)
const isModalOpen = ref(false)
const selectedCertificate = ref(null)
const statusMessage = ref('')
const isReordering = ref(false)

async function fetchAdminCertificates() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('issue_date', { ascending: false })

    if (error) throw error
    certificates.value = data || []
  } catch (err) {
    console.error('[CertificatesView] Error fetching:', err)
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  selectedCertificate.value = null
  isModalOpen.value = true
}

function openEditModal(cert) {
  selectedCertificate.value = cert
  isModalOpen.value = true
}

function handleSaved() {
  isModalOpen.value = false
  statusMessage.value = 'Sertifikat berhasil disimpan.'
  setTimeout(() => (statusMessage.value = ''), 4000)
  fetchAdminCertificates()
}

async function handleDelete(cert) {
  const confirmed = window.confirm(`Hapus sertifikat "${cert.title}"?`)
  if (!confirmed) return

  try {
    const { error } = await supabase.from('certificates').delete().eq('id', cert.id)
    if (error) throw error

    statusMessage.value = 'Sertifikat berhasil dihapus.'
    setTimeout(() => (statusMessage.value = ''), 4000)
    fetchAdminCertificates()
  } catch (err) {
    alert('Gagal menghapus: ' + err.message)
  }
}

async function moveOrder(currentIndex, direction) {
  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
  if (targetIndex < 0 || targetIndex >= certificates.value.length || isReordering.value) return

  isReordering.value = true

  const updated = [...certificates.value]
  const [moved] = updated.splice(currentIndex, 1)
  updated.splice(targetIndex, 0, moved)

  certificates.value = updated

  try {
    for (let i = 0; i < updated.length; i++) {
      const item = updated[i]
      const newOrder = i + 1
      if (item.sort_order !== newOrder) {
        await supabase
          .from('certificates')
          .update({ sort_order: newOrder })
          .eq('id', item.id)
        item.sort_order = newOrder
      }
    }
    statusMessage.value = `Urutan sertifikat berhasil diperbarui (Dipindah ke posisi #${targetIndex + 1}).`
    setTimeout(() => (statusMessage.value = ''), 3000)
  } catch (err) {
    console.error('[CertificatesView] Gagal update urutan:', err)
    alert('Gagal memperbarui urutan: ' + err.message)
    await fetchAdminCertificates()
  } finally {
    isReordering.value = false
  }
}

function formatDate(dateString) {
  if (!dateString) return '-'
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return dateString
  return d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
}

onMounted(() => {
  fetchAdminCertificates()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
      <div>
        <h1 class="text-2xl font-bold font-heading text-ink">Manajemen Sertifikat</h1>
        <p class="text-xs text-ink-muted mt-1">
          Kelola kredensial resmi, bukti sertifikasi, dan lisensi kompetensi. Urutan tabel menentukan posisi di web utama.
        </p>
      </div>
      <BaseButton variant="primary" size="md" @click="openCreateModal">
        <Plus class="w-4 h-4 mr-1.5" />
        Tambah Sertifikat Baru
      </BaseButton>
    </div>

    <!-- Status Alert -->
    <div
      v-if="statusMessage"
      class="p-3 bg-accent/15 border border-accent/30 text-accent text-xs rounded-lg flex items-center justify-between"
    >
      <div class="flex items-center gap-2">
        <CheckCircle class="w-4 h-4 shrink-0" />
        <span>{{ statusMessage }}</span>
      </div>
      <button class="text-xs hover:underline cursor-pointer" @click="statusMessage = ''">Tutup</button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12 text-ink-muted text-sm">
      Memuat daftar sertifikat...
    </div>

    <!-- Table -->
    <div
      v-else-if="certificates.length > 0"
      class="bg-surface-alt border border-border rounded-xl overflow-hidden shadow-lg"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-surface-raised border-b border-border text-xs text-ink-muted uppercase">
            <tr>
              <th class="px-4 py-3.5 w-16 text-center">Urutan</th>
              <th class="px-5 py-3.5">Sertifikat</th>
              <th class="px-5 py-3.5">Penerbit</th>
              <th class="px-5 py-3.5">Tanggal</th>
              <th class="px-5 py-3.5">Kategori</th>
              <th class="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border/60">
            <tr
              v-for="(cert, index) in certificates"
              :key="cert.id"
              class="hover:bg-surface-raised/40 transition-colors"
            >
              <!-- Order Controls -->
              <td class="px-4 py-3 text-center">
                <div class="inline-flex flex-col items-center justify-center gap-0.5 bg-surface-raised border border-border/80 rounded-lg p-1 min-w-[36px]">
                  <button
                    type="button"
                    :disabled="index === 0 || isReordering"
                    class="p-0.5 rounded hover:bg-accent/20 text-ink-muted hover:text-accent disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Naikkan ke posisi atas"
                    @click="moveOrder(index, 'up')"
                  >
                    <ArrowUp class="w-3.5 h-3.5" />
                  </button>
                  <span class="text-[11px] font-mono font-bold text-accent">#{{ index + 1 }}</span>
                  <button
                    type="button"
                    :disabled="index === certificates.length - 1 || isReordering"
                    class="p-0.5 rounded hover:bg-accent/20 text-ink-muted hover:text-accent disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Turunkan ke posisi bawah"
                    @click="moveOrder(index, 'down')"
                  >
                    <ArrowDown class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>

              <!-- Certificate Details -->
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded bg-surface-raised overflow-hidden shrink-0 border border-border/60 flex items-center justify-center">
                    <img
                      v-if="cert.image_url"
                      :src="cert.image_url"
                      :alt="cert.title"
                      class="w-full h-full object-cover"
                    />
                    <Award v-else class="w-5 h-5 text-accent/60" />
                  </div>
                  <span class="font-heading font-semibold text-ink block">
                    {{ cert.title }}
                  </span>
                </div>
              </td>
              <td class="px-5 py-4 text-ink-muted text-xs font-medium">
                {{ cert.issuer }}
              </td>
              <td class="px-5 py-4 text-ink-muted text-xs">
                {{ formatDate(cert.issue_date) }}
              </td>
              <td class="px-5 py-4">
                <BaseBadge variant="accent" class="text-[11px]">
                  {{ cert.category || 'Umum' }}
                </BaseBadge>
              </td>
              <td class="px-5 py-4 text-right space-x-2">
                <button
                  type="button"
                  class="p-1.5 rounded text-ink-muted hover:text-accent hover:bg-surface-raised transition-colors cursor-pointer"
                  title="Edit Sertifikat"
                  @click="openEditModal(cert)"
                >
                  <Edit3 class="w-4 h-4" />
                </button>
                <button
                  type="button"
                  class="p-1.5 rounded text-ink-muted hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                  title="Hapus Sertifikat"
                  @click="handleDelete(cert)"
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
      class="bg-surface-alt border border-border rounded-xl p-12 text-center"
    >
      <Award class="w-12 h-12 text-ink-muted mx-auto mb-3" />
      <h3 class="font-heading font-semibold text-ink text-base">Belum ada sertifikat</h3>
      <p class="text-xs text-ink-muted mt-1 mb-4">Tambahkan sertifikat dan lisensi kompetensi Anda.</p>
      <BaseButton variant="outline" size="sm" @click="openCreateModal">
        <Plus class="w-4 h-4 mr-1.5" />
        Tambah Sertifikat Pertama
      </BaseButton>
    </div>

    <!-- Modal Form -->
    <CertificateForm
      v-if="isModalOpen"
      :certificate="selectedCertificate"
      @close="isModalOpen = false"
      @saved="handleSaved"
    />
  </div>
</template>
