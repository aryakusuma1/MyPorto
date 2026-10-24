<script setup>
import { ref } from 'vue'
import { UploadCloud, X, AlertCircle, Crop } from 'lucide-vue-next'
import { supabase } from '../../lib/supabase'
import ImageCropperModal from './ImageCropperModal.vue'

const props = defineProps({
  bucket: {
    type: String,
    default: 'portfolio-images',
  },
  folder: {
    type: String,
    default: 'uploads',
  },
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: 'Unggah Gambar',
  },
  aspectRatio: {
    type: String,
    default: '16:9', // '16:9', '4:3', '3:4', '1:1', 'free'
  },
})

const emit = defineEmits(['update:modelValue', 'success', 'error'])

const isUploading = ref(false)
const errorMessage = ref('')
const fileInputRef = ref(null)

// Cropper modal state
const isCropperOpen = ref(false)
const fileToCrop = ref(null)

function triggerFileInput() {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

function handleFileChange(event) {
  const file = event.target.files?.[0]
  if (!file) return

  // Validasi tipe berkas
  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Berkas yang dipilih harus berupa gambar (JPG, PNG, WebP).'
    return
  }

  // Validasi ukuran berkas (maksimal 10MB sebelum potong)
  if (file.size > 10 * 1024 * 1024) {
    errorMessage.value = 'Ukuran gambar maksimal 10MB.'
    return
  }

  errorMessage.value = ''
  fileToCrop.value = file
  isCropperOpen.value = true

  // Reset input agar bisa memilih file yang sama jika diinginkan
  if (event.target) event.target.value = ''
}

function handleCropperClose() {
  isCropperOpen.value = false
  fileToCrop.value = null
}

async function handleCropped(croppedFile) {
  isCropperOpen.value = false
  fileToCrop.value = null

  isUploading.value = true
  errorMessage.value = ''

  try {
    const fileExt = croppedFile.name.split('.').pop() || 'jpg'
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`
    const filePath = `${props.folder}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from(props.bucket)
      .upload(filePath, croppedFile, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from(props.bucket)
      .getPublicUrl(filePath)

    emit('update:modelValue', urlData.publicUrl)
    emit('success', urlData.publicUrl)
  } catch (err) {
    console.error('[ImageUploader] Upload error:', err)
    errorMessage.value = err.message || 'Gagal mengunggah gambar. Pastikan sesi login aktif.'
    emit('error', errorMessage.value)
  } finally {
    isUploading.value = false
  }
}

function removeImage() {
  emit('update:modelValue', '')
  errorMessage.value = ''
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <label class="block text-xs font-semibold text-ink-muted uppercase tracking-wider">
        {{ label }}
      </label>
      <span v-if="aspectRatio" class="text-[10px] font-mono text-ink-muted/80 bg-surface-raised px-2 py-0.5 rounded border border-border/50">
        Rasio target: {{ aspectRatio }}
      </span>
    </div>

    <!-- Error message alert -->
    <div
      v-if="errorMessage"
      class="p-2.5 rounded-lg bg-red-950/40 border border-red-800 text-red-200 text-xs flex items-center gap-2"
    >
      <AlertCircle class="w-4 h-4 text-red-400 shrink-0" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Hidden native file input -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileChange"
    />

    <!-- Preview if image exists -->
    <div
      v-if="modelValue"
      class="relative w-full max-w-sm rounded-xl overflow-hidden border border-border bg-surface-raised group shadow-sm"
    >
      <img
        :src="modelValue"
        alt="Preview"
        class="w-full h-44 object-cover"
        loading="lazy"
      />
      <button
        type="button"
        class="absolute top-2 right-2 p-1.5 rounded-full bg-surface-alt/90 text-ink-muted hover:text-red-400 border border-border shadow-md transition-colors cursor-pointer"
        title="Hapus gambar"
        @click="removeImage"
      >
        <X class="w-4 h-4" />
      </button>
      <button
        type="button"
        class="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg bg-surface/90 text-xs font-medium text-ink border border-border hover:border-accent transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
        @click="triggerFileInput"
      >
        <Crop class="w-3.5 h-3.5 text-accent" />
        <span>Ganti / Sesuaikan</span>
      </button>
    </div>

    <!-- Upload placeholder box if no image -->
    <div
      v-else
      class="border-2 border-dashed border-border hover:border-accent/70 rounded-xl p-6 text-center cursor-pointer transition-colors bg-surface-raised/40 hover:bg-surface-raised/80 select-none group"
      @click="triggerFileInput"
    >
      <div class="flex flex-col items-center justify-center space-y-2">
        <div class="w-10 h-10 rounded-full bg-surface-raised flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
          <UploadCloud v-if="!isUploading" class="w-5 h-5" />
          <svg
            v-else
            class="animate-spin h-5 w-5 text-accent"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
        </div>
        <p class="text-xs sm:text-sm font-medium text-ink">
          {{ isUploading ? 'Sedang mengunggah...' : 'Pilih Foto (Bisa dipotong & disesuaikan letaknya)' }}
        </p>
        <p class="text-[11px] text-ink-muted">
          Format PNG, JPG, WebP (Rasio otomatis {{ aspectRatio }})
        </p>
      </div>
    </div>

    <!-- Interactive Cropper Modal -->
    <ImageCropperModal
      v-if="isCropperOpen && fileToCrop"
      :image-file="fileToCrop"
      :default-aspect-ratio="aspectRatio"
      :title="`Sesuaikan ${label}`"
      @close="handleCropperClose"
      @crop="handleCropped"
    />
  </div>
</template>
