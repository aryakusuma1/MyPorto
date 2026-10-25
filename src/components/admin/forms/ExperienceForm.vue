<script setup>
import { reactive, watch, ref, computed } from 'vue'
import { X, Briefcase, GraduationCap } from 'lucide-vue-next'
import { supabase } from '../../../lib/supabase'
import BaseButton from '../../ui/BaseButton.vue'
import MultiImageUploader from '../MultiImageUploader.vue'

const props = defineProps({
  experience: {
    type: Object,
    default: null,
  },
  defaultType: {
    type: String,
    default: 'work', // 'work' atau 'education'
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
  photos: [],
  })

const isEducation = computed(() => form.type === 'education')

watch(
  () => props.experience,
  (val) => {
    if (val) {
      form.company = val.company || ''
      form.role = val.role || ''
      form.type = val.type || props.defaultType || 'work'
      form.start_date = val.start_date || ''
      form.end_date = val.end_date || ''
      form.description = val.description || ''
      form.logo_url = val.logo_url || ''
            isCurrent.value = !val.end_date

      // Parsing foto array dengan fallback aman
      if (Array.isArray(val.photos) && val.photos.length > 0) {
        form.photos = [...val.photos]
      } else if (typeof val.photos === 'string' && val.photos.startsWith('[')) {
        try {
          form.photos = JSON.parse(val.photos)
        } catch (e) {
          form.photos = [val.photos]
        }
      } else if (val.logo_url) {
        form.photos = [val.logo_url]
      } else {
        form.photos = []
      }
    } else {
      form.company = ''
      form.role = ''
      form.type = props.defaultType || 'work'
      form.start_date = ''
      form.end_date = ''
      form.description = ''
      form.logo_url = ''
      form.photos = []
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
  if (!form.company.trim() || !form.role.trim() || !form.start_date) {
    errorMessage.value = 'Mohon lengkapi nama instansi/perusahaan, jabatan/jurusan, dan tanggal mulai.'
    return
  }

  isSaving.value = true
  errorMessage.value = ''

  const payload = {
    company: form.company.trim(),
    role: form.role.trim(),
    type: form.type,
    start_date: form.start_date,
    end_date: isCurrent.value ? null : (form.end_date || null),
    description: form.description.trim() || null,
    logo_url: form.photos.length > 0 ? form.photos[0] : null,
    photos: form.photos,
    sort_order: (() => {
      // Jika edit, pertahankan urutan yang ada
      if (props.experience?.sort_order !== undefined && props.experience?.sort_order !== null) {
        return props.experience.sort_order
      }
      return 1 // fallback jika perlu
    })(),
  }

  // Jika item baru (bukan edit), posisikan otomatis di urutan paling akhir untuk tipe kategori yang sama (education / work)
  if (!props.experience?.id) {
    try {
      const { data: latest } = await supabase
        .from('experiences')
        .select('sort_order')
        .eq('type', form.type)
        .order('sort_order', { ascending: false })
        .limit(1)
      payload.sort_order = ((latest?.[0]?.sort_order ?? 0) + 1)
    } catch (e) {
      payload.sort_order = 999
    }
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
    errorMessage.value = err.message || 'Gagal menyimpan data.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
    <div class="w-full max-w-2xl bg-surface-alt border border-border rounded-2xl shadow-2xl overflow-hidden my-8 animate-fade-in">
      <!-- Modal Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-surface-raised/40">
        <div class="flex items-center gap-2.5">
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center border"
            :class="isEducation ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-accent/10 border-accent/20 text-accent'"
          >
            <component :is="isEducation ? GraduationCap : Briefcase" class="w-4 h-4" />
          </div>
          <div>
            <h3 class="font-heading font-bold text-ink text-base">
              {{ isEducation ? (props.experience ? 'Ubah Data Pendidikan' : 'Tambah Pendidikan Baru') : (props.experience ? 'Ubah Pengalaman Kerja' : 'Tambah Pengalaman Baru') }}
            </h3>
            <p class="text-xs text-ink-muted">
              {{ isEducation ? 'Riwayat latar belakang pendidikan formal Anda' : 'Riwayat karir profesional atau proyek freelance Anda' }}
            </p>
          </div>
        </div>
        <button
          type="button"
          class="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-raised transition-colors cursor-pointer"
          @click="emit('close')"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
        <!-- Error Alert -->
        <div
          v-if="errorMessage"
          class="p-3 rounded-lg bg-red-950/40 border border-red-800 text-red-200 text-xs"
        >
          {{ errorMessage }}
        </div>

        <!-- Nama Sekolah / Perusahaan -->
        <div>
          <label class="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
            {{ isEducation ? 'Nama Sekolah / Institusi / Universitas *' : 'Nama Perusahaan / Organisasi *' }}
          </label>
          <input
            v-model="form.company"
            type="text"
            :placeholder="isEducation ? 'Contoh: Universitas Gadjah Mada / SMKN 1 ...' : 'Contoh: PT Teknologi Bangsa'"
            class="w-full px-4 py-2.5 bg-surface-raised border border-border/80 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors"
            required
          />
        </div>

        <!-- Jurusan / Posisi -->
        <div>
          <label class="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
            {{ isEducation ? 'Gelar & Jurusan / Jenjang Pendidikan *' : 'Jabatan / Posisi Kerja *' }}
          </label>
          <input
            v-model="form.role"
            type="text"
            :placeholder="isEducation ? 'Contoh: S1 – Teknik Informatika' : 'Contoh: Frontend Developer Intern'"
            class="w-full px-4 py-2.5 bg-surface-raised border border-border/80 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors"
            required
          />
        </div>

        <!-- Dates (Start and End) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
              Tanggal Mulai *
            </label>
            <input
              v-model="form.start_date"
              type="date"
              class="w-full px-4 py-2.5 bg-surface-raised border border-border/80 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors"
              required
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                Tanggal Selesai
              </label>
              <label class="flex items-center gap-1.5 cursor-pointer text-xs text-ink-muted hover:text-ink">
                <input
                  v-model="isCurrent"
                  type="checkbox"
                  class="rounded bg-surface-raised border-border text-accent focus:ring-accent"
                />
                <span>Masih Berjalan / Aktif</span>
              </label>
            </div>
            <input
              v-model="form.end_date"
              type="date"
              :disabled="isCurrent"
              class="w-full px-4 py-2.5 bg-surface-raised border border-border/80 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
            Deskripsi Riwayat & Detail Kegiatan
          </label>
          <textarea
            v-model="form.description"
            rows="4"
            :placeholder="isEducation ? 'Ringkasan pencapaian akademik, mata kuliah relevan, publikasi, atau organisasi kampus...' : 'Ringkasan tanggung jawab kerja, proyek yang diselesaikan, atau teknologi yang digunakan...'"
            class="w-full px-4 py-2.5 bg-surface-raised border border-border/80 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors resize-none"
          ></textarea>
        </div>

        <!-- Multi-Image Uploader (1 s/d 4 foto mini) -->
        <div>
          <MultiImageUploader
            v-model="form.photos"
            folder="experiences"
            :label="isEducation ? 'Foto Dokumentasi / Gedung Kampus / Kegiatan (Maksimal 4 Foto)' : 'Foto Dokumentasi / Suasana Kerja / Portofolio (Maksimal 4 Foto)'"
            :max-images="4"
            aspect-ratio="16:9"
          />
        </div>
      </form>

      <!-- Footer Buttons -->
      <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/80 bg-surface-raised/40">
        <BaseButton variant="ghost" @click="emit('close')" :disabled="isSaving">
          Batal
        </BaseButton>
        <BaseButton variant="primary" @click="handleSubmit" :loading="isSaving">
          {{ props.experience ? 'Perbarui Data' : 'Simpan Data' }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>
