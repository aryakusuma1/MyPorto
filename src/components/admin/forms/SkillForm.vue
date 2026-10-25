<script setup>
import { reactive, watch, ref } from 'vue'
import { X, Sliders, AlertCircle, UploadCloud, Loader2, Trash2 } from 'lucide-vue-next'
import TechIcon from '../../ui/TechIcon.vue'
import { supabase } from '../../../lib/supabase'
import BaseButton from '../../ui/BaseButton.vue'

const props = defineProps({
  skill: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'saved'])

const isSaving = ref(false)
const errorMessage = ref('')

const predefinedCategories = ['Frontend', 'Backend', 'Database', 'Tools', 'DevOps', 'Mobile']

const form = reactive({
  name: '',
  category: 'Frontend',
  level: 80,
  icon_url: '',
  })

watch(
  () => props.skill,
  (val) => {
    if (val) {
      form.name = val.name || ''
      form.category = val.category || 'Frontend'
      form.level = val.level ?? 80
      form.icon_url = val.icon_url || ''
          } else {
      form.name = ''
      form.category = 'Frontend'
      form.level = 80
      form.icon_url = ''
          }
  },
  { immediate: true }
)

function selectCategory(cat) {
  form.category = cat
}

const isUploadingIcon = ref(false)
const iconFileInputRef = ref(null)
const uploadError = ref('')

function triggerIconUpload() {
  if (iconFileInputRef.value) {
    iconFileInputRef.value.click()
  }
}

async function handleIconUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  uploadError.value = ''

  if (!file.type.startsWith('image/') && !file.name.endsWith('.svg')) {
    uploadError.value = 'Berkas harus berupa gambar (SVG, PNG, JPG, WebP).'
    return
  }

  if (file.size > 3 * 1024 * 1024) {
    uploadError.value = 'Ukuran berkas ikon maksimal 3MB.'
    return
  }

  isUploadingIcon.value = true

  try {
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '')
    const filePath = `skills/${Date.now()}_${cleanName}`

    const { error: err } = await supabase.storage
      .from('portfolio-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (err) throw err

    const { data: urlData } = supabase.storage
      .from('portfolio-images')
      .getPublicUrl(filePath)

    form.icon_url = urlData.publicUrl
  } catch (err) {
    console.error('[SkillForm] Upload icon error:', err)
    uploadError.value = err.message || 'Gagal mengunggah ikon. Periksa sesi login.'
  } finally {
    isUploadingIcon.value = false
    if (event.target) event.target.value = ''
  }
}

function removeCustomIcon() {
  form.icon_url = ''
  uploadError.value = ''
}

