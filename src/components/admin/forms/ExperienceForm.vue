<script setup>
import { reactive, watch, ref } from 'vue'
import { X, Briefcase, GraduationCap } from 'lucide-vue-next'
import { supabase } from '../../../lib/supabase'
import BaseButton from '../../ui/BaseButton.vue'
import ImageUploader from '../ImageUploader.vue'

const props = defineProps({
  experience: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'saved'])

const isSaving = ref(false)
const errorMessage = ref('')
const isCurrent = ref(false)

const form = reactive({
  company: '',
  role: '',
  type: 'work',
  start_date: '',
  end_date: '',
  description: '',
  logo_url: '',
  sort_order: 0,
})

watch(
  () => props.experience,
  (val) => {
    if (val) {
      form.company = val.company || ''
      form.role = val.role || ''
      form.type = val.type || 'work'
      form.start_date = val.start_date || ''
      form.end_date = val.end_date || ''
      form.description = val.description || ''
      form.logo_url = val.logo_url || ''
      form.sort_order = val.sort_order ?? 0
      isCurrent.value = !val.end_date
    } else {
      form.company = ''
      form.role = ''
      form.type = 'work'
      form.start_date = ''
      form.end_date = ''
      form.description = ''
      form.logo_url = ''
      form.sort_order = 0
      isCurrent.value = false
    }
  },
  { immediate: true }
)

watch(isCurrent, (current) => {
  if (current) {
    form.end_date = ''
  }
})

async function handleSubmit() {
  errorMessage.value = ''
  if (!form.company.trim() || !form.role.trim() || !form.start_date) {
    errorMessage.value = 'Instansi/Perusahaan, Posisi/Jurusan, dan Tanggal Mulai wajib diisi.'
    return
  }

  isSaving.value = true

  const payload = {
    company: form.company.trim(),
    role: form.role.trim(),
    type: form.type,
    start_date: form.start_date,
    end_date: isCurrent.value ? null : (form.end_date || null),
    description: form.description.trim() || null,
    logo_url: form.logo_url.trim() || null,
    sort_order: Number(form.sort_order) || 0,
  }

  try {
    if (props.experience?.id) {
      const { error } = await supabase.from('experiences').update(payload).eq('id', props.experience.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('experiences').insert([payload])
      if (error) throw error
    }
    emit('saved')
  } catch (err) {
    errorMessage.value = err.message || 'Gagal menyimpan riwayat pengalaman/pendidikan.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-sm">
    <div
      class="bg-canvas-card border border-canvas-subtle/40 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-canvas-subtle/30 bg-canvas/50">
        <div class="flex items-center gap-2">
          <div class="p-2 rounded-lg bg-accent/10 text-accent">
            <component :is="form.type === 'work' ? Briefcase : GraduationCap" class="w-5 h-5" />
          </div>
          <h3 class="text-lg font-heading font-semibold text-ink">
            {{ props.experience ? 'Edit Riwayat' : 'Tambah Riwayat Baru' }}
          </h3>
        </div>
        <button
          @click="emit('close')"
          class="p-2 text-ink-muted hover:text-ink hover:bg-canvas-subtle/20 rounded-lg transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleSubmit" class="p-6 overflow-y-auto space-y-4 flex-1">
        <div
          v-if="errorMessage"
          class="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400"
        >
          {{ errorMessage }}
        </div>

        <!-- Tipe: Work vs Education -->
        <div>
          <label class="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-2">
            Tipe Entri <span class="text-accent">*</span>
          </label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="form.type = 'work'"
              class="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all"
              :class="
                form.type === 'work'
                  ? 'bg-accent/15 border-accent text-accent shadow-sm'
                  : 'bg-canvas border-canvas-subtle/40 text-ink-muted hover:text-ink hover:border-canvas-subtle'
              "
            >
              <Briefcase class="w-4 h-4" />
              Pengalaman Kerja
            </button>

            <button
              type="button"
              @click="form.type = 'education'"
              class="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all"
              :class="
                form.type === 'education'
                  ? 'bg-accent/15 border-accent text-accent shadow-sm'
                  : 'bg-canvas border-canvas-subtle/40 text-ink-muted hover:text-ink hover:border-canvas-subtle'
              "
            >
              <GraduationCap class="w-4 h-4" />
              Pendidikan Formal
            </button>
          </div>
        </div>

        <!-- Company / Institution -->
        <div>
          <label class="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-2">
            {{ form.type === 'work' ? 'Perusahaan / Organisasi' : 'Nama Sekolah / Universitas' }} <span class="text-accent">*</span>
          </label>
          <input
            v-model="form.company"
            type="text"
            :placeholder="form.type === 'work' ? 'Contoh: PT Teknologi Inovasi' : 'Contoh: Universitas Indonesia'"
            class="w-full px-4 py-2.5 bg-canvas border border-canvas-subtle/40 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors"
            required
          />
        </div>

        <!-- Role / Degree -->
        <div>
          <label class="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-2">
            {{ form.type === 'work' ? 'Jabatan / Posisi' : 'Jurusan / Tingkat Gelar' }} <span class="text-accent">*</span>
          </label>
          <input
            v-model="form.role"
            type="text"
            :placeholder="form.type === 'work' ? 'Contoh: Full Stack Developer' : 'Contoh: S1 Teknik Informatika'"
            class="w-full px-4 py-2.5 bg-canvas border border-canvas-subtle/40 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors"
            required
          />
        </div>

        <!-- Dates -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-2">
              Tanggal Mulai <span class="text-accent">*</span>
            </label>
            <input
              v-model="form.start_date"
              type="date"
              class="w-full px-4 py-2.5 bg-canvas border border-canvas-subtle/40 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors"
              required
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs font-medium text-ink-muted uppercase tracking-wider">
                Tanggal Selesai
              </label>
              <label class="flex items-center gap-1.5 cursor-pointer text-xs text-ink-muted hover:text-ink">
                <input
                  v-model="isCurrent"
                  type="checkbox"
                  class="rounded bg-canvas border-canvas-subtle text-accent focus:ring-accent"
                />
                <span>Masih Aktif</span>
              </label>
            </div>
            <input
              v-model="form.end_date"
              type="date"
              :disabled="isCurrent"
              class="w-full px-4 py-2.5 bg-canvas border border-canvas-subtle/40 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-2">
            Deskripsi & Tanggung Jawab
          </label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Ringkasan tanggung jawab, pencapaian, atau mata kuliah utama..."
            class="w-full px-4 py-2.5 bg-canvas border border-canvas-subtle/40 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors resize-none"
          ></textarea>
        </div>

        <!-- Logo / Image Uploader -->
        <div>
          <ImageUploader
            v-model="form.logo_url"
            folder="experiences"
            label="Logo Perusahaan / Institusi (Opsional)"
          />
        </div>

        <!-- Sort Order -->
        <div>
          <label class="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-2">
            Urutan Tampilan
          </label>
          <input
            v-model.number="form.sort_order"
            type="number"
            class="w-full px-4 py-2.5 bg-canvas border border-canvas-subtle/40 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      </form>

      <!-- Footer Buttons -->
      <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-canvas-subtle/30 bg-canvas/50">
        <BaseButton variant="ghost" @click="emit('close')" :disabled="isSaving">
          Batal
        </BaseButton>
        <BaseButton variant="primary" @click="handleSubmit" :loading="isSaving">
          {{ props.experience ? 'Perbarui Riwayat' : 'Simpan Riwayat' }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>\n