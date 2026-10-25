<script setup>
import { reactive, watch, ref } from 'vue'
import { X } from 'lucide-vue-next'
import { supabase } from '../../../lib/supabase'
import BaseButton from '../../ui/BaseButton.vue'
import ImageUploader from '../ImageUploader.vue'

const props = defineProps({
  certificate: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'saved'])

const isSaving = ref(false)
const errorMessage = ref('')

const form = reactive({
  title: '',
  issuer: '',
  category: 'Sertifikasi Kompetensi',
  issue_date: '',
  expiry_date: '',
  credential_url: '',
  image_url: '',
  description: '',
  })

watch(
  () => props.certificate,
  (val) => {
    if (val) {
      form.title = val.title || ''
      form.issuer = val.issuer || ''
      form.category = val.category || 'Sertifikasi'
      form.issue_date = val.issue_date || ''
      form.expiry_date = val.expiry_date || ''
      form.credential_url = val.credential_url || ''
      form.image_url = val.image_url || ''
      form.description = val.description || ''
          }
  },
  { immediate: true }
)

async function handleSubmit() {
  errorMessage.value = ''
  if (!form.title.trim() || !form.issuer.trim() || !form.issue_date) {
    errorMessage.value = 'Nama sertifikat, penerbit, dan tanggal terbit wajib diisi.'
    return
  }

  isSaving.value = true

  const payload = {
    title: form.title.trim(),
    issuer: form.issuer.trim(),
    category: form.category.trim() || null,
    issue_date: form.issue_date,
    expiry_date: form.expiry_date || null,
    credential_url: form.credential_url.trim() || null,
    image_url: form.image_url || null,
    description: form.description.trim() || null,
    sort_order: (() => {
      if (props.certificate?.sort_order !== undefined && props.certificate?.sort_order !== null) {
        return props.certificate.sort_order
      }
      return 1
    })(),
  }

  // Jika item baru (bukan edit), posisikan otomatis di urutan paling akhir
  if (!props.certificate?.id) {
    try {
      const { data: latest } = await supabase
        .from('certificates')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
      payload.sort_order = ((latest?.[0]?.sort_order ?? 0) + 1)
    } catch (e) {
      payload.sort_order = 999
    }
  }

  try {
    if (props.certificate) {
      const { error } = await supabase
        .from('certificates')
        .update(payload)
        .eq('id', props.certificate.id)

      if (error) throw error
    } else {
      const { error } = await supabase.from('certificates').insert(payload)
      if (error) throw error
    }

    emit('saved')
  } catch (err) {
    console.error('[CertificateForm] Error saving:', err)
    errorMessage.value = err.message || 'Gagal menyimpan sertifikat.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-center items-center p-4 overflow-y-auto">
    <div class="bg-surface-alt border border-border rounded-xl w-full max-w-2xl my-8 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-border flex items-center justify-between">
        <h3 class="font-heading font-bold text-lg text-ink">
          {{ certificate ? 'Edit Sertifikat' : 'Tambah Sertifikat Baru' }}
        </h3>
        <button
          type="button"
          class="p-1 rounded text-ink-muted hover:text-ink hover:bg-surface-raised cursor-pointer"
          @click="emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form Body -->
      <form class="p-6 overflow-y-auto space-y-4 flex-1" @submit.prevent="handleSubmit">
        <div v-if="errorMessage" class="p-3 bg-red-950/40 border border-red-800 text-red-200 text-xs rounded-lg">
          {{ errorMessage }}
        </div>

        <div>
          <label class="block text-xs font-medium text-ink-muted mb-1">Nama Sertifikat *</label>
          <input
            v-model="form.title"
            type="text"
            required
            class="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border text-ink text-sm focus:border-accent focus:outline-none"
            placeholder="Contoh: AWS Certified Solutions Architect"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-ink-muted mb-1">Penerbit (Issuer) *</label>
            <input
              v-model="form.issuer"
              type="text"
              required
              class="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border text-ink text-sm focus:border-accent focus:outline-none"
              placeholder="Contoh: Amazon Web Services / Dicoding"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-ink-muted mb-1">Kategori</label>
            <input
              v-model="form.category"
              type="text"
              class="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border text-ink text-sm focus:border-accent focus:outline-none"
              placeholder="Cloud Computing / Web Dev"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-medium text-ink-muted mb-1">Tanggal Terbit *</label>
            <input
              v-model="form.issue_date"
              type="date"
              required
              class="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border text-ink text-sm focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-ink-muted mb-1">Masa Berlaku (Opsional)</label>
            <input
              v-model="form.expiry_date"
              type="date"
              class="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border text-ink text-sm focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-ink-muted mb-1">Nomor Urutan</label>
            <input
              v-model="form.sort_order"
              type="number"
              class="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border text-ink text-sm focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-ink-muted mb-1">Tautan Verifikasi Kredensial</label>
          <input
            v-model="form.credential_url"
            type="url"
            class="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border text-ink text-sm focus:border-accent focus:outline-none"
            placeholder="https://..."
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-ink-muted mb-1">Keterangan / Deskripsi</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full px-3 py-2 rounded-lg bg-surface-raised border border-border text-ink text-sm focus:border-accent focus:outline-none"
            placeholder="Uraian kompetensi yang dicakup dalam sertifikat ini..."
          ></textarea>
        </div>

        <ImageUploader
          v-model="form.image_url"
          folder="certificates"
          label="Gambar / Sertifikat Digital"
          aspect-ratio="4:3"
        />

        <!-- Actions -->
        <div class="pt-4 border-t border-border flex justify-end gap-3">
          <BaseButton type="button" variant="ghost" size="md" @click="emit('close')">
            Batal
          </BaseButton>
          <BaseButton type="submit" variant="primary" size="md" :loading="isSaving">
            Simpan Sertifikat
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>