async function handleSubmit() {
  errorMessage.value = ''
  if (!form.name.trim()) {
    errorMessage.value = 'Nama skill wajib diisi.'
    return
  }
  if (!form.category.trim()) {
    errorMessage.value = 'Kategori skill wajib diisi.'
    return
  }

  isSaving.value = true

  const levelNum = Math.min(100, Math.max(1, Number(form.level) || 80))

  // Otomatis tempatkan di urutan paling akhir jika tambah data baru (misal ada 1..4, maka jadi ke-5)
  let sortOrder = props.skill?.sort_order
  if (!props.skill?.id) {
    try {
      const { data: latest } = await supabase
        .from('skills')
        .select('sort_order')
        .order('sort_order', { ascending: false })
        .limit(1)
      sortOrder = ((latest?.[0]?.sort_order ?? 0) + 1)
    } catch (e) {
      sortOrder = 999
    }
  }

  const payload = {
    name: form.name.trim(),
    category: form.category.trim(),
    level: levelNum,
    icon_url: form.icon_url.trim() || null,
    sort_order: sortOrder ?? 1,
  }

  try {
    if (props.skill?.id) {
      const { error } = await supabase.from('skills').update(payload).eq('id', props.skill.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('skills').insert([payload])
      if (error) throw error
    }
    emit('saved')
  } catch (err) {
    errorMessage.value = err.message || 'Gagal menyimpan data skill.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
    <div
      class="bg-surface-alt border border-border rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto animate-fade-in"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-surface-raised/50 shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-xl bg-accent/10 text-accent border border-accent/20">
            <Sliders class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-heading font-semibold text-ink">
              {{ props.skill ? 'Edit Skill' : 'Tambah Skill Baru' }}
            </h3>
            <p class="text-xs text-ink-muted">
              Kompetensi teknis dan level kemahiran
            </p>
          </div>
        </div>
        <button
          type="button"
          @click="emit('close')"
          class="p-1.5 text-ink-muted hover:text-ink hover:bg-surface-raised rounded-lg transition-colors cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form Body -->
      <form @submit.prevent="handleSubmit" class="p-6 overflow-y-auto space-y-5 flex-1">
        <div
          v-if="errorMessage"
          class="p-3.5 bg-red-950/40 border border-red-800 rounded-xl text-sm text-red-200"
        >
          {{ errorMessage }}
        </div>

        <!-- Nama Skill -->
        <div>
          <label class="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
            Nama Skill <span class="text-accent">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Contoh: Vue.js, PostgreSQL, Docker"
            class="w-full px-4 py-2.5 bg-surface-raised border border-border/80 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors"
            required
          />
        </div>

        <!-- Kategori -->
        <div>
          <label class="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
            Kategori <span class="text-accent">*</span>
          </label>
          <div class="flex flex-wrap gap-1.5 mb-2.5">
            <button
              v-for="cat in predefinedCategories"
              :key="cat"
              type="button"
              @click="selectCategory(cat)"
              class="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer"
              :class="
                form.category === cat
                  ? 'bg-accent/15 border-accent text-accent font-semibold shadow-sm'
                  : 'bg-surface-raised/70 border-border/70 text-ink-muted hover:text-ink hover:bg-surface-raised'
              "
            >
              {{ cat }}
            </button>
          </div>
          <input
            v-model="form.category"
            type="text"
            placeholder="Atau ketik kategori kustom..."
            class="w-full px-4 py-2 bg-surface-raised border border-border/80 rounded-xl text-ink text-sm focus:outline-none focus:border-accent transition-colors"
            required
          />
        </div>

        <!-- Tingkat Kemahiran -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              Tingkat Kemahiran (1-100%)
            </label>
            <span class="font-mono text-sm font-semibold text-accent">{{ form.level }}%</span>
          </div>
          <input
            v-model.number="form.level"
            type="range"
            min="1"
            max="100"
            step="1"
            class="w-full accent-accent h-2 bg-surface-raised rounded-lg cursor-pointer"
          />
          <div class="flex justify-between text-[11px] text-ink-muted/80 mt-1 font-mono">
            <span>Pemula (20%)</span>
            <span>Menengah (60%)</span>
            <span>Mahir (90%+)</span>
          </div>
        </div>

        <!-- Icon / Gambar Keahlian (Upload / Otomatis) -->
        <div>
          <label class="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
            Ikon / Logo Keahlian (Opsional)
          </label>

          <!-- Hidden Native File Input -->
          <input
            ref="iconFileInputRef"
            type="file"
            accept="image/svg+xml,image/png,image/jpeg,image/webp,.svg"
            class="hidden"
            @change="handleIconUpload"
          />

          <!-- Error Alert if upload fails -->
          <div
            v-if="uploadError"
            class="mb-3 p-2.5 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center justify-between"
          >
            <div class="flex items-center gap-2">
              <AlertCircle class="w-4 h-4 shrink-0 text-red-400" />
              <span>{{ uploadError }}</span>
            </div>
            <button type="button" @click="uploadError = ''" class="text-xs hover:underline cursor-pointer">Tutup</button>
          </div>

          <!-- KONDISI 1: Ikon Kustom Sudah Diunggah -->
          <div
            v-if="form.icon_url"
            class="p-3 bg-surface-raised border border-border/80 rounded-xl flex items-center justify-between gap-3 shadow-inner"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center p-2 shrink-0 overflow-hidden">
                <img
                  :src="form.icon_url"
                  :alt="form.name"
                  class="w-full h-full object-contain"
                  @error="uploadError = 'Gambar gagal dimuat.'"
                />
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-semibold text-ink truncate">Ikon Kustom Terpasang</span>
                  <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono">
                    Aktif
                  </span>
                </div>
                <p class="text-[11px] text-ink-muted truncate max-w-[240px] mt-0.5 font-mono">
                  {{ form.icon_url }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <button
                type="button"
                @click="triggerIconUpload"
                :disabled="isUploadingIcon"
                class="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-surface text-ink hover:text-accent border border-border/80 hover:border-accent transition-colors cursor-pointer disabled:opacity-50"
              >
                Ganti
              </button>
              <button
                type="button"
                @click="removeCustomIcon"
                title="Hapus Ikon Kustom (Gunakan Ikon Bawaan)"
                class="p-1.5 rounded-lg text-ink-muted hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-900/50 transition-colors cursor-pointer"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- KONDISI 2: Belum Unggah Ikon (Gunakan Ikon Bawaan Otomatis) -->
          <div v-else class="space-y-2.5">
            <!-- Upload Trigger Box -->
            <div
              @click="triggerIconUpload"
              class="border-2 border-dashed border-border hover:border-accent/70 rounded-xl p-4 text-center cursor-pointer transition-all bg-surface-raised/40 hover:bg-surface-raised/80 group"
            >
              <div class="flex flex-col items-center justify-center gap-1.5">
                <div class="w-9 h-9 rounded-xl bg-surface flex items-center justify-center text-accent group-hover:scale-110 transition-transform shadow-sm">
                  <Loader2 v-if="isUploadingIcon" class="w-4 h-4 animate-spin" />
                  <UploadCloud v-else class="w-4 h-4" />
                </div>
                <div class="text-xs font-semibold text-ink group-hover:text-accent transition-colors">
                  {{ isUploadingIcon ? 'Sedang Mengunggah Ikon...' : 'Klik untuk Unggah Ikon (SVG / PNG / WebP)' }}
                </div>
                <p class="text-[11px] text-ink-muted">
                  Ikon akan langsung tersimpan di Supabase Storage
                </p>
              </div>
            </div>

            <!-- Built-in Icon Auto Fallback Notice -->
            <div class="p-2.5 rounded-xl bg-surface-raised/60 border border-border/60 flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-surface border border-border/80 flex items-center justify-center p-1.5 text-accent shrink-0">
                <TechIcon :name="form.name || 'Skill'" class="w-full h-full" />
              </div>
              <div class="text-[11px] text-ink-muted leading-relaxed min-w-0">
                <span>Ikon Bawaan Otomatis: </span>
                <span class="text-ink font-semibold">{{ form.name || 'Sesuai nama skill' }}</span>
                <p class="text-[10px] text-ink-muted/70">
                  Jika tidak mengunggah ikon, sistem otomatis memakai SVG resmi bawaan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>

      <!-- Footer Buttons -->
      <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/80 bg-surface-raised/40 shrink-0">
        <BaseButton variant="ghost" @click="emit('close')" :disabled="isSaving">
          Batal
        </BaseButton>
        <BaseButton variant="primary" @click="handleSubmit" :loading="isSaving">
          {{ props.skill ? 'Perbarui Skill' : 'Simpan Skill' }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>
